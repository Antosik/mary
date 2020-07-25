import { app } from "electron";

import { Mary } from "./app/client";
import { MainWindow } from "./ui/main";
import { logError } from "./utils/log";
import "./utils/security";


const gotTheLock = app.requestSingleInstanceLock();

let window: MainWindow;
let mary: Mary;

if (!gotTheLock) {
  app.quit();

} else {

  app.on("ready", () => {
    window = new MainWindow();
    mary = Mary.mount(window);
  });

  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      mary.destroy();
      app.quit();
    }
  });
}

process.on("uncaughtException", (error) => {
  logError("[UNCAUGHT]: ", error);
});
