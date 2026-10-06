<script setup lang="ts">
import { ref } from 'vue';
import {
  AppButton,
  AppInput,
  AppNav,
  CoverUpload,
  MainChip,
  MAIN_CHIP_LABELS,
  PrivacyChip,
  RankRow,
  TopicRow,
  type AppNavActive,
  type PrivacyValue,
} from '@/components/ui';

const email = ref('');
const password = ref('secret');
const errorEmail = ref('Некорректный email');
const loading = ref(false);
const navActive = ref<AppNavActive>('topics');

const selectedChip = ref<string | null>(null);
const coverPreview = ref<string | null>(null);
const coverError = ref<string | null>(null);

const sampleCover =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48"><rect fill="#CFE6DF" width="36" height="48"/></svg>',
  );

const sampleRows: {
  title: string;
  meta: string;
  privacy: PrivacyValue;
  covers?: string[];
}[] = [
  {
    title: 'Фильмы 2026',
    meta: 'Изменено 5 окт',
    privacy: 'public',
    covers: [
      'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40"><rect fill="#CFE6DF" width="32" height="40"/></svg>',
        ),
      'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40"><rect fill="#D4E0EF" width="32" height="40"/></svg>',
        ),
      'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40"><rect fill="#EDF0ED" width="32" height="40"/></svg>',
        ),
    ],
  },
  {
    title: 'Книги по ссылке',
    meta: 'Изменено 1 окт',
    privacy: 'unlisted',
  },
  {
    title: 'Личное',
    meta: 'Изменено вчера',
    privacy: 'private',
  },
];

function toggleLoading() {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
  }, 1500);
}

function onCoverFile(file: File) {
  if (coverPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreview.value);
  }
  coverError.value = null;
  coverPreview.value = URL.createObjectURL(file);
}

function onCoverClear() {
  if (coverPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreview.value);
  }
  coverPreview.value = null;
  coverError.value = null;
}

function showCoverErrorDemo() {
  coverError.value = 'Не удалось прочитать файл';
}
</script>

<template>
  <!-- TEMP: витрина UI-Kit для приёмки; не продуктовый экран -->
  <main class="min-h-dvh bg-bg p-8 pb-28 md:pb-8 md:pt-28">
    <h1 class="text-h2 text-ink">UI-Kit · Rank, Cover, Main chip</h1>
    <p class="mt-2 text-body-sm text-muted">
      Временная страница для сверки с Figma 04.4 / 04.7 + Main chip (+ Nav / Topic / Privacy /
      Button / Input)
    </p>

    <AppNav
      :active="navActive"
      profile-label="Профиль"
      @profile="navActive = 'profile'"
      @logout="navActive = 'profile'"
    />

    <section class="mt-10 space-y-4">
      <h2 class="text-title">MainChip · подсказки S04</h2>
      <div class="flex flex-wrap gap-2">
        <MainChip
          v-for="label in MAIN_CHIP_LABELS"
          :key="label"
          :label="label"
          :selected="selectedChip === label"
          @select="selectedChip = $event"
        />
      </div>
      <p class="text-caption text-muted">
        emit label → title:
        <span class="text-ink">{{ selectedChip ?? '—' }}</span>
      </p>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">CoverUpload · 144×192</h2>
      <div class="flex flex-wrap items-start gap-6">
        <CoverUpload
          :preview-url="coverPreview"
          :error="coverError"
          @file="onCoverFile"
          @clear="onCoverClear"
        />
        <div class="space-y-2">
          <AppButton size="sm" variant="secondary" @click="showCoverErrorDemo">
            Demo error
          </AppButton>
          <AppButton size="sm" variant="ghost" @click="onCoverClear">Reset</AppButton>
        </div>
      </div>
    </section>

    <section class="mt-10 space-y-2">
      <h2 class="text-title">RankRow · ranked (mobile 358)</h2>
      <div class="max-w-[358px] rounded-lg border border-line bg-surface p-1">
        <RankRow :rank="1" title="Dune 2" :cover-url="sampleCover" />
        <RankRow :rank="2" title="Arrival" :cover-url="sampleCover" />
        <RankRow :rank="3" title="Blade Runner 2049" :cover-url="sampleCover" />
        <RankRow :rank="4" title="Interstellar" />
        <RankRow :rank="5" title="Dragging sample" :cover-url="sampleCover" dragging />
      </div>
    </section>

    <section class="mt-10 space-y-2">
      <h2 class="text-title">RankRow · inbox</h2>
      <div class="max-w-[358px] rounded-lg border border-line bg-surface p-1">
        <RankRow mode="inbox" title="Ещё не оценён" :cover-url="sampleCover" />
        <RankRow mode="inbox" title="Без обложки" />
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">PrivacyChip</h2>
      <div class="flex flex-wrap items-center gap-3">
        <PrivacyChip privacy="private" />
        <PrivacyChip privacy="unlisted" />
        <PrivacyChip privacy="public" />
      </div>
      <p class="text-caption text-muted">compact (mobile icon-only)</p>
      <div class="flex flex-wrap items-center gap-3">
        <PrivacyChip privacy="private" compact />
        <PrivacyChip privacy="unlisted" compact />
        <PrivacyChip privacy="public" compact />
      </div>
    </section>

    <section class="mt-10 max-w-lg space-y-2">
      <h2 class="text-title">TopicRow · desktop (labeled chip)</h2>
      <div class="rounded-lg border border-line bg-surface p-1">
        <TopicRow
          v-for="row in sampleRows"
          :key="row.title"
          :title="row.title"
          :meta="row.meta"
          :privacy="row.privacy"
          :covers="row.covers"
        />
      </div>
    </section>

    <section class="mt-10 max-w-[358px] space-y-2">
      <h2 class="text-title">TopicRow · mobile (compact chip)</h2>
      <div class="rounded-lg border border-line bg-surface p-1">
        <TopicRow
          v-for="row in sampleRows"
          :key="`m-${row.title}`"
          :title="row.title"
          :meta="row.meta"
          :privacy="row.privacy"
          :covers="row.covers"
          compact-privacy
        />
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppNav · placement samples</h2>
      <p class="text-body-sm text-muted">
        Fixed auto-dock на краях viewport. Ниже — inline bottom (M) и top (D).
      </p>
      <div class="max-w-[390px] rounded-lg border border-line bg-bg p-3">
        <AppNav :fixed="false" placement="bottom" active="topics" />
      </div>
      <div class="rounded-lg border border-line bg-bg p-3">
        <AppNav :fixed="false" placement="top" active="topics" profile-label="demo" />
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppButton · md (44)</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton>Primary</AppButton>
        <AppButton variant="secondary">Secondary</AppButton>
        <AppButton variant="ghost">Ghost</AppButton>
        <AppButton variant="danger-ghost">Danger ghost</AppButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <AppButton disabled>Primary disabled</AppButton>
        <AppButton variant="secondary" disabled>Secondary disabled</AppButton>
        <AppButton variant="ghost" disabled>Ghost disabled</AppButton>
        <AppButton variant="danger-ghost" disabled>Danger disabled</AppButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <AppButton :loading="loading" @click="toggleLoading">
          {{ loading ? 'Loading…' : 'Primary loading' }}
        </AppButton>
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppButton · sm (32)</h2>
      <div class="flex flex-wrap gap-3">
        <AppButton size="sm">Primary</AppButton>
        <AppButton size="sm" variant="secondary">Secondary</AppButton>
        <AppButton size="sm" variant="ghost">Ghost</AppButton>
        <AppButton size="sm" variant="danger-ghost">Danger ghost</AppButton>
      </div>
    </section>

    <section class="mt-10 max-w-sm space-y-5">
      <h2 class="text-title">AppInput</h2>
      <AppInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
      <AppInput v-model="password" label="Пароль" type="password" />
      <AppInput
        v-model="errorEmail"
        label="С ошибкой"
        type="email"
        error="Некорректный email"
      />
      <AppInput model-value="Disabled" label="Disabled" disabled />
    </section>
  </main>
</template>
