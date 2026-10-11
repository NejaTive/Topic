<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthApiError } from '@/api/auth';
import { TButton, TInput } from '@/components/ui-kit';
import { useLoginMutation } from '@/composables/useAuthMutations';
import { hasFieldErrors, validateLoginForm } from '@/lib/auth-validation';
import { RouteName } from '@/router/route-names';

interface FieldErrors {
  email?: string;
  password?: string;
}

const route = useRoute();
const router = useRouter();
const login = useLoginMutation();

const email = ref('');
const password = ref('');
const fieldErrors = ref<FieldErrors>({});
const emailInvalid = ref(false);

const isSubmitting = computed(() => login.isPending.value);

function resolveReturnPath(): string {
  const raw = route.query.returnUrl;
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return router.resolve({ name: RouteName.AppTopics }).fullPath;
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

  const data = {
    email: email.value.trim(),
    password: password.value.trim(),
  };
  const localErrors = validateLoginForm(data);
  if (hasFieldErrors(localErrors)) {
    fieldErrors.value = localErrors;
    return;
  }

  try {
    await login.mutateAsync(data);
    await router.replace(resolveReturnPath());
  } catch (err) {
    applyAuthError(err);
  }
}
</script>

<template>
  <div class="glass flex w-full max-w-89.5 flex-col gap-3 rounded-lg px-6.25 py-7.25 md:max-w-110">
    <RouterLink :to="RouteName.Root" class="text-label font-semibold text-accent">
      ← Topic
    </RouterLink>

    <h1 class="text-h1">Вход</h1>

    <form class="flex flex-col gap-3" novalidate @submit.prevent="onSubmit">
      <TInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :error="fieldErrors.email"
        :invalid="emailInvalid"
        :disabled="isSubmitting"
      />
      <TInput
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
        <RouterLink :to="RouteName.Register" class="text-accent font-semibold">
          Регистрация
        </RouterLink>
      </p>

      <TButton type="submit" :loading="isSubmitting">Войти</TButton>
    </form>
  </div>
</template>
