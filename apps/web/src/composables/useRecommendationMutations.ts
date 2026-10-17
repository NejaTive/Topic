import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  acceptRecommendation,
  dismissRecommendation,
  recommendItem,
  type AcceptRecommendationBody,
  type AcceptedRecommendationItem,
  type RecommendItemBody,
} from '@/api/recommendations';
import { queryKeys } from '@/query/keys';

export function useRecommendItemMutation() {
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: RecommendItemBody }) =>
      recommendItem(itemId, body),
  });
}

export function useAcceptRecommendationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AcceptRecommendationBody }) =>
      acceptRecommendation(id, body),
    onSuccess: (item: AcceptedRecommendationItem) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.list() });
      queryClient.setQueryData(queryKeys.topics.item(item.topicId, item.id), item);
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.items(item.topicId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}

export function useDismissRecommendationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dismissRecommendation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.list() });
    },
  });
}
