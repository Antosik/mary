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

  protected _game?: Game;
  protected _liveClientApiPing: LiveClientAPIPing;

  protected constructor() {

    this._liveClientApiPing = new LiveClientAPIPing();

    this
      ._handleLiveGameAPIEvents()
      ._handleInternalEvents();
  }


  // #region Events handling zone
  private _handleLiveGameAPIEvents() {

    this._liveClientApiPing.addListener("connected", this._onLiveConnected);
    this._liveClientApiPing.addListener("reconnected", this._onLiveReconnected);
    this._liveClientApiPing.addListener("disconnected", this._onLiveDisconnected);
    this._liveClientApiPing.addListener("players", this._onLivePlayers);
    this._liveClientApiPing.addListener("events", this._onLiveEvents);

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

    if (isNotExists(this._game)) {
      await this._initGame();
      this._sendMeta();
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
    if (isNotExists(this._game)) {
      return;
    }

    this._game.setPlayers(players);

    const msg: TMessageContainer = {
      event: "live:players", data: Result.create(
        Array.from(this._game.players.values()).map(p => p.rawValue),
        "success"
      )
    };

    Events.emit("mary:send", msg);
  };

  private _onLiveEvents = (events: ILiveAPIGameEvent[]) => {
    if (isExists(this._game)) {
      this._game.setEvents(events);
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

    if (new Date() >= cooldown.rawValue.end && isExists(this._game)) {
      this._game.removeObjectCooldown(cooldown.id);
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
      { event: "live:me", data: Result.create(this._game!.mePlayer?.rawValue) },
      {
        event: "live:players",
        data: Result.create(
          Array.from(this._game!.players.values()).map(p => p.rawValue),
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

    this._game = new Game(myName, gameData);
    this._game.setPlayers(players);
    this._game.setEvents(events);
  }

  protected _getPlayer(summonerName: string): Player {

    if (isNotExists(this._game)) {
      throw new Error("Game not started");
    }

    const player = this._game.players.get(summonerName);
    if (isNotExists(player)) {
      throw new Error("Player not found");
    }

    return player;
  }

  private _resetGame(): void {
    if (isExists(this._game)) {
      this._game.destroy();
      this._game = undefined;
    }
  }
  // #endregion Utils zone


  // #region Cleanup zone
  public destroy(): void {
    this._liveClientApiPing.removeListener("connected", this._onLiveConnected);
    this._liveClientApiPing.removeListener("reconnected", this._onLiveReconnected);
    this._liveClientApiPing.removeListener("disconnected", this._onLiveDisconnected);
    this._liveClientApiPing.removeListener("players", this._onLivePlayers);
    this._liveClientApiPing.removeListener("events", this._onLiveEvents);

    Events.removeListener("data:cooldown:player", this._onInternalCooldownPlayer);
    Events.removeListener("data:cooldown:object", this._onInternalCooldownObject);

    this._liveClientApiPing.destroy();
    this._resetGame();
  }
  // #endregion Cleanup zone
}
