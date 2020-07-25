import { writable } from "svelte/store";
import { isExists } from "@mary-shared/utils/typeguards";


function createSettingsStore() {
  const getInitialStore = (): IInternalSettingsNew => ({
    overlayLaunch: false,
    overlayKey: "",
    overlayWindowName: "League of Legends (TM) Client",
    showAllyTeam: true,
    showEnemyTeam: true,
    showObjects: true,
    lanAvailability: false
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { subscribe, update } = writable<IInternalSettingsNew>(getInitialStore());

  function setSetting<T extends keyof IInternalSettingsNew>(key: T, value: IInternalSettingsNew[T]) {
    update(store => ({
      ...store,
      [key]: value
    }));
  }
  const setSettings = (value?: IInternalSettingsNew) => update(() => isExists(value) ? value : getInitialStore());
  const reset = () => update(() => getInitialStore());

  return {
    subscribe,

    setSetting,
    setSettings,

    reset
  };
}

export const settingsStore = createSettingsStore();