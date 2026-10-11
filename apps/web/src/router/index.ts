import { createRouter, createWebHistory } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useSessionStore } from '@/stores/session';
import { RouteName } from './route-names';
import { ensureSessionReady } from './session-ready';

export { RouteName } from './route-names';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: RouteName.Login,
          component: () => import('@/pages/LoginPage.vue'),
          meta: { guestOnly: true },
        },
        {
          path: 'register',
          name: RouteName.Register,
          component: () => import('@/pages/RegisterPage.vue'),
          meta: { guestOnly: true },
        },
        {
          path: '/',
          name: RouteName.Home,
          component: () => import('@/pages/HomePage.vue'),
          meta: { guestOnly: true },
        },
      ],
    },
    {
      path: '/share/no-access',
      name: RouteName.ShareForbidden,
      component: () => import('@/pages/AccessDeniedPage.vue'),
    },
    {
      path: '/share/not-found',
      name: RouteName.ShareNotFound,
      component: () => import('@/pages/NotFoundPage.vue'),
    },
    {
      path: '/app',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: RouteName.AppTopics },
        },
        {
          path: 'feed',
          name: RouteName.AppFeed,
          component: () => import('@/pages/FeedPage.vue'),
        },
        {
          path: 'topics',
          name: RouteName.AppTopics,
          component: () => import('@/pages/TopicsPage.vue'),
        },
        {
          path: 'topics/new',
          name: RouteName.AppTopicCreate,
          component: () => import('@/pages/TopicCreatePage.vue'),
        },
        {
          path: 'topics/:id/items/new',
          name: RouteName.AppTopicItemCreate,
          component: () => import('@/pages/ItemCreatePage.vue'),
        },
        {
          path: 'topics/:id/items/:itemId',
          name: RouteName.AppTopicItemDetail,
          component: () => import('@/pages/ItemDetailPage.vue'),
        },
        {
          path: 'topics/:id',
          name: RouteName.AppTopicDetail,
          component: () => import('@/pages/TopicDetailPage.vue'),
        },
        {
          path: '/t/:shareId',
          name: RouteName.ShareView,
          component: () => import('@/pages/ShareViewPage.vue'),
        },
      ],
    },
    {
      path: '/u/:nick',
      component: MainLayout,
      children: [
        {
          path: '',
          name: RouteName.UserProfile,
          component: () => import('@/pages/ProfilePage.vue'),
        },
      ],
    },
    {
      path: '/dev/ui-kit',
      name: RouteName.DevUiKit,
      component: () => import('@/pages/UiKitPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  await ensureSessionReady();

  const session = useSessionStore();

  if (to.meta.requiresAuth && session.status === 'guest') {
    return { name: RouteName.Login, query: { returnUrl: to.fullPath } };
  }

  if (to.meta.guestOnly && session.status === 'authed') {
    return { name: RouteName.AppTopics };
  }

  return true;
});
