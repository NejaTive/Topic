<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  TButton,
  TInput,
  TCoverUpload,
  TEmptyState,
  TMainChip,
  MAIN_CHIP_LABELS,
  TPrivacyChip,
  TRankRow,
  TTopicRow,
  type PrivacyValue,
} from '@/components/ui-kit';

const email = ref('');
const password = ref('secret');
const errorEmail = ref('Некорректный email');
const loading = ref(false);

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
  covers?: Array<string | null>;
}[] = [
  {
    title: 'Фильмы 2026',
    meta: 'обновлён вчера',
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
    meta: 'обновлён 1 окт',
    privacy: 'unlisted',
  },
  {
    title: 'Личное',
    meta: 'обновлён сегодня',
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

    <section class="mt-10 space-y-4">
      <h2 class="text-title">TMainChip · подсказки S04</h2>
      <div class="flex flex-wrap gap-2">
        <TMainChip
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
      <h2 class="text-title">TCoverUpload · 144×192</h2>
      <div class="flex flex-wrap items-start gap-6">
        <TCoverUpload
          :preview-url="coverPreview"
          :error="coverError"
          @file="onCoverFile"
          @clear="onCoverClear"
        />
        <div class="space-y-2">
          <TButton size="sm" variant="secondary" @click="showCoverErrorDemo"> Demo error </TButton>
          <TButton size="sm" variant="ghost" @click="onCoverClear">Reset</TButton>
        </div>
      </div>
    </section>

    <section class="mt-10 space-y-2">
      <h2 class="text-title">TRankRow · ranked (mobile 358)</h2>
      <div class="flex max-w-89.5 flex-col gap-3">
        <TRankRow :rank="1" title="Dune 2" :cover-url="sampleCover" />
        <TRankRow :rank="2" title="Arrival" :cover-url="sampleCover" />
        <TRankRow :rank="3" title="Blade Runner 2049" :cover-url="sampleCover" />
        <TRankRow :rank="4" title="Interstellar" />
        <TRankRow :rank="5" title="Dragging sample" :cover-url="sampleCover" dragging />
      </div>
    </section>

    <section class="mt-10 space-y-2">
      <h2 class="text-title">TRankRow · inbox</h2>
      <div class="flex max-w-89.5 flex-col gap-3">
        <TRankRow mode="inbox" title="Ещё не оценён" :cover-url="sampleCover" />
        <TRankRow mode="inbox" title="Без обложки" />
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">TPrivacyChip</h2>
      <div class="flex flex-wrap items-center gap-3">
        <TPrivacyChip privacy="private" />
        <TPrivacyChip privacy="unlisted" />
        <TPrivacyChip privacy="public" />
      </div>
      <p class="text-caption text-muted">selected</p>
      <div class="flex flex-wrap items-center gap-3">
        <TPrivacyChip privacy="private" selected />
        <TPrivacyChip privacy="unlisted" selected />
        <TPrivacyChip privacy="public" selected />
      </div>
      <p class="text-caption text-muted">compact (mobile icon-only)</p>
      <div class="flex flex-wrap items-center gap-3">
        <TPrivacyChip privacy="private" compact />
        <TPrivacyChip privacy="unlisted" compact />
        <TPrivacyChip privacy="public" compact />
      </div>
    </section>

    <section class="mt-10 max-w-240 space-y-3">
      <h2 class="text-title">TTopicRow · desktop (labeled chip)</h2>
      <TTopicRow
        v-for="row in sampleRows"
        :key="row.title"
        :title="row.title"
        :meta="row.meta"
        :privacy="row.privacy"
        :covers="row.covers"
      />
    </section>

    <section class="mt-10 max-w-89.5 space-y-3">
      <h2 class="text-title">TTopicRow · mobile (compact chip)</h2>
      <TTopicRow
        v-for="row in sampleRows"
        :key="`m-${row.title}`"
        :title="row.title"
        :meta="row.meta"
        :privacy="row.privacy"
        :covers="row.covers"
        compact-privacy
      />
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">GuestNav · S09 / S11–S12</h2>
      <p class="text-body-sm text-muted">
        Floating dock auto (M bottom / D top), CTA «Присоединиться» → `/`. Live:
        <RouterLink class="text-accent" to="/t/demo">/t/…</RouterLink>
        или S11/S12.
      </p>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">AppNav</h2>
      <p class="text-body-sm text-muted">
        Floating dock auto (M bottom / D top). Live в
        <RouterLink class="text-accent" to="/app/topics">/app/topics</RouterLink>.
      </p>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">TEmptyState · With CTA</h2>
      <div class="max-w-180">
        <TEmptyState />
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">TButton · md (44)</h2>
      <div class="flex flex-wrap gap-3">
        <TButton>Primary</TButton>
        <TButton variant="secondary">Secondary</TButton>
        <TButton variant="ghost">Ghost</TButton>
        <TButton variant="danger-ghost">Danger ghost</TButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <TButton disabled>Primary disabled</TButton>
        <TButton variant="secondary" disabled>Secondary disabled</TButton>
        <TButton variant="ghost" disabled>Ghost disabled</TButton>
        <TButton variant="danger-ghost" disabled>Danger disabled</TButton>
      </div>
      <div class="flex flex-wrap gap-3">
        <TButton :loading="loading" @click="toggleLoading">
          {{ loading ? 'Loading…' : 'Primary loading' }}
        </TButton>
      </div>
    </section>

    <section class="mt-10 space-y-4">
      <h2 class="text-title">TButton · sm (32)</h2>
      <div class="flex flex-wrap gap-3">
        <TButton size="sm">Primary</TButton>
        <TButton size="sm" variant="secondary">Secondary</TButton>
        <TButton size="sm" variant="ghost">Ghost</TButton>
        <TButton size="sm" variant="danger-ghost">Danger ghost</TButton>
      </div>
    </section>

    <section class="mt-10 max-w-sm space-y-5">
      <h2 class="text-title">TInput</h2>
      <TInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
      <TInput v-model="password" label="Пароль" type="password" />
      <TInput v-model="errorEmail" label="С ошибкой" type="email" error="Некорректный email" />
      <TInput model-value="Disabled" label="Disabled" disabled />
    </section>
  </main>
</template>
