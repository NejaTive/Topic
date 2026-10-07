const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const MS_DAY = 86_400_000;

/** Meta-line для TopicRow (Figma S03): «обновлён вчера» / «обновлён 5 окт». */
export function formatTopicUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'обновлён недавно';

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / MS_DAY);

  if (diffDays <= 0) return 'обновлён сегодня';
  if (diffDays === 1) return 'обновлён вчера';
  if (diffDays < 7) return `обновлён ${diffDays} дн. назад`;

  const raw = monthFormatter.format(date).replace(/\./g, '');
  return `обновлён ${raw}`;
}
