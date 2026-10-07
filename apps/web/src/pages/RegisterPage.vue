<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthApiError } from '@/api/auth';
import { AppButton, AppInput } from '@/components/ui';
import { useRegisterMutation } from '@/composables/useAuthMutations';
import { hasFieldErrors, validateRegisterForm } from '@/lib/auth-validation';

const router = useRouter();
const register = useRegisterMutation();

const email = ref('');
const nick = ref('');
const password = ref('');
const fieldErrors = ref<{ email?: string; nick?: string; password?: string }>({});
const formError = ref('');

const isSubmitting = computed(() => register.isPending.value);

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
}

function applyAuthError(err: unknown) {
  clearErrors();
  if (!(err instanceof AuthApiError)) {
    formError.value = 'Не удалось зарегистрироваться';
    return;
  }

  if (err.status === 409) {
    if (err.field === 'email' || err.field === 'nick') {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    formError.value = err.message || 'Конфликт данных';
    return;
  }

  if (err.status === 400 || err.status === 422) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      fieldErrors.value = {
        email: err.fields.email,
        nick: err.fields.nick,
        password: err.fields.password,
      };
      return;
    }
    if (err.field === 'email' || err.field === 'nick' || err.field === 'password') {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    formError.value = err.message || 'Проверьте данные формы';
    return;
  }

  formError.value = err.message || 'Не удалось зарегистрироваться';
}

async function onSubmit() {
  clearErrors();
  const localErrors = validateRegisterForm({
    email: email.value,
    nick: nick.value,
    password: password.value,
  });
  if (hasFieldErrors(localErrors)) {
    fieldErrors.value = localErrors;
    return;
  }

  try {
    await register.mutateAsync({
      email: email.value.trim(),
      nick: nick.value.trim(),
      password: password.value,
    });
    await router.replace('/app/topics');
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

      <h1 class="text-h1 text-ink">Регистрация</h1>

      <form class="flex flex-col gap-3" novalidate @submit.prevent="onSubmit">
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :error="fieldErrors.email"
          :disabled="isSubmitting"
        />
        <AppInput
          v-model="nick"
          label="Ник"
          type="text"
          autocomplete="username"
          placeholder="topic_fan"
          :error="fieldErrors.nick"
          :disabled="isSubmitting"
        />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          :error="fieldErrors.password"
          :disabled="isSubmitting"
        />

        <p class="text-label font-semibold text-muted">
          Уже есть аккаунт?
          <RouterLink
            class="text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            to="/login"
          >
            Войти
          </RouterLink>
        </p>

        <p v-if="formError" class="text-caption text-danger" role="alert">{{ formError }}</p>

        <AppButton type="submit" :loading="isSubmitting" class="w-full">
          Зарегистрироваться
        </AppButton>
      </form>
    </div>
  </main>
</template>
