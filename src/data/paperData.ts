/* ============================================================================
   Numbers transcribed from the SparkDiffusion paper (docs/论文.pdf).
   Sources: Fig. 2 / Fig. 3 (pp. 2–3), Fig. 4 (p. 3), Table 2 (p. 10).
   ========================================================================== */

/* ----- Figure 2 — end-to-end latency (s) & speedup over Full Attention -----
   Suffixes 90 / 97 = attention sparsity. Full Attention = 50-step CFG
   (NFE 100), BF16, FlashAttention; SparkDiffusion = 3-step CFG-free (NFE 3)
   with the full stack. Speedup = Full / SparkDiffusion, rounded to integer.
   RTX 5090 Wan2.2 latency includes expert-switch overhead (H100 keeps both
   experts resident, so none is incurred there).                            */
export type LatencyRow = {
  model: string
  short: string
  gpu: 'H100' | 'RTX 5090'
  full: number
  spark: number
  speedup: number
}

export const latencyRows: LatencyRow[] = [
  { model: 'Wan2.1-T2V-1.3B-480P', short: 'Wan2.1 1.3B · 480P · 90%', gpu: 'H100', full: 92, spark: 0.6, speedup: 153 },
  { model: 'Wan2.1-T2V-1.3B-480P', short: 'Wan2.1 1.3B · 480P · 90%', gpu: 'RTX 5090', full: 182, spark: 1.3, speedup: 140 },
  { model: 'Wan2.1-T2V-14B-720P', short: 'Wan2.1 14B · 720P · 97%', gpu: 'H100', full: 1757, spark: 8, speedup: 220 },
  { model: 'Wan2.1-T2V-14B-720P', short: 'Wan2.1 14B · 720P · 97%', gpu: 'RTX 5090', full: 4769, spark: 18, speedup: 265 },
  { model: 'Wan2.2-T2V-A14B-720P', short: 'Wan2.2 A14B · 720P · 97%', gpu: 'H100', full: 1508, spark: 8, speedup: 189 },
  { model: 'Wan2.2-T2V-A14B-720P', short: 'Wan2.2 A14B · 720P · 97%', gpu: 'RTX 5090', full: 4545, spark: 25.1, speedup: 181 },
]

/* ----- Figure 3 — headline speedup ---------------------------------------- */
export const headline = {
  model: 'Wan2.1-T2V-14B-720P',
  sparsity: '97%',
  dense: 4769,
  spark: 18,
  speedup: 265,
  gpu: 'RTX 5090',
  clip: '81 frames · 5.06 s clip',
}

/* ----- Figure 4 — the high-sparsity trap (oracle correction) ---------------
   Terminal gap (normalized) after replacing the sparse student's velocity
   with the dense teacher's on one matched noise window. High-noise window
   recovers most of the gap; low-noise yields little; starkest at 97%.      */
export type TrapPanel = { sparsity: string; uncorrected: number; high: number; low: number }

export const trapPanels: TrapPanel[] = [
  { sparsity: '95% sparsity', uncorrected: 3.2, high: 1.1, low: 2.9 },
  { sparsity: '97% sparsity', uncorrected: 2.9, high: 0.5, low: 1.1 },
]

/* ----- Table 2 — VBench / VBench-2.0 quality ------------------------------
   Higher is better. Wan2.1-T2V-1.3B at 480×832; 14B & A14B at 720×1280,
   81-frame generation. Baselines run at their strongest official config
   (90% sparsity); SparkDiffusion is reported at matched 90% and at 97%.    */
export type QualityRow = {
  model: string
  method: 'Full' | 'FastWan (VSA)' | 'TurboDiffusion' | 'SparkDiffusion'
  vbench: number
  vb2: number
  creativity: number
  commonsense: number
  controllability: number
  humanFidelity: number
  physics: number
  sparsity: string
}

export const qualityRows: QualityRow[] = [
  { model: 'Wan2.1-T2V-1.3B', method: 'Full', vbench: 83.21, vb2: 56.02, creativity: 54.73, commonsense: 57.38, controllability: 34.96, humanFidelity: 78.71, physics: 54.30, sparsity: '0%' },
  { model: 'Wan2.1-T2V-1.3B', method: 'FastWan (VSA)', vbench: 82.37, vb2: 54.63, creativity: 52.66, commonsense: 56.52, controllability: 32.27, humanFidelity: 79.69, physics: 52.01, sparsity: '90%' },
  { model: 'Wan2.1-T2V-1.3B', method: 'TurboDiffusion', vbench: 82.52, vb2: 54.61, creativity: 51.72, commonsense: 56.94, controllability: 31.65, humanFidelity: 79.55, physics: 53.21, sparsity: '90%' },
  { model: 'Wan2.1-T2V-1.3B', method: 'SparkDiffusion', vbench: 82.64, vb2: 55.85, creativity: 53.99, commonsense: 57.13, controllability: 33.75, humanFidelity: 80.34, physics: 54.02, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'Full', vbench: 83.69, vb2: 60.20, creativity: 55.25, commonsense: 63.98, controllability: 37.32, humanFidelity: 81.60, physics: 62.84, sparsity: '0%' },
  { model: 'Wan2.1-T2V-14B', method: 'FastWan (VSA)', vbench: 82.72, vb2: 58.04, creativity: 54.97, commonsense: 59.54, controllability: 35.75, humanFidelity: 81.72, physics: 58.20, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'TurboDiffusion', vbench: 82.88, vb2: 57.98, creativity: 54.88, commonsense: 59.77, controllability: 34.98, humanFidelity: 81.51, physics: 58.74, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'SparkDiffusion', vbench: 83.42, vb2: 59.36, creativity: 55.22, commonsense: 60.88, controllability: 37.41, humanFidelity: 83.51, physics: 59.77, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'SparkDiffusion', vbench: 83.15, vb2: 58.05, creativity: 54.81, commonsense: 59.02, controllability: 36.01, humanFidelity: 81.77, physics: 58.63, sparsity: '97%' },
  { model: 'Wan2.2-T2V-A14B', method: 'Full', vbench: 84.21, vb2: 60.36, creativity: 55.60, commonsense: 64.50, controllability: 37.40, humanFidelity: 81.30, physics: 63.00, sparsity: '0%' },
  { model: 'Wan2.2-T2V-A14B', method: 'SparkDiffusion', vbench: 83.75, vb2: 59.77, creativity: 55.51, commonsense: 61.36, controllability: 37.55, humanFidelity: 83.88, physics: 60.53, sparsity: '90%' },
  { model: 'Wan2.2-T2V-A14B', method: 'SparkDiffusion', vbench: 83.36, vb2: 58.46, creativity: 55.09, commonsense: 59.32, controllability: 35.67, humanFidelity: 81.92, physics: 60.30, sparsity: '97%' },
]

/* SparkDiffusion row per model for grouped bar / radar charts — prefer the
   headline 97% config when the model has one, else the 90% row. */
export const sparkRowOf = (model: string): QualityRow =>
  qualityRows.find((r) => r.model === model && r.method === 'SparkDiffusion' && r.sparsity === '97%') ??
  qualityRows.find((r) => r.model === model && r.method === 'SparkDiffusion')!
