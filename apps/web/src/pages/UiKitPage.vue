<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, AppInput } from '@/components/ui';

const email = ref('');
const password = ref('secret');
const errorEmail = ref('Некорректный email');
const loading = ref(false);

function toggleLoading() {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
  }, 1500);
}
</script>

<template>
  <!-- TEMP: витрина UI-Kit для приёмки FRO-6; не продуктовый экран -->
  <main class="min-h-dvh bg-bg p-8">
    <h1 class="text-h2 text-ink">UI-Kit · Button & Input</h1>
    <p class="mt-2 text-body-sm text-muted">Временная страница для сверки с Figma 04.1 / 04.2</p>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppButton · md (44)</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton>Primary</AppButton>
        <AppButton variant="secondary">Secondary</AppButton>
        <AppButton variant="ghost">Ghost</AppButton>
        <AppButton variant="danger-ghost">Danger ghost</AppButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <AppButton disabled>Primary disabled</AppButton>
        <AppButton variant="secondary" disabled>Secondary disabled</AppButton>
        <AppButton variant="ghost" disabled>Ghost disabled</AppButton>
        <AppButton variant="danger-ghost" disabled>Danger disabled</AppButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <AppButton :loading="loading" @click="toggleLoading">
          {{ loading ? 'Loading…' : 'Primary loading' }}
        </AppButton>
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppButton · sm (32)</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton size="sm">Primary</AppButton>
        <AppButton size="sm" variant="secondary">Secondary</AppButton>
        <AppButton size="sm" variant="ghost">Ghost</AppButton>
        <AppButton size="sm" variant="danger-ghost">Danger ghost</AppButton>
      </div>
    </section>

    <section class="mt-10 max-w-sm space-y-5">
      <h2 class="text-title">AppInput</h2>
      <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
      <AppInput v-model="password" label="Пароль" type="password" />
      <AppInput
        v-model="errorEmail"
        label="С ошибкой"
        type="email"
        error="Некорректный email"
      />
      <AppInput model-value="Disabled" label="Disabled" disabled />
    </section>
  </main>
</template>
