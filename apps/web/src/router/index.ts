import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import UiKitPage from '@/pages/UiKitPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      // TEMP: витрина UI-Kit (FRO-6); убрать после Auth/продуктовых экранов
      path: '/dev/ui-kit',
      name: 'dev-ui-kit',
      component: UiKitPage,
    },
  ],
});
