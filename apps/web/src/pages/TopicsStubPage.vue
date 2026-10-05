<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { AppButton } from '@/components/ui';
import { useLogoutMutation } from '@/composables/useAuthMutations';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const router = useRouter();
const logout = useLogoutMutation();
const isLoggingOut = computed(() => logout.isPending.value);

async function onLogout() {
  await logout.mutateAsync();
  await router.replace('/app/topics');
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-8">
    <div>
      <h1 class="text-title">Мои топики</h1>
      <p class="mt-3 text-body text-muted">
        Полный экран списка топиков появится в эпике Topics. Сейчас это защищённая заглушка после
        входа.
      </p>
      <p v-if="session.user" class="mt-2 text-body-sm text-subtle">
        {{ session.user.nick }} · {{ session.user.email }}
      </p>
    </div>

    <AppButton variant="danger-ghost" :loading="isLoggingOut" @click="onLogout">
      Выйти
    </AppButton>
  </main>
</template>
