import type { BrowserWindowConstructorOptions } from "electron";

import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";


export class SettingsWindow extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions = {}) {
    const htmlPath = isDev ? resolvePath("target", "settings.html") : joinPath(process.resourcesPath, "settings.html");
    const preloadPath = isDev ? resolvePath("target/renderer", "preload.js") : joinPath(process.resourcesPath, "renderer", "preload.js");

    const settings: BrowserWindowConstructorOptions = {
      title: "Mary - Settings",

      width: 500,
      height: 400,
      minWidth: 500,
      minHeight: 400,

      show: false,
      frame: false,

      webPreferences: {
        nodeIntegration: true,
        preload: preloadPath
      },

      ...options
    };
    super(settings);

    this.setMenuBarVisibility(false);
    void this.loadFile(htmlPath);

    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

export const createSettingsWindow = (options: BrowserWindowConstructorOptions = {}): SettingsWindow => new SettingsWindow(options);