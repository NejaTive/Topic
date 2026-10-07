/** Meta-line S07: «Добавлен: 01.10.2026». */
export function formatItemAddedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Добавлен';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `Добавлен: ${dd}.${mm}.${yyyy}`;
}

/** Placement copy: inbox / ranked (+ позиция). */
export function formatItemPlacement(
  placement: 'unranked' | 'ranked',
  rankPosition?: number | null,
): string {
  if (placement === 'ranked') {
    return rankPosition != null ? `В рейтинге · ${rankPosition}` : 'В рейтинге';
  }
  return 'Ещё не оценён';
}
