<script setup lang="ts">
interface TLoaderProps {
  compact?: boolean;
  /** Светлый спиннер на тёмном фоне (оверлей на обложке). */
  onDark?: boolean;
}

withDefaults(defineProps<TLoaderProps>(), {
  compact: false,
  onDark: false,
});
</script>

<template>
  <div
    class="app-loader"
    :class="{ 'app-loader--compact': compact, 'app-loader--on-dark': onDark }"
  >
    <div class="app-loader__spinner" role="status" aria-label="Загрузка…" />
  </div>
</template>

<style lang="scss" scoped>
$size: 36px;
$size-compact: 20px;

.app-loader {
  display: flex;
  align-items: center;
  justify-content: center;

  &__spinner {
    box-sizing: border-box;
    width: $size;
    height: $size;
    border-radius: 9999px;
    border: calc($size / 7) solid color-mix(in srgb, var(--color-accent) 25%, transparent);
    border-top-color: var(--color-accent);
    animation: app-loader-spin 0.7s linear infinite;
  }

  &--compact &__spinner {
    width: $size-compact;
    height: $size-compact;
    border-width: 2px;
  }

  &--on-dark &__spinner {
    border-color: color-mix(in srgb, #fff 28%, transparent);
    border-top-color: #fff;
  }
}

@keyframes app-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
