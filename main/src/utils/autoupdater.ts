import { autoUpdater } from "electron-updater";
import Log from "./log";


autoUpdater.autoDownload = true;
autoUpdater.logger = Log;
autoUpdater.autoInstallOnAppQuit = true;


export { autoUpdater };