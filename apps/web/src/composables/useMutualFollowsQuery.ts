import { useQuery } from '@tanstack/vue-query';
import { getMutualFollows } from '@/api/recommendations';
import { queryKeys } from '@/query/keys';

export function useMutualFollowsQuery() {
  return useQuery({
    queryKey: queryKeys.recommendations.mutualFollows(),
    queryFn: getMutualFollows,
    staleTime: 30_000,
  });
}
