<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

export type AppNavPlacement = 'auto' | 'bottom' | 'top';
export type AppNavActive = 'topics' | 'profile';

const props = withDefaults(
  defineProps<{
    /** auto: bottom below md, top from md up (floating dock). */
    placement?: AppNavPlacement;
    active?: AppNavActive;
    topicsTo?: string;
    /** Nick / label for profile placeholder. */
    profileLabel?: string;
    /** false — relative shell for UI-Kit samples (not viewport-fixed). */
    fixed?: boolean;
  }>(),
  {
    placement: 'auto',
    active: 'topics',
    topicsTo: '/app/topics',
    profileLabel: 'Профиль',
    fixed: true,
  },
);

const emit = defineEmits<{
  /** Profile placeholder — wire real profile later. */
  profile: [];
  /** Logout placeholder (desktop) / profile can also trigger logout. */
  logout: [];
}>();

const isTopics = computed(() => props.active === 'topics');
const isProfile = computed(() => props.active === 'profile');

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
    'mx-auto flex h-16 items-center rounded-lg border border-line bg-surface shadow-float';
  switch (props.placement) {
    case 'bottom':
      return `${base} max-w-[366px] justify-around px-2`;
    case 'top':
      return `${base} max-w-[1256px] justify-between px-4`;
    case 'auto':
    default:
      return `${base} max-w-[366px] justify-around px-2 md:max-w-[1256px] md:justify-between md:px-4`;
  }
});

const showMobileChrome = computed(
  () => props.placement === 'bottom' || props.placement === 'auto',
);
const showDesktopChrome = computed(
  () => props.placement === 'top' || props.placement === 'auto',
);
</script>

<template>
  <nav :class="rootClass" aria-label="Основная навигация">
    <div :class="shellClass">
      <!-- Mobile floating dock: soft-well 32×32 on active icon -->
      <div
        v-if="showMobileChrome"
        class="flex w-full items-center justify-around"
        :class="placement === 'auto' ? 'md:hidden' : undefined"
      >
        <RouterLink
          :to="topicsTo"
          class="flex flex-col items-center gap-1 rounded-md px-3 py-1 text-caption outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          :class="isTopics ? 'text-accent' : 'text-muted'"
          :aria-current="isTopics ? 'page' : undefined"
        >
          <span
            class="flex size-8 items-center justify-center rounded-md"
            :class="isTopics ? 'bg-accent-soft' : 'bg-transparent'"
          >
            <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5" />
              <rect x="3" y="9" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.5" />
              <rect x="3" y="14" width="10" height="3" rx="1" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </span>
          <span class="font-semibold">Мои топики</span>
        </RouterLink>

        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-md px-3 py-1 text-caption outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          :class="isProfile ? 'text-accent' : 'text-muted'"
          :aria-current="isProfile ? 'page' : undefined"
          @click="emit('profile')"
        >
          <span
            class="flex size-8 items-center justify-center rounded-md"
            :class="isProfile ? 'bg-accent-soft' : 'bg-transparent'"
          >
            <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M4 16.5c1.5-2.5 3.5-3.5 6-3.5s4.5 1 6 3.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="font-semibold">{{ profileLabel }}</span>
        </button>
      </div>

      <!-- Desktop floating dock: active = accent + Semibold (no underline) -->
      <div
        v-if="showDesktopChrome"
        class="w-full items-center justify-between"
        :class="placement === 'auto' ? 'hidden md:flex' : 'flex'"
      >
        <RouterLink
          :to="topicsTo"
          class="rounded-md px-3 py-2 text-label outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          :class="isTopics ? 'font-semibold text-accent' : 'font-normal text-muted hover:text-ink'"
          :aria-current="isTopics ? 'page' : undefined"
        >
          Мои топики
        </RouterLink>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-md px-3 py-2 text-label outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            :class="
              isProfile ? 'font-semibold text-accent' : 'font-normal text-muted hover:text-ink'
            "
            :aria-current="isProfile ? 'page' : undefined"
            @click="emit('profile')"
          >
            {{ profileLabel }}
          </button>
          <button
            type="button"
            class="rounded-md px-3 py-2 text-body-sm text-muted outline-none transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            @click="emit('logout')"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
