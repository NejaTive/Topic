<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, type RouteLocationRaw } from 'vue-router';
import { RouteName } from '@/router/route-names';
import PageShell from './PageShell.vue';

interface ContentPageWrapperProps {
  routeTo?: RouteName | RouteLocationRaw;
  textTo?: string;
  title?: string;
}

const props = defineProps<ContentPageWrapperProps>();

const linkTo = computed<RouteLocationRaw | undefined>(() => {
  const to = props.routeTo;
  if (to == null) return undefined;
  if (typeof to === 'string') {
    return to.startsWith('/') ? to : { name: to };
  }
  return to;
});
</script>

<template>
  <PageShell>
    <template #header>
      <slot name="back">
        <RouterLink v-if="linkTo" :to="linkTo" class="text-label font-semibold text-accent">
          ← {{ props.textTo }}
        </RouterLink>
      </slot>
      <h1 class="mt-4 text-h1 text-ink">{{ props.title }}</h1>
      <slot name="chrome" />
    </template>
    <slot />
  </PageShell>
</template>
