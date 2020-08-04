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

    this.setMaryMenu(menuItems);
    this.setToolTip("Mary");
  }

  public setMaryMenu(menuItems: MenuItemConstructorOptions[]): void {
    this.setContextMenu(
      Menu.buildFromTemplate(menuItems)
    );
  }
}