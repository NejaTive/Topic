<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import TButton from '@/components/ui-kit/TButton.vue';

export type GuestNavPlacement = 'auto' | 'bottom' | 'top';
export type GuestNavCtaMode = 'guest' | 'share' | 'error';

interface GuestNavProps {
  placement?: GuestNavPlacement;
  fixed?: boolean;
  ctaMode?: GuestNavCtaMode;
  brandTo?: string;
  loginTo?: string;
  joinTo?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  showSecondary?: boolean;
}

const props = withDefaults(defineProps<GuestNavProps>(), {
  placement: 'auto',
  fixed: true,
  ctaMode: 'guest',
  brandTo: '/',
  loginTo: '/login',
  joinTo: '/',
  primaryLabel: undefined,
  primaryTo: undefined,
  secondaryLabel: undefined,
  secondaryTo: undefined,
  showSecondary: undefined,
});

const resolvedPrimaryLabel = computed(() => {
  if (props.primaryLabel !== undefined) return props.primaryLabel;
  if (props.ctaMode === 'error') return 'На главную';
  if (props.ctaMode === 'share') return 'Присоединиться';
  return 'Войти';
});

const resolvedPrimaryTo = computed(() => {
  if (props.primaryTo !== undefined) return props.primaryTo;
  if (props.ctaMode === 'error' || props.ctaMode === 'share') return props.joinTo;
  return props.loginTo;
});

const resolvedSecondaryLabel = computed(() => props.secondaryLabel ?? 'Присоединиться');

const resolvedSecondaryTo = computed(() => props.secondaryTo ?? props.joinTo);

const showJoinCta = computed(() => {
  if (props.showSecondary !== undefined) return props.showSecondary;
  return props.ctaMode === 'guest';
});

const rootClass = computed(() => {
  if (!props.fixed) {
    return 'relative w-full';
  }
  switch (props.placement) {
    case 'bottom':
      return 'fixed inset-x-3 bottom-3 z-40';
    case 'top':
      return 'fixed inset-x-3 top-3 z-40';
    case 'auto':
    default:
      return 'fixed inset-x-3 bottom-3 z-40 md:bottom-auto md:top-3';
  }
});

const shellClass = computed(() => {
  const base =
    'mx-auto flex h-16 items-center rounded-lg border border-line bg-surface shadow-float justify-between gap-2 px-3 md:gap-3 md:px-4';
  switch (props.placement) {
    case 'bottom':
      return `${base} max-w-91.5`;
    case 'top':
      return `${base} max-w-201 lg:max-w-314`;
    case 'auto':
    default:
      return `${base} max-w-91.5 md:max-w-201 lg:max-w-314`;
  }
});

const brandClass =
  'rounded-md text-[22px] font-bold leading-tight text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

const showCompactCtas = computed(() => props.placement === 'bottom' || props.placement === 'auto');
const showWideCtas = computed(() => props.placement === 'top' || props.placement === 'auto');
</script>

<template>
  <nav :class="rootClass" aria-label="Навигация гостя">
    <div :class="shellClass">
      <RouterLink :to="brandTo" :class="brandClass">Topic</RouterLink>

      <div
        v-if="showCompactCtas"
        class="flex shrink-0 items-center gap-2"
        :class="placement === 'auto' ? 'md:hidden' : undefined"
      >
        <RouterLink v-slot="{ navigate }" :to="resolvedPrimaryTo" custom>
          <TButton size="sm" @click="navigate">{{ resolvedPrimaryLabel }}</TButton>
        </RouterLink>
        <RouterLink v-if="showJoinCta" v-slot="{ navigate }" :to="resolvedSecondaryTo" custom>
          <TButton variant="ghost" size="sm" @click="navigate">
            {{ resolvedSecondaryLabel }}
          </TButton>
        </RouterLink>
      </div>

      <div
        v-if="showWideCtas"
        class="hidden shrink-0 items-center gap-2"
        :class="placement === 'auto' ? 'md:flex' : 'flex'"
      >
        <RouterLink v-slot="{ navigate }" :to="resolvedPrimaryTo" custom>
          <TButton @click="navigate">{{ resolvedPrimaryLabel }}</TButton>
        </RouterLink>
        <RouterLink v-if="showJoinCta" v-slot="{ navigate }" :to="resolvedSecondaryTo" custom>
          <TButton variant="ghost" @click="navigate">{{ resolvedSecondaryLabel }}</TButton>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
