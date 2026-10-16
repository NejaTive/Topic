<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { refDebounced } from '@vueuse/core';
import { computed, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  CatalogApiError,
  searchCatalogMovies,
  searchCatalogSeries,
  type CatalogMovie,
} from '@/api/catalog';
import { ItemsApiError } from '@/api/items';
import { TopicsApiError } from '@/api/topics';
import { ContentPageWrapper } from '@/components/layout';
import { TButton, TCoverUpload, TError, TInput, TLoader, TTextarea } from '@/components/ui-kit';
import {
  useCreateItemFromCatalogMutation,
  useCreateItemMutation,
  useUploadItemCoverMutation,
} from '@/composables/useItemMutations';
import { useTopicQuery } from '@/composables/useTopicQuery';
import { queryKeys } from '@/query/keys';
import { RouteName } from '@/router/route-names';

const BACK_LINK_CLASS =
  'cursor-pointer text-label font-semibold text-accent transition-opacity hover:enabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50';

interface FieldErrors {
  title?: string;
}

type EntryMode = 'search' | 'manual';

const SEARCH_DEBOUNCE_MS = 300;

const route = useRoute();
const router = useRouter();

const topicId = computed(() => String(route.params.id ?? ''));

const topicQuery = useTopicQuery(topicId);
const createItem = useCreateItemMutation(() => topicId.value);
const createFromCatalog = useCreateItemFromCatalogMutation(() => topicId.value);

const pendingItemId = ref('');
const uploadCover = useUploadItemCoverMutation(
  () => topicId.value,
  () => pendingItemId.value,
);

const entryMode = ref<EntryMode>('search');
const searchInput = ref('');
const debouncedSearch = refDebounced(searchInput, SEARCH_DEBOUNCE_MS);
const selectingProviderId = ref<string | null>(null);

const title = ref('');
const description = ref('');
const director = ref('');
const genre = ref('');
const country = ref('');
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref<string | null>(null);
const coverError = ref<string | null>(null);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');

const category = computed(() => topicQuery.data.value?.category);
const isCatalogTopic = computed(() => category.value === 'movies' || category.value === 'series');
const isSeriesTopic = computed(() => category.value === 'series');
const directorLabel = computed(() => (isSeriesTopic.value ? 'Создатель' : 'Режиссёр'));
const searchLabel = computed(() => (isSeriesTopic.value ? 'Поиск сериала' : 'Поиск фильма'));
const searchPlaceholder = computed(() =>
  isSeriesTopic.value ? 'Например, Во все тяжкие' : 'Например, Интерстеллар',
);
const descriptionPlaceholder = computed(() =>
  isSeriesTopic.value ? 'Кратко о сериале' : 'Кратко о фильме',
);
const showCatalogSearch = computed(() => isCatalogTopic.value && entryMode.value === 'search');
const showManualForm = computed(() => !isCatalogTopic.value || entryMode.value === 'manual');
const backToSearch = computed(() => showManualForm.value && isCatalogTopic.value);

const trimmedSearch = computed(() => debouncedSearch.value.trim());

const catalogSearch = useQuery({
  queryKey: computed(() =>
    isSeriesTopic.value
      ? queryKeys.catalog.seriesSearch(trimmedSearch.value)
      : queryKeys.catalog.moviesSearch(trimmedSearch.value),
  ),
  queryFn: () =>
    isSeriesTopic.value
      ? searchCatalogSeries(trimmedSearch.value)
      : searchCatalogMovies(trimmedSearch.value),
  enabled: computed(() => showCatalogSearch.value && trimmedSearch.value.length > 0),
  retry: false,
  staleTime: 30_000,
});

const searchResults = computed(() => catalogSearch.data.value ?? []);
const searchBusy = computed(() => catalogSearch.isFetching.value && trimmedSearch.value.length > 0);
const searchSoftError = computed(() => {
  if (!catalogSearch.isError.value) return '';
  const err = catalogSearch.error.value;
  if (err instanceof CatalogApiError && err.status === 401) return '';
  return 'Не удалось выполнить поиск. Можно указать вручную.';
});
const showEmptyResults = computed(
  () =>
    trimmedSearch.value.length > 0 &&
    !searchBusy.value &&
    !catalogSearch.isError.value &&
    searchResults.value.length === 0,
);

const isSubmitting = computed(
  () =>
    createItem.isPending.value || uploadCover.isPending.value || createFromCatalog.isPending.value,
);

watch(
  () => catalogSearch.error.value,
  (err) => {
    if (err instanceof CatalogApiError && err.status === 401) {
      void router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
    }
  },
);

function revokePreview() {
  if (coverPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreviewUrl.value);
  }

  coverPreviewUrl.value = null;
}

onUnmounted(() => {
  revokePreview();
});

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
  coverError.value = null;
}

function switchToManual() {
  clearErrors();
  entryMode.value = 'manual';
}

function switchToSearch() {
  clearErrors();
  entryMode.value = 'search';
}

function onCoverFile(file: File) {
  coverError.value = null;
  revokePreview();
  coverFile.value = file;
  coverPreviewUrl.value = URL.createObjectURL(file);
}

function onCoverClear() {
  coverError.value = null;
  coverFile.value = null;
  revokePreview();
}

function applyError(err: unknown, preferCover = false) {
  if (err instanceof TopicsApiError || err instanceof ItemsApiError) {
    if (err.status === 401) {
      void router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
      return;
    }
    if (err.status === 404) {
      formError.value = err.message || 'Топик не найден';
      return;
    }
    if (preferCover || err.status === 413) {
      coverError.value = err.message;
      return;
    }
    if (err.status === 400 || err.status === 422) {
      fieldErrors.value = { title: err.message };
      return;
    }
    formError.value = err.message || 'Не удалось добавить элемент';
    return;
  }
  formError.value = 'Не удалось добавить элемент';
}

async function onSelectCatalogItem(entry: CatalogMovie) {
  if (isSubmitting.value) return;
  clearErrors();
  selectingProviderId.value = entry.providerId;

  try {
    await createFromCatalog.mutateAsync({
      provider: 'tmdb',
      providerId: entry.providerId,
    });
    await router.replace({
      name: RouteName.AppTopicDetail,
      params: { id: topicId.value },
    });
  } catch (err) {
    if (err instanceof ItemsApiError || err instanceof TopicsApiError) {
      if (err.status === 401) {
        void router.replace({ name: RouteName.Login, query: { returnUrl: route.fullPath } });
        return;
      }
      formError.value = err.message || 'Не удалось добавить элемент';
      return;
    }
    formError.value = 'Не удалось добавить элемент';
  } finally {
    selectingProviderId.value = null;
  }
}

async function onSubmit() {
  clearErrors();

  const trimmed = title.value.trim();
  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    const meta = isCatalogTopic.value
      ? {
          ...(description.value.trim() ? { description: description.value.trim() } : {}),
          ...(director.value.trim() ? { director: director.value.trim() } : {}),
          ...(genre.value.trim() ? { genre: genre.value.trim() } : {}),
          ...(country.value.trim() ? { country: country.value.trim() } : {}),
        }
      : undefined;
    const item = await createItem.mutateAsync({
      title: trimmed,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    });
    pendingItemId.value = item.id;

    if (coverFile.value) {
      try {
        await uploadCover.mutateAsync(coverFile.value);
      } catch (coverErr) {
        applyError(coverErr, true);
        await router.replace({
          name: RouteName.AppTopicItemDetail,
          params: { id: topicId.value, itemId: item.id },
        });
        return;
      }
    }

    await router.replace({
      name: RouteName.AppTopicDetail,
      params: { id: topicId.value },
    });
  } catch (err) {
    applyError(err);
  }
}
</script>

<template>
  <ContentPageWrapper title="Добавить элемент">
    <template #back>
      <button
        v-if="backToSearch"
        type="button"
        :class="BACK_LINK_CLASS"
        :disabled="isSubmitting"
        @click="switchToSearch"
      >
        ← Назад
      </button>
      <RouterLink
        v-else
        :to="{ name: RouteName.AppTopicDetail, params: { id: topicId } }"
        class="text-label font-semibold text-accent"
      >
        ← Назад
      </RouterLink>
    </template>
    <TError v-if="topicQuery.isError.value" />
    <TLoader v-else-if="topicQuery.isPending.value" />
    <div v-else class="flex flex-col gap-5">
      <template v-if="showCatalogSearch">
        <TInput
          v-model="searchInput"
          :label="searchLabel"
          type="text"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          :disabled="isSubmitting"
        />

        <p v-if="searchSoftError" class="text-caption text-danger" role="status">
          {{ searchSoftError }}
        </p>
        <p v-else-if="showEmptyResults" class="text-caption text-muted" role="status">
          Ничего не найдено
        </p>
        <TLoader v-else-if="searchBusy" />

        <ul
          v-if="searchResults.length > 0"
          class="flex flex-col divide-y divide-line"
          role="listbox"
          aria-label="Результаты поиска"
        >
          <li v-for="entry in searchResults" :key="entry.providerId">
            <button
              type="button"
              class="flex w-full items-center gap-3 py-2.5 text-left transition-colors outline-none hover:enabled:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
              role="option"
              :disabled="isSubmitting"
              :aria-busy="selectingProviderId === entry.providerId || undefined"
              @click="onSelectCatalogItem(entry)"
            >
              <img
                v-if="entry.imageUrl"
                :src="entry.imageUrl"
                alt=""
                class="h-15 w-10 shrink-0 rounded-sm bg-surface-sunken object-cover"
              />
              <div
                v-else
                class="h-15 w-10 shrink-0 rounded-sm bg-surface-sunken"
                aria-hidden="true"
              />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-body text-ink">{{ entry.title }}</span>
                <span v-if="entry.year" class="block text-caption text-muted">{{
                  entry.year
                }}</span>
              </span>
            </button>
          </li>
        </ul>

        <p v-if="formError" class="text-caption text-danger">
          {{ formError }}
        </p>

        <p v-if="trimmedSearch.length > 0" class="text-caption text-muted">
          Источник данных: TMDB. This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>

        <button
          type="button"
          class="self-start text-label font-semibold text-accent transition-opacity hover:enabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          :disabled="isSubmitting"
          @click="switchToManual"
        >
          Указать вручную
        </button>
      </template>

      <form v-if="showManualForm" class="flex flex-col gap-5" @submit.prevent="onSubmit">
        <TCoverUpload
          :preview-url="coverPreviewUrl"
          :error="coverError"
          :disabled="isSubmitting"
          @file="onCoverFile"
          @clear="onCoverClear"
        />

        <TInput
          v-model="title"
          label="Название *"
          type="text"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          :error="fieldErrors.title"
          :disabled="isSubmitting"
        />

        <template v-if="isCatalogTopic">
          <TTextarea
            v-model="description"
            label="Описание"
            :placeholder="descriptionPlaceholder"
            :disabled="isSubmitting"
          />
          <TInput
            v-model="genre"
            label="Жанр"
            type="text"
            autocomplete="off"
            placeholder="Например, Фантастика"
            :disabled="isSubmitting"
          />
          <TInput
            v-model="director"
            :label="directorLabel"
            type="text"
            autocomplete="off"
            placeholder="Например, Кристофер Нолан"
            :disabled="isSubmitting"
          />
          <TInput
            v-model="country"
            label="Страна"
            type="text"
            autocomplete="off"
            placeholder="Например, США"
            :disabled="isSubmitting"
          />
        </template>

        <p v-if="formError" class="text-caption text-danger">
          {{ formError }}
        </p>

        <div
          class="fixed inset-x-0 bottom-23 z-30 flex justify-center md:static md:z-auto md:block"
        >
          <div
            class="flex w-full max-w-91.5 flex-col gap-3 px-3 md:w-auto md:max-w-none md:flex-row md:items-center md:px-0"
          >
            <TButton
              type="submit"
              class="w-full shadow-float md:w-auto md:shadow-none"
              :loading="isSubmitting"
            >
              Добавить
            </TButton>
          </div>
        </div>
      </form>
    </div>
  </ContentPageWrapper>
</template>
