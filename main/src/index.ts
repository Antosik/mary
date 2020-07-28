import { app } from "electron";

import { Mary } from "./app/mary";
import { logError } from "./utils/log";
import "./utils/security";


if (!app.requestSingleInstanceLock()) {
  app.exit();
}

let mary: Mary;

app.on("ready", () => {
  mary = Mary.launch();
});

app.on("before-quit", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    mary.destroy();
  }
});

app.on("window-all-closed", (e: Event) => {
  e.preventDefault();
});

process.on("uncaughtException", (error) => {
  logError("[UNCAUGHT]: ", error);
});
