import { useQuery } from '@tanstack/vue-query';
import { fetchTopics } from '@/api/topics';
import { queryKeys } from '@/query/keys';

/** GET /api/topics → список S03. */
export function useTopicsQuery() {
  return useQuery({
    queryKey: queryKeys.topics.list(),
    queryFn: fetchTopics,
    staleTime: 30_000,
  });
}
