import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { apiClient } from './api/client';
import { queryClient } from './query/client';
import { queryKeys } from './query/keys';
import { router } from './router';
import { useSessionStore } from './stores/session';
import './styles/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VueQueryPlugin, { queryClient });
app.use(router);

/** Базовый 401 → guest (без refresh / сложных interceptors). */
apiClient.use({
  async onResponse({ response }) {
    if (response.status !== 401) return;
    const session = useSessionStore(pinia);
    if (session.status === 'guest') return;
    session.clear();
    queryClient.setQueryData(queryKeys.auth.me(), null);
  },
});

app.mount('#app');
