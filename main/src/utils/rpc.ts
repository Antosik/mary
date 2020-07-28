/* eslint-disable @typescript-eslint/unbound-method */
import { BrowserWindow, IpcMainInvokeEvent, IpcMainEvent } from "electron";

import { ipcMain } from "electron";

import { EventsWithInvoke } from "@mary-main/utils/eventsExtended";
import { logDebug } from "@mary-main/utils/log";
import { Result } from "@mary-shared/utils/result";
import { isNotExists } from "@mary-shared/utils/typeguards";


export class MainRPC extends EventsWithInvoke implements IDestroyable {

  #id: string;
  #window: BrowserWindow;

  constructor(id: string, window: BrowserWindow) {
    super();

    this.#id = id;
    this.#window = window;

    ipcMain.on(this.#id, this._handleFlow);
    ipcMain.handle(this.#id, this._handleInvoke);
  }


  // #region Main
  public send(event: string, data: RPCDataType = undefined): void {
    this.#window.webContents.send(this.#id, { event, data });
  }
  // #endregion Main


  // #region Flow handlers
  private _handleFlow = (_: IpcMainEvent, { event, data }: { event: string, data: unknown }): void => {
    super.emit(event, data);
  };

  private _handleInvoke = (_: IpcMainInvokeEvent, { event, data }: { event: string, data: unknown[] }): RPCDataType => {
    const handler = this.handlers.get(event);

    if (isNotExists(handler)) {
      logDebug(`Internal: unknown event - ${event}`);
      return Result.create()
        .setStatus("error")
        .setNotification("Внутренняя ошибка приложения");
    }

    return typeof data === "undefined"
      ? handler()
      : handler(...data);
  };
  // #endregion


  public destroy(): void {
    super.destroy();

    this.removeAllListeners();
    this.#window.webContents.removeAllListeners();

    ipcMain.removeHandler(this.#id);
    ipcMain.removeAllListeners(this.#id);
  }
}