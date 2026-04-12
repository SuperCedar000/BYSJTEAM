<template>
  <div class="basic-data-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6" v-for="stat in statCards" :key="stat.title">
        <el-card shadow="always" class="data-card">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ stat.title }}</div>
              <div class="card-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card" shadow="never">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 物料档案 tab -->
        <el-tab-pane :label="$t('basicData.tabs.material')" name="material">
          <div class="toolbar">
            <el-input v-model="searchQuery" :placeholder="$t('basicData.toolbar.search')" class="search-input" clearable :prefix-icon="Search" />
            <el-button type="primary" :icon="Plus" @click="handleOpenDialog('add')">{{ $t('basicData.toolbar.add') }}</el-button>
          </div>
          <el-table :data="filteredMaterials" stripe style="width: 100%" class="animated-table">
            <el-table-column prop="materialId" label="ID" width="80" />
            <el-table-column prop="materialName" :label="$t('basicData.table.name')" min-width="150" />
            <el-table-column prop="category" :label="$t('basicData.table.category')" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.category === '茶叶' ? 'success' : 'warning'">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="unitPrice" :label="$t('basicData.table.unitPrice')" width="120" sortable />
            <el-table-column prop="stock" :label="$t('basicData.table.stock')" width="120" sortable />
            <el-table-column :label="$t('basicData.table.actions')" width="180" align="right">
              <template #default="scope">
                <div class="dynamic-actions">
                  <el-button size="small" type="primary" plain :icon="Edit" @click="handleOpenDialog('edit', scope.row)">{{ $t('basicData.table.edit') }}</el-button>
                  <el-button size="small" type="danger" plain :icon="Delete" @click="deleteMaterial(scope.row.materialId)">{{ $t('basicData.table.delete') }}</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper">
            <el-pagination background layout="prev, pager, next, total" :total="materialData.length" />
          </div>
        </el-tab-pane>

        <!-- 组织架构（静态，不变） -->
        <el-tab-pane :label="$t('basicData.tabs.org')" name="org">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-tree :data="orgData" :props="defaultProps" default-expand-all class="custom-tree">
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span>{{ node.label }}</span>
                    <el-tag size="small" v-if="data.level" type="info">{{ data.level }}</el-tag>
                  </span>
                </template>
              </el-tree>
            </el-col>
            <el-col :span="16">
              <el-empty :description="$t('basicData.table.emptyOrg')" />
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 用户角色（静态开关不可调，忽略） -->
        <el-tab-pane :label="$t('basicData.tabs.role')" name="role">
          <el-table :data="roleData" border>
            <el-table-column type="index" :label="$t('basicData.table.index')" width="60" />
            <el-table-column prop="name" :label="$t('basicData.table.roleName')" width="150" />
            <el-table-column prop="desc" :label="$t('basicData.table.roleDesc')" />
            <el-table-column prop="users" :label="$t('basicData.table.roleUsers')" width="120" align="center" />
            <el-table-column :label="$t('basicData.table.status')" width="100">
              <template #default><el-switch :model-value="true" /></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- BOM表（静态） -->
        <el-tab-pane :label="$t('basicData.tabs.bom')" name="bom">
          <el-table :data="bomData" stripe>
            <el-table-column prop="id" :label="$t('basicData.table.bomId')" width="120" />
            <el-table-column prop="product" :label="$t('basicData.table.bomProduct')" min-width="150" />
            <el-table-column prop="version" :label="$t('basicData.table.bomVersion')" width="100" />
            <el-table-column prop="materials" :label="$t('basicData.table.bomMaterials')" width="150" align="center" />
            <el-table-column prop="cost" :label="$t('basicData.table.bomCost')" width="150" sortable />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑物料弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增物料' : '编辑物料'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="名称" prop="materialName">
          <el-input v-model="formData.materialName" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择类别">
            <el-option label="茶叶" value="茶叶" />
            <el-option label="乳制品" value="乳制品" />
            <el-option label="小料" value="小料" />
            <el-option label="包材" value="包材" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number v-model="formData.unitPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { OfficeBuilding, User, Box, Document, Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const activeTab = ref('material')
const searchQuery = ref('')
const materialData = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = reactive({
  materialId: null,
  materialName: '',
  category: '',
  unit: '',
  stock: 0,
  unitPrice: 0
})

const statCards = computed(() => [
  { title: t('basicData.cards.org'), value: '3', icon: OfficeBuilding, color: '#409EFF' },
  { title: t('basicData.cards.role'), value: '5', icon: User, color: '#67C23A' },
  { title: t('basicData.cards.material'), value: materialData.value.length, icon: Box, color: '#E6A23C' },
  { title: t('basicData.cards.bom'), value: '5', icon: Document, color: '#F56C6C' }
])

const filteredMaterials = computed(() => {
  if (!searchQuery.value) return materialData.value
  return materialData.value.filter(m => m.materialName && m.materialName.includes(searchQuery.value))
})

const orgData = [
  { label: '总部', level: 'Level 1', children: [
    { label: '华东大区', level: 'Level 2', children: [
      { label: '上海南京路旗舰店', level: 'Level 3' },
      { label: '杭州西湖概念店', level: 'Level 3' }
    ]},
    { label: '华南大区', level: 'Level 2', children: [
      { label: '广州塔黑金店', level: 'Level 3' }
    ]}
  ]}
]
const defaultProps = { children: 'children', label: 'label' }

const roleData = [
  { name: '超级管理员', desc: '拥有系统所有权限', users: 2 },
  { name: '区域经理', desc: '管理大区数据与门店审核', users: 8 },
  { name: '店长', desc: '管理门店库存与要货申请', users: 45 }
]

const bomData = [
  { id: 'BOM-001', product: '波霸烤奶', version: 'v1.0', materials: 4, cost: 2.8 },
  { id: 'BOM-002', product: '芝士莓莓', version: 'v2.1', materials: 6, cost: 5.5 }
]

const formRules = {
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

const fetchMaterials = async () => {
  try {
    const res = await axios.get('/api/materials', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    materialData.value = res.data
  } catch (err) {
    ElMessage.error('获取物料列表失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await axios.post('/api/materials', formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          ElMessage.success('添加成功')
        } else {
          await axios.put(`/api/materials/${formData.materialId}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchMaterials()
      } catch (err) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const deleteMaterial = async (id) => {
  try {
    await axios.delete(`/api/materials/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchMaterials()
    ElMessage.success('删除成功')
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

const handleOpenDialog = (type, row = null) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    Object.assign(formData, row)
  } else {
    formData.materialId = null
    formData.materialName = ''
    formData.category = ''
    formData.unit = ''
    formData.stock = 0
    formData.unitPrice = 0
  }
  dialogVisible.value = true
}

onMounted(() => {
  fetchMaterials()
})
</script>

<style lang="scss" scoped>
/* 这里的样式与上一个版本完全一致，无需修改 */
.basic-data-container { padding: 20px; }
.data-card {
  border-radius: 12px; border: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: var(--el-bg-color-overlay);
  &:hover { transform: translateY(-8px); box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08) !important; }
  .card-content { display: flex; align-items: center; gap: 16px; }
  .card-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 28px; transition: transform 0.3s; }
  &:hover .card-icon { transform: scale(1.1); }
  .card-title { font-size: 14px; color: var(--el-text-color-secondary); margin-bottom: 4px; }
  .card-value { font-size: 24px; font-weight: bold; color: var(--el-text-color-primary); }
}
.main-card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; .search-input { width: 300px; } }
.animated-table {
  :deep(.el-table__row) { transition: background-color 0.3s ease; }
  :deep(.dynamic-actions) { opacity: 0; transform: translateX(20px); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
  :deep(.el-table__row:hover .dynamic-actions) { opacity: 1; transform: translateX(0); }
}
.pagination-wrapper { margin-top: 20px; display: flex; justify-content: flex-end; }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) {
  transition: all 0.3s ease; box-shadow: 0 0 0 1px var(--el-border-color) inset;
  &:hover { box-shadow: 0 0 0 1px var(--el-color-primary) inset !important; background-color: var(--el-color-primary-light-9); }
  &.is-focus { box-shadow: 0 0 0 2px var(--el-color-primary-light-5) inset !important; }
}
.custom-tree-node { display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 10px; }
</style>