/* eslint-disable @typescript-eslint/unbound-method */
import { Agent as httpsAgent } from "https";

import axios from "axios";
import { EventEmitter } from "events";

import { isExists, isNotExists } from "@mary-shared/utils/typeguards";


export class LiveClientAPIPing extends EventEmitter {
  private static ENDPOINT = "https://127.0.0.1:2999/liveclientdata";
  private static PING_INTERVAL = 3e3;
  private _pingTimer?: NodeJS.Timer;

  private _isConnected = false;

  public get isConnected(): boolean {
    return this._isConnected;
  }

  constructor() {
    super();

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    this._ping = this._ping.bind(this);
  }


  // #region Socket
  public async start(): Promise<void> {
    await this._ping();
    this._setPingTimer("on");
  }

  public stop(): void {
    this._setPingTimer("off");
  }
  // #endregion Socket


  // #region Connect handlers
  private _setPingTimer(mode: "on" | "off"): void {
    if (isExists(this._pingTimer) && mode === "off") {
      clearInterval(this._pingTimer);
      this._pingTimer = undefined;
    } else if (isNotExists(this._pingTimer) && mode === "on") {
      this._pingTimer = setInterval(this._ping, LiveClientAPIPing.PING_INTERVAL);
    }
  }

  private async _pingEndpoint(path: string, eventName: string): Promise<void> {
    await axios
      .get(`${LiveClientAPIPing.ENDPOINT}/${path}`, { httpsAgent: new httpsAgent({ rejectUnauthorized: false }) })
      .then(({ data }) => {
        if (!this.isConnected) {
          this.emit("live:connected");
          this._isConnected = true;
        }
        this.emit(eventName, data);
      })
      .catch(() => {
        if (this.isConnected) {
          this.emit("live:disconnected");
          this._isConnected = false;
        }
      });
  }

  private async _ping(): Promise<void> {
    await Promise.all([
      this._pingEndpoint("playerlist", "live:players"),
      this._pingEndpoint("eventdata", "live:events"),
    ]);
  }
  // #endregion
}