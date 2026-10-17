<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TopicsApiError, type TopicCategory } from '@/api/topics';
import FieldHint from '@/components/FieldHint.vue';
import { TButton, TInput, TMainChip, TPrivacyChip, type PrivacyValue } from '@/components/ui-kit';
import { ContentPageWrapper } from '@/components/layout';
import { useCreateTopicMutation } from '@/composables/useCreateTopicMutation';
import { TOPIC_CATEGORY_LABELS } from '@/lib/topic-category';
import { RouteName } from '@/router/route-names';

interface FieldErrors {
  title?: string;
}

interface CategoryOption {
  value: TopicCategory;
  label: string;
}

const PRIVACY_OPTIONS: PrivacyValue[] = ['private', 'unlisted', 'public'];

const CATEGORY_OPTIONS: CategoryOption[] = (
  Object.entries(TOPIC_CATEGORY_LABELS) as [TopicCategory, string][]
).map(([value, label]) => ({ value, label }));

const TITLE_PREFILL: Partial<Record<TopicCategory, string>> = {
  movies: TOPIC_CATEGORY_LABELS.movies,
  series: TOPIC_CATEGORY_LABELS.series,
  games: TOPIC_CATEGORY_LABELS.games,
};

const CATEGORY_HINT =
  '«Категория» — при добавлении элементов можно искать название и обложку в каталоге.';

const router = useRouter();
const createTopic = useCreateTopicMutation();

const title = ref(TITLE_PREFILL.movies ?? '');
const category = ref<TopicCategory>('movies');
const privacy = ref<PrivacyValue>('unlisted');
const privacyTouched = ref(false);
const fieldErrors = ref<FieldErrors>({});
const formError = ref('');

const isSubmitting = computed(() => createTopic.isPending.value);

function clearErrors() {
  fieldErrors.value = {};
  formError.value = '';
}

function onCategorySelect(value: TopicCategory) {
  if (value === 'custom') return;
  category.value = value;
  const prefill = TITLE_PREFILL[value];
  if (prefill) {
    title.value = prefill;
    if (fieldErrors.value.title) {
      fieldErrors.value = { ...fieldErrors.value, title: undefined };
    }
  }
}

function onCategoryChipSelect(label: string) {
  const option = CATEGORY_OPTIONS.find((item) => item.label === label);
  if (option) onCategorySelect(option.value);
}

function onPrivacySelect(value: PrivacyValue) {
  privacy.value = value;
  privacyTouched.value = true;
}

function applyCreateError(err: unknown) {
  clearErrors();
  if (!(err instanceof TopicsApiError)) {
    formError.value = 'Не удалось создать топик';
    return;
  }

  if (err.status === 401) {
    router.replace({
      name: RouteName.Login,
      query: {
        returnUrl: router.resolve({ name: RouteName.AppTopicCreate }).fullPath,
      },
    });
    return;
  }

  if (err.status === 400 || err.status === 422) {
    if (err.fields && Object.keys(err.fields).length > 0) {
      fieldErrors.value = {
        title: err.fields.title,
      };
      return;
    }
    if (err.field === 'title') {
      fieldErrors.value = { [err.field]: err.message };
      return;
    }
    formError.value = err.message || 'Проверьте данные формы';
    return;
  }

  formError.value = err.message || 'Не удалось создать топик';
}

async function onSubmit() {
  clearErrors();
  const trimmed = title.value.trim();

  if (!trimmed) {
    fieldErrors.value = { title: 'Укажите название' };
    return;
  }

  try {
    const privacyParam = privacyTouched.value ? { privacy: privacy.value } : {};
    const topic = await createTopic.mutateAsync({
      title: trimmed,
      category: category.value,
      ...privacyParam,
    });

    await router.replace({ name: RouteName.AppTopicDetail, params: { id: topic.id } });
  } catch (err) {
    applyCreateError(err);
  }
}
</script>

<template>
  <ContentPageWrapper :route-to="RouteName.AppTopics" text-to="Мои топики" title="Новый топик">
    <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
      <fieldset>
        <legend class="mb-2 flex w-full items-center gap-1.5 text-label">
          <span>Категория</span>
          <FieldHint :text="CATEGORY_HINT" label="Зачем выбирать категорию" />
        </legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Категория топика">
          <TMainChip
            v-for="option in CATEGORY_OPTIONS"
            :key="option.value"
            :label="option.label"
            :selected="category === option.value"
            :disabled="isSubmitting || option.value === 'custom'"
            @select="onCategoryChipSelect"
          />
        </div>
      </fieldset>

      <TInput
        v-model="title"
        label="Название"
        type="text"
        autocomplete="off"
        placeholder="Например, Зарубежные фильмы"
        :error="fieldErrors.title"
        :disabled="isSubmitting"
      />

      <fieldset>
        <legend class="mb-2 text-label">Приватность</legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Приватность топика">
          <button
            v-for="option in PRIVACY_OPTIONS"
            :key="option"
            type="button"
            role="radio"
            class="cursor-pointer transition-opacity hover:enabled:opacity-70"
            :aria-checked="privacy === option"
            :disabled="isSubmitting"
            @click="onPrivacySelect(option)"
          >
            <TPrivacyChip :privacy="option" :selected="privacy === option" />
          </button>
        </div>
      </fieldset>

      <p v-if="formError" class="text-caption text-danger" role="alert">{{ formError }}</p>

      <TButton type="submit" class="w-full md:w-auto" :loading="isSubmitting"> Создать </TButton>
    </form>
  </ContentPageWrapper>
</template>
