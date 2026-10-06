export const queryKeys = {
  health: () => ['health'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  topics: {
    list: () => ['topics', 'list'] as const,
    detail: (id: string) => ['topics', 'detail', id] as const,
    items: (id: string) => ['topics', 'items', id] as const,
  },
};
