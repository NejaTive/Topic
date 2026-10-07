import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createTopic, type CreateTopicBody } from '@/api/topics';
import { queryKeys } from '@/query/keys';

export type CreateTopicInput = {
  title: string;
  /** Если не передано — API default unlisted (клиент тоже шлёт unlisted). */
  privacy?: CreateTopicBody['privacy'];
};

/** POST /api/topics → invalidate list. */
export function useCreateTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTopicInput) => createTopic(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}
