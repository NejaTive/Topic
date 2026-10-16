import { useQuery } from '@tanstack/vue-query';
import { getRecommendations } from '@/api/recommendations';
import { queryKeys } from '@/query/keys';

export function useRecommendationsQuery() {
  return useQuery({
    queryKey: queryKeys.recommendations.list(),
    queryFn: getRecommendations,
    staleTime: 30_000,
  });
}
