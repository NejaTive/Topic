export const queryKeys = {
  health: () => ['health'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  topics: {
    list: () => ['topics', 'list'] as const,
  },
};
