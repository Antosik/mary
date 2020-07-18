import type { BrowserWindowConstructorOptions } from "electron";

import { BrowserWindow, screen } from "electron";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";


export class Window extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions = {}) {
    const htmlPath = isDev ? resolvePath("target", "index.html") : joinPath(process.resourcesPath, "index.html");
    const preloadPath = isDev ? resolvePath("target/renderer", "preload.js") : joinPath(process.resourcesPath, "renderer", "preload.js");

    const { width, height } = screen.getPrimaryDisplay().size;

    const settings: BrowserWindowConstructorOptions = {
      title: "Mary",
      width,
      height,
      backgroundColor: "#00000000",
      opacity: 1,

      resizable: false,
      transparent: true,
      frame: false,
      hasShadow: false,
      skipTaskbar: true,

      webPreferences: {
        nodeIntegration: true,
        preload: preloadPath
      },
      ...options
    };
    super(settings);

    this.setMenuBarVisibility(false);
    void this.loadFile(htmlPath);

    this.webContents.on("did-finish-load", () => {
      this.show();
      this.focus();

      this.setIgnoreMouseEvents(true, {
        forward: true
      });

      this.setAlwaysOnTop(true, "pop-up-menu");
      this.setVisibleOnAllWorkspaces(true);
      this.setFullScreenable(false);
    });

    this.once("ready-to-show", () => {
      this.show();
    });

  }
}

export const createWindow = (options: BrowserWindowConstructorOptions = {}): Window => new Window(options);