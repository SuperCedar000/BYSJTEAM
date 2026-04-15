<template>
  <div class="dashboard-wrapper">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="(card, i) in statCards" :key="i">
        <el-card shadow="hover" class="stat-card" :class="card.color">
          <div class="card-header">{{ t(card.title) }}</div>
          <div class="card-main">
            <span class="num">{{ card.prefix }}{{ card.value }}</span>
            <el-icon class="icon"><component :is="card.icon" /></el-icon>
          </div>
          <div class="card-footer">
            <span class="trend">↑ 12% {{ t('dashboard.table.trend') }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header><div class="c-header"><span>{{ t('dashboard.charts.salesTrend') }}</span></div></template>
          <div id="salesChart" class="echart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header><div class="c-header"><span>{{ t('dashboard.charts.stockDist') }}</span></div></template>
          <div id="pieChart" class="echart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row bottom-row">
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header><div class="c-header"><span>{{ t('dashboard.charts.purchaseFlow') }}</span></div></template>
          <div id="barChart" class="echart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header><div class="c-header"><span>{{ t('dashboard.charts.lossRadar') }}</span></div></template>
          <div id="radarChart" class="echart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header><div class="c-header"><span>{{ t('dashboard.charts.capacityGauge') }}</span></div></template>
          <div id="gaugeChart" class="echart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { Box, Money, Aim, Warning } from '@element-plus/icons-vue'

const { t } = useI18n()
const tab = ref('hq')

// 指标数据
const statCards = [
  { title: 'dashboard.cards.totalStock', value: '85,420', icon: Box, color: 'blue', prefix: '' },
  { title: 'dashboard.cards.stockValue', value: '1,240,000', icon: Money, color: 'green', prefix: '¥' },
  { title: 'dashboard.cards.salesTarget', value: '92.4%', icon: Aim, color: 'purple', prefix: '' },
  { title: 'dashboard.cards.warningCount', value: '14', icon: Warning, color: 'orange', prefix: '' }
]

// 图表实例持久化
let charts = { line: null, pie: null, bar: null, radar: null, gauge: null }

const initLine = () => {
  const el = document.getElementById('salesChart')
  if (!el) return
  charts.line = echarts.init(el)
  charts.line.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'], boundaryGap: false },
    yAxis: { type: 'value' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    series: [{
      name: 'Sales', type: 'line', smooth: true, 
      data: [1200, 1900, 1500, 2100, 1800, 2500, 2200],
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(64,158,255,0.5)'}, {offset: 1, color: 'rgba(64,158,255,0)'}]) },
      itemStyle: { color: '#409EFF' }
    }]
  })
}

const initPie = () => {
  const el = document.getElementById('pieChart')
  if (!el) return
  charts.pie = echarts.init(el)
  charts.pie.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 1048, name: '茶叶类' }, { value: 735, name: '乳制品' },
        { value: 580, name: '包材类' }, { value: 484, name: '小料类' }
      ]
    }]
  })
}

const initBar = () => {
  const el = document.getElementById('barChart')
  if (!el) return
  charts.bar = echarts.init(el)
  charts.bar.setOption({
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: ['供应商A', '供应商B', '供应商C', '供应商D'] },
    series: [{ type: 'bar', data: [3500, 2800, 4200, 3100], itemStyle: { color: '#67C23A' } }]
  })
}

const initRadar = () => {
  const el = document.getElementById('radarChart')
  if (!el) return
  charts.radar = echarts.init(el)
  charts.radar.setOption({
    radar: {
      indicator: [
        { name: '过期损耗', max: 100 }, { name: '操作失误', max: 100 },
        { name: '设备故障', max: 100 }, { name: '要货过度', max: 100 }, { name: '其他', max: 100 }
      ]
    },
    series: [{ type: 'radar', data: [{ value: [65, 78, 45, 80, 30], name: '损耗维度' }], areaStyle: { color: 'rgba(245,108,108,0.3)' }, itemStyle: { color: '#F56C6C' } }]
  })
}

const initGauge = () => {
  const el = document.getElementById('gaugeChart')
  if (!el) return
  charts.gauge = echarts.init(el)
  charts.gauge.setOption({
    series: [{
      type: 'gauge', progress: { show: true }, detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20 },
      data: [{ value: 78, name: 'Usage' }]
    }]
  })
}

onMounted(() => {
  nextTick(() => {
    initLine(); initPie(); initBar(); initRadar(); initGauge();
    window.addEventListener('resize', handleResize)
  })
})

const handleResize = () => {
  Object.values(charts).forEach(c => c && c.resize())
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  Object.values(charts).forEach(c => c && c.dispose())
})
</script>

<style lang="scss" scoped>
.dashboard-wrapper { padding: 20px; background: #f0f2f5; min-height: calc(100vh - 100px); }

/* 卡片样式 */
.stat-row { margin-bottom: 20px; }
.stat-card {
  border: none; border-radius: 12px; color: #fff;
  &.blue { background: linear-gradient(135deg, #409EFF, #79bbff); }
  &.green { background: linear-gradient(135deg, #67C23A, #95d475); }
  &.purple { background: linear-gradient(135deg, #7367f0, #ce9ffc); }
  &.orange { background: linear-gradient(135deg, #f09819, #ff512f); }
  
  .card-header { font-size: 14px; opacity: 0.9; }
  .card-main {
    display: flex; justify-content: space-between; align-items: center; margin: 10px 0;
    .num { font-size: 28px; font-weight: bold; }
    .icon { font-size: 40px; opacity: 0.3; }
  }
  .card-footer { font-size: 12px; opacity: 0.8; }
}

/* 图表区 */
.chart-row { margin-bottom: 20px; }
.chart-card {
  border-radius: 12px; border: none;
  .c-header { font-weight: bold; color: #333; }
  .echart-container { height: 300px; width: 100%; }
}

.bottom-row .echart-container { height: 250px; }

/* 悬浮高亮动效 */
.el-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover { transform: translateY(-5px); box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.08); }
}
</style>