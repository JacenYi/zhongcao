import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdvertiserView from '../views/AdvertiserView.vue'
import PlanterView from '../views/PlanterView.vue'
import ConsumerView from '../views/ConsumerView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/advertiser',
    name: 'advertiser',
    component: AdvertiserView
  },
  {
    path: '/planter',
    name: 'planter',
    component: PlanterView
  },
  {
    path: '/consumer',
    name: 'consumer',
    component: ConsumerView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router