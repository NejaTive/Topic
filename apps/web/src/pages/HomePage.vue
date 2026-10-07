<script setup lang="ts">
import { useRouter } from 'vue-router';
import { AppButton } from '@/components/ui';

const router = useRouter();
</script>

<template>
  <main class="flex min-h-dvh flex-col items-center justify-center bg-bg px-9 py-8 md:px-8">
    <div
      class="flex w-full max-w-80 flex-col items-center gap-4 text-center md:max-w-none md:gap-5"
    >
      <h1 class="text-display text-ink md:text-[48px] md:leading-15.25">Topic</h1>

      <p class="text-[18px] leading-5.75 font-medium text-ink md:text-h2">
        <span class="md:hidden">Личные рейтинги.<br />Не звёзды — порядок.</span>
        <span class="hidden md:inline">Личные рейтинги. Не звёзды — порядок.</span>
      </p>

      <p class="text-body-sm text-muted md:text-body">
        <span class="md:hidden"
          >Создавай топики, ранжируй DnD,<br />делись ссылкой с друзьями.</span
        >
        <span class="hidden md:inline">Создавай топики · ранжируй DnD · делись ссылкой</span>
      </p>

      <div class="flex w-full flex-col gap-4 md:w-auto md:flex-row md:gap-3">
        <AppButton class="w-full md:w-auto" @click="router.push('/login')"> Войти </AppButton>
        <AppButton variant="secondary" class="w-full md:w-auto" @click="router.push('/register')">
          Регистрация
        </AppButton>
      </div>
    </div>
  </main>
</template>
