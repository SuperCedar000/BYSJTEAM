<template>
  <div class="inventory-container">
    
    <el-row :gutter="20" class="mb-4 dashboard-cards">
      <el-col :span="6" v-for="(stat, index) in statCards" :key="index">
        <el-card shadow="hover" class="data-card" :class="stat.theme">
          <div class="card-content">
            <div class="card-info">
              <div class="card-title">{{ t(stat.titleKey) }}</div>
              <div class="card-value">{{ stat.prefix || '' }}{{ stat.value }}</div>
            </div>
            <div class="card-icon"><el-icon><component :is="stat.icon" /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card" shadow="never">
      <el-tabs v-model="activeTab" class="custom-tabs">
        
        <!-- 批次管理 -->
        <el-tab-pane :label="t('inventory.tabs.batch')" name="batch">
          <el-table :data="inventoryList" style="width: 100%" class="expandable-table" stripe row-key="id">
            <el-table-column type="expand">
              <template #default="props">
                <div class="expand-detail">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item :label="t('inventory.table.supplier')">{{ props.row.supplier }}</el-descriptions-item>
                    <el-descriptions-item :label="t('inventory.table.location')">{{ props.row.location }}</el-descriptions-item>
                    <el-descriptions-item :label="t('inventory.table.inDate')">{{ props.row.inDate }}</el-descriptions-item>
                    <el-descriptions-item :label="t('inventory.table.expDate')">
                      <span :class="{'text-danger': props.row.status === 'expiring'}">{{ props.row.expDate }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="备注">初始批次数据</el-descriptions-item>
                  </el-descriptions>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="code" :label="t('inventory.table.code')" width="120" sortable />
            <el-table-column prop="name" :label="t('inventory.table.name')" min-width="150" />
            <el-table-column prop="batchNo" :label="t('inventory.table.batchNo')" width="140" />
            <el-table-column prop="stock" :label="t('inventory.table.stock')" width="120" sortable>
              <template #default="scope">
                <span :class="{'text-danger font-bold': scope.row.stock < scope.row.threshold}">
                  {{ scope.row.stock }} {{ scope.row.unit }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="t('inventory.table.status')" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getStatusColor(scope.row.status)" effect="dark">
                  {{ t('inventory.warning.' + scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column :label="t('inventory.table.actions')" width="180" align="right">
              <template #default="scope">
                <div class="dynamic-actions">
                  <el-button size="small" type="primary" plain @click="openOperation(scope.row, 'in')">入库</el-button>
                  <el-button size="small" type="warning" plain @click="openOperation(scope.row, 'out')">出库</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 预警管理 -->
        <el-tab-pane :label="t('inventory.tabs.warning')" name="warning">
          <h3 style="margin-top: 0;">{{ t('inventory.warning.title') }}</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="item in warningList" :key="item.id" style="margin-bottom: 20px;">
              <el-card shadow="always" class="warning-card" :class="item.status === 'lowStock' ? 'flash-red' : 'flash-orange'">
                <div class="warn-header">
                  <span class="warn-title">{{ item.name }}</span>
                  <el-tag :type="item.status === 'lowStock' ? 'danger' : 'warning'" effect="dark">
                    {{ t('inventory.warning.' + item.status) }}
                  </el-tag>
                </div>
                <div class="warn-body">
                  <div class="warn-data">
                    <p>当前数量：<strong>{{ item.stock }}</strong> {{ item.unit }}</p>
                    <p v-if="item.status === 'lowStock'">{{ t('inventory.warning.threshold') }}：{{ item.threshold }}</p>
                    <p v-if="item.status === 'expiring'">过期时间：{{ item.expDate }}</p>
                  </div>
                  <div class="warn-action">
                    <el-button v-if="item.status === 'lowStock'" type="danger" :icon="ShoppingCart" circle title="一键补货" @click="handleReplenish(item)" />
                    <el-button v-if="item.status === 'expiring'" type="warning" :icon="Delete" circle title="报废处理" @click="handleDispose(item)" />
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" v-if="warningList.length === 0">
              <el-empty description="当前无任何预警物料" />
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 快捷入库 -->
        <el-tab-pane :label="t('inventory.tabs.inbound')" name="inbound">
          <el-row :gutter="40">
            <el-col :span="12">
              <div class="operation-form-box">
                <h3>📦 快捷入库录入</h3>
                <el-form ref="inboundFormRef" :model="quickInForm" label-width="90px">
                  <el-form-item label="选择物料" required>
                    <el-select v-model="quickInForm.id" filterable placeholder="搜索" style="width: 100%" @change="onQuickInChange">
                      <el-option v-for="item in inventoryList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="入库数量" required>
                    <el-input-number v-model="quickInForm.qty" :min="1" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="入库源">
                    <el-radio-group v-model="quickInForm.source">
                      <el-radio value="采购入库">采购入库</el-radio>
                      <el-radio value="调拨入库">调拨入库</el-radio>
                      <el-radio value="门店退货">门店退货</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-button type="primary" style="width: 100%; margin-top: 15px;" @click="submitQuickIn">确认入库</el-button>
                </el-form>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="log-box">
                <h4>📜 今日入库流水</h4>
                <div v-for="log in inLogList" :key="log.time" class="log-item fade-in-log">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-content">入库 <strong style="color:var(--el-color-primary)">{{ log.name }}</strong> +{{ log.qty }}</span>
                  <el-tag size="small" type="info">{{ log.source }}</el-tag>
                </div>
                <el-empty v-if="inLogList.length === 0" description="暂无入库操作记录" :image-size="60" />
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 快捷出库 -->
        <el-tab-pane :label="t('inventory.tabs.outbound')" name="outbound">
          <el-row :gutter="40">
            <el-col :span="12">
              <div class="operation-form-box">
                <h3>📤 快捷出库录入</h3>
                <el-form ref="outboundFormRef" :model="quickOutForm" label-width="90px">
                  <el-form-item label="选择物料" required>
                    <el-select v-model="quickOutForm.id" filterable placeholder="搜索" style="width: 100%" @change="onQuickOutChange">
                      <el-option v-for="item in inventoryList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                    <div v-if="quickOutForm.max" class="hint-text">当前最大可出库：{{ quickOutForm.max }}</div>
                  </el-form-item>
                  <el-form-item label="出库数量" required>
                    <el-input-number 
                      v-model="quickOutForm.qty" 
                      :min="1" 
                      :max="quickOutForm.max > 0 ? quickOutForm.max : 1" 
                      :disabled="quickOutForm.max === 0"
                      style="width: 100%" 
                    />
                  </el-form-item>
                  <el-form-item label="出库去向">
                    <el-radio-group v-model="quickOutForm.target">
                      <el-radio value="门店配送">门店配送</el-radio>
                      <el-radio value="过期销毁">过期销毁</el-radio>
                      <el-radio value="研发领用">研发领用</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-button type="warning" style="width: 100%; margin-top: 15px;" @click="submitQuickOut">确认出库</el-button>
                </el-form>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="log-box">
                <h4>📜 今日出库流水</h4>
                <div v-for="log in outLogList" :key="log.time" class="log-item fade-in-log">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-content">出库 <strong style="color:var(--el-color-warning)">{{ log.name }}</strong> -{{ log.qty }}</span>
                  <el-tag size="small" type="info">{{ log.target }}</el-tag>
                </div>
                <el-empty v-if="outLogList.length === 0" description="暂无出库操作记录" :image-size="60" />
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 库存盘点 -->
        <el-tab-pane :label="t('inventory.tabs.check')" name="check">
          <div class="check-toolbar">
            <el-button type="primary" :icon="DocumentChecked" @click="startStocktake" v-if="!isChecking">开启盘点任务</el-button>
            <el-button type="success" :icon="Check" @click="submitStocktake" v-if="isChecking">提交盘点结果并同步系统</el-button>
            <span v-if="isChecking" class="check-hint">💡 请在右侧填入实际清点结果。</span>
          </div>
          <el-table :data="stocktakeList" border stripe>
            <el-table-column prop="code" label="物料编码" width="130" />
            <el-table-column prop="name" label="物料名称" min-width="150" />
            <el-table-column prop="stock" label="系统库存" width="100" align="center" />
            
            <el-table-column label="实盘数量" width="180" align="center">
              <template #default="scope">
                <el-input-number v-model="scope.row.actualStock" :min="0" size="small" :disabled="!isChecking" @change="calcDiff(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="差异盈亏" width="120" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.diff !== undefined" :type="scope.row.diff > 0 ? 'success' : (scope.row.diff < 0 ? 'danger' : 'info')" effect="dark">
                  {{ scope.row.diff > 0 ? '+' : '' }}{{ scope.row.diff }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'in' ? t('inventory.dialog.inTitle') : t('inventory.dialog.outTitle')" width="400px">
      <div v-if="currentRow" class="op-item-info">
        <h3>{{ currentRow.name }}</h3>
        <p>当前库存：{{ currentRow.stock }} {{ currentRow.unit }}</p>
      </div>
      <el-form label-width="80px" class="mt-4">
        <el-form-item :label="t('inventory.dialog.qty')">
          <el-input-number v-model="operationQty" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('inventory.dialog.remark')">
          <el-input v-model="operationRemark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('inventory.dialog.cancel') }}</el-button>
        <el-button :type="dialogType === 'in' ? 'primary' : 'warning'" @click="confirmOperation" :loading="isOperating">
          {{ t('inventory.dialog.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Box, Money, Warning, Timer, ShoppingCart, Delete, DocumentChecked, Check } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()

const activeTab = ref('batch')
const inboundFormRef = ref(null)
const outboundFormRef = ref(null)
const inventoryList = ref([])

// 顶部统计卡片（动态计算）
const statCards = computed(() => {
  const totalStock = inventoryList.value.reduce((sum, i) => sum + (i.stock || 0), 0)
  const totalValue = inventoryList.value.reduce((sum, i) => sum + (i.stock || 0) * (i.unitPrice || 0), 0)
  const lowStockCount = inventoryList.value.filter(i => i.status === 'lowStock').length
  const expiringCount = inventoryList.value.filter(i => i.status === 'expiring').length
  return [
    { titleKey: 'inventory.cards.totalStock', value: totalStock, icon: Box, theme: 'theme-blue' },
    { titleKey: 'inventory.cards.totalValue', value: totalValue.toFixed(0), prefix: '¥', icon: Money, theme: 'theme-green' },
    { titleKey: 'inventory.cards.lowStock', value: lowStockCount, icon: Warning, theme: 'theme-red' },
    { titleKey: 'inventory.cards.expiring', value: expiringCount, icon: Timer, theme: 'theme-orange' }
  ]
})

const warningList = computed(() => inventoryList.value.filter(item => item.status !== 'normal'))

// 从后端获取库存数据
const fetchInventory = async () => {
  try {
    const res = await axios.get('/api/inventory', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    inventoryList.value = res.data.map(item => {
      let status = item.status
      if (!status) {
        if (item.stock < item.threshold) status = 'lowStock'
        else if (new Date(item.expDate) < new Date()) status = 'expiring'
        else status = 'normal'
      }
      return { ...item, status }
    })
  } catch (err) {
    ElMessage.error('获取库存数据失败')
  }
}

const getStatusColor = (status) => {
  const map = { normal: 'success', lowStock: 'danger', expiring: 'warning' }
  return map[status] || 'info'
}

const handleReplenish = (item) => openOperation(item, 'in')
const handleDispose = (item) => {
  ElMessageBox.confirm(`确认将【${item.name}】报废处理并清空库存吗？此操作不可逆！`, '报废警告', {
    confirmButtonText: '强制报废',
    cancelButtonText: '取消',
    type: 'error',
  }).then(() => {
    item.stock = 0
    item.status = 'lowStock'
    ElMessage.success(`${item.name} 已成功报废！`)
    // 可选：调用后端更新接口
  }).catch(() => {})
}

// 出入库弹窗
const dialogVisible = ref(false)
const dialogType = ref('in')
const currentRow = ref(null)
const operationQty = ref(1)
const operationRemark = ref('')
const isOperating = ref(false)

const openOperation = (row, type) => {
  currentRow.value = row
  dialogType.value = type
  operationQty.value = 1
  operationRemark.value = ''
  dialogVisible.value = true
}

const confirmOperation = () => {
  isOperating.value = true
  setTimeout(() => {
    const target = inventoryList.value.find(i => i.id === currentRow.value.id)
    if (target) {
      if (dialogType.value === 'in') {
        target.stock += operationQty.value
      } else {
        if (target.stock < operationQty.value) {
          ElMessage.error('出库数量不能大于当前库存！')
          isOperating.value = false
          return
        }
        target.stock -= operationQty.value
      }
      target.status = target.stock < target.threshold ? 'lowStock' : 'normal'
      ElMessage.success(`${dialogType.value === 'in' ? '入库' : '出库'}完成！`)
    }
    isOperating.value = false
    dialogVisible.value = false
  }, 500)
}

// 快捷出入库流水
const quickInForm = reactive({ id: '', qty: 1, source: '采购入库' })
const quickOutForm = reactive({ id: '', qty: 1, target: '门店配送', max: 0 })
const inLogList = ref([])
const outLogList = ref([])

const onQuickInChange = () => { quickInForm.qty = 1 }
const onQuickOutChange = (val) => {
  const item = inventoryList.value.find(i => i.id === val)
  quickOutForm.max = item ? item.stock : 0
  quickOutForm.qty = 1
}
const submitQuickIn = () => {
  if (!quickInForm.id) return ElMessage.warning('请选择要入库的物料')
  const item = inventoryList.value.find(i => i.id === quickInForm.id)
  if (item) {
    item.stock += quickInForm.qty
    item.status = item.stock < item.threshold ? 'lowStock' : 'normal'
    inLogList.value.unshift({
      time: new Date().toLocaleTimeString(), name: item.name, qty: quickInForm.qty, source: quickInForm.source
    })
    ElMessage.success(`【${item.name}】入库成功！`)
    quickInForm.id = ''; quickInForm.qty = 1
  }
}
const submitQuickOut = () => {
  if (!quickOutForm.id) return ElMessage.warning('请选择要出库的物料')
  const item = inventoryList.value.find(i => i.id === quickOutForm.id)
  if (item) {
    if (item.stock < quickOutForm.qty) return ElMessage.error('库存不足，无法出库！')
    item.stock -= quickOutForm.qty
    item.status = item.stock < item.threshold ? 'lowStock' : 'normal'
    outLogList.value.unshift({
      time: new Date().toLocaleTimeString(), name: item.name, qty: quickOutForm.qty, target: quickOutForm.target
    })
    ElMessage.success(`【${item.name}】出库成功！`)
    quickOutForm.id = ''; quickOutForm.qty = 1; quickOutForm.max = 0
  }
}

// 盘点功能
const isChecking = ref(false)
const stocktakeList = ref([])

const startStocktake = () => {
  isChecking.value = true
  stocktakeList.value = inventoryList.value.map(i => ({
    ...i, actualStock: i.stock, diff: 0
  }))
  ElMessage.info('盘点任务开启')
}
const calcDiff = (row) => { row.diff = row.actualStock - row.stock }
const submitStocktake = () => {
  ElMessageBox.confirm('确认提交盘点结果并覆盖系统库存？', '警告', { type: 'warning' })
    .then(() => {
      stocktakeList.value.forEach(checkItem => {
        const target = inventoryList.value.find(i => i.id === checkItem.id)
        if (target) {
          target.stock = checkItem.actualStock
          target.status = target.stock < target.threshold ? 'lowStock' : 'normal'
        }
      })
      isChecking.value = false
      stocktakeList.value = []
      ElMessage.success('盘点同步成功！')
    }).catch(() => {})
}

onMounted(() => {
  fetchInventory()
})
</script>


<style lang="scss" scoped>
.inventory-container { padding: 20px; }

/* 顶部卡片 */
.dashboard-cards {
  .data-card {
    border-radius: 12px; border: none; color: #fff;
    transition: transform 0.3s;
    &:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
  }
  .card-content { display: flex; justify-content: space-between; align-items: center; }
  .card-title { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
  .card-value { font-size: 28px; font-weight: bold; }
  .card-icon { font-size: 40px; opacity: 0.3; }

  .theme-blue { background: linear-gradient(135deg, #409EFF, #79bbff); }
  .theme-green { background: linear-gradient(135deg, #67C23A, #95d475); }
  .theme-red { background: linear-gradient(135deg, #F56C6C, #f89898); }
  .theme-orange { background: linear-gradient(135deg, #E6A23C, #eebe77); }
}

/* 表格与扩展区 */
.main-card { border-radius: 12px; border: none; min-height: 60vh; }
.expand-detail { padding: 20px; background-color: var(--el-bg-color-page); border-radius: 8px; }
.text-danger { color: var(--el-color-danger); }
.font-bold { font-weight: bold; }
.expandable-table {
  :deep(.dynamic-actions) { opacity: 0; transform: translateX(20px); transition: all 0.3s; }
  :deep(.el-table__row:hover .dynamic-actions) { opacity: 1; transform: translateX(0); }
}

/* 预警卡片与闪烁 */
.warning-card {
  border-radius: 12px; border: 1px solid transparent;
  .warn-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--el-border-color-lighter); padding-bottom: 10px; }
  .warn-title { font-weight: bold; font-size: 16px; }
  .warn-body { display: flex; justify-content: space-between; align-items: flex-end; }
  .warn-data p { margin: 5px 0; font-size: 14px; color: var(--el-text-color-regular); }
  .warn-data strong { font-size: 18px; }
}

.flash-red { animation: anim-red 2s infinite alternate ease-in-out; }
@keyframes anim-red { 
  0% { box-shadow: 0 0 0 transparent; border-color: transparent; } 
  100% { box-shadow: 0 0 15px rgba(245,108,108,0.4); border-color: rgba(245,108,108,0.5); } 
}

.flash-orange { animation: anim-orange 2s infinite alternate ease-in-out; }
@keyframes anim-orange { 
  0% { box-shadow: 0 0 0 transparent; border-color: transparent; } 
  100% { box-shadow: 0 0 15px rgba(230,162,60,0.4); border-color: rgba(230,162,60,0.5); } 
}

/* 操作表单与流水 */
.operation-form-box { padding: 20px; background: var(--el-bg-color-overlay); border-radius: 8px; border: 1px solid var(--el-border-color-light); }
.log-box { padding: 20px; background: var(--el-bg-color-page); border-radius: 8px; height: 100%; min-height: 300px; }
.log-box h4 { margin-top: 0; margin-bottom: 15px; }
.log-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px dashed var(--el-border-color-lighter); }
.log-time { font-size: 12px; color: var(--el-text-color-secondary); }
.fade-in-log { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

.check-toolbar { margin-bottom: 20px; display: flex; gap: 15px; align-items: center; }
.check-hint { color: var(--el-color-warning); font-size: 14px; }
.op-item-info { background: var(--el-color-primary-light-9); padding: 15px; border-radius: 8px; text-align: center; }
.op-item-info h3 { margin: 0 0 5px 0; color: var(--el-color-primary); }
.op-item-info p { margin: 0; color: var(--el-text-color-secondary); }
.hint-text { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 5px; }
</style>