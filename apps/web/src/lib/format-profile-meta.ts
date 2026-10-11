function ruPlural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** Счётчики шапки S10: `N подписчиков · M подписок · K топиков`. */
export function formatProfileCounters(
  followersCount: number,
  followingCount: number,
  topicsCount: number,
): string {
  const followers = `${followersCount} ${ruPlural(followersCount, 'подписчик', 'подписчика', 'подписчиков')}`;
  const following = `${followingCount} ${ruPlural(followingCount, 'подписка', 'подписки', 'подписок')}`;
  const topics = `${topicsCount} ${ruPlural(topicsCount, 'топик', 'топика', 'топиков')}`;
  return `${followers} · ${following} · ${topics}`;
}
