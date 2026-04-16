<template>
  <el-container class="layout-container">
    <el-aside width="210px">
      <Sidebar />
    </el-aside>
    <el-container class="main-container">
      <el-header height="50px">
        <Navbar />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 显式添加 .vue 后缀，防止 Vite 解析路径失败导致白屏
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.layout-container { height: 100vh; width: 100vw; }
.main-container { display: flex; flex-direction: column; }
.el-aside { background-color: #304156; transition: width 0.3s; }
.el-header { padding: 0; background: #fff; z-index: 10; }
.el-main { background-color: #f0f2f5; padding: 20px; }
</style>