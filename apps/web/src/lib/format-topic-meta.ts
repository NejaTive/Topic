const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

/** Meta-line для TopicRow: «Изменено 5 окт». */
export function formatTopicUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Изменено недавно';
  const raw = monthFormatter.format(date).replace(/\./g, '');
  return `Изменено ${raw}`;
}
