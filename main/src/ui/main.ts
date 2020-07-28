import type { BrowserWindowConstructorOptions } from "electron";

import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";


export class MainWindow extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions = {}) {
    const htmlPath = isDev ? resolvePath("target", "client.html") : joinPath(process.resourcesPath, "client.html");
    const preloadPath = isDev ? resolvePath("target/renderer", "preload.js") : joinPath(process.resourcesPath, "renderer", "preload.js");

    const settings: BrowserWindowConstructorOptions = {
      title: "Mary",

      width: 800,
      height: 600,
      minWidth: 350,
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

export const createWindow = (options: BrowserWindowConstructorOptions = {}): MainWindow => new MainWindow(options);