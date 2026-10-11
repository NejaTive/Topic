import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { followUser, unfollowUser } from '@/api/social';
import { queryKeys } from '@/query/keys';

export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nick: string) => followUser(nick),
    onSuccess: (_void, nick) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(nick) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.list() });
    },
  });
}

export function useUnfollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nick: string) => unfollowUser(nick),
    onSuccess: (_void, nick) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(nick) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed.list() });
    },
  });
}
