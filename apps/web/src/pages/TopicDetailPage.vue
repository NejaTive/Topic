<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import {
  AppButton,
  AppNav,
  PrivacyChip,
  RankRow,
  type PrivacyValue,
} from '@/components/ui';
import { useLogoutMutation } from '@/composables/useAuthMutations';
import {
  useDeleteTopicMutation,
  useRankItemMutation,
  useUpdateTopicPrivacyMutation,
} from '@/composables/useTopicMutations';
import { useTopicItemsQuery } from '@/composables/useTopicItemsQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { useSessionStore } from '@/stores/session';

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const logout = useLogoutMutation();

const topicId = computed(() => String(route.params.id ?? ''));

const topicQuery = useTopicQuery(topicId);
const itemsQuery = useTopicItemsQuery(topicId);
const updatePrivacy = useUpdateTopicPrivacyMutation(() => topicId.value);
const deleteTopicMut = useDeleteTopicMutation();
const rankItemMut = useRankItemMutation(() => topicId.value);

const privacyOpen = ref(false);
const actionError = ref('');
const copyFeedback = ref('');

/** Mobile chip compact for meta? Figma S05 meta uses labeled chip even on M. */
const isMdUp = ref(false);

function syncViewport() {
  isMdUp.value = window.matchMedia('(min-width: 768px)').matches;
}

onMounted(() => {
  syncViewport();
  window.addEventListener('resize', syncViewport);
});

onUnmounted(() => {
  window.removeEventListener('resize', syncViewport);
});

const profileLabel = computed(() => session.user?.nick ?? 'Профиль');
const topic = computed(() => topicQuery.data.value);
const inbox = computed(() => itemsQuery.data.value?.inbox ?? []);
const ranked = computed(() => itemsQuery.data.value?.ranked ?? []);

const isEmpty = computed(
  () =>
    itemsQuery.isSuccess.value &&
    inbox.value.length === 0 &&
    ranked.value.length === 0,
);
const isInboxOnly = computed(
  () =>
    itemsQuery.isSuccess.value &&
    inbox.value.length > 0 &&
    ranked.value.length === 0,
);

const shareUrl = computed(() => {
  const shareId = topic.value?.shareId;
  if (!shareId || typeof window === 'undefined') return '';
  return `${window.location.origin}/t/${shareId}`;
});

const isUnlisted = computed(() => topic.value?.privacy === 'unlisted');
const busyPrivacy = computed(() => updatePrivacy.isPending.value);
const busyDelete = computed(() => deleteTopicMut.isPending.value);

function clearActionError() {
  actionError.value = '';
}

function applyApiError(err: unknown, fallback: string) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace(
        `/login?returnUrl=${encodeURIComponent(route.fullPath)}`,
      );
      return;
    }
    actionError.value = err.message || fallback;
    return;
  }
  actionError.value = fallback;
}

function togglePrivacyPicker() {
  clearActionError();
  privacyOpen.value = !privacyOpen.value;
}

async function onPrivacySelect(value: PrivacyValue) {
  if (!topic.value || value === topic.value.privacy) {
    privacyOpen.value = false;
    return;
  }
  clearActionError();
  try {
    await updatePrivacy.mutateAsync(value);
    privacyOpen.value = false;
  } catch (err) {
    applyApiError(err, 'Не удалось сменить приватность');
  }
}

async function onCopyLink() {
  clearActionError();
  copyFeedback.value = '';
  const url = shareUrl.value;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    copyFeedback.value = 'Ссылка скопирована';
    window.setTimeout(() => {
      if (copyFeedback.value === 'Ссылка скопирована') copyFeedback.value = '';
    }, 2000);
  } catch {
    actionError.value = 'Не удалось скопировать ссылку';
  }
}

async function onDeleteTopic() {
  clearActionError();
  const ok = window.confirm('Удалить топик безвозвратно?');
  if (!ok) return;
  try {
    await deleteTopicMut.mutateAsync(topicId.value);
    await router.replace({ name: 'app-topics' });
  } catch (err) {
    applyApiError(err, 'Не удалось удалить топик');
  }
}

async function onToRank(itemId: string) {
  clearActionError();
  try {
    await rankItemMut.mutateAsync(itemId);
  } catch (err) {
    applyApiError(err, 'Не удалось перенести в рейтинг');
  }
}

function goAddItem() {
  void router.push({
    name: 'app-topic-item-create',
    params: { id: topicId.value },
  });
}

async function onLogout() {
  await logout.mutateAsync();
  await router.replace('/login');
}

function onRetry() {
  void topicQuery.refetch();
  void itemsQuery.refetch();
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav
      active="topics"
      :profile-label="profileLabel"
      @logout="onLogout"
    />

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[1200px] md:px-8 md:pb-10 md:pt-28"
    >
      <RouterLink
        to="/app/topics"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← Мои топики
      </RouterLink>

      <p
        v-if="topicQuery.isPending.value || itemsQuery.isPending.value"
        class="mt-10 text-body text-muted"
        role="status"
      >
        Загрузка…
      </p>

      <div
        v-else-if="topicQuery.isError.value || itemsQuery.isError.value"
        class="mt-10 flex flex-col items-start gap-3"
        role="alert"
      >
        <p class="text-body text-danger">
          {{
            topicQuery.error.value instanceof TopicsApiError &&
            topicQuery.error.value.status === 404
              ? 'Топик не найден'
              : 'Не удалось загрузить топик'
          }}
        </p>
        <AppButton variant="secondary" size="sm" @click="onRetry">Повторить</AppButton>
      </div>

      <template v-else-if="topic">
        <h1 class="mt-4 text-h1 text-ink md:text-[28px] md:leading-9">
          {{ topic.title }}
        </h1>

        <!-- Meta: privacy (+ copy unlisted) | delete -->
        <div class="mt-3 flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <button
              type="button"
              class="rounded-sm outline-none transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              :class="
                privacyOpen
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg'
                  : 'hover:opacity-90'
              "
              :aria-expanded="privacyOpen"
              aria-haspopup="listbox"
              aria-label="Приватность топика"
              :disabled="busyPrivacy"
              @click="togglePrivacyPicker"
            >
              <PrivacyChip :privacy="topic.privacy" />
            </button>

            <!-- Mobile Unlisted: icon copy 24 -->
            <button
              v-if="isUnlisted && !isMdUp"
              type="button"
              class="flex size-6 shrink-0 items-center justify-center rounded-sm text-info outline-none transition-colors hover:bg-info-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              aria-label="Скопировать ссылку"
              @click="onCopyLink"
            >
              <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect
                  x="5.5"
                  y="5.5"
                  width="8"
                  height="8"
                  rx="1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <!-- Desktop Unlisted: ghost «Скопировать ссылку» -->
            <AppButton
              v-if="isUnlisted && isMdUp"
              variant="ghost"
              size="sm"
              class="shrink-0"
              @click="onCopyLink"
            >
              Скопировать ссылку
            </AppButton>
          </div>

          <AppButton
            variant="danger-ghost"
            size="sm"
            class="shrink-0"
            :disabled="busyDelete"
            :loading="busyDelete"
            @click="onDeleteTopic"
          >
            Удалить топик
          </AppButton>
        </div>

        <div
          v-if="privacyOpen"
          class="mt-3 flex flex-wrap gap-2"
          role="listbox"
          aria-label="Выбор приватности"
        >
          <button
            v-for="option in PRIVACY_OPTIONS"
            :key="option"
            type="button"
            role="option"
            class="rounded-sm outline-none transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            :class="
              topic.privacy === option
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg'
                : 'hover:opacity-90'
            "
            :aria-selected="topic.privacy === option"
            :disabled="busyPrivacy"
            @click="onPrivacySelect(option)"
          >
            <PrivacyChip :privacy="option" />
          </button>
        </div>

        <p
          v-if="copyFeedback"
          class="mt-2 text-caption text-accent"
          role="status"
        >
          {{ copyFeedback }}
        </p>
        <p
          v-if="actionError"
          class="mt-2 text-caption text-danger"
          role="alert"
        >
          {{ actionError }}
        </p>

        <!-- Empty: no items at all -->
        <div
          v-if="isEmpty"
          class="mt-12 flex flex-col items-start gap-4 md:mt-16"
        >
          <p class="text-title text-ink">Добавьте первый элемент</p>
          <button
            type="button"
            class="text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            @click="goAddItem"
          >
            + Добавить элемент
          </button>
        </div>

        <!-- Lists: mobile stack / desktop 2 columns -->
        <div
          v-else
          class="mt-8 flex flex-col gap-8 md:mt-10 md:grid md:grid-cols-2 md:items-start md:gap-10"
        >
          <!-- Inbox column -->
          <section aria-labelledby="s05-inbox-heading">
            <h2 id="s05-inbox-heading" class="text-label font-bold text-ink md:text-title">
              Ещё не оценены
            </h2>
            <ul class="mt-3 flex list-none flex-col gap-1 p-0" aria-label="Ещё не оценены">
              <li v-for="item in inbox" :key="item.id">
                <RankRow
                  class="!max-w-none w-full"
                  mode="inbox"
                  :title="item.title"
                  :cover-url="item.coverUrl ?? undefined"
                  @to-rank="onToRank(item.id)"
                />
              </li>
            </ul>
            <p
              v-if="inbox.length === 0"
              class="mt-3 text-body-sm text-muted"
            >
              Пока пусто
            </p>
            <button
              type="button"
              class="mt-3 text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              @click="goAddItem"
            >
              + Добавить элемент
            </button>
          </section>

          <!-- Ranked column -->
          <section aria-labelledby="s05-rank-heading">
            <h2 id="s05-rank-heading" class="text-label font-bold text-ink md:text-title">
              Рейтинг
            </h2>
            <p
              v-if="isInboxOnly"
              class="mt-3 text-body-sm text-muted"
            >
              Перенесите в рейтинг, когда будете готовы
            </p>
            <ul
              v-else
              class="mt-3 flex list-none flex-col gap-1 p-0"
              aria-label="Рейтинг"
            >
              <li v-for="item in ranked" :key="item.id">
                <RankRow
                  class="!max-w-none w-full"
                  mode="ranked"
                  :rank="item.rankPosition ?? undefined"
                  :title="item.title"
                  :cover-url="item.coverUrl ?? undefined"
                />
              </li>
            </ul>
            <p
              v-if="ranked.length === 0 && !isInboxOnly"
              class="mt-3 text-body-sm text-muted"
            >
              Пока пусто
            </p>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>
