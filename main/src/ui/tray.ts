import { Tray, Menu, app } from "electron";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";

import { Window } from "./window";


export function createTrayIcon(window: Window): Tray {

  const trayIconPath = isDev ? resolvePath("target", "tray-icon.png") : joinPath(process.resourcesPath, "tray-icon.png");
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "Закрыть",
      click: () => {
        app.exit();
      }
    }
  ]);

  const tray = new Tray(trayIconPath);

  tray.addListener("click", () => {
    window.focus();
  });
  tray.setToolTip("Mary");
  tray.setContextMenu(trayMenu);

  return tray;
}