<template>
  <el-menu
    :default-active="activePath"
    router
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    style="border: none"
  >
    <el-menu-item index="/dashboard">
      <el-icon><Monitor /></el-icon>
      <span>{{ t('nav.dashboard') }}</span>
    </el-menu-item>
    <el-menu-item index="/basic-data">
      <el-icon><Memo /></el-icon>
      <span>{{ t('nav.basicData') }}</span>
    </el-menu-item>
    <el-menu-item index="/procurement">
      <el-icon><ShoppingCart /></el-icon>
      <span>{{ t('nav.procurement') }}</span>
    </el-menu-item>
    <el-menu-item index="/inventory">
      <el-icon><Box /></el-icon>
      <span>{{ t('nav.inventory') }}</span>
    </el-menu-item>
    <el-menu-item index="/requisition">
      <el-icon><Van /></el-icon>
      <span>{{ t('nav.requisition') }}</span>
    </el-menu-item>
    <el-menu-item index="/sales">
      <el-icon><DataAnalysis /></el-icon>
      <span>{{ t('nav.sales') }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// 显式导入所有用到的图标，注意：Truck 换成 Van
import { Monitor, Memo, ShoppingCart, Box, Van, DataAnalysis } from '@element-plus/icons-vue'

const { t } = useI18n()
const route = useRoute()
const activePath = computed(() => route.path)
</script>