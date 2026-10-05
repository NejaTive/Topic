<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthApiError } from '@/api/auth';
import { AppButton, AppInput } from '@/components/ui';
import { useRegisterMutation } from '@/composables/useAuthMutations';

const router = useRouter();
const register = useRegisterMutation();

const email = ref('');
const nick = ref('');
const password = ref('');
const formError = ref('');
const fieldErrors = ref<{ email?: string; nick?: string }>({});

const isSubmitting = computed(() => register.isPending.value);

async function onSubmit() {
  formError.value = '';
  fieldErrors.value = {};
  try {
    await register.mutateAsync({
      email: email.value,
      nick: nick.value,
      password: password.value,
    });
    await router.replace('/app/topics');
  } catch (err) {
    if (err instanceof AuthApiError && err.field) {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    formError.value = err instanceof AuthApiError ? err.message : 'Не удалось зарегистрироваться';
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-8">
    <div>
      <h1 class="text-title">Регистрация</h1>
      <p class="mt-2 text-body text-muted">Создайте аккаунт Topic.</p>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="fieldErrors.email"
        :disabled="isSubmitting"
      />
      <AppInput
        v-model="nick"
        label="Ник"
        type="text"
        autocomplete="username"
        :error="fieldErrors.nick"
        :disabled="isSubmitting"
      />
      <AppInput
        v-model="password"
        label="Пароль"
        type="password"
        autocomplete="new-password"
        :disabled="isSubmitting"
      />
      <p v-if="formError" class="text-caption text-danger" role="alert">{{ formError }}</p>
      <AppButton type="submit" :loading="isSubmitting" class="w-full">Создать аккаунт</AppButton>
    </form>

    <p class="text-body-sm text-muted">
      Уже есть аккаунт?
      <RouterLink class="text-accent font-semibold" to="/login">Войти</RouterLink>
    </p>
  </main>
</template>
