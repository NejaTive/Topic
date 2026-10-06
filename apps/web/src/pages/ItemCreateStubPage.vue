<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { AppNav } from '@/components/ui';
import { useLogoutMutation } from '@/composables/useAuthMutations';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const logout = useLogoutMutation();

const topicId = computed(() => String(route.params.id ?? ''));
const profileLabel = computed(() => session.user?.nick ?? 'Профиль');

async function onLogout() {
  await logout.mutateAsync();
  await router.replace('/login');
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav
      active="topics"
      :profile-label="profileLabel"
      @logout="onLogout"
    />
    <main
      class="mx-auto flex w-full max-w-[366px] flex-col gap-4 px-4 pb-28 pt-6 md:max-w-[440px] md:px-8 md:pb-10 md:pt-28"
    >
      <RouterLink
        :to="{ name: 'app-topic-detail', params: { id: topicId } }"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← Назад к топику
      </RouterLink>
      <h1 class="text-h1 text-ink">Добавить элемент</h1>
      <p class="text-body text-muted">
        Экран S06 появится в FRO-14. Заглушка
        <code class="text-body-sm">/app/topics/{{ topicId }}/items/new</code>.
      </p>
    </main>
  </div>
</template>
