import type { Player } from "@mary-main/model/player";
import type { PlayerCooldown } from "@mary-main/model/playercooldown";
import type { ObjectCooldown } from "@mary-main/model/objectcooldown";

import { LiveClientAPI } from "@mary-main/connectors/LiveClientAPI";
import { LiveClientAPIPing } from "@mary-main/connectors/LiveClientAPI/ping";
import { Game } from "@mary-main/model/game";
import { Events } from "@mary-main/utils/events";
import { Result } from "@mary-shared/utils/result";
import { isExists, isNotExists } from "@mary-shared/utils/typeguards";


export class MaryInternal implements IDestroyable {

  #game?: Game;
  #liveClientApiPing: LiveClientAPIPing;

  protected constructor() {

    this.#liveClientApiPing = new LiveClientAPIPing();

    this
      ._handleLiveGameAPIEvents()
      ._handleInternalEvents();
  }

  protected get _liveClientApiPing(): LiveClientAPIPing {
    return this.#liveClientApiPing;
  }

  protected get _game(): Game | undefined {
    return this.#game;
  }


  // #region Events handling zone
  private _handleLiveGameAPIEvents() {

    this.#liveClientApiPing.addListener("connected", this._onLiveConnected);
    this.#liveClientApiPing.addListener("reconnected", this._onLiveReconnected);
    this.#liveClientApiPing.addListener("disconnected", this._onLiveDisconnected);
    this.#liveClientApiPing.addListener("players", this._onLivePlayers);
    this.#liveClientApiPing.addListener("events", this._onLiveEvents);

    return this;
  }

  private _handleInternalEvents() {

    Events.addListener("data:cooldown:player", this._onInternalCooldownPlayer);
    Events.addListener("data:cooldown:object", this._onInternalCooldownObject);

    return this;
  }
  // #endregion Events handling zone


  // #region LiveAPI Events Handlers
  private _onLiveConnected = async () => {

    this._resetGame();

    await this._initGame();

    this._sendConnected();
    this._sendMeta();
  };

  private _onLiveReconnected = async () => {

    if (isNotExists(this.#game)) {
      await this._initGame();
    }

    this._sendConnected();
    this._sendMeta();
  };

  private _onLiveDisconnected = () => {

    this._resetGame();

    Events.emit(
      "mary:send",
      { event: "live:disconnected" } as TMessageContainer
    );
  };

  private _onLivePlayers = (players: ILiveAPIPlayer[]) => {
    if (isNotExists(this.#game)) {
      return;
    }

    this.#game.setPlayers(players);

    const msg: TMessageContainer = {
      event: "live:players", data: Result.create(
        Array.from(this.#game.players.values()).map(p => p.rawValue),
        "success"
      )
    };

    Events.emit("mary:send", msg);
  };

  private _onLiveEvents = (events: ILiveAPIGameEvent[]) => {
    if (isExists(this.#game)) {
      this.#game.setEvents(events);
    }
  };
  // #endregion LiveAPI Events Handlers


  // #region Internal Events Handlers
  private _onInternalCooldownPlayer = (cooldown: PlayerCooldown) => {

    if (new Date() >= cooldown.rawValue.end) {
      const player = this._getPlayer(cooldown.summonerName);
      if (isExists(player)) {
        player.removeCooldown(cooldown.target);
      }
    }

    Events.emit(
      "mary:send",
      {
        event: "cooldown:player:ping",
        data: Result.create(cooldown.rawValue, "success")
      } as TMessageContainer
    );
  };

  private _onInternalCooldownObject = (cooldown: ObjectCooldown) => {

    if (new Date() >= cooldown.rawValue.end && isExists(this.#game)) {
      this.#game.removeObjectCooldown(cooldown.id);
    }

    Events.emit(
      "mary:send",
      {
        event: "cooldown:object:ping",
        data: Result.create(cooldown.rawValue, "success")
      } as TMessageContainer
    );
  };
  // #endregion Internal Events Handlers


  // #region Events utils zone
  private _sendConnected(): void {
    Events.emit(
      "mary:send",
      { event: "live:connected" } as TMessageContainer
    );
  }

  private _sendMeta(): void {

    const msg: TMessageContainer[] = [
      { event: "live:me", data: Result.create(this.#game!.mePlayer?.rawValue) },
      {
        event: "live:players",
        data: Result.create(
          Array.from(this.#game!.players.values()).map(p => p.rawValue),
          "success"
        )
      },
    ];

    Events.emit("mary:send", msg);
  }
  // #endregion Events utils zone


  // #region Utils zone
  private async _initGame(): Promise<void> {

    const [gameData, myName, players, events] = await Promise.all([
      LiveClientAPI.getGameStats(),
      LiveClientAPI.getActivePlayerName(),
      LiveClientAPI.getPlayersList(),
      LiveClientAPI.getGameEvents()
    ]);

    this.#game = new Game(myName, gameData);
    this.#game.setPlayers(players);
    this.#game.setEvents(events);
  }

  protected _getPlayer(summonerName: string): Player {

    if (isNotExists(this.#game)) {
      throw new Error("Game not started");
    }

    const player = this.#game.players.get(summonerName);
    if (isNotExists(player)) {
      throw new Error("Player not found");
    }

    return player;
  }

  private _resetGame(): void {
    if (isExists(this.#game)) {
      this.#game.destroy();
      this.#game = undefined;
    }
  }
  // #endregion Utils zone


  // #region Cleanup zone
  public destroy(): void {
    this.#liveClientApiPing.removeListener("connected", this._onLiveConnected);
    this.#liveClientApiPing.removeListener("reconnected", this._onLiveReconnected);
    this.#liveClientApiPing.removeListener("disconnected", this._onLiveDisconnected);
    this.#liveClientApiPing.removeListener("players", this._onLivePlayers);
    this.#liveClientApiPing.removeListener("events", this._onLiveEvents);

    Events.removeListener("data:cooldown:player", this._onInternalCooldownPlayer);
    Events.removeListener("data:cooldown:object", this._onInternalCooldownObject);

    this.#liveClientApiPing.destroy();
    this._resetGame();
  }
  // #endregion Cleanup zone
}
