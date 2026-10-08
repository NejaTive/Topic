<script setup lang="ts">
import { useRouter } from 'vue-router';
import { TButton } from '@/components/ui-kit';
import { RouteName } from '@/router/route-names';

const router = useRouter();
</script>

<template>
  <main>
    <div class="flex flex-col items-center gap-4 text-center">
      <h1 class="text-display">Topic</h1>
      <p class="text-h2">Личные рейтинги</p>
      <p class="text-body text-muted">Создавай топики и делись ссылкой!</p>

      <div class="flex w-full flex-col gap-4 md:w-auto md:flex-row md:gap-3">
        <TButton @click="router.push({ name: RouteName.Login })">Войти</TButton>
        <TButton variant="secondary" @click="router.push({ name: RouteName.Register })">
          Регистрация
        </TButton>
      </div>
    </div>
  </main>
</template>
