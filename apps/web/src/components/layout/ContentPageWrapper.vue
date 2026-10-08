<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { RouteName } from '@/router/route-names';

interface ContentPageWrapperProps {
  routeTo?: RouteName | Record<string, unknown>;
  textTo?: string;
  title?: string;
}

const props = defineProps<ContentPageWrapperProps>();
</script>

<template>
  <div>
    <RouterLink
      v-if="props.routeTo"
      :to="props.routeTo"
      class="text-label font-semibold text-accent"
    >
      ← {{ props.textTo }}
    </RouterLink>
    <h1 class="mt-4 text-h1 text-ink">{{ props.title }}</h1>
    <slot />
  </div>
</template>
