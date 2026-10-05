<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthApiError } from '@/api/auth';
import { AppButton, AppInput } from '@/components/ui';
import { useLoginMutation } from '@/composables/useAuthMutations';

const route = useRoute();
const router = useRouter();
const login = useLoginMutation();

const email = ref('');
const password = ref('');
const formError = ref('');

const isSubmitting = computed(() => login.isPending.value);

function resolveReturnPath(): string {
  const raw = route.query.returnUrl;
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/app/topics';
  }
  return raw;
}

async function onSubmit() {
  formError.value = '';
  try {
    await login.mutateAsync({ email: email.value, password: password.value });
    await router.replace(resolveReturnPath());
  } catch (err) {
    formError.value = err instanceof AuthApiError ? err.message : 'Не удалось войти';
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-8">
    <div>
      <h1 class="text-title">Вход</h1>
      <p class="mt-2 text-body text-muted">Войдите, чтобы открыть свои топики.</p>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :disabled="isSubmitting"
      />
      <AppInput
        v-model="password"
        label="Пароль"
        type="password"
        autocomplete="current-password"
        :disabled="isSubmitting"
      />
      <p v-if="formError" class="text-caption text-danger" role="alert">{{ formError }}</p>
      <AppButton type="submit" :loading="isSubmitting" class="w-full">Войти</AppButton>
    </form>

    <p class="text-body-sm text-muted">
      Нет аккаунта?
      <RouterLink class="text-accent font-semibold" to="/register">Зарегистрироваться</RouterLink>
    </p>
  </main>
</template>
