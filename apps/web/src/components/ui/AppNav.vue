<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

export type AppNavPlacement = 'auto' | 'bottom' | 'top';
/** Override for UI-Kit samples (`fixed=false`); в продукте active берётся из роута. */
export type AppNavActive = 'feed' | 'topics' | 'profile';

const props = withDefaults(
  defineProps<{
    /** auto: bottom below md, top from md up (floating dock). */
    placement?: AppNavPlacement;
    /** Только для витрины (`fixed=false`). Иначе «Мои топики» active на `/app/topics*`. */
    active?: AppNavActive;
    topicsTo?: string;
    brandTo?: string;
    /** false — relative shell for UI-Kit samples (not viewport-fixed). */
    fixed?: boolean;
  }>(),
  {
    placement: 'auto',
    active: undefined,
    topicsTo: '/app/topics',
    brandTo: '/app/topics',
    fixed: true,
  },
);

const route = useRoute();

/** Подсветка только на экранах топиков (`/app/topics` и вложенные). */
const isTopics = computed(() => {
  if (route.path.startsWith('/app/topics')) return true;
  return !props.fixed && props.active === 'topics';
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
  const base = 'mx-auto flex items-center rounded-lg border border-line bg-surface shadow-float';
  switch (props.placement) {
    case 'bottom':
      return `${base} h-[68px] max-w-[366px] justify-around px-0.5`;
    case 'top':
      return `${base} h-16 max-w-[804px] justify-between px-6 lg:max-w-[1256px]`;
    case 'auto':
    default:
      return `${base} h-[68px] max-w-[366px] justify-around px-0.5 md:h-16 md:max-w-[804px] md:justify-between md:px-6 lg:max-w-[1256px]`;
  }
});

const showMobileChrome = computed(() => props.placement === 'bottom' || props.placement === 'auto');
const showDesktopChrome = computed(() => props.placement === 'top' || props.placement === 'auto');

const tabClass =
  'flex flex-col items-center gap-1 rounded-md px-2 py-1 text-caption outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

const tabDisabledClass = 'cursor-not-allowed text-subtle';

const desktopLinkBase =
  'rounded-md text-label outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

const desktopDisabledClass = 'cursor-not-allowed px-0 py-2 font-medium text-subtle';
</script>

<template>
  <nav :class="rootClass" aria-label="Основная навигация">
    <div :class="shellClass">
      <!-- Mobile floating dock: Лента | Мои топики | Профиль -->
      <div
        v-if="showMobileChrome"
        class="flex w-full items-center justify-around"
        :class="placement === 'auto' ? 'md:hidden' : undefined"
      >
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Скоро"
          :class="[tabClass, tabDisabledClass]"
        >
          <span class="flex size-8 items-center justify-center rounded-md bg-transparent">
            <svg class="size-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M9 6.75H23C23.6904 6.75 24.25 7.30964 24.25 8V11C24.25 11.6904 23.6904 12.25 23 12.25H9C8.30964 12.25 7.75 11.6904 7.75 11V8C7.75 7.30964 8.30964 6.75 9 6.75Z"
                fill="white"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M9 17.75H23C23.6904 17.75 24.25 18.3096 24.25 19V22C24.25 22.6904 23.6904 23.25 23 23.25H9C8.30964 23.25 7.75 22.6904 7.75 22V19C7.75 18.3096 8.30964 17.75 9 17.75Z"
                fill="white"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </span>
          <span class="font-medium">Лента</span>
        </button>

        <RouterLink
          :to="topicsTo"
          :class="[tabClass, isTopics ? 'text-accent' : 'text-muted']"
          :aria-current="isTopics ? 'page' : undefined"
        >
          <span
            class="flex size-8 items-center justify-center rounded-md"
            :class="isTopics ? 'bg-accent-soft' : 'bg-transparent'"
          >
            <svg class="size-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M7 10C7 9.44772 7.44772 9 8 9H24C24.5523 9 25 9.44772 25 10C25 10.5523 24.5523 11 24 11H8C7.44772 11 7 10.5523 7 10Z"
                fill="currentColor"
              />
              <path
                d="M7 16C7 15.4477 7.44772 15 8 15H24C24.5523 15 25 15.4477 25 16C25 16.5523 24.5523 17 24 17H8C7.44772 17 7 16.5523 7 16Z"
                fill="currentColor"
              />
              <path
                d="M7 22C7 21.4477 7.44772 21 8 21H18C18.5523 21 19 21.4477 19 22C19 22.5523 18.5523 23 18 23H8C7.44772 23 7 22.5523 7 22Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span :class="isTopics ? 'font-semibold' : 'font-medium'">Мои топики</span>
        </RouterLink>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Скоро"
          :class="[tabClass, tabDisabledClass]"
        >
          <span class="flex size-8 items-center justify-center rounded-md bg-transparent">
            <svg class="size-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M16 5.75C17.7949 5.75 19.25 7.20507 19.25 9C19.25 10.7949 17.7949 12.25 16 12.25C14.2051 12.25 12.75 10.7949 12.75 9C12.75 7.20507 14.2051 5.75 16 5.75Z"
                fill="white"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M11.5 17.75H20.5C22.0188 17.75 23.25 18.9812 23.25 20.5C23.25 22.0188 22.0188 23.25 20.5 23.25H11.5C9.98122 23.25 8.75 22.0188 8.75 20.5C8.75 18.9812 9.98122 17.75 11.5 17.75Z"
                fill="white"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </span>
          <span class="font-medium">Профиль</span>
        </button>
      </div>

      <!-- Desktop floating dock: Topic | Лента · Мои топики | Профиль -->
      <div
        v-if="showDesktopChrome"
        class="w-full items-center justify-between"
        :class="placement === 'auto' ? 'hidden md:flex' : 'flex'"
      >
        <div class="flex items-center gap-24">
          <RouterLink
            :to="brandTo"
            class="rounded-md text-[22px] font-bold leading-tight text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            Topic
          </RouterLink>

          <div class="flex items-center gap-6">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Скоро"
              :class="[desktopLinkBase, desktopDisabledClass]"
            >
              Лента
            </button>

            <RouterLink
              :to="topicsTo"
              :class="[
                desktopLinkBase,
                isTopics
                  ? 'bg-accent-soft px-3 py-2 font-semibold text-accent'
                  : 'px-0 py-2 font-medium text-muted hover:text-ink',
              ]"
              :aria-current="isTopics ? 'page' : undefined"
            >
              Мои топики
            </RouterLink>
          </div>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Скоро"
          :class="[desktopLinkBase, desktopDisabledClass]"
        >
          Профиль
        </button>
      </div>
    </div>
  </nav>
</template>
