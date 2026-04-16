<template>
  <div class="navbar">
    <div class="system-name">{{ t('header.systemName') }}</div>
    <div class="right-menu">
      <el-dropdown @command="handleLang" trigger="click">
        <span class="lang-link">
          {{ currentLangText }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh">中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { ArrowDown } from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const store = useStore()

const currentLangText = computed(() => {
  if (!store || !store.state) return '中文'
  return store.state.language === 'zh' ? '中文' : 'English'
})

const handleLang = (lang) => {
  if (locale) locale.value = lang
  if (store) store.dispatch('changeLanguage', lang)
}
</script>

<style scoped>
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 50px; background: #fff; border-bottom: 1px solid #dcdfe6; }
.system-name { font-weight: bold; font-size: 18px; color: #303133; }
.lang-link { cursor: pointer; color: #409EFF; display: flex; align-items: center; }
</style>