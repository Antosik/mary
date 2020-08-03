import type { MenuItemConstructorOptions } from "electron";

import { Tray, Menu, } from "electron";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";


export class MaryTray extends Tray {

  private static getTrayIcon() {
    return isDev ? resolvePath("target", "tray-icon.png") : joinPath(process.resourcesPath, "tray-icon.png");
  }

  constructor(menuItems: MenuItemConstructorOptions[]) {
    super(MaryTray.getTrayIcon());
    this._setMaryMenu(menuItems);
  }

  private _setMaryMenu(menuItems: MenuItemConstructorOptions[]) {

    const contextMenu = Menu.buildFromTemplate(menuItems);

    this.setToolTip("Mary");
    this.setContextMenu(contextMenu);
  }
}