<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthApiError } from '@/api/auth';
import { AppButton, AppInput } from '@/components/ui';
import { useLoginMutation } from '@/composables/useAuthMutations';
import { hasFieldErrors, validateLoginForm } from '@/lib/auth-validation';

const route = useRoute();
const router = useRouter();
const login = useLoginMutation();

const email = ref('');
const password = ref('');
const fieldErrors = ref<{ email?: string; password?: string }>({});
const emailInvalid = ref(false);

const isSubmitting = computed(() => login.isPending.value);

/** Same-origin path only; reject protocol-relative and absolute URLs. */
function resolveReturnPath(): string {
  const raw = route.query.returnUrl;
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/app/topics';
  }
  return raw;
}

function clearErrors() {
  fieldErrors.value = {};
  emailInvalid.value = false;
}

function applyAuthError(err: unknown) {
  clearErrors();
  if (!(err instanceof AuthApiError)) {
    fieldErrors.value = { password: 'Не удалось войти' };
    return;
  }

  if (err.status === 401) {
    emailInvalid.value = true;
    fieldErrors.value = { password: err.message || 'Неверный email или пароль' };
    return;
  }

  if (err.status === 400 || err.status === 422) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      fieldErrors.value = {
        email: err.fields.email,
        password: err.fields.password,
      };
      return;
    }
    if (err.field === 'email' || err.field === 'password') {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    fieldErrors.value = { password: err.message || 'Проверьте данные формы' };
    return;
  }

  fieldErrors.value = { password: err.message || 'Не удалось войти' };
}

async function onSubmit() {
  clearErrors();
  const localErrors = validateLoginForm({
    email: email.value,
    password: password.value,
  });
  if (hasFieldErrors(localErrors)) {
    fieldErrors.value = localErrors;
    return;
  }

  try {
    await login.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    });
    await router.replace(resolveReturnPath());
  } catch (err) {
    applyAuthError(err);
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
    <div
      class="flex w-full max-w-89.5 flex-col gap-3 rounded-lg border border-line bg-surface px-6.25 py-7.25 md:max-w-110"
    >
      <RouterLink
        to="/"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← Topic
      </RouterLink>

      <h1 class="text-h1 text-ink">Вход</h1>

      <form class="flex flex-col gap-3" novalidate @submit.prevent="onSubmit">
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :error="fieldErrors.email"
          :invalid="emailInvalid"
          :disabled="isSubmitting"
        />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :error="fieldErrors.password"
          :disabled="isSubmitting"
        />

        <p class="text-label font-semibold text-muted">
          Нет аккаунта?
          <RouterLink
            class="text-accent font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            to="/register"
          >
            Регистрация
          </RouterLink>
        </p>

        <AppButton type="submit" :loading="isSubmitting" class="w-full">Войти</AppButton>
      </form>
    </div>
  </main>
</template>
