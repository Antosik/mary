import { MenuItemConstructorOptions, MenuItem, dialog } from "electron";

import { app, shell } from "electron";

import { MaryInternal } from "@mary-main/app/internal";
import { MaryClient } from "@mary-main/app/output/client";
import { MaryOverlay } from "@mary-main/app/output/overlay";
import { MarySettings } from "@mary-main/app/output/settings";
import { MaryServer } from "@mary-main/app/output/server";
import { settingsStore } from "@mary-main/storage/settings";
import { MaryTray } from "@mary-main/ui/tray";
import { Events } from "@mary-main/utils/events";
import { Result } from "@mary-shared/utils/result";
import { isExists, isNotExists, isNotEmpty } from "@mary-shared/utils/typeguards";


export class Mary extends MaryInternal implements IDestroyable {

  #tray: MaryTray;

  #main: MaryClient | null;
  #settings: MarySettings | null;
  #server: MaryServer | null;
  #overlay: MaryOverlay | null;

  public static launch(): Mary {
    return new this();
  }

  private constructor() {
    super();

    this.#main = null;
    this.#settings = null;
    this.#server = null;
    this.#overlay = null;

    if (settingsStore.get("overlayLaunch")) {
      this.#overlay = this._initOverlay(settingsStore.store);
    }

    if (settingsStore.get("lanAvailability")) {
      this.#server = this._initServer();
      this.#server.start();
    }

    this.#tray = new MaryTray(this._getTrayMenuItems());

    this
      ._handleTrayEvents()
      ._handleMaryInternalEvents();
  }


  // #region Events handling
  private _handleTrayEvents() {
    this.#tray.addListener("double-click", this._onTrayDoubleClick);
    return this;
  }

  private _handleMaryInternalEvents() {
    Events.addListener("mary:send", this._onEventsMarySend);
    return this;
  }
  // #endregion Events handling


  // #region Output handlers
  private _onLiveConnect = async () => {        // "live:connect"
    await this._liveClientApiPing.start();
  };

  private _onCooldownsObjectGet = () => {       // "cooldowns:object:get"
    const cooldowns = isExists(this._game)
      ? this._game.getObjectsCooldowns()
      : [];
    return Result.create(cooldowns, "success");
  };

  private _onCooldownsPlayerGet = () => {       // "cooldowns:player:get"
    const cooldowns = isExists(this._game)
      ? this._game.getPlayersCooldowns()
      : [];
    return Result.create(cooldowns, "success");
  };

  private _onCooldownsPlayerSet = (summonerName: string, target: TInternalCooldownTarget) => {     // "cooldown:player:set"
    this._getPlayer(summonerName).setCooldown(target);
  };

  private _onCooldownsPlayerReset = (summonerName: string, target: TInternalCooldownTarget) => {   // "cooldown:player:reset"
    this._getPlayer(summonerName).resetCooldown(target);
  };

  private _onSettingsOpen = () => {   // "settings:open"
    return this._openSettingsWindow();
  };

  private _onSettingsLoad = () => {   // "settings:load"
    return Result.create(settingsStore.store, "success");
  };

  private _acceptedRestartDialog(): boolean {

    const response = dialog.showMessageBoxSync({
      buttons: ["OK", "Cancel"],
      message: "Critical changes - App will be restarted. \nProceed?"
    });
    return response === 0;
  }

  private _onSettingsSave = (data: IInternalSettings) => {   // "settings:save"

    const oldSettings = settingsStore.store;
    settingsStore.set(data);

    if (
      this._isRestartAfterSettingsSetNeeded(oldSettings, settingsStore.store)
      && this._acceptedRestartDialog()
    ) {
      app.relaunch();
      app.exit(0);
      return;
    }

    const msg: TMessageContainer = {
      event: "settings:updated",
      data: Result.create(data, "success")
    };

    this._sendToOutputs(msg);
    this.#settings?.window.close();
  };

  private _onServerIp = (ip: string[]) => {     // "server:ip"
    this.#tray.destroy();

    this.#tray = new MaryTray(this._getTrayMenuItems(ip));
    this._handleTrayEvents();
  };

  private _onOverlayActiveChange = (isActive: boolean) => { // "overlay:active-change"
    if (isNotExists(this.#overlay)) {
      return;
    }

    const msg: TMessageContainer = {
      event: "overlay:active-change",
      data: Result.create(isActive, "success")
    };

    this._sendToOutput(this.#overlay, msg);
  };

  private _onOverlayHide = () => { // "overlay:hide"
    if (isNotExists(this.#overlay)) {
      return;
    }

    this.#overlay.hideOverlay();
  };
  // #endregion Output handlers


  // #region Window init
  private _openMainWindow(): void {

    if (isNotExists(this.#main)) {
      this.#main = MaryClient.launch();
      this.#main.window.on("closed", () => {
        const temp = this.#main;
        this.#main = null;
        temp?.destroy();
      });
    }

    this.#main.events.on("live:connect", this._onLiveConnect);
    this.#main.events.setHandler("cooldowns:object:get", this._onCooldownsObjectGet);
    this.#main.events.setHandler("cooldowns:player:get", this._onCooldownsPlayerGet);
    this.#main.events.setHandler("cooldown:player:set", this._onCooldownsPlayerSet);
    this.#main.events.setHandler("cooldown:player:reset", this._onCooldownsPlayerReset);
    this.#main.events.setHandler("settings:open", this._onSettingsOpen);
    this.#main.events.setHandler("settings:load", this._onSettingsLoad);

    this.#main.window.focus();
  }


  private _openSettingsWindow(): void {
    if (isNotExists(this.#settings)) {
      this.#settings = MarySettings.launch();
      this.#settings.window.on("closed", () => {
        const temp = this.#settings;
        this.#settings = null;
        temp?.destroy();
      });
    }

    this.#settings.events.setHandler("settings:load", this._onSettingsLoad);
    this.#settings.events.setHandler("settings:save", this._onSettingsSave);

    this.#settings.window.focus();
  }

  private _initServer(): MaryServer {

    const server = new MaryServer();

    server.events.on("server:ip", this._onServerIp);
    server.events.on("live:connect", this._onLiveConnect);
    server.events.setHandler("cooldowns:object:get", this._onCooldownsObjectGet);
    server.events.setHandler("cooldowns:player:get", this._onCooldownsPlayerGet);
    server.events.setHandler("cooldown:player:set", this._onCooldownsPlayerSet);
    server.events.setHandler("cooldown:player:reset", this._onCooldownsPlayerReset);
    server.events.setHandler("settings:open", this._onSettingsOpen);
    server.events.setHandler("settings:load", this._onSettingsLoad);

    return server;
  }

  private _initOverlay(settings: TOverlaySettings): MaryOverlay {

    const overlay = MaryOverlay.launch(settings);

    overlay.events.on("live:connect", this._onLiveConnect);
    overlay.events.on("overlay:active-change", this._onOverlayActiveChange);
    overlay.events.setHandler("overlay:hide", this._onOverlayHide);
    overlay.events.setHandler("cooldowns:object:get", this._onCooldownsObjectGet);
    overlay.events.setHandler("cooldowns:player:get", this._onCooldownsPlayerGet);
    overlay.events.setHandler("cooldown:player:set", this._onCooldownsPlayerSet);
    overlay.events.setHandler("cooldown:player:reset", this._onCooldownsPlayerReset);
    overlay.events.setHandler("settings:open", this._onSettingsOpen);
    overlay.events.setHandler("settings:load", this._onSettingsLoad);

    return overlay;
  }
  // #endregion Window init


  // #region Internal Mary Events handlers
  private _onEventsMarySend = (msg: TMessageContainer | TMessageContainer[]): void => {
    this._sendToOutputs(msg);
  };
  // #endregion Internal Mary Events handlers


  // #region Tray Events handlers
  private _getTrayMenuItems(ips: string[] = []): MenuItemConstructorOptions[] {

    const ipsItems = ips.map<MenuItemConstructorOptions>(ip => ({
      label: ip,
      click: this._onIPClick
    }));

    const menu: MenuItemConstructorOptions[] = [
      { label: "Open", type: "normal", click: this._onTrayMenuOpenClick },
      { label: "LAN", type: "submenu", submenu: ipsItems, visible: isNotEmpty(ips) },
      { label: "Settings", type: "normal", click: this._onTrayMenuSettingsClick },
      { label: "Quit", type: "normal", click: this._onTrayMenuQuitClick }
    ];

    return menu;
  }

  private _onIPClick = (menuItem: MenuItem): void => {
    void shell.openExternal(`http://${menuItem.label}`);
  };
  private _onTrayDoubleClick = (): void => {
    return this._openMainWindow();
  };
  private _onTrayMenuOpenClick = (): void => {
    return this._openMainWindow();
  };
  private _onTrayMenuSettingsClick = (): void => {
    return this._openSettingsWindow();
  };
  private _onTrayMenuQuitClick = (): void => {
    return this._quitApp();
  };
  // #endregion Tray Events handlers


  // #region Utils
  private _quitApp(): void {
    app.quit();
  }

  private _sendToOutputs(container: TMessageContainer | TMessageContainer[]): void {
    if (isExists(this.#overlay)) { this._sendToOutput(this.#overlay, container); }
    if (isExists(this.#main)) { this._sendToOutput(this.#main, container); }
    if (isExists(this.#server)) { this._sendToOutput(this.#server, container); }
  }

  private _sendToOutput(output: IMaryOutput | null, container: TMessageContainer | TMessageContainer[]): void {
    if (isNotExists(output)) {
      return;
    }

    if (!Array.isArray(container)) {
      return output.send(container);
    }

    for (const message of container) {
      output.send(message);
    }
  }

  private _isRestartAfterSettingsSetNeeded(oldSettings: Partial<IInternalSettings>, newSettings: Partial<IInternalSettings>): boolean {
    return oldSettings.overlayWindowName !== newSettings.overlayWindowName
      || oldSettings.lanAvailability !== newSettings.lanAvailability
      || oldSettings.overlayLaunch !== newSettings.overlayLaunch;
  }
  // #endregion Utils


  // #region Cleanup
  public destroy(): void {

    super.destroy();
    this.#tray.destroy();

    if (isExists(this.#overlay)) { this.#overlay.destroy(); this.#overlay = null; }
    if (isExists(this.#main)) { this.#main.destroy(); this.#main = null; }
    if (isExists(this.#server)) { this.#server.destroy(); this.#server = null; }
    if (isExists(this.#settings)) { this.#settings.destroy(); this.#settings = null; }
  }
  // #endregion Cleanup
}