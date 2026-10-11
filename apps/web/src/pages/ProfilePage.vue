<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SocialApiError } from '@/api/social';
import { TButton, TError, TLoader, TEmptyState, TTopicRow } from '@/components/ui-kit';
import { useFollowMutation, useUnfollowMutation } from '@/composables/useFollowMutations';
import { useTailwindBreakpoints } from '@/composables/useTailwindBreakpoints';
import { useUserProfileQuery } from '@/composables/useUserProfileQuery';
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

const profile = computed(() => profileQuery.data.value);
const topics = computed(() => profile.value?.topics ?? []);
const isMobileView = computed(() => breakpoints.smaller('md').value);

const isPending = computed(() => profileQuery.isPending.value);
const isError = computed(() => profileQuery.isError.value);
const isEmpty = computed(() => profileQuery.isSuccess.value && topics.value.length === 0);
const showList = computed(() => profileQuery.isSuccess.value && topics.value.length > 0);

const showCta = computed(() => Boolean(profile.value && !profile.value.isSelf));
const isFollowing = computed(() => profile.value?.isFollowing === true);
const followBusy = computed(
  () => followMutation.isPending.value || unfollowMutation.isPending.value,
);

const counters = computed(() => {
  if (!profile.value) return '';
  return formatProfileCounters(
    profile.value.followersCount,
    profile.value.followingCount,
    profile.value.topicsCount,
  );
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
</script>

<template>
  <header class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <h1 class="text-h1 text-ink">
        <template v-if="profile">@{{ profile.nick }}</template>
        <template v-else-if="nickParam">@{{ nickParam }}</template>
      </h1>
      <p v-if="profile" class="mt-1 text-body-sm text-muted">{{ counters }}</p>
    </div>

    <template v-if="showCta && !isMobileView">
      <TButton v-if="isFollowing" variant="secondary" :loading="followBusy" @click="onUnfollow">
        Отписаться
      </TButton>
      <TButton v-else :loading="followBusy" @click="onFollow">Подписаться</TButton>
    </template>
  </header>

  <div v-if="isPending || isError || isEmpty" class="max-w-84.5 mx-auto mt-10">
    <TLoader v-if="isPending" />
    <TError v-else-if="isError" @retry="onRetry" />
    <TEmptyState
      v-else-if="isEmpty"
      title="Пока нет открытых топиков"
      description=""
      :show-cta="false"
    />
  </div>

  <ul v-else-if="showList" class="mt-6 flex flex-col gap-3 md:mt-4" aria-label="Открытые топики">
    <li v-for="topic in topics" :key="topic.id">
      <TTopicRow
        :title="topic.title"
        :meta="formatTopicUpdatedAt(topic.updatedAt)"
        :covers="previewCoverUrls(topic.previewCovers)"
        @click="goShare(topic.shareId)"
      />
    </li>
  </ul>

  <div v-if="showCta && isMobileView" class="fixed inset-x-0 bottom-23 z-30 flex justify-center">
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
