/* ============================================================================
   ECharts option factories for the paper figures. Palette follows the site:
   ink #e8ecff, muted rgba(232,236,255,.64), signal #4d8bff, violet #9d7bff,
   on a #0d1322 card substrate. Full Attention reads as desaturated slate;
   SparkDiffusion gets the signal-blue accent — same vocabulary as the "Ours"
   demo column. Labels are pre-formatted strings (no callbacks) so the whole
   file stays plainly typed for vue-tsc.                                      */
import type { EChartsOption } from 'echarts'
import {
  headline,
  latencyRows,
  qualityRows,
  sparkRowOf,
  trapPanels,
  type LatencyRow,
  type QualityRow,
} from './data/paperData'

const INK = '#e8ecff'
const MUTED = 'rgba(232, 236, 255, .64)'
const QUIET = 'rgba(232, 236, 255, .38)'
const RULE = 'rgba(232, 236, 255, .16)'
const SIGNAL = '#4d8bff'

/* Full Attention = desaturated slate; SparkDiffusion = signal blue.
   H100 solid vs RTX 5090 tinted keeps the GPU pairing readable in both
   charts without a 4-color rainbow. */
const FA_H100 = 'rgba(148, 158, 190, .95)'
const FA_5090 = 'rgba(148, 158, 190, .45)'
const SD_H100 = SIGNAL
const SD_5090 = 'rgba(77, 139, 255, .42)'

const MONO = "'DM Mono', monospace"

const axisBase = {
  axisLine: { lineStyle: { color: RULE } },
  axisTick: { show: false },
  axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(232, 236, 255, .07)' } },
}

const tooltipBase = {
  backgroundColor: '#111832',
  borderColor: RULE,
  textStyle: { color: INK, fontFamily: MONO, fontSize: 12 },
}

/* 92 → "92 s", 0.6 → "0.6 s", 25.1 → "25.1 s" */
const sec = (s: number) => `${+s.toFixed(2)} s`
/* Latency bar point: value + pre-rendered end label. */
const latPoint = (v: number, labelColor: string) => ({
  value: v,
  label: { show: true, position: 'right' as const, color: labelColor, fontFamily: MONO, fontSize: 10, formatter: sec(v) },
})

/* ----- Figure 2a — end-to-end latency (log scale) -------------------------- */
export function latencyOption(): EChartsOption {
  const models = [...new Set(latencyRows.map((r) => r.model))]
  const at = (model: string, gpu: LatencyRow['gpu']) =>
    latencyRows.find((r) => r.model === model && r.gpu === gpu)!

  return {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 70, top: 42, bottom: 8, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: { color: MUTED, fontFamily: MONO, fontSize: 10 },
      data: ['H100 · Full', 'H100 · Spark', '5090 · Full', '5090 · Spark'],
    },
    tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'log',
      logBase: 10,
      min: 0.4,
      max: 8000,
      name: 'Latency (s, log)',
      nameLocation: 'middle',
      nameGap: 26,
      nameTextStyle: { color: QUIET, fontFamily: MONO, fontSize: 10 },
      ...axisBase,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: models.map((m) => m.split('-T2V-').join('\nT2V ')),
      axisLine: { show: true, lineStyle: { color: RULE } },
      axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 10, lineHeight: 15 },
      splitLine: { show: false },
    },
    series: [
      {
        name: 'H100 · Full',
        type: 'bar',
        barWidth: 9,
        itemStyle: { color: FA_H100, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => latPoint(at(m, 'H100').full, QUIET)),
      },
      {
        name: 'H100 · Spark',
        type: 'bar',
        barWidth: 9,
        itemStyle: { color: SD_H100, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => latPoint(at(m, 'H100').spark, MUTED)),
      },
      {
        name: '5090 · Full',
        type: 'bar',
        barWidth: 9,
        itemStyle: { color: FA_5090, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => latPoint(at(m, 'RTX 5090').full, QUIET)),
      },
      {
        name: '5090 · Spark',
        type: 'bar',
        barWidth: 9,
        itemStyle: { color: SD_5090, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => latPoint(at(m, 'RTX 5090').spark, MUTED)),
      },
    ],
  }
}

/* ----- Figure 2b — speedup over Full Attention ----------------------------- */
export function speedupOption(): EChartsOption {
  const models = [...new Set(latencyRows.map((r) => r.model))]
  const at = (model: string, gpu: LatencyRow['gpu']) =>
    latencyRows.find((r) => r.model === model && r.gpu === gpu)!
  const supPoint = (v: number, color: string) => ({
    value: v,
    label: { show: true, position: 'right' as const, color, fontFamily: MONO, fontSize: 10.5, formatter: `${v}×` },
  })

  return {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 56, top: 42, bottom: 8, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: MUTED, fontFamily: MONO, fontSize: 10.5 },
      data: ['H100', 'RTX 5090'],
    },
    tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      min: 0,
      max: 300,
      interval: 50,
      name: 'Speedup (×)',
      nameLocation: 'middle',
      nameGap: 26,
      nameTextStyle: { color: QUIET, fontFamily: MONO, fontSize: 10 },
      ...axisBase,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: models.map((m) => m.split('-T2V-').join('\nT2V ')),
      axisLine: { show: true, lineStyle: { color: RULE } },
      axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 10, lineHeight: 15 },
      splitLine: { show: false },
    },
    series: [
      {
        name: 'H100',
        type: 'bar',
        barWidth: 11,
        itemStyle: { color: SD_H100, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => supPoint(at(m, 'H100').speedup, MUTED)),
      },
      {
        name: 'RTX 5090',
        type: 'bar',
        barWidth: 11,
        itemStyle: { color: SD_5090, borderRadius: [0, 2, 2, 0] },
        data: models.map((m) => supPoint(at(m, 'RTX 5090').speedup, MUTED)),
      },
    ],
  }
}

/* ----- Figure 3 — headline speedup (dense vs SparkDiffusion) ---------------- */
export function headlineOption(): EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 100, top: 34, bottom: 8, containLabel: true },
    tooltip: { ...tooltipBase, trigger: 'item' },
    xAxis: {
      type: 'log',
      logBase: 10,
      min: 10,
      max: 6000,
      ...axisBase,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ['Full Attention', 'SparkDiffusion'],
      axisLine: { show: true, lineStyle: { color: RULE } },
      axisLabel: { color: INK, fontFamily: MONO, fontSize: 11 },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 22,
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        data: [
          { value: headline.dense, itemStyle: { color: FA_H100 }, label: { show: true, position: 'right', color: QUIET, fontFamily: MONO, fontSize: 11, formatter: sec(headline.dense) } },
          { value: headline.spark, itemStyle: { color: SIGNAL }, label: { show: true, position: 'right', color: INK, fontFamily: MONO, fontSize: 11, formatter: sec(headline.spark) } },
        ],
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: '#9d7bff', type: 'dashed', width: 1.2 },
          label: {
            show: true,
            position: 'insideMiddleTop',
            formatter: `${headline.speedup}× faster`,
            color: '#9d7bff',
            fontFamily: MONO,
            fontSize: 11,
            distance: 8,
          },
          data: [{ xAxis: headline.spark }],
        },
      },
    ],
  }
}

/* ----- Figure 4 — the high-sparsity trap (oracle correction) ---------------- */
export function trapOption(): EChartsOption {
  const categories = ['Uncorrected', 'High-noise\ncorrection', 'Low-noise\ncorrection']
  const colors = ['rgba(148, 158, 190, .9)', SIGNAL, 'rgba(157, 123, 255, .75)']
  const fmt = (v: number) => `${v.toFixed(1)}`

  return {
    backgroundColor: 'transparent',
    grid: trapPanels.map((_, i) => ({
      left: i === 0 ? 8 : '55.5%',
      right: i === 0 ? '55.5%' : 24,
      top: 46,
      bottom: 8,
      containLabel: true,
    })),
    tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: trapPanels.map((_, i) => ({
      type: 'category',
      gridIndex: i,
      data: categories,
      axisLine: { lineStyle: { color: RULE } },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 10, lineHeight: 14 },
    })),
    yAxis: trapPanels.map((_, i) => ({
      type: 'value',
      gridIndex: i,
      min: 0,
      max: 3.5,
      interval: 0.5,
      name: 'Terminal gap',
      nameTextStyle: { color: QUIET, fontFamily: MONO, fontSize: 10 },
      nameLocation: 'middle',
      nameGap: 42,
      nameRotate: 90,
      ...axisBase,
    })),
    title: trapPanels.map((p, i) => ({
      text: p.sparsity,
      left: i === 0 ? '27%' : '77%',
      top: 6,
      textAlign: 'center',
      textStyle: { color: INK, fontFamily: MONO, fontSize: 12, fontWeight: 500 },
    })),
    series: trapPanels.map((p, i) => ({
      name: p.sparsity,
      type: 'bar',
      xAxisIndex: i,
      yAxisIndex: i,
      barWidth: 30,
      itemStyle: { borderRadius: [2, 2, 0, 0] },
      label: { show: true, position: 'top', color: MUTED, fontFamily: MONO, fontSize: 10.5 },
      data: [
        { value: p.uncorrected, itemStyle: { color: colors[0] }, label: { formatter: fmt(p.uncorrected) } },
        { value: p.high, itemStyle: { color: colors[1] }, label: { formatter: fmt(p.high), color: INK } },
        { value: p.low, itemStyle: { color: colors[2] }, label: { formatter: fmt(p.low) } },
      ],
    })),
  }
}

/* ----- Table 2 — VBench total, zoomed to show near-losslessness ------------- */
export function vbenchOption(): EChartsOption {
  const models = [...new Set(qualityRows.map((r) => r.model))]
  const by = (method: QualityRow['method']) =>
    models.map((m) => qualityRows.find((r) => r.model === m && r.method === method)?.vbench ?? null)
  const spark = models.map((m) => sparkRowOf(m).vbench)
  const fmt = (v: number | null | undefined) => (v == null ? '–' : v.toFixed(2))

  return {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 16, top: 42, bottom: 8, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: MUTED, fontFamily: MONO, fontSize: 10.5 },
    },
    tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: models,
      axisLine: { lineStyle: { color: RULE } },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontFamily: MONO, fontSize: 10, interval: 0 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 85,
      interval: 1,
      name: 'VBench Total ↑',
      nameTextStyle: { color: QUIET, fontFamily: MONO, fontSize: 10 },
      nameLocation: 'middle',
      nameGap: 40,
      nameRotate: 90,
      ...axisBase,
    },
    series: [
      {
        name: 'Full Attention',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: FA_H100, borderRadius: [2, 2, 0, 0] },
        data: by('Full').map((v) => ({ value: v, label: { formatter: fmt(v) } })),
        label: { show: true, position: 'top', color: QUIET, fontFamily: MONO, fontSize: 10 },
      },
      {
        name: 'FastWan (VSA)',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: 'rgba(148, 158, 190, .75)', borderRadius: [2, 2, 0, 0] },
        data: by('FastWan (VSA)').map((v) => ({ value: v, label: { formatter: fmt(v) } })),
        label: { show: true, position: 'top', color: QUIET, fontFamily: MONO, fontSize: 10 },
      },
      {
        name: 'TurboDiffusion',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: 'rgba(157, 123, 255, .55)', borderRadius: [2, 2, 0, 0] },
        data: by('TurboDiffusion').map((v) => ({ value: v, label: { formatter: fmt(v) } })),
        label: { show: true, position: 'top', color: QUIET, fontFamily: MONO, fontSize: 10 },
      },
      {
        name: 'SparkDiffusion',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: SIGNAL, borderRadius: [2, 2, 0, 0] },
        data: spark.map((v) => ({ value: v, label: { formatter: fmt(v), color: INK } })),
        label: { show: true, position: 'top', color: INK, fontFamily: MONO, fontSize: 10 },
      },
    ],
  }
}

/* ----- Table 2 — VBench-2.0 capability radar (Wan2.1-T2V-14B) --------------- */
export function radarOption(): EChartsOption {
  const pick = (m: QualityRow['method']) => qualityRows.find((r) => r.model === 'Wan2.1-T2V-14B' && r.method === m)!
  const spark = sparkRowOf('Wan2.1-T2V-14B')
  const keys = ['creativity', 'commonsense', 'controllability', 'humanFidelity', 'physics'] as const
  const indicators = [
    { name: 'Creativity', min: 25, max: 90 },
    { name: 'Commonsense', min: 25, max: 90 },
    { name: 'Controllability', min: 25, max: 90 },
    { name: 'Human Fidelity', min: 25, max: 90 },
    { name: 'Physics', min: 25, max: 90 },
  ]

  return {
    backgroundColor: 'transparent',
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: MUTED, fontFamily: MONO, fontSize: 10.5 },
    },
    tooltip: { ...tooltipBase, trigger: 'item' },
    radar: {
      indicator: indicators,
      center: ['50%', '48%'],
      radius: '62%',
      axisName: { color: MUTED, fontFamily: MONO, fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(232, 236, 255, .12)' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(232, 236, 255, .12)' } },
    },
    series: [
      {
        type: 'radar',
        symbolSize: 3,
        data: [
          {
            name: 'Full Attention',
            value: keys.map((k) => pick('Full')[k]),
            lineStyle: { color: FA_H100, width: 1.6 },
            itemStyle: { color: FA_H100 },
            areaStyle: { color: 'rgba(148, 158, 190, .08)' },
          },
          {
            name: 'FastWan (VSA)',
            value: keys.map((k) => pick('FastWan (VSA)')[k]),
            lineStyle: { color: 'rgba(148, 158, 190, .75)', width: 1.6 },
            itemStyle: { color: 'rgba(148, 158, 190, .75)' },
            areaStyle: { color: 'rgba(148, 158, 190, .06)' },
          },
          {
            name: 'TurboDiffusion',
            value: keys.map((k) => pick('TurboDiffusion')[k]),
            lineStyle: { color: 'rgba(157, 123, 255, .8)', width: 1.6 },
            itemStyle: { color: 'rgba(157, 123, 255, .8)' },
            areaStyle: { color: 'rgba(157, 123, 255, .06)' },
          },
          {
            name: `SparkDiffusion (${spark.sparsity})`,
            value: keys.map((k) => spark[k]),
            lineStyle: { color: SIGNAL, width: 1.6 },
            itemStyle: { color: SIGNAL },
            areaStyle: { color: 'rgba(77, 139, 255, .10)' },
          },
        ],
      },
    ],
  }
}

export const chartPalette = { INK, MUTED, QUIET, RULE, SIGNAL, MONO }
