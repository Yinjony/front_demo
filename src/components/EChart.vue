<script setup lang="ts">
/* Thin Vue wrapper around ECharts — mounts a chart into a div, wires the
   theme to the site's blueprint palette, and keeps the canvas sized to its
   container via ResizeObserver. Option changes re-render in place. */
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  height?: string
}>()

const host = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!host.value) return
  chart = echarts.init(host.value)
  chart.setOption(props.option)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(host.value)
})

watch(
  () => props.option,
  (option) => chart?.setOption(option, true),
  { deep: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="host" class="echart" :style="height ? { height } : undefined" aria-hidden="true"></div>
</template>

<style scoped>
.echart {
  width: 100%;
  min-height: 300px;
}
</style>
