import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Divine from '../views/Divine.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/divine/:skill', name: 'Divine', component: Divine },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
