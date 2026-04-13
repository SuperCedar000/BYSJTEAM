<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">物料供应管理平台</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="form.password" placeholder="密码" prefix-icon="Lock" @keyup.enter="login" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const login = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        username: form.username,
        password: form.password
      })
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('role', res.data.role)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } else {
        ElMessage.error(res.data.message || '登录失败')
      }
    } catch (err) {
      ElMessage.error(err.response?.data?.message || '登录失败，请检查用户名密码')
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #2d3a4b;
}
.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>