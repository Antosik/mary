/* eslint-disable @typescript-eslint/unbound-method */
import { EventEmitter } from "events";

import { LiveClientAPI } from "@mary-main/connectors/LiveClientAPI";
import { isExists, isNotExists } from "@mary-shared/utils/typeguards";


export class LiveClientAPIPing extends EventEmitter {
  private static PING_INTERVAL = 3e3;

  #pingTimer?: NodeJS.Timer;
  #isConnected = false;

  constructor() {
    super();

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    this._ping = this._ping.bind(this);
  }


  // #region Getters & Setters
  public get isConnected(): boolean {
    return this.#isConnected;
  }
  // #endregion Getters & Setters


  // #region Socket
  public async start(): Promise<void> {
    if (this.#isConnected) {
      this.emit("reconnected");
      return;
    }

    await this._ping();
    this._setPingTimer("on");
  }

  public stop(): void {
    this._setPingTimer("off");
  }
  // #endregion Socket


  // #region Connect handlers
  private _setPingTimer(mode: "on" | "off"): void {
    if (isExists(this.#pingTimer) && mode === "off") {
      clearInterval(this.#pingTimer);
      this.#pingTimer = undefined;
    } else if (isNotExists(this.#pingTimer) && mode === "on") {
      this.#pingTimer = setInterval(this._ping, LiveClientAPIPing.PING_INTERVAL);
    }
  }

  private async _ping(): Promise<void> {
    if (this.#isConnected) {
      await Promise.all([
        this._pingEndpoint("players", LiveClientAPI.getPlayersList),
        this._pingEndpoint("events", LiveClientAPI.getGameEvents),
      ]);
    } else {
      await this._pingEndpoint("game", LiveClientAPI.getGameStats);
    }
  }

  private async _pingEndpoint(eventName: string, handler: () => Promise<unknown>): Promise<void> {
    await handler()
      .then((data) => {
        if (!this.isConnected) {
          this.emit("connected");
          this.#isConnected = true;
        }
        this.emit(eventName, data);
      })
      .catch(() => {
        if (this.isConnected) {
          this.emit("disconnected");
          this.#isConnected = false;
        }
      });
  }
  // #endregion


  // #region Cleanup
  public destroy(): void {
    this._setPingTimer("off");
  }
  // #endregion Cleanup

}