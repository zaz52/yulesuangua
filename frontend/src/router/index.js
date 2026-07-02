import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Divine from '../views/Divine.vue'
import ToolPage from '../views/ToolPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/divine/:skill', name: 'Divine', component: Divine },
  { path: '/tools/:tool', name: 'ToolPage', component: ToolPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
