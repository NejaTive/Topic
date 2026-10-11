import { useQuery } from '@tanstack/vue-query';
import { getFeed } from '@/api/social';
import { queryKeys } from '@/query/keys';

export function useFeedQuery() {
  return useQuery({
    queryKey: queryKeys.feed.list(),
    queryFn: getFeed,
    staleTime: 30_000,
  });
}
