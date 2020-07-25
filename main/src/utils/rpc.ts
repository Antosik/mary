/* eslint-disable @typescript-eslint/unbound-method */
import type { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from "electron";

import { ipcMain } from "electron";
import { EventEmitter } from "events";

import { logDebug } from "@mary-main/utils/log";
import { Result } from "@mary-shared/utils/result";
import { flowId } from "@mary-shared/utils/rpc";
import { isNotExists } from "@mary-shared/utils/typeguards";


type RPCDataType = void | Promise<void> | IResult<unknown> | Promise<IResult<unknown>>;


export class MainRPC extends EventEmitter {
  private _id: string = flowId;
  private _window: BrowserWindow;
  private _handlers: Map<string, TRPCHandlerFunc>;

  constructor(window: BrowserWindow) {
    super();

    this._window = window;
    this._handlers = new Map<string, TRPCHandlerFunc>();

    this.handleFlow = this.handleFlow.bind(this);       // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    this.handleInvoke = this.handleInvoke.bind(this);   // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    ipcMain.on(this._id, this.handleFlow);
    ipcMain.handle(this._id, this.handleInvoke);
  }

  public get wc(): Electron.WebContents {
    return this._window.webContents;
  }


  // #region Main
  public send(event: string, data: RPCDataType = undefined): void {
    this.wc.send(this._id, { event, data });
  }

  public setHandler(event: string, handler: TRPCHandlerFunc): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    this._handlers.set(event, handler);
  }

  public destroy(): void {
    this._handlers.clear();

    this.removeAllListeners();
    this.wc.removeAllListeners();

    ipcMain.removeListener(this._id, this.handleFlow);
    ipcMain.removeHandler(this._id);
  }
  // #endregion


  // #region Flow handlers
  private handleFlow(_: IpcMainEvent, { event, data }: { event: string, data: unknown }): void {
    super.emit(event, data);
  }

  private handleInvoke(_: IpcMainInvokeEvent, { event, data }: { event: string, data: unknown[] }): RPCDataType {
    const handler = this._handlers.get(event);

    if (isNotExists(handler)) {
      logDebug(`Internal: unknown event - ${event}`);
      return Result.create()
        .setStatus("error")
        .setNotification("Внутренняя ошибка приложения");
    }

    return handler(...data);
  }
  // #endregion
}

export const createMainRPC = (window: BrowserWindow): MainRPC => new MainRPC(window);