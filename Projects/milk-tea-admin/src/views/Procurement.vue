<template>
  <div class="procurement-container">
    <el-card class="main-card" shadow="never">
      <el-tabs v-model="activeTab" class="custom-tabs">
        
        <!-- 采购申请 tab -->
        <el-tab-pane :label="$t('procurement.tabs.apply')" name="apply">
          <div class="form-wrapper">
            <h3 class="form-title">{{ $t('procurement.form.title') }}</h3>
            <el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" label-width="120px" class="apply-form">
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item :label="$t('procurement.form.material')" prop="materialId">
                    <el-select v-model="applyForm.materialId" filterable :placeholder="$t('procurement.form.materialPlaceholder')" @change="handleMaterialChange" class="smart-select">
                      <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id">
                        <span style="float: left">{{ item.name }}</span>
                        <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">{{ item.code }}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('procurement.form.supplier')">
                    <el-input v-model="applyForm.supplier" disabled :placeholder="$t('procurement.form.supplierAuto')" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item :label="$t('procurement.form.qty')" prop="qty">
                    <el-input-number v-model="applyForm.qty" :min="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('procurement.form.unit')">
                    <el-input v-model="applyForm.unit" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" size="large" @click="submitApply" class="submit-btn" :icon="Position">
                  {{ $t('procurement.form.submit') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 采购订单 tab -->
        <el-tab-pane :label="$t('procurement.tabs.orders')" name="orders">
          <el-table :data="orderList" style="width: 100%" class="animated-table" :row-class-name="tableRowClassName">
            <el-table-column prop="orderNo" :label="$t('procurement.table.orderNo')" width="140" sortable />
            <el-table-column prop="materialName" :label="$t('procurement.table.material')" min-width="150" />
            <el-table-column prop="supplier" :label="$t('procurement.table.supplier')" min-width="180" />
            <el-table-column prop="qty" :label="$t('procurement.table.qty')" width="100" />
            <el-table-column prop="amount" :label="$t('procurement.table.amount')" width="120" sortable>
              <template #default="scope">¥ {{ scope.row.amount }}</template>
            </el-table-column>
            <el-table-column :label="$t('procurement.table.status')" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" effect="light" :class="{'pulse-anim': scope.row.status === 'pending' || scope.row.status === 'returning'}">
                  {{ $t(`procurement.status.${scope.row.status}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('procurement.table.actions')" width="200" align="right">
              <template #default="scope">
                <div class="dynamic-actions">
                  <el-button v-if="scope.row.status === 'shipping'" size="small" type="success" plain :icon="Box" @click="handleAction(scope.row, 'inbound')">
                    {{ $t('procurement.table.inboundBtn') }}
                  </el-button>
                  <el-button v-if="scope.row.status === 'received'" size="small" type="danger" plain :icon="RefreshLeft" @click="handleAction(scope.row, 'return')">
                    {{ $t('procurement.table.returnBtn') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper">
            <el-pagination background layout="prev, pager, next, total" :total="orderList.length" />
          </div>
        </el-tab-pane>

        <!-- 采购入库 tab -->
        <el-tab-pane :label="$t('procurement.tabs.inbound')" name="inbound">
          <el-row :gutter="20">
            <el-col :span="10">
              <el-card class="scan-card" shadow="hover">
                <div class="scan-header">
                  <el-icon class="scan-icon"><FullScreen /></el-icon>
                  <span>{{ $t('procurement.inbound.scanBtn') }}</span>
                </div>
                <el-input
                  v-model="scanInput"
                  :placeholder="$t('procurement.inbound.scanPlaceholder')"
                  size="large"
                  clearable
                  @keyup.enter="handleScan"
                >
                  <template #append>
                    <el-button :icon="Search" @click="handleScan" :loading="isScanning" />
                  </template>
                </el-input>
                <div class="laser-box" v-if="isScanning">
                  <div class="laser-line"></div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="14">
              <el-card class="result-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>{{ $t('procurement.inbound.infoTitle') }}</span>
                  </div>
                </template>
                <div v-if="scannedData" class="scanned-info fade-in">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item :label="$t('procurement.table.orderNo')">{{ scannedData.orderNo }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('procurement.table.status')">
                      <el-tag type="warning">待入库</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('procurement.table.material')">{{ scannedData.material }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('procurement.table.supplier')">{{ scannedData.supplier }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('procurement.table.qty')">
                      <span class="highlight-qty">{{ scannedData.qty }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                  <div class="action-bar">
                    <el-button type="success" size="large" :icon="Check" @click="confirmScanInbound">
                      {{ $t('procurement.inbound.confirmBtn') }}
                    </el-button>
                  </div>
                </div>
                <div v-else class="empty-scan">
                  <el-empty :description="$t('procurement.inbound.emptyInfo')" :image-size="100" />
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div class="recent-inbound-wrapper mt-4">
            <h4>{{ $t('procurement.inbound.recentTitle') }}</h4>
            <el-table :data="recentInbounds" stripe size="small">
              <el-table-column prop="orderNo" :label="$t('procurement.table.orderNo')" width="140" />
              <el-table-column prop="material" :label="$t('procurement.table.material')" />
              <el-table-column prop="qty" :label="$t('procurement.table.qty')" width="100" />
              <el-table-column prop="time" :label="$t('procurement.table.date')" width="180" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 退货管理 tab -->
        <el-tab-pane :label="$t('procurement.tabs.return')" name="return">
          <el-table :data="returnList" style="width: 100%" stripe>
            <el-table-column prop="orderNo" :label="$t('procurement.returns.returnNo')" width="150" />
            <el-table-column prop="orderNo" :label="$t('procurement.table.orderNo')" width="140" />
            <el-table-column prop="materialName" :label="$t('procurement.table.material')" min-width="150" />
            <el-table-column prop="reason" label="退货原因" min-width="150" />
            <el-table-column :label="$t('procurement.table.status')" width="120" align="center">
              <template #default="scope">
                <el-tag type="danger" effect="dark">{{ $t('procurement.status.returning') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('procurement.table.actions')" width="150" align="right">
              <template #default="scope">
                <el-button size="small" type="primary" plain :icon="Van" @click="viewLogistics(scope.row)">
                  {{ $t('procurement.returns.logisticsBtn') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>
    </el-card>

    <!-- 操作确认弹窗 -->
    <el-dialog v-model="dialogVisible" :title="$t(`procurement.dialog.${dialogType}Title`)" width="400px" destroy-on-close>
      <p style="font-size: 16px; margin-bottom: 20px;">
        {{ dialogType === 'inbound' ? '确认将该批次物料办理入库吗？' : '确认对该订单发起退货申请吗？' }}
      </p>
      <div v-if="currentRow" class="info-card">
        <p><strong>单号：</strong>{{ currentRow.orderNo }}</p>
        <p><strong>物料：</strong>{{ currentRow.materialName }}</p>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('procurement.dialog.cancel') }}</el-button>
        <el-button :type="dialogType === 'inbound' ? 'success' : 'danger'" @click="confirmAction">
          {{ $t('procurement.dialog.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 退货物流弹窗 -->
    <el-dialog v-model="logisticsVisible" :title="$t('procurement.returns.logisticsTitle')" width="600px" destroy-on-close>
      <div class="logistics-timeline">
        <el-steps :active="currentReturnInfo.step" finish-status="success" align-center>
          <el-step :title="$t('procurement.returns.step1')" description="买家发起退货退款" />
          <el-step :title="$t('procurement.returns.step2')" description="顺丰速运揽件中" />
          <el-step :title="$t('procurement.returns.step3')" description="快件发往仓库" />
          <el-step :title="$t('procurement.returns.step4')" description="财务已完成退款" />
        </el-steps>
        <el-timeline style="margin-top: 40px;" v-if="currentReturnInfo.step > 1">
          <el-timeline-item v-if="currentReturnInfo.step >= 3" timestamp="今日 14:30" type="primary">快件已到达【转运中心】，准备发往总部仓库</el-timeline-item>
          <el-timeline-item v-if="currentReturnInfo.step >= 2" timestamp="昨日 10:15" color="#0bbd87">顺丰小哥已揽件，运单号：SF1234567890</el-timeline-item>
          <el-timeline-item timestamp="昨日 09:00" type="info">您的退货申请已通过审核</el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 成功提示弹窗 -->
    <el-dialog v-model="successVisible" width="300px" :show-close="false" center class="success-dialog">
      <div class="success-content">
        <div class="success-icon-wrapper"><el-icon class="success-icon"><Select /></el-icon></div>
        <h3>{{ $t('procurement.dialog.success') }}</h3>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Position, Box, RefreshLeft, Select, Search, FullScreen, Check, Van } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const activeTab = ref('orders')

// 采购申请表单
const applyFormRef = ref(null)
const applyForm = reactive({ materialId: '', supplier: '', qty: 1, unit: '' })
const materialList = ref([])

const applyRules = computed(() => ({
  materialId: [{ required: true, message: '请选择采购物料', trigger: 'change' }],
  qty: [{ required: true, message: '数量必须大于0', trigger: 'blur' }]
}))

// 订单列表
const orderList = ref([])
// 退货列表
const returnList = ref([])

// 其他弹窗状态
const dialogVisible = ref(false)
const successVisible = ref(false)
const dialogType = ref('')
const currentRow = ref(null)
const scanInput = ref('')
const isScanning = ref(false)
const scannedData = ref(null)
const recentInbounds = ref([])
const logisticsVisible = ref(false)
const currentReturnInfo = ref({})

// 获取物料列表
const fetchMaterials = async () => {
  try {
    const res = await axios.get('/api/materials', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    materialList.value = res.data.map(m => ({
      id: m.materialId,
      code: `M-${m.materialId}`,
      name: m.materialName,
      supplier: m.supplier || '默认供应商',
      unit: '个'
    }))
  } catch (err) {
    ElMessage.error('获取物料列表失败')
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    const res = await axios.get('/api/procurement/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    orderList.value = res.data
  } catch (err) {
    console.error('获取订单失败', err)
  }
}

// 获取退货列表（状态为 returning 的订单）
const fetchReturnList = async () => {
  try {
    const res = await axios.get('/api/procurement/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    returnList.value = res.data.filter(order => order.status === 'returning')
  } catch (err) {
    console.error('获取退货列表失败', err)
  }
}

const handleMaterialChange = (val) => {
  const item = materialList.value.find(m => m.id === val)
  if (item) {
    applyForm.supplier = item.supplier
    applyForm.unit = item.unit
  }
}

const submitApply = async () => {
  if (!applyFormRef.value) return
  await applyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const selectedMaterial = materialList.value.find(m => m.id === applyForm.materialId)
        const newOrder = {
          orderNo: `PO-${Date.now()}`,
          materialId: applyForm.materialId,
          materialName: selectedMaterial.name,
          supplier: applyForm.supplier,
          qty: applyForm.qty,
          amount: applyForm.qty * 100,
          status: 'pending'
        }
        await axios.post('/api/procurement/orders', newOrder, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        showSuccess()
        applyFormRef.value.resetFields()
        applyForm.supplier = ''
        applyForm.unit = ''
        fetchOrders()
        activeTab.value = 'orders'
      } catch (err) {
        ElMessage.error('提交失败')
      }
    }
  })
}

const getStatusType = (status) => {
  const map = { pending: 'warning', shipping: 'primary', received: 'success', returning: 'danger' }
  return map[status] || 'info'
}

const handleAction = (row, type) => {
  currentRow.value = row
  dialogType.value = type
  dialogVisible.value = true
}

const tableRowClassName = ({ row }) => { return row.isBlinking ? 'blink-row' : '' }

const confirmAction = async () => {
  if (dialogType.value === 'inbound') {
    try {
      await axios.put(`/api/procurement/orders/${currentRow.value.id}/status?status=received`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchOrders()
      fetchReturnList()
      showSuccess()
    } catch (err) {
      ElMessage.error('入库失败')
    }
  } else if (dialogType.value === 'return') {
    try {
      await axios.put(`/api/procurement/orders/${currentRow.value.id}/status?status=returning`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchOrders()
      fetchReturnList()
      showSuccess()
    } catch (err) {
      ElMessage.error('退货失败')
    }
  }
  dialogVisible.value = false
}

const showSuccess = () => {
  successVisible.value = true
  setTimeout(() => { successVisible.value = false }, 1200)
}

// 扫码入库
const handleScan = () => {
  if (!scanInput.value) {
    ElMessage.warning('请输入单号或进行扫码')
    return
  }
  isScanning.value = true
  scannedData.value = null
  setTimeout(() => {
    isScanning.value = false
    const order = orderList.value.find(o => o.orderNo === scanInput.value)
    if (order) {
      scannedData.value = {
        orderNo: order.orderNo,
        material: order.materialName,
        supplier: order.supplier,
        qty: order.qty,
        id: order.id
      }
    } else {
      ElMessage.error('未找到订单')
    }
  }, 1000)
}

const confirmScanInbound = async () => {
  if (!scannedData.value) return
  try {
    await axios.put(`/api/procurement/orders/${scannedData.value.id}/status?status=received`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    recentInbounds.value.unshift({ ...scannedData.value, time: new Date().toLocaleString() })
    scannedData.value = null
    scanInput.value = ''
    fetchOrders()
    fetchReturnList()
    showSuccess()
  } catch (err) {
    ElMessage.error('入库失败')
  }
}

const viewLogistics = (row) => {
  currentReturnInfo.value = row
  logisticsVisible.value = true
}

onMounted(() => {
  fetchMaterials()
  fetchOrders()
  fetchReturnList()
})
</script>

<style lang="scss" scoped>
.procurement-container { padding: 20px; }
.main-card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); min-height: calc(100vh - 140px); }

/* 表单样式保留 */
.form-wrapper { max-width: 800px; margin: 20px auto; padding: 30px 40px; background: var(--el-bg-color-overlay); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.02); }
.form-title { text-align: center; margin-bottom: 30px; color: var(--el-text-color-primary); }
.submit-btn { width: 100%; border-radius: 8px; margin-top: 20px; transition: transform 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(64,158,255,0.3); } }
.smart-select :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px var(--el-color-primary-light-3) inset !important; }

/* 列表动效保留 */
.animated-table {
  :deep(.el-table__row) { transition: background-color 0.4s ease; }
  :deep(.dynamic-actions) { opacity: 0; transform: translateX(20px); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
  :deep(.el-table__row:hover .dynamic-actions) { opacity: 1; transform: translateX(0); }
}
.pagination-wrapper { margin-top: 20px; display: flex; justify-content: flex-end; }
.pulse-anim { animation: pulse-opacity 2s infinite ease-in-out; }
@keyframes pulse-opacity { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
:deep(.blink-row) { animation: highlight-flash 2s ease-out !important; }
@keyframes highlight-flash { 0% { background-color: var(--el-color-success-light-7) !important; } 20% { background-color: var(--el-color-success-light-5) !important; } 100% { background-color: transparent !important; } }

/* 成功动画保留 */
.success-dialog :deep(.el-dialog) { background: transparent !important; box-shadow: none !important; }
.success-content { background: var(--el-bg-color); padding: 40px 20px; border-radius: 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.success-icon-wrapper { width: 80px; height: 80px; margin: 0 auto 20px; background: var(--el-color-success-light-8); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: var(--el-color-success); font-size: 40px; }
@keyframes pop-in { 0% { opacity: 0; transform: scale(0.5); } 80% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }

/* ================= 新增：入库工作台专属样式 ================= */
.scan-card {
  height: 300px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--el-color-primary-light-9);
  border: 2px dashed var(--el-color-primary-light-5);
  .scan-header {
    font-size: 20px; color: var(--el-color-primary); margin-bottom: 20px; font-weight: bold;
    display: flex; align-items: center; gap: 10px;
  }
}

/* 魔法：扫码光束扫描线动效 */
.laser-box {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; border-radius: 8px;
}
.laser-line {
  width: 100%; height: 3px; background: rgba(255, 0, 0, 0.7); box-shadow: 0 0 10px rgba(255,0,0,0.8);
  animation: scan-laser 1s linear infinite alternate;
}
@keyframes scan-laser {
  0% { transform: translateY(0); }
  100% { transform: translateY(300px); }
}

.result-card {
  height: 300px;
  .empty-scan { height: 200px; display: flex; align-items: center; justify-content: center; }
  .highlight-qty { font-size: 24px; font-weight: bold; color: var(--el-color-success); }
  .action-bar { margin-top: 20px; text-align: right; }
}

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.recent-inbound-wrapper {
  padding: 20px; background: var(--el-bg-color-overlay); border-radius: 12px;
  h4 { margin-top: 0; margin-bottom: 15px; color: var(--el-text-color-primary); }
}

/* ================= 新增：退货物流弹窗样式 ================= */
.logistics-timeline {
  padding: 20px 40px;
}
</style>