<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Directive } from 'vue'
import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/contrib/auto-render'

type Demo = {
  id: string
  number: number
  source: string
  prompt: string
}

const menuOpen = ref(false)
const openPromptId = ref<string | null>(null)
const expandedVideo = ref<Demo | null>(null)
const citationCopied = ref(false)

const videoFiles = import.meta.glob('../docs/videos/*.mp4', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const videoPath = (number: number) =>
  `../docs/videos/personal_lihaoyu_0730_14b_sla_distill_4step_${number}.mp4`

const videoSource = (number: number) => videoFiles[videoPath(number)] ?? ''

// Discover demo numbers from the actual files so the gallery always mirrors
// whatever lives in docs/videos — no hard-coded count to drift out of sync.
const demoNumbers = Object.keys(videoFiles)
  .map((path) => path.match(/_4step_(\d+)\.mp4$/)?.[1])
  .filter((value): value is string => Boolean(value))
  .map(Number)
  .sort((a, b) => a - b)

const heroNumber = demoNumbers.includes(20) ? 20 : demoNumbers[demoNumbers.length - 1] ?? 1
const heroVideo = videoSource(heroNumber)
const paperUrl = new URL('../docs/论文.pdf', import.meta.url).href

const demos: Demo[] = demoNumbers.map((number) => ({
  id: `demo-${number}`,
  number,
  source: videoSource(number),
  prompt: `[ Add the original input prompt for demo ${String(number).padStart(2, '0')} ]`,
}))

function openVideo(demo: Demo) {
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
        :src="heroVideo"
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
        class="expand-button hero-expand"
        type="button"
        aria-label="Expand hero video"
        title="Expand video"
        @click="openVideo({ id: 'hero', number: heroNumber, source: heroVideo, prompt: 'Hero background video' })"
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

    <section id="demos" class="demos-section page-width">
      <div class="demos-heading">
        <div>
          <h2>Demos</h2>
        </div>
      </div>

      <div class="video-gallery">
        <figure v-for="demo in demos" :key="demo.id" class="video-card">
          <div
            class="demo-frame"
            :class="{ 'is-prompt-open': openPromptId === demo.id }"
            @mouseleave="openPromptId = null"
          >
            <video :src="demo.source" autoplay muted loop playsinline preload="metadata"></video>
            <div class="prompt-overlay" aria-hidden="true">
              <span>Prompt</span>
              <p>{{ demo.prompt }}</p>
            </div>
            <button
              type="button"
              class="prompt-button"
              :aria-pressed="openPromptId === demo.id"
              :aria-label="openPromptId === demo.id ? 'Hide prompt' : 'Show prompt'"
              @click.stop="togglePrompt(demo.id)"
            >Prompt</button>
            <button
              type="button"
              class="expand-button"
              aria-label="Expand demo video"
              title="Expand video"
              @click.stop="openVideo(demo)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
                <path d="M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7" />
              </svg>
            </button>
          </div>
        </figure>
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
        <p>{{ expandedVideo.number === heroNumber && expandedVideo.id === 'hero' ? 'Hero background video' : `Demo ${String(expandedVideo.number).padStart(2, '0')}` }}</p>
      </div>
    </div>
  </main>
</template>
