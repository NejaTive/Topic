import { useRegisterSW } from 'virtual:pwa-register/vue';

/** Обёртка над регистрацией SW: обновление только по запросу (registerType: prompt). */
export function useAppUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();

  return { needRefresh, updateServiceWorker };
}
