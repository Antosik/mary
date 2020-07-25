/* eslint-disable @typescript-eslint/unbound-method */
import type { IpcRendererEvent } from "electron";
import type { Result } from "@mary-shared/utils/result";

import { ipcRenderer } from "electron";
import { EventEmitter } from "events";

import { flowId } from "@mary-shared/utils/rpc";


export class ClientRPC extends EventEmitter {
  private _id: string = flowId;

  constructor() {
    super();

    this.handleFlow = this.handleFlow.bind(this);   // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    ipcRenderer.on(this._id, this.handleFlow);

    this.emit("ready");
  }


  // #region Main
  public send(event: string, data: unknown = undefined): void {
    ipcRenderer.send(this._id, { event, data });
  }

  public async invoke<T>(event: TRPCHandlerEvent, ...data: unknown[]): Promise<T | undefined> {
    const response = await ipcRenderer.invoke(this._id, { event, data }) as Result<T>;
    return response?.data; // TODO: Error handling
  }

  public destroy(): void {
    this.removeAllListeners();
    ipcRenderer.removeListener(this._id, this.handleFlow);
  }
  // #endregion


  // #region Flow handlers
  private handleFlow(_: IpcRendererEvent, { event, data }: { event: string, data: Result<unknown> }): void {
    super.emit(event, data?.data); // TODO: Error handling
  }
  // #endregion
}

export const rpc = new ClientRPC();