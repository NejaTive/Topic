<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import TButton from '@/components/ui-kit/TButton.vue';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';

const breakpoints = useTailwindBreakpoints();
const isMdUp = breakpoints.greaterOrEqual('md');
const ctaSize = computed(() => (isMdUp.value ? 'md' : 'sm'));

const brandClass =
  'rounded-md text-[22px] font-bold leading-tight text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';
</script>

<template>
  <nav class="fixed inset-x-3 bottom-3 z-40 md:bottom-auto md:top-3" aria-label="Навигация гостя">
    <div
      class="mx-auto flex h-16 max-w-91.5 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 shadow-float md:max-w-201 md:gap-3 md:px-4 lg:max-w-314"
    >
      <RouterLink to="/" :class="brandClass">Topic</RouterLink>

      <RouterLink v-slot="{ navigate }" to="/" custom>
        <TButton :size="ctaSize" @click="navigate">Присоединиться</TButton>
      </RouterLink>
    </div>
  </nav>
</template>
