import type { Server as HttpServer } from "http";
import type { AddressInfo } from "net";
import type { Polka, Middleware } from "polka";
import type WebSocket from "ws";

import { json } from "body-parser";
import isDev from "electron-is-dev";
import http from "http";
import { join as joinPath, resolve as resolvePath } from "path";
import polka from "polka";
import polkaSend from "@polka/send-type";
import sirv from "sirv";
import { Server as WebSocketServer } from "ws";

import { EventsWithInvoke } from "@mary-main/utils/eventsExtended";
import { getMyIPAddress } from "@mary-main/utils/lan";
import { Set_toJSON } from "@mary-shared/utils/serialize";
import { isNotExists } from "@mary-shared/utils/typeguards";
import { logDebug } from "@mary-main/utils/log";


export class MaryServer implements IMaryOutput, IDestroyable {

  private static getPublicPath() {
    return isDev ? resolvePath("target") : joinPath(process.resourcesPath);
  }

  #ip: string[];
  #events: EventsWithInvoke;

  #server: HttpServer;
  #polka: Polka;
  #wsServer: WebSocketServer;

  constructor() {

    this.#ip = [];
    this.#events = new EventsWithInvoke();

    this.#server = http.createServer();
    this.#server.on("listening", this._onServerListening);

    this.#polka = polka({ server: this.#server });
    this._initPolka();

    this.#wsServer = new WebSocketServer({ server: this.#server });
    this.#wsServer.on("connection", this._onWsConnection);
  }


  // #region Getters & Setters
  public get events(): EventsWithInvoke {
    return this.#events;
  }
  // #endregion Getters & Setters


  // #region Main
  public start(): void {
    this.#polka.listen({ host: "0.0.0.0", port: 0 });
  }

  public send(container: TMessageContainer): void {
    this.#wsServer.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(container, Set_toJSON));
      }
    });
  }
  // #endregion Main


  // #region Polka
  private _initPolka() {
    this.#polka
      .use(sirv(MaryServer.getPublicPath()))
      .use(json());
    this.#polka.get("/ping", this._onRoutePingGet);
    this.#polka.post("/invoke", this._onRouteInvokePost);
  }

  private _onRoutePingGet: Middleware = (_, res) => {
    return res.end("pong");
  };

  private _onRouteInvokePost: Middleware = async (req, res) => {
    const { event, data } = req.body as { event: string, data: any[] };
    const handler = this.#events.getHandler(event);

    if (isNotExists(handler)) {
      return polkaSend(res, 200, {}, { "Content-Type": "application/json" });
    }

    const result = typeof data === "undefined"
      ? await handler()
      : await handler(...data);

    return polkaSend(res, 200, result ?? {}, { "Content-Type": "application/json" });
  };
  // #endregion Polka


  // #region WebSocket
  private _onServerListening = async () => {
    const { port } = this.#server.address() as AddressInfo;
    const myAddress = await getMyIPAddress();

    this.#ip = myAddress.map(address => `${address}:${port}`);

    this.#events.emit("server:ip", this.#ip);

    const ips = myAddress.map(address => `${address}:${port}`).toString();
    logDebug(`"[MaryServer]" IPs: ${ips}`);
  };

  private _onWsMessage = async (message: string) => {
    const { event, data } = JSON.parse(message) as { event: string, data: unknown[] };
    const handler = this.#events.getHandler(event);

    if (isNotExists(handler)) {
      this.events.emit(event, data);
      return;
    }

    if (typeof data === "undefined") {
      await handler();
    } else {
      await handler(...data);
    }
  };

  private _onWsConnection = (socket: WebSocket) => {
    socket.on("message", this._onWsMessage);
  };
  // #endregion WebSocket


  // #region Cleanup
  public destroy(): void {
    this.#server.close();
    this.#wsServer.close();
  }
  // #endregion Cleanup
}