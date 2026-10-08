<script setup lang="ts">
import TButton from './TButton.vue';

interface TErrorEmits {
  (e: 'retry'): void;
}

const emit = defineEmits<TErrorEmits>();
</script>

<template>
  <div class="t-error" role="alert">
    <p class="t-error__title">Не удалось загрузить</p>
    <p class="t-error__description">Проверьте соединение и попробуйте ещё раз.</p>

    <TButton variant="secondary" @click="emit('retry')"> Повторить </TButton>
  </div>
</template>

<style lang="scss" scoped>
.t-error {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  padding: 52px 32px;
  text-align: center;
}

.t-error__title {
  font-size: var(--text-title);
  line-height: var(--text-title--line-height);
  font-weight: var(--text-title--font-weight);
  color: var(--color-ink);
}

.t-error__description {
  font-size: var(--text-body-sm);
  line-height: var(--text-body-sm--line-height);
  color: var(--color-muted);
}
</style>
