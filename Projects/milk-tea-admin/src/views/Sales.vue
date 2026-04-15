<template>
  <div class="sales-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card b-blue">
          <div class="card-inner">
            <div class="info">
              <div class="title">{{ t('sales.cards.todaySales') }}</div>
              <div class="value">{{ v1 }}</div>
            </div>
            <el-icon class="icon"><DataLine /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card b-green">
          <div class="card-inner">
            <div class="info">
              <div class="title">{{ t('sales.cards.monthRevenue') }}</div>
              <div class="value">¥{{ v2 }}</div>
            </div>
            <el-icon class="icon"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card b-red">
          <div class="card-inner">
            <div class="info">
              <div class="title">{{ t('sales.cards.exceptionLoss') }}</div>
              <div class="value">{{ v3 }}</div>
            </div>
            <el-icon class="icon"><Warning /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card b-orange">
          <div class="card-inner">
            <div class="info">
              <div class="title">{{ t('sales.cards.deductionCount') }}</div>
              <div class="value">{{ v4 }}</div>
            </div>
            <el-icon class="icon"><Setting /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card" shadow="never">
      <el-tabs v-model="tabName" @tab-change="onTab">
        <el-tab-pane :label="t('sales.tabs.records')" name="list">
          <el-table :data="salesList" stripe border height="450">
            <el-table-column prop="id" :label="t('sales.table.orderNo')" width="140" />
            <el-table-column prop="name" :label="t('sales.table.product')" />
            <el-table-column prop="num" :label="t('sales.table.qty')" width="80" align="center" />
            <el-table-column :label="t('sales.table.total')" width="100">
              <template #default="s">¥{{ (s.row.num * s.row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="date" :label="t('sales.table.date')" width="160" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="t('sales.tabs.analysis')" name="chart">
          <el-row :gutter="20">
            <el-col :span="16"><div id="lineChart" style="height: 400px; width: 100%;"></div></el-col>
            <el-col :span="8"><div id="barChart" style="height: 400px; width: 100%;"></div></el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { DataLine, Money, Warning, Setting } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const { t } = useI18n();
const tabName = ref('list');

// 【终极方案】：不再使用数组索引，直接定义独立变量，彻底告别 Cannot read properties of undefined
const v1 = ref(0);
const v2 = ref(0);
const v3 = ref(0);
const v4 = ref(0);

// 你的数据
const xLine = ['04-11', '04-12', '04-13', '04-14', '04-15', '04-16', '04-17'];
const yLine = [1200, 1900, 1500, 2100, 1800, 2500, 2200];
const xBar = ['旗舰店', '概念店', '黑金店', '快取店'];
const yBar = [3500, 2800, 4200, 3100];

const goals = [865, 125800, 4, 860];
const refs = [v1, v2, v3, v4];

const salesList = ref([]);

onMounted(() => {
  for (let i = 0; i < 15; i++) {
    salesList.value.push({ id: 'SAL'+i, name: '招牌奶茶', num: 2, price: 15, date: '2026-04-17' });
  }

  // 执行动画
  goals.forEach((goal, i) => {
    let start = null;
    const run = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 2000, 1);
      refs[i].value = Math.floor(prog * goal);
      if (prog < 1) window.requestAnimationFrame(run);
    };
    window.requestAnimationFrame(run);
  });
});

let c1 = null; 
let c2 = null;

const init = () => {
  const d1 = document.getElementById('lineChart');
  const d2 = document.getElementById('barChart');
  if (d1) {
    c1 = echarts.init(d1);
    c1.setOption({
      title: { text: t('sales.charts.trendTitle'), left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: xLine },
      yAxis: { type: 'value' },
      series: [{ data: yLine, type: 'line', smooth: true, color: '#409EFF' }]
    });
  }
  if (d2) {
    c2 = echarts.init(d2);
    c2.setOption({
      title: { text: t('sales.charts.lossTitle'), left: 'center' },
      xAxis: { type: 'category', data: xBar },
      yAxis: { type: 'value' },
      series: [{ data: yBar, type: 'bar', color: '#F56C6C' }]
    });
  }
};

const onTab = (v) => { if (v === 'chart') nextTick(() => init()); };

window.addEventListener('resize', () => {
  if (c1) c1.resize();
  if (c2) c2.resize();
});
</script>

<style lang="scss" scoped>
.sales-container { padding: 20px; }
.mb-4 { margin-bottom: 20px; }
.stat-card { border: none; border-radius: 12px; color: #fff; }
.card-inner { display: flex; justify-content: space-between; align-items: center; }
.info .title { font-size: 14px; opacity: 0.9; }
.info .value { font-size: 26px; font-weight: bold; margin-top: 5px; }
.icon { font-size: 32px; opacity: 0.3; }
.b-blue { background: linear-gradient(135deg, #409EFF, #79bbff); }
.b-green { background: linear-gradient(135deg, #67C23A, #95d475); }
.b-red { background: linear-gradient(135deg, #F56C6C, #f89898); }
.b-orange { background: linear-gradient(135deg, #E6A23C, #eebe77); }
.main-card { border-radius: 12px; }
</style>