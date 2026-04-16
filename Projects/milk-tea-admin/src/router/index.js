import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'basic-data',
        name: 'BasicData',
        component: () => import('../views/BasicData.vue')
      },
      {
        path: 'procurement',
        name: 'Procurement',
        component: () => import('../views/Procurement.vue')
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/Inventory.vue')
      },
      {
        path: 'requisition',
        name: 'Requisition',
        component: () => import('../views/Requisition.vue')
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('../views/Sales.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：未登录时跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router