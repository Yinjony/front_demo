/* ============================================================================
   Numbers transcribed from the SparkDiffusion paper (docs/论文.pdf).
   Sources: Fig. 2 / Fig. 3 (pp. 2–3), Fig. 4 (p. 4), Table 1 (p. 10).
   ========================================================================== */

/* ----- Figure 2 — end-to-end latency (s) & speedup over Full Attention -----
   Suffixes 90 / 97 = attention sparsity. Speedup = Full / SparkDiffusion,
   rounded to integer. RTX 5090 Wan2.2 latency includes expert-switch overhead
   (H100 keeps both experts resident, so none is incurred there).            */
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
  { model: 'Wan2.2-T2V-A14B-720P', short: 'Wan2.2 A14B · 720P · 97%', gpu: 'H100', full: 1500, spark: 8, speedup: 189 },
  { model: 'Wan2.2-T2V-A14B-720P', short: 'Wan2.2 A14B · 720P · 97%', gpu: 'RTX 5090', full: 4343, spark: 25.1, speedup: 181 },
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

/* ----- Table 1 — VBench / VBench-2.0 quality ------------------------------
   Higher is better. Wan2.1-T2V-1.3B at 480×832; 14B & A14B at 720×1280,
   81-frame generation. VB2 = VBench-2.0 overall.                          */
export type QualityRow = {
  model: string
  method: 'Full' | 'TurboDiffusion' | 'SparkDiffusion'
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
  { model: 'Wan2.1-T2V-1.3B', method: 'TurboDiffusion', vbench: 82.64, vb2: 54.17, creativity: 50.72, commonsense: 56.94, controllability: 30.65, humanFidelity: 79.34, physics: 53.21, sparsity: '90%' },
  { model: 'Wan2.1-T2V-1.3B', method: 'SparkDiffusion', vbench: 82.82, vb2: 55.49, creativity: 52.99, commonsense: 55.63, controllability: 33.25, humanFidelity: 82.55, physics: 53.02, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'Full', vbench: 83.69, vb2: 60.20, creativity: 55.25, commonsense: 63.98, controllability: 37.32, humanFidelity: 81.60, physics: 62.84, sparsity: '0%' },
  { model: 'Wan2.1-T2V-14B', method: 'TurboDiffusion', vbench: 82.98, vb2: 55.60, creativity: 51.88, commonsense: 59.02, controllability: 30.98, humanFidelity: 79.51, physics: 56.63, sparsity: '90%' },
  { model: 'Wan2.1-T2V-14B', method: 'SparkDiffusion', vbench: 83.25, vb2: 57.63, creativity: 54.81, commonsense: 58.77, controllability: 34.01, humanFidelity: 85.37, physics: 55.20, sparsity: '97%' },
  { model: 'Wan2.2-T2V-A14B', method: 'Full', vbench: 84.21, vb2: 60.36, creativity: 55.60, commonsense: 64.50, controllability: 37.40, humanFidelity: 81.30, physics: 63.00, sparsity: '0%' },
  { model: 'Wan2.2-T2V-A14B', method: 'SparkDiffusion', vbench: 83.36, vb2: 58.14, creativity: 55.09, commonsense: 59.32, controllability: 35.67, humanFidelity: 84.32, physics: 56.30, sparsity: '97%' },
]
