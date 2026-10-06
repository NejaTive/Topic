import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { rankItem } from '@/api/items';
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
