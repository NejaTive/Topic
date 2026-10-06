import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  rankItem,
  reorderItems,
  type ItemList,
} from '@/api/items';
import {
  deleteTopic,
  updateTopic,
  type TopicDetail,
} from '@/api/topics';
import type { PrivacyValue } from '@/components/ui';
import { queryKeys } from '@/query/keys';

/** PATCH privacy → invalidate detail + list. */
export function useUpdateTopicPrivacyMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (privacy: PrivacyValue) =>
      updateTopic(topicId(), { privacy }),
    onSuccess: (topic: TopicDetail) => {
      queryClient.setQueryData(queryKeys.topics.detail(topic.id), topic);
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

/** DELETE topic → invalidate list. */
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

/** POST …/rank — inbox → конец ranked. */
export function useRankItemMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => rankItem(topicId(), itemId),
    onSuccess: () => {
      const id = topicId();
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.items(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

/** POST …/reorder — optimistic порядок ranked + rollback при ошибке. */
export function useReorderItemsMutation(topicId: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedItemIds: string[]) =>
      reorderItems(topicId(), orderedItemIds),
    onMutate: async (orderedItemIds) => {
      const id = topicId();
      const key = queryKeys.topics.items(id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ItemList>(key);
      if (previous) {
        const byId = new Map(previous.ranked.map((item) => [item.id, item]));
        const ranked = orderedItemIds.flatMap((itemId, index) => {
          const item = byId.get(itemId);
          if (!item) return [];
          return [{ ...item, rankPosition: index + 1 }];
        });
        queryClient.setQueryData<ItemList>(key, { ...previous, ranked });
      }
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
