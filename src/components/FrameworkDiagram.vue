<script setup lang="ts">
/* Figure 9 rebuilt in HTML/CSS: the four SparkDiffusion stages left → right,
   the noise-trajectory bar inside distillation, and the gains chain that
   converges on real latency speedup. Pure DOM — crisp at any width, no
   raster asset. */
</script>

<template>
  <div class="fw">
    <!-- Stage row -->
    <div class="fw-stages">
      <!-- Stage 0: teacher & data -->
      <section class="fw-stage" aria-label="Teacher and data preparation">
        <header><span class="fw-index">0</span> Teacher &amp; Data Preparation</header>
        <div class="fw-boxes">
          <div class="fw-box">
            <h4>Video data</h4>
            <p>text–video pairs</p>
          </div>
          <div class="fw-box">
            <h4>Pretrained checkpoint</h4>
            <p>dense video DiT</p>
          </div>
          <div class="fw-box fw-box-teacher">
            <h4>Teacher</h4>
            <p>dense · frozen</p>
          </div>
          <div class="fw-box fw-box-student">
            <h4>Student</h4>
            <p>sparse · trainable</p>
          </div>
        </div>
      </section>

      <div class="fw-arrow" aria-hidden="true">→</div>

      <!-- Stage 1: sparse warm-up -->
      <section class="fw-stage" aria-label="Sparse warm-up">
        <header><span class="fw-index">1</span> Sparse Warm-up</header>
        <div class="fw-boxes">
          <div class="fw-box">
            <h4>Compensated sparse attention</h4>
            <ul class="fw-branches">
              <li>Sparse branch <span>top-k blocks</span></li>
              <li>Compensation branch <span>low-rank linear</span></li>
              <li>Gate <span>near-zero init</span></li>
            </ul>
          </div>
          <div class="fw-note">coarse manifold prior</div>
        </div>
      </section>

      <div class="fw-arrow" aria-hidden="true">→</div>

      <!-- Stage 2: trajectory-mixed distillation -->
      <section class="fw-stage" aria-label="Trajectory-mixed distillation">
        <header><span class="fw-index">2</span> Trajectory-Mixed Distillation</header>
        <div class="fw-boxes">
          <div class="fw-box fw-box-traj">
            <div class="fw-traj-labels"><span>t = 1</span><span>t<sub>c</sub></span><span>t = 0</span></div>
            <div class="fw-traj">
              <i class="fw-traj-high">High noise</i>
              <i class="fw-traj-low">Low noise</i>
            </div>
          </div>
          <div class="fw-duo">
            <div class="fw-box">
              <h4>Structure</h4>
              <p>consistency / flow matching on teacher trajectory</p>
            </div>
            <div class="fw-box">
              <h4>Fidelity</h4>
              <p>distribution matching · critic vs teacher scores</p>
            </div>
          </div>
          <div class="fw-note fw-note-step">multi-step sparse <b>→</b> few-step sparse</div>
        </div>
      </section>

      <div class="fw-arrow" aria-hidden="true">→</div>

      <!-- Stage 3: FP8 + fused kernel -->
      <section class="fw-stage" aria-label="FP8 and fused kernel deployment">
        <header><span class="fw-index">3</span> FP8 + Fused Kernel</header>
        <div class="fw-boxes">
          <div class="fw-box">
            <h4><span class="fw-tag">offline</span> Quantize</h4>
            <ul class="fw-branches">
              <li>BF16 W <span>→ FP8 W + scale</span></li>
              <li>BF16 A <span>→ FP8 A + scale</span></li>
            </ul>
          </div>
          <div class="fw-box">
            <h4><span class="fw-tag">runtime</span> Execute</h4>
            <ul class="fw-branches">
              <li>FP8 E4M3 GEMM <span>attention · FFN</span></li>
              <li>Fused kernels <span>scale + cast in one pass</span></li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- Gains chain (bottom of the figure) -->
    <div class="fw-gains" aria-label="Where the speedup comes from">
      <span class="fw-gain">Sparsity</span><span class="fw-gain-arrow">→</span>
      <span class="fw-gain">FLOPs ↓</span><span class="fw-gain-sep">·</span>
      <span class="fw-gain">Distillation steps ↓</span><span class="fw-gain-sep">·</span>
      <span class="fw-gain">FP8 bandwidth ↓</span><span class="fw-gain-sep">·</span>
      <span class="fw-gain">Kernel overhead ↓</span>
      <span class="fw-gain-arrow">⇒</span>
      <span class="fw-gain fw-gain-total">Real latency speedup</span>
    </div>
  </div>
</template>

<style scoped>
/* Four stage columns joined by arrows; collapses to a vertical stack under
   1080px. Same card substrate (#0d1322 + rule border) as the rest of the
   site so the diagram reads as part of the page, not a pasted figure. */
.fw {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fw-stages {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1.25fr auto 1fr;
  gap: .6rem;
  align-items: stretch;
}

.fw-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--quiet);
  font: 500 1.1rem/1 'DM Mono', monospace;
}

.fw-stage {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  padding: .9rem .95rem;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: rgba(13, 19, 34, .72);
}

.fw-stage header {
  display: flex;
  align-items: center;
  gap: .55rem;
  color: var(--ink);
  font: 500 .68rem/1.3 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.fw-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid rgba(77, 139, 255, .5);
  border-radius: 50%;
  color: var(--signal);
  font-size: .62rem;
}

.fw-boxes {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  flex: 1;
}

.fw-box {
  padding: .55rem .65rem;
  border: 1px solid var(--rule);
  border-radius: 7px;
  background: rgba(232, 236, 255, .03);
}

.fw-box h4 {
  margin: 0 0 .18rem;
  color: var(--ink);
  font: 500 .78rem/1.25 'DM Sans', sans-serif;
}

.fw-box p {
  margin: 0;
  color: var(--quiet);
  font: .68rem/1.45 'DM Mono', monospace;
}

.fw-box-teacher {
  border-color: rgba(148, 158, 190, .4);
}

.fw-box-student {
  border-color: rgba(77, 139, 255, .45);
  background: rgba(77, 139, 255, .07);
}

.fw-branches {
  margin: .1rem 0 0;
  padding: 0;
  list-style: none;
}

.fw-branches li {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  color: var(--muted);
  font: .68rem/1.7 'DM Mono', monospace;
}

.fw-branches li span {
  color: var(--quiet);
  white-space: nowrap;
}

.fw-note {
  margin-top: auto;
  padding: .4rem .55rem;
  border: 1px dashed rgba(77, 139, 255, .4);
  border-radius: 6px;
  color: var(--signal);
  font: .64rem/1.4 'DM Mono', monospace;
  text-align: center;
}

.fw-note-step b {
  color: var(--signal);
  font-weight: 500;
}

.fw-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .5rem;
}

/* Noise trajectory bar — violet high-noise fades into blue low-noise across
   t = 1 → 0, with the crossover tick between them. */
.fw-box-traj {
  padding: .55rem .65rem .7rem;
}

.fw-traj-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: .35rem;
  color: var(--quiet);
  font: .62rem/1 'DM Mono', monospace;
}

.fw-traj {
  display: flex;
  height: 1.75rem;
  border-radius: 5px;
  overflow: hidden;
}

.fw-traj-high {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1.15;
  background: linear-gradient(90deg, rgba(157, 123, 255, .5), rgba(157, 123, 255, .24));
  color: var(--ink);
  font: 500 .6rem/1 'DM Mono', monospace;
  letter-spacing: .08em;
}

.fw-traj-low {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  border-left: 1px dashed rgba(232, 236, 255, .55);
  background: linear-gradient(90deg, rgba(77, 139, 255, .24), rgba(77, 139, 255, .5));
  color: var(--ink);
  font: 500 .6rem/1 'DM Mono', monospace;
  letter-spacing: .08em;
}

.fw-tag {
  margin-right: .4rem;
  padding: .1rem .35rem;
  border: 1px solid var(--rule);
  border-radius: 4px;
  color: var(--quiet);
  font: 500 .56rem/1 'DM Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  vertical-align: .08em;
}

/* Gains chain */
.fw-gains {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  padding: .8rem 1rem;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: rgba(13, 19, 34, .72);
}

.fw-gain {
  padding: .32rem .6rem;
  border: 1px solid var(--rule);
  border-radius: 99px;
  color: var(--muted);
  font: .66rem/1 'DM Mono', monospace;
  letter-spacing: .04em;
  white-space: nowrap;
}

.fw-gain-arrow {
  color: var(--signal);
  font: 500 .85rem/1 'DM Mono', monospace;
}

.fw-gain-sep {
  color: var(--quiet);
}

.fw-gain-total {
  border-color: rgba(77, 139, 255, .55);
  background: rgba(77, 139, 255, .1);
  color: var(--ink);
}

@media (max-width: 1080px) {
  .fw-stages {
    grid-template-columns: 1fr;
  }

  .fw-arrow {
    transform: rotate(90deg);
    padding: .1rem 0;
  }
}
</style>
