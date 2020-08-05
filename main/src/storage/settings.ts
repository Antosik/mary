import Store from "electron-store";


const createSettingsStore = () => new Store<Partial<IInternalSettings>>({
  name: "settings",
  defaults: {
    overlayLaunch: false,
    overlayKey: "Backquote",
    overlayWindowName: "League of Legends (TM) Client",
    showAllyTeam: true,
    showEnemyTeam: true,
    showObjects: true,
    lanAvailability: false
  }
});


export const settingsStore = createSettingsStore();