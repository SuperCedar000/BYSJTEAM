<template>
  <div class="requisition-container">
    <el-card class="main-card" shadow="never">
      <el-tabs v-model="activeTab" class="custom-tabs">
        
        <el-tab-pane :label="t('requisition.tabs.apply')" name="apply">
          <div class="form-wrapper">
            <h3 class="form-title">{{ t('requisition.form.title') }}</h3>
            <el-form ref="applyFormRef" :model="applyForm" label-width="120px" class="apply-form">
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item :label="t('requisition.form.store')" required>
                    <el-select v-model="applyForm.store" placeholder="请选择门店" style="width: 100%">
                      <el-option label="上海南京路旗舰店" value="上海南京路旗舰店" />
                      <el-option label="杭州西湖概念店" value="杭州西湖概念店" />
                      <el-option label="广州塔黑金店" value="广州塔黑金店" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('requisition.form.material')" required>
                    <el-select v-model="applyForm.materialId" filterable placeholder="搜索物料" style="width: 100%" @change="handleMaterialChange">
                      <el-option v-for="item in materialDb" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                    <div v-if="selectedMaterialStock !== null" class="stock-hint">
                      {{ t('requisition.form.stockHint') }} 
                      <strong :class="selectedMaterialStock > 50 ? 'text-success' : 'text-danger'">
                        {{ selectedMaterialStock }}
                      </strong>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item :label="t('requisition.form.qty')" required>
                    <el-input-number 
                      v-model="applyForm.qty" 
                      :min="1" 
                      :max="selectedMaterialStock > 0 ? selectedMaterialStock : 1" 
                      :disabled="selectedMaterialStock === 0"
                      style="width: 100%" 
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-button type="primary" size="large" class="submit-btn" :icon="Position" @click="submitApply">
                {{ t('requisition.form.submit') }}
              </el-button>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="t('requisition.tabs.delivery')" name="delivery">
          <el-table :data="deliveryList" style="width: 100%" class="animated-table" :row-class-name="tableRowClassName" stripe>
            <el-table-column prop="orderNo" :label="t('requisition.table.orderNo')" width="140" sortable />
            <el-table-column prop="store" :label="t('requisition.table.store')" min-width="160" />
            <el-table-column prop="material" :label="t('requisition.table.material')" min-width="150" />
            <el-table-column prop="qty" :label="t('requisition.table.qty')" width="100" align="center">
              <template #default="scope"><strong>{{ scope.row.qty }}</strong></template>
            </el-table-column>
            <el-table-column :label="t('requisition.table.status')" width="140" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" effect="light" :class="{'pulse-van': scope.row.status === 'shipping'}">
                  <el-icon v-if="scope.row.status === 'shipping'" style="margin-right: 4px"><Van /></el-icon>
                  {{ t(`requisition.status.${scope.row.status}`) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column :label="t('requisition.table.actions')" width="220" align="right">
              <template #default="scope">
                <div class="dynamic-actions">
                  <el-button v-if="scope.row.status === 'pending'" size="small" type="primary" plain :icon="Van" @click="handleAction(scope.row, 'dispatch')">
                    {{ t('requisition.table.dispatch') }}
                  </el-button>
                  <el-button v-if="scope.row.status === 'shipping'" size="small" type="success" plain :icon="Check" @click="handleAction(scope.row, 'sign')">
                    {{ t('requisition.table.sign') }}
                  </el-button>
                  <el-button v-if="scope.row.status === 'signed'" size="small" type="danger" plain :icon="RefreshLeft" @click="handleAction(scope.row, 'return')">
                    {{ t('requisition.table.returnBtn') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="t('requisition.tabs.receipt')" name="receipt">
          <el-row :gutter="20">
            <el-col :span="10">
              <el-card class="scan-card" shadow="hover">
                <div class="scan-header">
                  <el-icon class="scan-icon"><FullScreen /></el-icon>
                  <span>{{ t('requisition.receipt.scanBtn') }}</span>
                </div>
                <el-input
                  v-model="scanInput"
                  :placeholder="t('requisition.receipt.scanPlaceholder')"
                  size="large"
                  clearable
                  @keyup.enter="handleScan"
                >
                  <template #append>
                    <el-button :icon="Search" @click="handleScan" :loading="isScanning" />
                  </template>
                </el-input>
                <div class="laser-box" v-if="isScanning"><div class="laser-line"></div></div>
              </el-card>
            </el-col>
            <el-col :span="14">
              <el-card class="result-card" shadow="hover">
                <template #header>
                  <div class="card-header"><span>{{ t('requisition.receipt.infoTitle') }}</span></div>
                </template>
                <div v-if="scannedData" class="scanned-info fade-in">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item :label="t('requisition.table.orderNo')">{{ scannedData.orderNo }}</el-descriptions-item>
                    <el-descriptions-item :label="t('requisition.table.store')">{{ scannedData.store }}</el-descriptions-item>
                    <el-descriptions-item :label="t('requisition.table.material')">{{ scannedData.material }}</el-descriptions-item>
                    <el-descriptions-item :label="t('requisition.table.qty')">
                      <span class="highlight-qty">{{ scannedData.qty }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                  <div class="action-bar">
                    <el-button type="success" size="large" :icon="Check" @click="confirmReceipt">
                      {{ t('requisition.receipt.confirmBtn') }}
                    </el-button>
                  </div>
                </div>
                <div v-else class="empty-scan">
                  <el-empty :description="t('requisition.receipt.emptyInfo')" :image-size="100" />
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div class="recent-wrapper mt-4">
            <h4>{{ t('requisition.receipt.recentTitle') }}</h4>
            <el-table :data="recentReceipts" stripe size="small">
              <el-table-column prop="orderNo" :label="t('requisition.table.orderNo')" width="140" />
              <el-table-column prop="material" :label="t('requisition.table.material')" />
              <el-table-column prop="qty" :label="t('requisition.table.qty')" width="100" />
              <el-table-column prop="time" label="签收时间" width="180" />
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="t('requisition.tabs.return')" name="return">
          <el-table :data="returnList" style="width: 100%" stripe>
            <el-table-column prop="returnNo" :label="t('requisition.returns.returnNo')" width="140" />
            <el-table-column prop="orderNo" :label="t('requisition.table.orderNo')" width="140" />
            <el-table-column prop="store" :label="t('requisition.table.store')" min-width="150" />
            <el-table-column prop="material" :label="t('requisition.table.material')" min-width="150" />
            <el-table-column prop="type" :label="t('requisition.returns.type')" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.type === '换货' ? 'warning' : 'danger'">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" :label="t('requisition.returns.reason')" min-width="150" />
            <el-table-column :label="t('requisition.table.actions')" width="150" align="right">
              <template #default="scope">
                <el-button size="small" type="primary" plain :icon="Position" @click="viewLogistics(scope.row)">
                  {{ t('requisition.returns.logisticsBtn') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px" custom-class="animated-dialog">
      <div v-if="currentRow" class="op-item-info">
        <h3>{{ currentRow.orderNo }}</h3>
        <p>门店：{{ currentRow.store }}</p>
        <p>物料：{{ currentRow.material }} x {{ currentRow.qty }}</p>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('requisition.dialog.cancel') }}</el-button>
        <el-button :type="dialogBtnType" @click="confirmAction" :loading="isOperating">
          {{ t('requisition.dialog.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logisticsVisible" :title="t('requisition.returns.logisticsTitle')" width="500px">
      <div class="logistics-timeline" style="padding: 20px;">
        <el-steps :active="currentReturnInfo.step" finish-status="success" align-center>
          <el-step title="门店发起" />
          <el-step title="物流揽件" />
          <el-step title="运输途中" />
          <el-step title="总部处理" />
        </el-steps>
        <el-timeline style="margin-top: 40px;" v-if="currentReturnInfo.step > 1">
          <el-timeline-item v-if="currentReturnInfo.step >= 3" timestamp="今日 14:30" type="primary">包裹已到达城市分拨中心，发往总部</el-timeline-item>
          <el-timeline-item v-if="currentReturnInfo.step >= 2" timestamp="昨日 10:15" color="#0bbd87">极兔速递已揽件</el-timeline-item>
          <el-timeline-item timestamp="昨日 09:00" type="info">门店已提交{{ currentReturnInfo.type }}申请</el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Position, Van, Check, RefreshLeft, FullScreen, Search } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const activeTab = ref('apply')

// 要货申请表单
const applyFormRef = ref(null)
const applyForm = reactive({ store: '', materialId: '', qty: 1 })
const selectedMaterialStock = ref(null)
const materialDb = ref([])

const deliveryList = ref([])

// 签收相关
const scanInput = ref('')
const isScanning = ref(false)
const scannedData = ref(null)
const recentReceipts = ref([])

const returnList = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogBtnType = ref('primary')
const currentRow = ref(null)
const actionType = ref('')
const isOperating = ref(false)
const logisticsVisible = ref(false)
const currentReturnInfo = ref({})

// 获取物料列表
const fetchMaterials = async () => {
  try {
    const res = await axios.get('/api/materials', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    materialDb.value = res.data.map(m => ({
      id: m.materialId,
      name: m.materialName,
      stock: m.stock || 0
    }))
  } catch (err) {
    ElMessage.error('获取物料列表失败')
  }
}

// 获取配送列表
const fetchDeliveries = async () => {
  try {
    const res = await axios.get('/api/requisition', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    deliveryList.value = res.data
  } catch (err) {
    console.error('获取配送列表失败', err)
  }
}

const handleMaterialChange = (val) => {
  const item = materialDb.value.find(m => m.id === val)
  selectedMaterialStock.value = item ? item.stock : 0
  applyForm.qty = 1
}

const submitApply = async () => {
  if (!applyForm.store || !applyForm.materialId) return ElMessage.warning('请完整填写要货信息')
  const item = materialDb.value.find(m => m.id === applyForm.materialId)
  try {
    const newReq = {
      orderNo: `REQ-${Date.now()}`,
      store: applyForm.store,
      material: item.name,
      qty: applyForm.qty,
      status: 'pending'
    }
    await axios.post('/api/requisition', newReq, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    ElMessage.success('要货申请提交成功！')
    fetchDeliveries()
    applyForm.store = ''
    applyForm.materialId = ''
    selectedMaterialStock.value = null
    activeTab.value = 'delivery'
  } catch (err) {
    ElMessage.error('提交失败')
  }
}

const getStatusType = (status) => {
  const map = { pending: 'info', shipping: 'primary', signed: 'success', returning: 'danger' }
  return map[status] || 'info'
}

const handleAction = (row, type) => {
  currentRow.value = row
  actionType.value = type
  if (type === 'dispatch') { dialogTitle.value = '发车配送确认'; dialogBtnType.value = 'primary' }
  if (type === 'sign') { dialogTitle.value = t('requisition.dialog.signTitle'); dialogBtnType.value = 'success' }
  if (type === 'return') { dialogTitle.value = t('requisition.dialog.returnTitle'); dialogBtnType.value = 'danger' }
  dialogVisible.value = true
}

const tableRowClassName = ({ row }) => { return row.isBlinking ? 'blink-row' : '' }

const confirmAction = async () => {
  isOperating.value = true
  try {
    let newStatus = ''
    if (actionType.value === 'dispatch') newStatus = 'shipping'
    if (actionType.value === 'sign') newStatus = 'signed'
    if (actionType.value === 'return') newStatus = 'returning'
    await axios.put(`/api/requisition/${currentRow.value.id}/status?status=${newStatus}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchDeliveries()
    ElMessage.success(t('requisition.dialog.success'))
  } catch (err) {
    ElMessage.error('操作失败')
  }
  isOperating.value = false
  dialogVisible.value = false
}

const handleScan = () => {
  if (!scanInput.value) return ElMessage.warning('请输入配送单号')
  isScanning.value = true
  scannedData.value = null
  setTimeout(() => {
    isScanning.value = false
    const order = deliveryList.value.find(o => o.orderNo === scanInput.value)
    if (order) {
      scannedData.value = {
        orderNo: order.orderNo,
        store: order.store,
        material: order.material,
        qty: order.qty,
        id: order.id
      }
    } else {
      ElMessage.error('未找到配送单')
    }
  }, 1000)
}

const confirmReceipt = async () => {
  if (!scannedData.value) return
  try {
    await axios.put(`/api/requisition/${scannedData.value.id}/status?status=signed`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    recentReceipts.value.unshift({ ...scannedData.value, time: new Date().toLocaleTimeString() })
    scannedData.value = null
    scanInput.value = ''
    fetchDeliveries()
    ElMessage.success('签收成功！门店库存已增加。')
  } catch (err) {
    ElMessage.error('签收失败')
  }
}

const viewLogistics = (row) => {
  currentReturnInfo.value = row
  logisticsVisible.value = true
}

onMounted(() => {
  fetchMaterials()
  fetchDeliveries()
})
</script>

<style lang="scss" scoped>
.requisition-container { padding: 20px; }
.main-card { border-radius: 12px; border: none; min-height: 60vh; }

/* 表单与联动提示样式 */
.form-wrapper { max-width: 800px; margin: 20px auto; padding: 30px 40px; background: var(--el-bg-color-overlay); border-radius: 16px; border: 1px solid var(--el-border-color-light); }
.form-title { text-align: center; margin-bottom: 30px; color: var(--el-text-color-primary); }
.stock-hint { font-size: 13px; margin-top: 8px; color: var(--el-text-color-secondary); }
.text-success { color: var(--el-color-success); font-size: 16px; }
.text-danger { color: var(--el-color-danger); font-size: 16px; }
.submit-btn { width: 100%; margin-top: 15px; border-radius: 8px; transition: transform 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(64,158,255,0.3); } }

/* 表格与悬浮按钮魔法 */
.animated-table {
  :deep(.el-table__row) { transition: background-color 0.4s ease; }
  :deep(.dynamic-actions) { opacity: 0; transform: translateX(20px); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
  :deep(.el-table__row:hover .dynamic-actions) { opacity: 1; transform: translateX(0); }
}

/* 状态呼吸动画 */
.pulse-van { animation: van-pulse 1.5s infinite alternate ease-in-out; }
@keyframes van-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(64,158,255, 0.4); }
  100% { transform: scale(1.05); box-shadow: 0 0 8px 0 rgba(64,158,255, 0); }
}

/* 行高亮闪烁动效 */
:deep(.blink-row) { animation: highlight-flash 2s ease-out !important; }
@keyframes highlight-flash {
  0% { background-color: var(--el-color-success-light-7) !important; }
  20% { background-color: var(--el-color-success-light-5) !important; }
  100% { background-color: transparent !important; }
}

/* 弹窗信息块 */
.op-item-info { background: var(--el-bg-color-page); padding: 15px; border-radius: 8px; text-align: center; }
.op-item-info h3 { margin: 0 0 5px 0; color: var(--el-color-primary); }
.op-item-info p { margin: 5px 0 0 0; color: var(--el-text-color-secondary); }

/* 扫码台样式 */
.scan-card { height: 300px; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--el-color-primary-light-9); border: 2px dashed var(--el-color-primary-light-5); }
.scan-header { font-size: 20px; color: var(--el-color-primary); margin-bottom: 20px; font-weight: bold; display: flex; align-items: center; gap: 10px; }
.laser-box { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; border-radius: 8px; }
.laser-line { width: 100%; height: 3px; background: rgba(255, 0, 0, 0.7); box-shadow: 0 0 10px rgba(255,0,0,0.8); animation: scan-laser 1s linear infinite alternate; }
@keyframes scan-laser { 0% { transform: translateY(0); } 100% { transform: translateY(300px); } }
.result-card { height: 300px; }
.empty-scan { height: 200px; display: flex; align-items: center; justify-content: center; }
.highlight-qty { font-size: 24px; font-weight: bold; color: var(--el-color-success); }
.action-bar { margin-top: 20px; text-align: right; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.recent-wrapper { padding: 20px; background: var(--el-bg-color-overlay); border-radius: 12px; }
.recent-wrapper h4 { margin-top: 0; margin-bottom: 15px; color: var(--el-text-color-primary); }
</style>