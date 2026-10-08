<template>
  <div class="app-loader">
    <div class="app-loader__spinner" role="status" aria-label="Загрузка…" />
  </div>
</template>

<style lang="scss" scoped>
$size: 36px;

.app-loader {
  display: flex;
  align-items: center;
  justify-content: center;

  &__spinner {
    width: $size;
    height: $size;
    border-radius: 9999px;
    border: calc($size / 7) solid color-mix(in srgb, var(--color-accent) 25%, transparent);
    border-top-color: var(--color-accent);
    animation: spin 0.7s linear infinite;
  }
}
</style>
