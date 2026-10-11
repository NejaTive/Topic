<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SocialApiError } from '@/api/social';
import { PageShell } from '@/components/layout';
import { TButton, TError, TLoader, TEmptyState, TTopicRow } from '@/components/ui-kit';
import { useLogoutMutation } from '@/composables/useAuthMutations';
import { useFollowMutation, useUnfollowMutation } from '@/composables/useFollowMutations';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';
import { useUserProfileQuery } from '@/composables/useUserProfileQuery';
import { copyText } from '@/lib/copy-text';
import { previewCoverUrls } from '@/lib/cover-url';
import { formatProfileCounters } from '@/lib/format-profile-meta';
import { formatTopicUpdatedAt } from '@/lib/format-topic-meta';
import { RouteName } from '@/router/route-names';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const breakpoints = useTailwindBreakpoints();

const nickParam = computed(() => {
  const value = route.params.nick;
  return typeof value === 'string' ? value : '';
});

const profileQuery = useUserProfileQuery(nickParam);
const followMutation = useFollowMutation();
const unfollowMutation = useUnfollowMutation();
const logoutMutation = useLogoutMutation();

const copyFeedback = ref('');
const copyError = ref('');

const profile = computed(() => profileQuery.data.value);
const topics = computed(() => profile.value?.topics ?? []);
const isMobileView = computed(() => breakpoints.smaller('md').value);

const isPending = computed(() => profileQuery.isPending.value);
const isError = computed(() => profileQuery.isError.value);
const isEmpty = computed(() => profileQuery.isSuccess.value && topics.value.length === 0);
const showList = computed(() => profileQuery.isSuccess.value && topics.value.length > 0);

const isSelf = computed(() => profile.value?.isSelf === true);
const showCta = computed(() => Boolean(profile.value && !profile.value.isSelf));
const isFollowing = computed(() => profile.value?.isFollowing === true);
const followBusy = computed(
  () => followMutation.isPending.value || unfollowMutation.isPending.value,
);
const logoutBusy = computed(() => logoutMutation.isPending.value);

const counters = computed(() => {
  if (!profile.value) return '';
  return formatProfileCounters(
    profile.value.followersCount,
    profile.value.followingCount,
    profile.value.topicsCount,
  );
});

const profileUrl = computed(() => {
  const nick = profile.value?.nick ?? nickParam.value;
  if (!nick || typeof window === 'undefined') return '';
  const resolved = router.resolve({ name: RouteName.UserProfile, params: { nick } });
  return `${window.location.origin}${resolved.href}`;
});

watch(
  () => profileQuery.error.value,
  (err) => {
    if (err instanceof SocialApiError && err.status === 404) {
      void router.replace({ name: RouteName.NotFound });
    }
  },
  { immediate: true },
);

function goShare(shareId: string) {
  router.push({ name: RouteName.ShareView, params: { shareId } });
}

function onRetry() {
  profileQuery.refetch();
}

async function onFollow() {
  if (session.status !== 'authed') {
    void router.push({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
    return;
  }
  const nick = profile.value?.nick ?? nickParam.value;
  if (!nick) return;
  await followMutation.mutateAsync(nick);
}

async function onUnfollow() {
  const nick = profile.value?.nick ?? nickParam.value;
  if (!nick) return;
  await unfollowMutation.mutateAsync(nick);
}

async function onCopyLink() {
  copyError.value = '';
  copyFeedback.value = '';
  const url = profileUrl.value;
  if (!url) return;
  try {
    await copyText(url);
    copyFeedback.value = 'Ссылка на профиль скопирована';
    window.setTimeout(() => {
      if (copyFeedback.value === 'Ссылка на профиль скопирована') copyFeedback.value = '';
    }, 2000);
  } catch {
    copyError.value = 'Не удалось скопировать ссылку';
  }
}

async function onLogout() {
  try {
    await logoutMutation.mutateAsync();
  } finally {
    void router.replace({ name: RouteName.Home });
  }
}
</script>

<template>
  <PageShell>
    <template #header>
      <header>
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <h1 class="min-w-0 truncate text-h1 text-ink">
              <template v-if="profile">@{{ profile.nick }}</template>
              <template v-else-if="nickParam">@{{ nickParam }}</template>
            </h1>
            <button
              v-if="isSelf"
              type="button"
              class="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-info transition-colors hover:bg-info-soft"
              aria-label="Скопировать ссылку на профиль"
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
          </div>

          <template v-if="showCta && !isMobileView">
            <TButton
              v-if="isFollowing"
              variant="secondary"
              :loading="followBusy"
              @click="onUnfollow"
            >
              Отписаться
            </TButton>
            <TButton v-else :loading="followBusy" @click="onFollow">Подписаться</TButton>
          </template>

          <template v-else-if="isSelf">
            <button
              v-if="isMobileView"
              type="button"
              class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-danger-soft text-danger transition-colors hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Выйти"
              :disabled="logoutBusy"
              :aria-busy="logoutBusy || undefined"
              @click="onLogout"
            >
              <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M8.5 4.5H5.5A1.5 1.5 0 0 0 4 6v8a1.5 1.5 0 0 0 1.5 1.5h3"
                  fill="var(--color-danger-soft)"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M11 13.5 14.5 10 11 6.5M14.5 10H8"
                  fill="var(--color-danger-soft)"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <TButton
              v-else
              variant="danger-ghost"
              class="shrink-0"
              :loading="logoutBusy"
              @click="onLogout"
            >
              Выйти
            </TButton>
          </template>
        </div>

        <p v-if="profile" class="mt-1 text-body-sm text-muted">{{ counters }}</p>
        <p v-if="copyFeedback" class="mt-1 text-caption text-accent" role="status">
          {{ copyFeedback }}
        </p>
        <p v-if="copyError" class="mt-1 text-caption text-danger" role="alert">{{ copyError }}</p>
      </header>
    </template>

    <div v-if="isPending || isError || isEmpty" class="max-w-84.5 mx-auto">
      <TLoader v-if="isPending" />
      <TError v-else-if="isError" @retry="onRetry" />
      <TEmptyState
        v-else-if="isEmpty"
        title="Пока нет открытых топиков"
        description=""
        :show-cta="false"
      />
    </div>

    <ul v-else-if="showList" class="flex flex-col gap-3" aria-label="Открытые топики">
      <li v-for="topic in topics" :key="topic.id">
        <TTopicRow
          :title="topic.title"
          :meta="formatTopicUpdatedAt(topic.updatedAt)"
          :covers="previewCoverUrls(topic.previewCovers)"
          @click="goShare(topic.shareId)"
        />
      </li>
    </ul>

    <template #overlay>
      <div
        v-if="showCta && isMobileView"
        class="fixed inset-x-0 bottom-23 z-30 flex justify-center"
      >
        <TButton
          v-if="isFollowing"
          variant="secondary"
          class="shadow-float"
          :loading="followBusy"
          @click="onUnfollow"
        >
          Отписаться
        </TButton>
        <TButton v-else class="shadow-float" :loading="followBusy" @click="onFollow">
          Подписаться
        </TButton>
      </div>
    </template>
  </PageShell>
</template>
