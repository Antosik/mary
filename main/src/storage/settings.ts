import Store from "electron-store";


const createSettingsStore = () => new Store<Partial<IInternalSettingsNew>>({
  name: "settings",
  defaults: {
    overlayLaunch: false,
    overlayKey: "",
    overlayWindowName: "League of Legends (TM) Client",
    showAllyTeam: true,
    showEnemyTeam: true,
    showObjects: true,
    lanAvailability: false
  }
});


export const settingsStore = createSettingsStore();