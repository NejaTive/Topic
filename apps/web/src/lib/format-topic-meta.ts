const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const MS_DAY = 86_400_000;

function diffCalendarDays(iso: string): number | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startToday.getTime() - startThat.getTime()) / MS_DAY);
}

/** Meta-line для TTopicRow (Figma S03): «обновлён вчера» / «обновлён 5 окт». */
export function formatTopicUpdatedAt(iso: string): string {
  const diffDays = diffCalendarDays(iso);
  if (diffDays === null) return 'обновлён недавно';

  if (diffDays <= 0) return 'обновлён сегодня';
  if (diffDays === 1) return 'обновлён вчера';
  if (diffDays < 7) return `обновлён ${diffDays} дн. назад`;

  const raw = monthFormatter.format(new Date(iso)).replace(/\./g, '');
  return `обновлён ${raw}`;
}

/** Meta-line для ленты S13: «сегодня» / «вчера» / «3 дня» / «неделю назад». */
export function formatFeedUpdatedAt(iso: string): string {
  const diffDays = diffCalendarDays(iso);
  if (diffDays === null) return 'недавно';

  if (diffDays <= 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays === 7) return 'неделю назад';
  if (diffDays < 7) {
    const mod10 = diffDays % 10;
    const mod100 = diffDays % 100;
    if (mod10 === 1 && mod100 !== 11) return `${diffDays} день`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${diffDays} дня`;
    return `${diffDays} дней`;
  }

  const raw = monthFormatter.format(new Date(iso)).replace(/\./g, '');
  return raw;
}
