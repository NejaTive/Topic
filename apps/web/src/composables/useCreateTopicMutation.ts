import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createTopic, type CreateTopicBody } from '@/api/topics';
import { queryKeys } from '@/query/keys';

export type CreateTopicInput = {
  title: string;
  privacy?: CreateTopicBody['privacy'];
};

export function useCreateTopicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTopicInput) => createTopic(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}
