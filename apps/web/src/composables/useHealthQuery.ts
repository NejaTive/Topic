import { useQuery } from '@tanstack/vue-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/query/keys';

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/health');
      if (error) throw error;
      if (!data) throw new Error('Health check failed');
      return data;
    },
  });
}
