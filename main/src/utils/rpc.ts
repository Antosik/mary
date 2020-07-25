/* eslint-disable @typescript-eslint/unbound-method */
import type { BrowserWindow, IpcMainInvokeEvent } from "electron";

import { ipcMain } from "electron";
import { EventEmitter } from "events";

import { logDebug } from "@mary-main/utils/log";
import { Result } from "@mary-shared/utils/result";
import { flowId } from "@mary-shared/utils/rpc";
import { isNotExists } from "@mary-shared/utils/typeguards";


type RPCDataType = void | Promise<void> | IResult<unknown> | Promise<IResult<unknown>>;


export class MainRPC extends EventEmitter {

  public static init(): void {
    ipcMain.handle(MainRPC._id, MainRPC._handleInvoke);
  }

  public static setHandler(event: string, handler: TRPCHandlerFunc): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    this._handlers.set(event, handler);
  }

  public static destroy(): void {
    this._handlers.clear();

    ipcMain.removeHandler(this._id);
  }

  private static _id: string = flowId;
  private static _handlers: Map<string, TRPCHandlerFunc> = new Map<string, TRPCHandlerFunc>();

  // #region Flow handlers
  private static _handleInvoke(_: IpcMainInvokeEvent, { event, data }: { event: string, data: unknown[] }): RPCDataType {
    const handler = MainRPC._handlers.get(event);

    if (isNotExists(handler)) {
      logDebug(`Internal: unknown event - ${event}`);
      return Result.create()
        .setStatus("error")
        .setNotification("Внутренняя ошибка приложения");
    }

    return typeof data === "undefined"
      ? handler()
      : handler(...data);
  }
  // #endregion


  #id: string = flowId;
  #window: BrowserWindow;

  constructor(window: BrowserWindow) {
    super();

    this.#window = window;
  }

  public get wc(): Electron.WebContents {
    return this.#window.webContents;
  }


  // #region Main
  public send(event: string, data: RPCDataType = undefined): void {
    this.wc.send(this.#id, { event, data });
  }

  public destroy(): void {
    this.removeAllListeners();
    this.wc.removeAllListeners();
  }
  // #endregion
}

MainRPC.init();

export const createMainRPC = (window: BrowserWindow): MainRPC => new MainRPC(window);