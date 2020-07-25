import type { MainWindow } from "@mary-main/ui/main";
import type { Cooldown } from "@mary-main/model/cooldown";
import type { Player } from "@mary-main/model/player";

import { LiveClientAPI } from "@mary-main/connectors/LiveClientAPI";
import { LiveClientAPIPing } from "@mary-main/connectors/LiveClientAPI/ping";
import { Game } from "@mary-main/model/game";
import { Events } from "@mary-main/utils/events";
import { MainRPC } from "@mary-main/utils/rpc";
import { Result } from "@mary-shared/utils/result";
import { isExists, isNotExists } from "@mary-shared/utils/typeguards";
import { PlayerCooldown } from "@mary-main/model/playercooldown";
import { ObjectCooldown } from "@mary-main/model/objectcooldown";


export class Mary {

  #game?: Game;

  #liveClientApiPing: LiveClientAPIPing;

  #window: MainWindow;
  #rpc: MainRPC;

  public static mount(window: MainWindow): Mary {
    return new this(window);
  }

  private constructor(window: MainWindow) {

    this.#window = window;
    this.#rpc = new MainRPC(this.#window);

    this.#liveClientApiPing = new LiveClientAPIPing();

    this
      ._handleLiveGameAPIEvents()
      ._handleInternalEvents()
      ._handleRPCEvents();
  }

  private _handleInternalEvents() {
    Events.on("data:cooldown:player", (cooldown: PlayerCooldown) => {
      if (new Date() >= cooldown.rawValue.end) {
        const player = this._getPlayer(cooldown.summonerName);
        if (isExists(player)) {
          player.removeCooldown(cooldown.target);
        }
      }
      if (new Date() >= cooldown.rawValue.end) {
        cooldown.destroy();

      }
      this.#rpc.send("cooldown:player:ping", Result.create(cooldown.rawValue, "success"));
    });
    Events.on("data:cooldown:object", (cooldown: ObjectCooldown) => {
      if (new Date() >= cooldown.rawValue.end && isExists(this.#game)) {
        this.#game.removeObjectCooldown(cooldown.id);
      }
      this.#rpc.send("cooldown:object:ping", Result.create(cooldown.rawValue, "success"));
    });

    return this;
  }

  private _handleRPCEvents() {

    this.#rpc.setHandler("live:connect", async () => {
      await this.#liveClientApiPing.start();
    });

    this.#rpc.setHandler("cooldowns:object:get", () => {
      const cooldowns = isExists(this.#game)
        ? this.#game.getObjectsCooldowns()
        : [];
      return Result.create(cooldowns, "success");
    });

    this.#rpc.setHandler("cooldowns:player:get", () => {
      const cooldowns = isExists(this.#game)
        ? this.#game.getPlayersCooldowns()
        : [];
      return Result.create(cooldowns, "success");
    });

    this.#rpc.setHandler("cooldown:player:set", (summonerName: string, target: TInternalCooldownTargetNew) => {
      this._getPlayer(summonerName).setCooldown(target);
    });

    this.#rpc.setHandler("cooldown:player:reset", (summonerName: string, target: TInternalCooldownTargetNew) => {
      this._getPlayer(summonerName).resetCooldown(target);
    });

    return this;
  }

  private _handleLiveGameAPIEvents() {

    this.#liveClientApiPing.on("connected", async () => {
      this._resetGame();

      this.#rpc.send("live:connected");

      const gameData = await LiveClientAPI.getGameStats();
      this.#game = new Game(gameData);

      const [players, events] = await Promise.all([
        LiveClientAPI.getPlayersList(),
        LiveClientAPI.getGameEvents()
      ]);

      this.#game.setPlayers(players);
      this.#game.setEvents(events);

      this.#rpc.send("live:players",
        Result.create(
          Array.from(this.#game.players.values()).map(p => p.rawValue),
          "success"
        )
      );
    });

    this.#liveClientApiPing.on("reconnected", () => {
      this.#rpc.send("live:connected");
    });

    this.#liveClientApiPing.on("disconnected", () => {
      this._resetGame();
      this.#rpc.send("live:disconnected");
    });

    this.#liveClientApiPing.on("players", (players: ILiveAPIPlayer[]) => {
      if (isNotExists(this.#game)) {
        return;
      }

      this.#game.setPlayers(players);
      this.#rpc.send("live:players",
        Result.create(
          Array.from(this.#game.players.values()).map(p => p.rawValue),
          "success"
        )
      );
    });

    this.#liveClientApiPing.on("events", (events: ILiveAPIGameEvent[]) => {
      if (isExists(this.#game)) {
        this.#game.setEvents(events);
      }
    });

    return this;
  }

  private _resetGame() {
    if (isExists(this.#game)) {
      this.#game.destroy();
      this.#game = undefined;
    }
  }

  private _getPlayer(summonerName: string): Player {

    if (isNotExists(this.#game)) {
      throw new Error("Game not started");
    }

    const player = this.#game.players.get(summonerName);
    if (isNotExists(player)) {
      throw new Error("Player not found");
    }

    return player;
  }

  public destroy(): void {
    this.#liveClientApiPing.destroy();
    this._resetGame();
  }
}