import { Tray } from "electron";
import { app } from "electron";

import { Mary } from "./client";
import { createTrayIcon } from "./ui/tray";
import { Window } from "./ui/window";
import { logError } from "./utils/log";
import "./utils/security";


const gotTheLock = app.requestSingleInstanceLock();

let window: Window;
let trayIcon: Tray;

if (!gotTheLock) {
  app.quit();

} else {

  app.on("ready", () => {
    window = new Window();
    trayIcon = createTrayIcon(window);

    Mary.mount(window);
  });

  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
      trayIcon.destroy();
    }
  });
}

process.on("uncaughtException", (error) => {
  logError("[UNCAUGHT]: ", error);
});
