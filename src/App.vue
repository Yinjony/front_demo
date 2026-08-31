<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Directive } from 'vue'
import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/contrib/auto-render'

type Demo = {
  id: string
  label: string
  source: string
  prompt: string
}

const menuOpen = ref(false)
const openPromptId = ref<string | null>(null)
const expandedVideo = ref<Demo | null>(null)
const citationCopied = ref(false)

/* ===== Demo gallery: per-model blocks × per-prompt rows × per-method columns ==
   Source tree convention: docs/videos/<model>/<method>/<file>.mp4 — one glob
   picks up everything, then rows group by filename-stem so the same prompt's
   three methods land side by side. Models render in the fixed order below;
   a model with no files drops out of the gallery automatically.            */

const methodOrder = ['full_attention', 'turbo_diffusion', 'ours'] as const
const methodLabels: Record<string, string> = {
  full_attention: 'Full Attention',
  turbo_diffusion: 'Turbo Diffusion',
  ours: 'Ours',
}

const modelOrder = [
  'Wan2.1-T2V-1.3B-480P-90',
  'Wan2.1-T2V-14B-480P-90',
  'Wan2.1-T2V-14B-720P-95',
  'Wan2.1-I2V-14B-720P-95',
  'Wan2.2-T2V-A14B-480P-95',
  'Wan2.2-T2V-A14B-720P-97',
]

const allVideos = import.meta.glob('../docs/videos-real/*/*/*.mp4', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// Prompts live per model: videos-real/<model>/prompts.txt, one prompt per
// gallery row (Nth line ↔ Nth row). Missing file or short file falls back to
// a placeholder so a row label never blanks.
const promptsByModel = import.meta.glob('../docs/videos-real/*/prompts.txt', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const modelPrompts = (model: string) => {
  const raw = Object.entries(promptsByModel).find(([p]) => p.includes(`/${model}/`))?.[1] ?? ''
  return raw.split(/\r?\n/).filter((line) => line.trim() !== '')
}

const rowPrompt = (model: string, row: number) =>
  modelPrompts(model)[row]?.trim() ||
  `[ Add the original input prompt for ${model} row ${row + 1} ]`

type MethodCell = { method: (typeof methodOrder)[number]; label: string; source: string }
type GalleryRow = { key: string; prompt: string; cells: MethodCell[] }
type ModelBlock = { model: string; rows: GalleryRow[] }

// Row grouping key — methods name the same prompt differently (e.g. Ours
// "06_seed42.mp4" vs Turbo Diffusion "prompt_06.mp4"), so rows group by the
// first digit-run in the filename instead of the raw stem: both normalize
// to "06" and land on the same row.
const rowKeyOf = (file: string) => file.match(/\d+/)?.[0] ?? file

const modelBlocks: ModelBlock[] = modelOrder
  .map((model) => {
    // Buckets: row key → method → resolved URL. Glob keys are sorted, so files
    // that share a row stay in file order within a method.
    const buckets = new Map<string, Map<string, string[]>>()
    for (const [path, source] of Object.entries(allVideos)) {
      const [m, method, file] = path.split('/').slice(-3)
      if (m !== model) continue
      const rowKey = rowKeyOf(file)
      let byMethod = buckets.get(rowKey)
      if (!byMethod) buckets.set(rowKey, (byMethod = new Map()))
      const list = byMethod.get(method) ?? []
      list.push(source)
      byMethod.set(method, list)
    }

    // Numeric row order — "2" must come before "10".
    const rows: GalleryRow[] = [...buckets.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([rowKey, byMethod], index) => ({
        key: `${model}-${rowKey}`,
        prompt: rowPrompt(model, index),
        cells: methodOrder
          .map((method): MethodCell | null => {
            const source = byMethod.get(method)?.[0]
            return source ? { method, label: methodLabels[method], source } : null
          })
          .filter((cell): cell is MethodCell => cell !== null),
      }))

    return { model, rows }
  })
  .filter((block) => block.rows.length > 0)

console.log(modelBlocks)

const heroDemo = (() => {
  for (const model of modelOrder) {
    for (const method of methodOrder) {
      const hit = Object.entries(allVideos).find(([p]) => p.includes(`/${model}/${method}/`))
      if (hit) return { label: `${model} / ${methodLabels[method]}`, source: hit[1] }
    }
  }
  return null
})()
const paperUrl = new URL('../docs/论文.pdf', import.meta.url).href

// End-to-end latency benchmarks from docs/5090测试.docx — RTX 5090, fp8 W8A8,
// 4-step, 81 frames @ 16 fps (5.06 s), single prompt, SLA only.
// 2.1 latency = full denoise loop; 2.2 = forward compute + expert swap,
// excluding model load/unload and VAE. BENCHMARK=1 warmup everywhere, so
// torch.compile overhead is excluded.
type BenchRow = {
  model: string
  task: string
  grid: string
  topk: string
  sparsity: string
  latency: string
  breakdown: string
}

const benchRows: BenchRow[] = [
  { model: 'Wan2.1', task: 't2v-1.3B-480p', grid: '832×480', topk: '0.1', sparsity: '90%', latency: '1.77', breakdown: '0.44 s/step' },
  { model: 'Wan2.1', task: 't2v-14B-480p', grid: '832×480', topk: '0.1', sparsity: '90%', latency: '11.03', breakdown: '2.76 s/step' },
  { model: 'Wan2.1', task: 't2v-14B-720p', grid: '1280×720', topk: '0.05', sparsity: '95%', latency: '26.43', breakdown: '6.61 s/step' },
  { model: 'Wan2.1', task: 'i2v-14B-720p', grid: '1296×704', topk: '0.05', sparsity: '95%', latency: '26.53', breakdown: '6.63 s/step' },
  { model: 'Wan2.2', task: 't2v-A14B-480p', grid: '832×480', topk: '0.1', sparsity: '90%', latency: '17.87', breakdown: 'compute 11.09 s + swap 6.78 s' },
  { model: 'Wan2.2', task: 't2v-A14B-480p', grid: '832×480', topk: '0.05', sparsity: '95%', latency: '16.96', breakdown: 'compute 9.92 s + swap 7.04 s' },
  { model: 'Wan2.2', task: 't2v-A14B-720p', grid: '1280×720', topk: '0.03', sparsity: '97%', latency: '31.14', breakdown: 'compute 23.99 s + swap 7.16 s' },
]

const benchStats = [
  { value: '6 . 2 ×', label: '1.3B vs 14B speedup at 480p / 90% sparsity' },
  { value: '0 . 4 %', label: 'i2v vs t2v cost gap at equal pixel budget (720p)' },
  { value: '− 1 0 . 5 %', label: 'forward compute from 90% → 95% sparsity (2.2, 480p)' },
]

function openVideo(demo: Demo | null) {
  if (!demo) return
  expandedVideo.value = demo
}

function closeVideo() {
  expandedVideo.value = null
}

function togglePrompt(id: string) {
  openPromptId.value = openPromptId.value === id ? null : id
}

// Mirrors the in-page anchor links — relies on html { scroll-behavior: smooth }
// so the reduced-motion media query still wins for users who opt out.
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView()
}

async function copyCitation() {
  const citation = `@article{liu2026ropeslr,\n  title={RoPeSLR: 3D RoPE-driven Sparse-LowRank Attention for Efficient Diffusion Transformers},\n  author={Liu, Yuxi and Zhang, Zekun and Cai, Yixiang and Deng, Renjia and He, Yutong and Yuan, Kun},\n  journal={arXiv preprint arXiv:2605.20659},\n  year={2026}\n}`

  try {
    await navigator.clipboard.writeText(citation)
    citationCopied.value = true
    window.setTimeout(() => (citationCopied.value = false), 1800)
  } catch {
    // Clipboard access may be disabled on some preview deployments.
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeVideo()
}

// KaTeX auto-render directive. Drop v-math on any element whose text contains
// inline ($...$) or display ($$...$$, \[...\]) LaTeX and it renders in place.
// Runs once on mount — fine for static prose like the abstract.
const vMath: Directive<HTMLElement> = {
  mounted(el) {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    })
  },
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <main>
    <section id="top" class="hero">
      <video
        class="hero-film"
        :src="heroDemo?.source"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        aria-label="Project demo video"
      ></video>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-grain" aria-hidden="true"></div>

      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="#top" aria-label="Project home">
          <span>RoPeSLR</span>
        </a>

        <button
          class="menu-button"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <span></span><span></span>
        </button>

        <div class="nav-links" :class="{ 'is-open': menuOpen }">
          <a href="#abstract" @click="menuOpen = false">Abstract</a>
          <a href="#benchmarks" @click="menuOpen = false">Benchmarks</a>
          <a href="#demos" @click="menuOpen = false">Demos</a>
          <a href="#citation" @click="menuOpen = false">Citation</a>
          <a class="nav-action" :href="paperUrl" target="_blank" rel="noreferrer" @click="menuOpen = false">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M14.5 2.75H6.8a1.8 1.8 0 0 0-1.8 1.8v14.9a1.8 1.8 0 0 0 1.8 1.8h10.4a1.8 1.8 0 0 0 1.8-1.8V7.85L14.5 2.75Z" />
              <path d="M14 2.75v5.5h5M8.5 12h7M8.5 15.5h7" />
            </svg>
            <span>Paper</span>
          </a>
          <a class="nav-action" href="https://github.com/your-org/your-project" target="_blank" rel="noreferrer" @click="menuOpen = false">
            <svg class="nav-icon github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.54 1.04 1.54 1.04.9 1.55 2.35 1.1 2.93.84.09-.66.35-1.1.64-1.36-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.55 9.55 0 0 1 12 6.52c.85 0 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.69-4.58 4.94.36.31.68.9.68 1.81v2.8c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z" />
            </svg>
            <span>Code</span>
          </a>
        </div>
      </nav>

      <div class="hero-copy page-width">
        <p class="kicker">ICLR· 2026</p>
        <h1>RoPeSLR:<br /><span>3D RoPE-driven Sparse-LowRank Attention for Efficient Diffusion Transformers</span></h1>
        <p class="hero-lede">
          A 3D RoPE-driven sparse-low-rank attention framework that restores global context at extreme
          sparsity, making ultra-long video diffusion substantially more efficient.
        </p>
        <p class="authors">Yuxi Liu<sup>*</sup> <i>·</i> Zekun Zhang<sup>*</sup> <i>·</i> Yixiang Cai<sup>*</sup> <i>·</i> Renjia Deng <i>·</i> Yutong He <i>·</i> Kun Yuan<sup>†</sup></p>
        <p class="affiliation">Pku Melon</p>
      </div>

      <button
        v-if="heroDemo"
        class="expand-button hero-expand"
        type="button"
        aria-label="Expand hero video"
        title="Expand video"
        @click="openVideo({ id: 'hero', label: heroDemo.label, source: heroDemo.source, prompt: 'Hero background video' })"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
          <path d="M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7" />
        </svg>
      </button>

      <button
        class="scroll-cue"
        type="button"
        aria-label="Continue to abstract"
        @click="scrollToId('abstract')"
      ><span>Let's go RoPeSLR</span><b aria-hidden="true"></b></button>
    </section>

    <section id="abstract" class="abstract-section page-width">
      <div class="abstract-title">
        <h2>Abstract</h2>
      </div>
      <div class="abstract-copy">
        <p v-math>
          Diffusion Transformers (DiTs) have revolutionized high-fidelity video generation, yet their $O(L^2)$
          attention complexity poses a formidable bottleneck for long-sequence synthesis. While recent sparse-linear
          attention hybrids aim to mitigate this, their performance severely degrades at extreme sparsity due
          to the "RoPE Dilemma": standard linear attention fails to preserve the orthogonal relative-position
          structure of 3D Rotary Position Embeddings (RoPE), neutralizing vital distance awareness. To address
          this, we propose <b>RoPeSLR</b>, a 3D RoPE-guided Sparse-LowRank attention framework. We establish
          that under empirically validated assumptions, the DiT attention manifold admits a decoupling into a
          high-frequency semantic spike set (bounded by $O(L^{3/2})$ sparsity) and an extreme low-rank ($O(d_h \log L)$)
          background continuum. Guided by this structural prior, RoPeSLR eschews standard linear attention for
          a head-wise low-rank parameterization equipped with a learnable 3D Absolute Positional Embedding
          (PE) injection, seamlessly synthesizing long-range relative distance decay. By guaranteeing sub-quadratic
          sparsity and sub-linear rank growth, RoPeSLR is exceptionally suited for scaling to ultra-long video
          inference. Extensive evaluations validate this scalable superiority: at 90% sparsity, RoPeSLR achieves up
          to 10× fewer FLOPs on Wan2.1-1.3B and delivers a 2.26× end-to-end inference speedup on the ultra-long
          100K+ token sequences of HunyuanVideo-13B, all while maintaining near-lossless generation fidelity (less
          than 1.3% average VBench degradation)
        </p>
        <div class="impact-strip" aria-label="Key results from the paper">
          <div><strong>1 0 ×</strong><span>fewer FLOPs on Wan2.1-1.3B</span></div>
          <div><strong>2 . 2 6 ×</strong><span>faster end-to-end inference on 100K+ tokens</span></div>
          <div><strong>&lt; 1 . 3 %</strong><span>average VBench degradation</span></div>
        </div>
      </div>
    </section>

    <section id="benchmarks" class="bench-section page-width">
      <div class="demos-heading">
        <div>
          <h2>Benchmarks</h2>
        </div>
<!--        <p class="bench-lede">-->
<!--          End-to-end SLA latency sweeps on a single RTX 5090 (fp8 W8A8, 4-step, 81 frames @ 16 fps-->
<!--          ≈ 5.06 s clips, single prompt). Wan2.1 numbers cover the full denoise loop; Wan2.2 splits-->
<!--          into forward compute + expert swap.-->
<!--        </p>-->
      </div>

      <div class="bench-table-wrap">
        <table class="bench-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Task</th>
              <th>Grid</th>
              <th>top-k</th>
              <th>Sparsity</th>
              <th>Latency</th>
              <th>Breakdown</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in benchRows" :key="`${row.model}-${row.task}-${row.sparsity}`">
              <td>{{ row.model }}</td>
              <td>{{ row.task }}</td>
              <td>{{ row.grid }}</td>
              <td>{{ row.topk }}</td>
              <td>{{ row.sparsity }}</td>
              <td class="bench-latency">{{ row.latency }} s</td>
              <td class="bench-breakdown">{{ row.breakdown }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="impact-strip bench-strip" aria-label="Key benchmark observations">
        <div v-for="stat in benchStats" :key="stat.label">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>

<!--      <p class="bench-foot">-->
<!--        All runs warmed up (BENCHMARK=1) so torch.compile overhead is excluded; seven tasks run-->
<!--        serially on an otherwise idle GPU.-->
<!--      </p>-->
    </section>

    <section id="demos" class="demos-section page-width">
      <div class="demos-heading">
        <div>
          <h2>Demos</h2>
        </div>
      </div>

      <div
        v-for="block in modelBlocks"
        :key="block.model"
        class="model-block"
        :data-model="block.model"
      >
        <h3 class="model-title">{{ block.model }}</h3>

        <div class="model-grid">
          <!-- Method column headers — same 3-col grid as .demo-row-videos so
               each label sits exactly over its column of videos. -->
          <div class="method-header" aria-hidden="true">
            <span
              v-for="method in methodOrder"
              :key="method"
              :class="{ 'is-ours': method === 'ours' }"
            >{{ methodLabels[method] }}</span>
          </div>
          <div
            v-for="row in block.rows"
            :key="row.key"
            class="demo-row"
          >
            <div class="demo-row-videos">
              <figure v-for="cell in row.cells" :key="row.key + cell.method" class="video-card">
                <div
                  class="demo-frame"
                  :class="{ 'is-prompt-open': openPromptId === row.key + cell.method }"
                  @mouseleave="openPromptId = null"
                >
                  <video :src="cell.source" autoplay muted loop playsinline preload="metadata"></video>
                  <div class="prompt-overlay" aria-hidden="true">
                    <span>Prompt</span>
                    <p>{{ row.prompt }}</p>
                  </div>
                  <button
                    type="button"
                    class="prompt-button"
                    :aria-pressed="openPromptId === row.key + cell.method"
                    :aria-label="openPromptId === row.key + cell.method ? 'Hide prompt' : 'Show prompt'"
                    @click.stop="togglePrompt(row.key + cell.method)"
                  >Prompt</button>
                  <button
                    type="button"
                    class="expand-button"
                    :aria-label="`Expand ${cell.label} video — ${row.prompt}`"
                    :title="cell.label"
                    @click.stop="openVideo({ id: row.key + cell.method, label: `${block.model} · ${cell.label}`, source: cell.source, prompt: row.prompt })"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                      <path d="M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7" />
                    </svg>
                  </button>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="citation" class="citation-section">
      <div class="page-width citation-layout">
        <div class="citation-intro">
          <h2>Citation</h2>
        </div>
        <div class="citation-card">
          <div class="citation-card-top">
            <div><span>BIBTEX / 2026</span></div>
            <button type="button" class="copy-button" @click="copyCitation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="1.5" /><path d="M5 16V5.5A1.5 1.5 0 0 1 6.5 4H16" /></svg>
              {{ citationCopied ? 'Copied' : 'Copy citation' }}
            </button>
          </div>
          <pre><code>@article{liu2026ropeslr,
  title   =   {RoPeSLR: 3D RoPE-driven Sparse-LowRank Attention for Efficient Diffusion Transformers},
  author  =   {Liu, Yuxi and Zhang, Zekun and Cai, Yixiang and Deng, Renjia and He, Yutong and Yuan, Kun},
  journal =   {arXiv preprint arXiv:2605.20659},
  year    =   {2026}
}</code></pre>
          <div class="citation-card-foot"><span>PLEASE CITE THIS WORK</span><span>↗</span></div>
        </div>
      </div>
    </section>

    <footer class="footer page-width">
      <a href="#top">Back to top ↑</a>
    </footer>

    <div v-if="expandedVideo" class="lightbox" role="dialog" aria-modal="true" aria-label="Expanded video" @click="closeVideo">
      <button type="button" class="lightbox-close" aria-label="Close expanded video" @click="closeVideo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      <div class="lightbox-stage" @click.stop>
        <video :src="expandedVideo.source" autoplay muted loop playsinline controls></video>
        <p>{{ expandedVideo.id === 'hero' ? 'Hero background video' : expandedVideo.label }}</p>
      </div>
    </div>
  </main>
</template>
