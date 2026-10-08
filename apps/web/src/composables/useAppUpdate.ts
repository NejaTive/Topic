import { useRegisterSW } from 'virtual:pwa-register/vue';

export function useAppUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  return { needRefresh, updateServiceWorker };
}
