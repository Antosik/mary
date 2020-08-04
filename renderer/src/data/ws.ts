/* eslint-disable @typescript-eslint/unbound-method */
import type { Result } from "@mary-shared/utils/result";

import { EventEmitter } from "events";

import { JSONDate_toDate } from "@mary-shared/utils/serialize";
import { isNotExists, isExists } from "@mary-shared/utils/typeguards";


export class ClientRPC extends EventEmitter implements IClientRPC, IDestroyable {

  private static readonly PING_INTERVAL = 1.5e3;

  #ip: string;

  #ws?: WebSocket;
  #onOpen?: TAnyFunc;
  #pingTimer?: NodeJS.Timer;

  constructor() {
    super();

    this.handleFlow = this.handleFlow.bind(this);   // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    this.#ip = window.location.host;
    this._connect();
  }

  private _connect() {
    if (this.#ws?.readyState === WebSocket.OPEN || this.#ws?.readyState === WebSocket.CONNECTING) {
      this.#ws.close();
    }

    this.#ws = new WebSocket(`ws://${this.#ip}`);

    this.#ws.addEventListener("message", this.handleFlow);
    if (isExists(this.#onOpen)) {
      this.#ws.addEventListener("open", this.#onOpen);
    }

    if (isNotExists(this.#pingTimer)) {
      this.#pingTimer = setInterval(this._ping, ClientRPC.PING_INTERVAL);
    }
  }

  // #region Main
  public setOpenHandler(func: TAnyFunc): void {
    this.#onOpen = func;
  }

  public send(event: TRPCHandlerEvent, ...data: unknown[]): void {

    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify({ event, data }));
    }
  }

  public async invoke<T>(event: TRPCHandlerEvent, ...data: unknown[]): Promise<T | undefined> {

    try {
      const json = await fetch(`http://${this.#ip}/invoke`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ event, data })
      }).then(res => res.json()) as Result<T>;
      return json?.data;
    } catch (e) {
      return undefined;
    }
  }

  private _ping = (): void => {
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify({ event: "ping" }));
    } else if (this.#ws?.readyState !== WebSocket.CONNECTING) {
      this._connect();
      console.log("trying to reconnect");
    }
  };
  // #endregion Main


  // #region Flow handlers
  private handleFlow(e: MessageEvent): void {
    if (isNotExists(e.data)) {
      return;
    }

    const { event, data } = JSON.parse(e.data, JSONDate_toDate) as TMessageContainer;
    this.emit(event, data?.data); // TODO: Error handling
  }
  // #endregion Flow handlers


  // #region Cleanup
  public destroy(): void {

    this.removeAllListeners();

    if (isExists(this.#pingTimer)) {
      clearInterval(this.#pingTimer);
    }

    if (isExists(this.#ws)) {
      this.#ws.removeEventListener("message", this.handleFlow);
      if (this.#ws?.readyState !== WebSocket.CLOSED || this.#ws?.readyState !== WebSocket.CLOSING) {
        this.#ws?.close();
      }
    }
  }
  // #endregion Cleanup
}

export const rpc = new ClientRPC();