import { writable } from "svelte/store";
import { isExists } from "@mary-shared/utils/typeguards";


function createSettingsStore() {
  const getInitialStore = (): IInternalSettings => ({
    overlayLaunch: false,
    overlayKey: "",
    overlayWindowName: "League of Legends (TM) Client",
    showAllyTeam: true,
    showEnemyTeam: true,
    showObjects: true,
    lanAvailability: false
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { subscribe, update } = writable<IInternalSettings>(getInitialStore());

  function setSetting<T extends keyof IInternalSettings>(key: T, value: IInternalSettings[T]) {
    update(store => ({
      ...store,
      [key]: value
    }));
  }
  const setSettings = (value?: IInternalSettings) => update(() => isExists(value) ? value : getInitialStore());
  const reset = () => update(() => getInitialStore());

  return {
    subscribe,

    setSetting,
    setSettings,

    reset
  };
}

export const settingsStore = createSettingsStore();