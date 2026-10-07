<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { AppButton, AppInput, AppNav, CoverUpload } from '@/components/ui';
import { useLogoutMutation } from '@/composables/useAuthMutations';
import {
  useDeleteItemCoverMutation,
  useDeleteItemMutation,
  useRankItemOnDetailMutation,
  useUnrankItemMutation,
  useUpdateItemMutation,
  useUploadItemCoverMutation,
} from '@/composables/useItemMutations';
import { useItemQuery } from '@/composables/useItemQuery';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { formatItemAddedAt, formatItemPlacement } from '@/lib/format-item-meta';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const logout = useLogoutMutation();

const topicId = computed(() => String(route.params.id ?? ''));
const itemId = computed(() => String(route.params.itemId ?? ''));

const topicQuery = useTopicQuery(topicId);
const itemQuery = useItemQuery(topicId, itemId);

const updateItem = useUpdateItemMutation(
  () => topicId.value,
  () => itemId.value,
);
const uploadCover = useUploadItemCoverMutation(
  () => topicId.value,
  () => itemId.value,
);
const deleteCover = useDeleteItemCoverMutation(
  () => topicId.value,
  () => itemId.value,
);
const deleteItemMut = useDeleteItemMutation(() => topicId.value);
const rankMut = useRankItemOnDetailMutation(
  () => topicId.value,
  () => itemId.value,
);
const unrankMut = useUnrankItemMutation(
  () => topicId.value,
  () => itemId.value,
);

const title = ref('');
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverRemoved = ref(false);
const coverError = ref<string | null>(null);
const fieldErrors = ref<{ title?: string }>({});
const formError = ref('');
const actionError = ref('');

const profileLabel = computed(() => session.user?.nick ?? 'Профиль');
const topicTitle = computed(() => topicQuery.data.value?.title ?? 'Топик');
const item = computed(() => itemQuery.data.value);

const remoteCoverUrl = computed(() => item.value?.coverUrl ?? null);
const displayCoverUrl = computed(() => {
  if (coverPreviewUrl.value) return coverPreviewUrl.value;
  if (coverRemoved.value) return null;
  return remoteCoverUrl.value;
});

const isBusy = computed(
  () =>
    updateItem.isPending.value ||
    uploadCover.isPending.value ||
    deleteCover.isPending.value ||
    deleteItemMut.isPending.value ||
    rankMut.isPending.value ||
    unrankMut.isPending.value,
);

const addedLabel = computed(() => (item.value ? formatItemAddedAt(item.value.createdAt) : ''));
const placementLabel = computed(() =>
  item.value ? formatItemPlacement(item.value.placement, item.value.rankPosition) : '',
);
const isUnranked = computed(() => item.value?.placement === 'unranked');

watch(
  () => item.value?.title,
  (next) => {
    if (next != null) title.value = next;
  },
  { immediate: true },
);

function revokeLocalPreview() {
  if (coverPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreviewUrl.value);
  }
  coverPreviewUrl.value = null;
}

onUnmounted(() => {
  revokeLocalPreview();
});

function clearFormErrors() {
  fieldErrors.value = {};
  formError.value = '';
  coverError.value = null;
}

function clearActionError() {
  actionError.value = '';
}

function applyError(err: unknown, fallback: string, preferCover = false) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace(`/login?returnUrl=${encodeURIComponent(route.fullPath)}`);
      return;
    }
    if (preferCover && (err.status === 400 || err.status === 413)) {
      coverError.value = err.message;
      return;
    }
    if (err.status === 400 || err.status === 422) {
      fieldErrors.value = { title: err.message };
      return;
    }
    formError.value = err.message || fallback;
    return;
  }
  formError.value = fallback;
}

function applyActionError(err: unknown, fallback: string) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace(`/login?returnUrl=${encodeURIComponent(route.fullPath)}`);
      return;
    }
    actionError.value = err.message || fallback;
    return;
  }
  actionError.value = fallback;
}

function onCoverFile(file: File) {
  coverError.value = null;
  coverRemoved.value = false;
  revokeLocalPreview();
  coverFile.value = file;
  coverPreviewUrl.value = URL.createObjectURL(file);
}

function onCoverClear() {
  coverError.value = null;
  coverFile.value = null;
  revokeLocalPreview();
  coverRemoved.value = true;
}

async function onSave() {
  clearFormErrors();
  clearActionError();
  const trimmed = title.value.trim();
  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    if (!item.value || trimmed !== item.value.title) {
      await updateItem.mutateAsync({ title: trimmed });
    }

    if (coverFile.value) {
      await uploadCover.mutateAsync(coverFile.value);
      coverFile.value = null;
      revokeLocalPreview();
      coverRemoved.value = false;
    } else if (coverRemoved.value && remoteCoverUrl.value) {
      await deleteCover.mutateAsync();
      coverRemoved.value = false;
    }

    await router.replace({
      name: 'app-topic-detail',
      params: { id: topicId.value },
    });
  } catch (err) {
    applyError(err, 'Не удалось сохранить элемент', Boolean(coverFile.value));
  }
}

async function onDelete() {
  clearActionError();
  const ok = window.confirm('Удалить элемент безвозвратно?');
  if (!ok) return;
  try {
    await deleteItemMut.mutateAsync(itemId.value);
    await router.replace({
      name: 'app-topic-detail',
      params: { id: topicId.value },
    });
  } catch (err) {
    applyActionError(err, 'Не удалось удалить элемент');
  }
}

async function onToRank() {
  clearActionError();
  try {
    await rankMut.mutateAsync();
  } catch (err) {
    applyActionError(err, 'Не удалось перенести в рейтинг');
  }
}

async function onToInbox() {
  clearActionError();
  try {
    await unrankMut.mutateAsync();
  } catch (err) {
    applyActionError(err, 'Не удалось вернуть в inbox');
  }
}

async function onLogout() {
  await logout.mutateAsync();
  await router.replace('/login');
}

function onRetry() {
  void topicQuery.refetch();
  void itemQuery.refetch();
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <AppNav active="topics" :profile-label="profileLabel" @logout="onLogout" />

    <main
      class="mx-auto w-full max-w-[366px] px-4 pb-28 pt-6 md:max-w-[640px] md:px-8 md:pb-10 md:pt-28"
    >
      <RouterLink
        :to="{ name: 'app-topic-detail', params: { id: topicId } }"
        class="w-fit text-label font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        ← {{ topicTitle }}
      </RouterLink>

      <p
        v-if="topicQuery.isPending.value || itemQuery.isPending.value"
        class="mt-10 text-body text-muted"
        role="status"
      >
        Загрузка…
      </p>

      <div
        v-else-if="topicQuery.isError.value || itemQuery.isError.value"
        class="mt-10 flex flex-col items-start gap-3"
        role="alert"
      >
        <p class="text-body text-danger">
          {{
            (itemQuery.error.value instanceof ItemsApiError &&
              itemQuery.error.value.status === 404) ||
            (topicQuery.error.value instanceof TopicsApiError &&
              topicQuery.error.value.status === 404)
              ? 'Элемент не найден'
              : 'Не удалось загрузить элемент'
          }}
        </p>
        <AppButton variant="secondary" size="sm" @click="onRetry"> Повторить </AppButton>
      </div>

      <template v-else-if="item">
        <h1 class="mt-4 text-h1 text-ink">Изменить элемент</h1>

        <form class="mt-6 flex flex-col gap-5" @submit.prevent="onSave">
          <AppInput
            v-model="title"
            label="Название"
            type="text"
            autocomplete="off"
            :error="fieldErrors.title"
            :disabled="isBusy"
          />

          <CoverUpload
            :preview-url="displayCoverUrl"
            :error="coverError"
            :disabled="isBusy"
            @file="onCoverFile"
            @clear="onCoverClear"
          />

          <div class="flex flex-col gap-1">
            <p class="text-body-sm text-muted">{{ addedLabel }}</p>
            <p class="text-body-sm font-medium text-ink">{{ placementLabel }}</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AppButton
              v-if="isUnranked"
              type="button"
              variant="secondary"
              :disabled="isBusy"
              class="w-full sm:w-auto"
              @click="onToRank"
            >
              В рейтинг
            </AppButton>
            <AppButton
              v-else
              type="button"
              variant="secondary"
              :disabled="isBusy"
              class="w-full sm:w-auto"
              @click="onToInbox"
            >
              В inbox
            </AppButton>
          </div>

          <p v-if="formError" class="text-caption text-danger" role="alert">
            {{ formError }}
          </p>
          <p v-if="actionError" class="text-caption text-danger" role="alert">
            {{ actionError }}
          </p>

          <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <AppButton
              type="submit"
              :loading="
                updateItem.isPending.value ||
                uploadCover.isPending.value ||
                deleteCover.isPending.value
              "
              class="w-full md:w-auto md:min-w-[200px]"
            >
              Сохранить
            </AppButton>
            <AppButton
              type="button"
              variant="danger-ghost"
              :disabled="isBusy"
              class="w-full md:w-auto md:min-w-[148px]"
              @click="onDelete"
            >
              Удалить
            </AppButton>
          </div>
        </form>
      </template>
    </main>
  </div>
</template>
