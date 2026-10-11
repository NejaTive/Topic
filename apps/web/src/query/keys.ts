export const queryKeys = {
  health: () => ['health'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  topics: {
    list: () => ['topics', 'list'] as const,
    detail: (id: string) => ['topics', 'detail', id] as const,
    items: (id: string) => ['topics', 'items', id] as const,
    item: (topicId: string, itemId: string) => ['topics', 'item', topicId, itemId] as const,
  },
  share: {
    detail: (shareId: string) => ['share', 'detail', shareId] as const,
  },
  users: {
    profile: (nick: string) => ['users', 'profile', nick] as const,
  },
  feed: {
    list: () => ['feed', 'list'] as const,
  },
};
