import type { MainWindow } from "@mary-main/ui/main";
import type { Player } from "@mary-main/model/player";
import type { ObjectCooldown } from "@mary-main/model/objectcooldown";
import type { PlayerCooldown } from "@mary-main/model/playercooldown";

import { LiveClientAPI } from "@mary-main/connectors/LiveClientAPI";
import { LiveClientAPIPing } from "@mary-main/connectors/LiveClientAPI/ping";
import { Game } from "@mary-main/model/game";
import { settingsStore } from "@mary-main/storage/settings";
import { Events } from "@mary-main/utils/events";
import { MainRPC } from "@mary-main/utils/rpc";
import { Result } from "@mary-shared/utils/result";
import { isExists, isNotExists } from "@mary-shared/utils/typeguards";
import { SettingsWindow, createSettingsWindow } from "@mary-main/ui/settings";


export class Mary {

  #game?: Game;

  #liveClientApiPing: LiveClientAPIPing;

  #window: MainWindow;
  #rpc: MainRPC;
  #settingsWindow: SettingsWindow | null;
  #settingsRPC: MainRPC | null;

  public static mount(window: MainWindow): Mary {
    return new this(window);
  }

  private constructor(window: MainWindow) {

    this.#window = window;
    this.#rpc = new MainRPC(this.#window);

    this.#settingsWindow = null;
    this.#settingsRPC = null;

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

    MainRPC.setHandler("live:connect", async () => {
      await this.#liveClientApiPing.start();
    });

    MainRPC.setHandler("cooldowns:object:get", () => {
      const cooldowns = isExists(this.#game)
        ? this.#game.getObjectsCooldowns()
        : [];
      return Result.create(cooldowns, "success");
    });

    MainRPC.setHandler("cooldowns:player:get", () => {
      const cooldowns = isExists(this.#game)
        ? this.#game.getPlayersCooldowns()
        : [];
      return Result.create(cooldowns, "success");
    });

    MainRPC.setHandler("cooldown:player:set", (summonerName: string, target: TInternalCooldownTargetNew) => {
      this._getPlayer(summonerName).setCooldown(target);
    });

    MainRPC.setHandler("cooldown:player:reset", (summonerName: string, target: TInternalCooldownTargetNew) => {
      this._getPlayer(summonerName).resetCooldown(target);
    });

    MainRPC.setHandler("settings:open", () => {
      if (isExists(this.#settingsWindow)) {
        return this.#settingsWindow.focus();
      }
      this._runSettingsWindow();
    });

    MainRPC.setHandler("settings:load", () => {
      return Result.create(settingsStore.store, "success");
    });

    MainRPC.setHandler("settings:save", (data: IInternalSettingsNew) => {
      settingsStore.set(data);
      this.#rpc.send("settings:updated", Result.create(data, "success"));
    });

    return this;
  }

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

  private _sendMeta(): void {
    this.#rpc.send("live:me", Result.create(this.#game!.mePlayer?.rawValue));
    this.#rpc.send("live:players",
      Result.create(
        Array.from(this.#game!.players.values()).map(p => p.rawValue),
        "success"
      )
    );
  }

  private _handleLiveGameAPIEvents() {

    this.#liveClientApiPing.on("connected", async () => {
      this._resetGame();

      this.#rpc.send("live:connected");

      await this._initGame();
      this._sendMeta();
    });

    this.#liveClientApiPing.on("reconnected", async () => {

      if (isNotExists(this.#game)) {
        await this._initGame();
        this._sendMeta();
      }

      this.#rpc.send("live:connected");
      this._sendMeta();
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

  // #region Settings Zone
  private _runSettingsWindow() {
    this.#settingsWindow = createSettingsWindow();
    this.#settingsRPC = new MainRPC(this.#settingsWindow);
    this.#settingsWindow.focus();
    this.#settingsWindow.addListener("close", () => {
      this.#settingsWindow = null;
      this.#settingsRPC = null;
    });
  }


  // #endregion Settings Zone



  // #region Cleanup
  public destroy(): void {
    this.#liveClientApiPing.destroy();
    this._resetGame();
  }
  // #endregion Cleanup
}