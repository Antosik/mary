/* eslint-disable @typescript-eslint/unbound-method */
import type { IpcRendererEvent } from "electron";
import type { Result } from "@mary-shared/utils/result";

import { ipcRenderer } from "electron";
import { EventEmitter } from "events";



export class ClientRPC extends EventEmitter implements IClientRPC, IDestroyable {
  #id: string;

  constructor(id: string) {
    super();

    this.#id = id;

    this.handleFlow = this.handleFlow.bind(this);   // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    ipcRenderer.on(this.#id, this.handleFlow);

    this.emit("ready");
  }


  // #region Main
  public send(event: TRPCHandlerEvent, ...data: unknown[]): void {
    return ipcRenderer.send(this.#id, { event, data });// TODO: Error handling
  }

  public async invoke<T>(event: TRPCHandlerEvent, ...data: unknown[]): Promise<T | undefined> {
    const response = await ipcRenderer.invoke(this.#id, { event, data }) as Result<T>;
    return response?.data; // TODO: Error handling
  }

  public destroy(): void {
    this.removeAllListeners();
    ipcRenderer.removeListener(this.#id, this.handleFlow);
  }
  // #endregion


  // #region Flow handlers
  private handleFlow(_: IpcRendererEvent, { event, data }: { event: string, data: Result<unknown> }): void {
    super.emit(event, data?.data); // TODO: Error handling
  }
  // #endregion
}