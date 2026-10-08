import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { loginUser, logoutUser, registerUser, type LoginBody, type RegisterBody } from '@/api/auth';
import { queryKeys } from '@/query/keys';
import { useSessionStore } from '@/stores/session';

export function useRegisterMutation() {
  const session = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterBody) => registerUser(body),
    onSuccess: (user) => {
      session.setUser(user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

export function useLoginMutation() {
  const session = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginBody) => loginUser(body),
    onSuccess: (user) => {
      session.setUser(user);
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

export function useLogoutMutation() {
  const session = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      session.clear();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.removeQueries({ queryKey: queryKeys.topics.list() });
    },
    onError: () => {
      session.clear();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.removeQueries({ queryKey: queryKeys.topics.list() });
    },
  });
}
