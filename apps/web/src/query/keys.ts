export const queryKeys = {
  health: () => ['health'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
  },
};
