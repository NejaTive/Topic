import { useMutation, useQueryClient, type QueryClient } from '@tanstack/vue-query';
import { rankItem, reorderItems, type ItemDto, type ItemList } from '@/api/items';
import { deleteTopic, updateTopic, type TopicDetail } from '@/api/topics';
import type { PrivacyValue } from '@/components/ui-kit';
import { queryKeys } from '@/query/keys';

export function applyOptimisticReorder(
  queryClient: QueryClient,
  topicId: string,
  orderedItemIds: string[],
): ItemList | undefined {
  const key = queryKeys.topics.items(topicId);
  const previous = queryClient.getQueryData<ItemList>(key);
  if (!previous) return undefined;

  const byId = new Map<string, ItemDto>();
  for (const item of previous.ranked) byId.set(item.id, item);
  for (const item of previous.inbox) byId.set(item.id, item);

  const ranked = orderedItemIds.flatMap((itemId, index) => {
    const item = byId.get(itemId);
    if (!item) return [];
    return [{ ...item, rankPosition: index + 1 }];
  });
  const rankedIds = new Set(orderedItemIds);
  const inbox = previous.inbox.filter((item) => !rankedIds.has(item.id));

  queryClient.setQueryData<ItemList>(key, { ...previous, inbox, ranked });
  return previous;
}

export function applyOptimisticInboxToRank(
  queryClient: QueryClient,
  topicId: string,
  itemId: string,
  insertAt: number,
): ItemList | undefined {
  const key = queryKeys.topics.items(topicId);
  const previous = queryClient.getQueryData<ItemList>(key);
  if (!previous) return undefined;

  const item =
    previous.inbox.find((row) => row.id === itemId) ??
    previous.ranked.find((row) => row.id === itemId);
  if (!item) return undefined;

  const inbox = previous.inbox.filter((row) => row.id !== itemId);
  const rest = previous.ranked.filter((row) => row.id !== itemId);
  const at = Math.min(Math.max(0, insertAt), rest.length);
  const ranked = [...rest];
  ranked.splice(at, 0, { ...item, rankPosition: at + 1 });
  const normalized = ranked.map((row, index) => ({ ...row, rankPosition: index + 1 }));

  queryClient.setQueryData<ItemList>(key, { ...previous, inbox, ranked: normalized });
  return previous;
}

export function useUpdateTopicPrivacyMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (privacy: PrivacyValue) => updateTopic(topicId(), { privacy }),
    onSuccess: (topic: TopicDetail) => {
      queryClient.setQueryData(queryKeys.topics.detail(topic.id), topic);
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.topics.detail(id) });
      queryClient.removeQueries({ queryKey: queryKeys.topics.items(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

export function useRankItemMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => rankItem(topicId(), itemId),
    onSuccess: (item) => {
      const id = topicId();
      const key = queryKeys.topics.items(id);
      const prev = queryClient.getQueryData<ItemList>(key);
      if (!prev) {
        void queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      const inbox = prev.inbox.filter((row) => row.id !== item.id);
      const idx = prev.ranked.findIndex((row) => row.id === item.id);
      const ranked =
        idx >= 0
          ? prev.ranked.map((row) =>
              row.id === item.id ? { ...row, ...item, rankPosition: row.rankPosition } : row,
            )
          : [...prev.ranked, { ...item, rankPosition: prev.ranked.length + 1 }];
      queryClient.setQueryData<ItemList>(key, { ...prev, inbox, ranked });
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

export function useReorderItemsMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedItemIds: string[]) => reorderItems(topicId(), orderedItemIds),
    onMutate: (orderedItemIds) => {
      const id = topicId();
      const key = queryKeys.topics.items(id);
      void queryClient.cancelQueries({ queryKey: key });
      const previous = applyOptimisticReorder(queryClient, id, orderedItemIds);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.topics.items(topicId()), ctx.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.topics.items(topicId()), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.topics.items(topicId()),
      });
    },
  });
}
