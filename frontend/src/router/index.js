import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Divine from '../views/Divine.vue'
import ToolPage from '../views/ToolPage.vue'
import ZhouyiRitual from '../views/ZhouyiRitual.vue'
import ShareView from '../views/ShareView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/divine/:skill', name: 'Divine', component: Divine },
  { path: '/zhouyi', name: 'ZhouyiRitual', component: ZhouyiRitual },
  { path: '/share/:id', name: 'ShareView', component: ShareView },
  { path: '/tools/liuyao', name: 'LiuyaoRitual', component: ZhouyiRitual },
  { path: '/tools/:tool', name: 'ToolPage', component: ToolPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
