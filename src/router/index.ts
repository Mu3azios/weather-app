import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AccountDetails from '../views/AccountDetails.vue'
import WeatherDetails from '../views/WeatherDetails.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/weather-details',
      name: 'WeatherDetails',
      component: WeatherDetails,
    },
    {
      path: '/account',
      name: 'AccountDetails',
      component: AccountDetails,
    },
  ],
})

export default router
