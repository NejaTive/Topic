import { createRouter, createWebHistory } from 'vue-router';
import AccessDeniedPage from '@/pages/AccessDeniedPage.vue';
import HomePage from '@/pages/HomePage.vue';
import ItemCreatePage from '@/pages/ItemCreatePage.vue';
import ItemDetailPage from '@/pages/ItemDetailPage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import NotFoundPage from '@/pages/NotFoundPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import TopicCreatePage from '@/pages/TopicCreatePage.vue';
import TopicDetailPage from '@/pages/TopicDetailPage.vue';
import ShareViewPage from '@/pages/ShareViewPage.vue';
import TopicsPage from '@/pages/TopicsPage.vue';
import UiKitPage from '@/pages/UiKitPage.vue';
import { useSessionStore } from '@/stores/session';
import { ensureSessionReady } from './session-ready';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { guestOnly: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { guestOnly: true },
    },
    {
      path: '/t/:shareId',
      name: 'share-view',
      component: ShareViewPage,
    },
    {
      path: '/share/no-access',
      name: 'share-forbidden',
      component: AccessDeniedPage,
    },
    {
      path: '/share/not-found',
      name: 'share-not-found',
      component: NotFoundPage,
    },
    {
      path: '/app',
      redirect: '/app/topics',
    },
    {
      path: '/app/topics',
      name: 'app-topics',
      component: TopicsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/app/topics/new',
      name: 'app-topic-create',
      component: TopicCreatePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/app/topics/:id/items/new',
      name: 'app-topic-item-create',
      component: ItemCreatePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/app/topics/:id/items/:itemId',
      name: 'app-topic-item-detail',
      component: ItemDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/app/topics/:id',
      name: 'app-topic-detail',
      component: TopicDetailPage,
      meta: { requiresAuth: true },
    },
    {
      // TEMP: витрина UI-Kit (FRO-6); убрать после Auth/продуктовых экранов
      path: '/dev/ui-kit',
      name: 'dev-ui-kit',
      component: UiKitPage,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
});

router.beforeEach(async (to) => {
  await ensureSessionReady();

  const session = useSessionStore();

  if (to.meta.requiresAuth && session.status === 'guest') {
    return `/login?returnUrl=${encodeURIComponent(to.fullPath)}`;
  }

  if (to.meta.guestOnly && session.status === 'authed') {
    return { path: '/app/topics' };
  }

  return true;
});
