/* eslint-disable @typescript-eslint/unbound-method */
import type { MainRPC } from "@mary-main/utils/rpc";
import type { LiveClientService } from "@mary-main/services/live";

import { gameStore } from "@mary-main/store/game";
import { Result } from "@mary-shared/utils/result";


export class LiveClientController {

  private _rpc: MainRPC;
  private _liveClientService: LiveClientService;

  public constructor(
    rpc: MainRPC,
    liveClientService: LiveClientService
  ) {
    this._rpc = rpc;
    this._liveClientService = liveClientService;

    // Event handlers binding
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    this._onLiveConnect = this._onLiveConnect.bind(this);
    this._onLiveDisconnect = this._onLiveDisconnect.bind(this);
    this._onLivePlayers = this._onLivePlayers.bind(this);
    this._onLiveEvents = this._onLiveEvents.bind(this);
    this._handleLiveConnect = this._handleLiveConnect.bind(this);
    this._handleLiveDisconnect = this._handleLiveDisconnect.bind(this);
    this._handleLiveGame = this._handleLiveGame.bind(this);
    this._handleLivePlayers = this._handleLivePlayers.bind(this);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  }


  public handleEvents(): this {
    return this
      ._handleLiveClientEvents()
      ._handleRPCEvents();
  }

  // #region LCU Events Handling (Inner)
  private _handleLiveClientEvents(): this {
    this._liveClientService.addListener("live:connected", this._onLiveConnect);
    this._liveClientService.addListener("live:disconnected", this._onLiveDisconnect);
    this._liveClientService.addListener("live:players", this._onLivePlayers);
    this._liveClientService.addListener("live:events", this._onLiveEvents);

    return this;
  }

  private async _onLiveConnect() {
    this._rpc.send("live:connected");

    const [game, players] = await Promise.all([
      this._liveClientService.getGameStats(),
      this._liveClientService.getPlayersList()
    ]);

    gameStore.set("gameMode", game.gameMode);
    this._rpc.send("live:game", game);

    gameStore.set("players", players);
    this._rpc.send("live:players", players);
  }

  private _onLiveDisconnect() {
    gameStore.clear();
    this._rpc.send("live:disconnected");
  }

  private _onLivePlayers(data: ILiveAPIPlayer[]) {
    const players = data.map(this._liveClientService.converterPlayerToInternal);

    gameStore.set("players", players);
    this._rpc.send("live:players", players);
  }

  private _onLiveEvents({ Events: events }: { Events: ILiveAPIGameEvent[] }) {
    const oldEvents = gameStore.get("events") ?? [];
    const oldEventsIds = oldEvents.map(event => event.EventID);
    const newEvents = events.filter(event => !oldEventsIds.includes(event.EventID));

    gameStore.set("events", events);
    this._rpc.send("live:events", newEvents);
  }
  // #endregion LCU Events Handling (Inner)


  // #region RPC Events Handling (Outer)
  private _handleRPCEvents(): this {

    this._rpc.setHandler("live:connect", this._handleLiveConnect);
    this._rpc.setHandler("live:disconnect", this._handleLiveDisconnect);
    this._rpc.setHandler("live:game", this._handleLiveGame);
    this._rpc.setHandler("live:players", this._handleLivePlayers);

    return this;
  }

  private _handleLiveConnect() {
    return Result.resolve(this._liveClientService.start());
  }

  private _handleLiveDisconnect() {
    return Result.create(this._liveClientService.stop(), "success");
  }

  private async _handleLiveGame() {
    return Result.resolve(this._liveClientService.getGameStats());
  }

  private async _handleLivePlayers() {
    return Result.resolve(this._liveClientService.getPlayersList());
  }
  // #endregion RPC Events Handling (Outer)
}

