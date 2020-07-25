import { CooldownCalculator } from "@mary-main/services/calculator/cooldown";
import { CDRCalculator } from "@mary-main/services/calculator/cdr";
import { PlayerCooldown } from "@mary-main/model/playercooldown";
import { Events } from "@mary-main/utils/events";
import { isExists, areSetsNotEqual, isNotEmpty } from "@mary-shared/utils/typeguards";


export class Player implements IInternalPlayerNew {

  #stats: TInternalPlayerStatsNew;
  #cooldowns: Map<TInternalCooldownTargetNew, PlayerCooldown>;
  #cdr: TInternalPlayerCDRMapNew;

  #isMapCalculated: boolean;

  constructor(
    stats: TInternalPlayerStatsNew,
    cooldowns?: IInternalPlayerCooldownNew[],
    cdr?: TInternalPlayerCDRMapNew
  ) {
    this.#stats = stats;
    this.#cooldowns = new Map<TInternalCooldownTargetNew, PlayerCooldown>();
    this.#cdr = cdr ?? {
      map: [],
      kills: new Set<string>(),
      dragons: [],
      items: [],
      runes: []
    };

    this.#isMapCalculated = false;

    if (isNotEmpty(cooldowns)) {
      this.setPlayerCooldowns(cooldowns);
    }

    this._calculateCDRFromRunes(this.#stats);
    this._calculateCDRFromItems(this.#stats);
  }


  // #region Getters & Setters
  public get pid(): string {
    return `${this.stats.championName}-${this.stats.summonerName}}`;
  }
  public get team(): ILiveAPIPlayerTeam {
    return this.stats.team;
  }
  public get cdr(): TInternalPlayerCDRMapNew {
    return this.#cdr;
  }
  public get stats(): TInternalPlayerStatsNew {
    return this.#stats;
  }
  public set stats(value: TInternalPlayerStatsNew) {
    const oldStats = this.#stats;
    this.#stats = value;
    this._onStatsChange(oldStats, value);
  }
  public get rawCooldowns(): IInternalPlayerCooldownNew[] {
    return Array.from(this.#cooldowns.values()).map(cd => cd.rawValue);
  }
  public get rawValue(): TInternalPlayerStatsNew {
    return { ...this.#stats };
  }
  // #endregion Getters & Setters


  // #region Custom Getters & Setters
  public addKillEvent(killEvent: TInternalChampionKillEvent): void {
    if (killEvent.killer === this.stats.summonerName || killEvent.assisters.has(this.stats.summonerName)) {
      this.#cdr.kills.add(killEvent.victim);
    }
  }

  public addDragonEvent(dragonEvent: TInternalDragonKillEvent): void {
    if (dragonEvent.dragonType === "Air" && dragonEvent.team === this.stats.team) {
      this.#cdr.dragons.push({
        id: dragonEvent.id,
        target: "Ultimate Ability",
        count: -0.1
      });
    }
  }

  public setMapType(mapId: number): void {
    if (!this.#isMapCalculated) {
      this.#cdr.map = CDRCalculator.calculateCDRFromMap(mapId);
      this.#isMapCalculated = true;
    }
  }

  public setPlayerCooldowns(value: IInternalPlayerCooldownNew[]): void {
    for (const item of value) {
      const cooldown = PlayerCooldown.fromRawValue(item);
      if (isExists(cooldown)) {
        this.#cooldowns.set(cooldown.target, cooldown);
      }
    }
  }
  // #endregion Custom Getters & Setters

  private _onStatsChange(oldStats: TInternalPlayerStatsNew, newStats: TInternalPlayerStatsNew): void {

    if (oldStats.isDead !== newStats.isDead) {
      Events.emit("data:player:dead", this);
    }

    if (areSetsNotEqual(oldStats.items, newStats.items)) {
      this._calculateCDRFromItems(newStats);
    }
  }

  private _calculateCDRFromItems(stats: TInternalPlayerStatsNew) {
    this.#cdr.items = CDRCalculator.calculateCDRFromItems(stats);
  }

  private _calculateCDRFromRunes(stats: TInternalPlayerStatsNew) {
    this.#cdr.runes = CDRCalculator.calculateCDRFromRunes(stats);
  }


  // #region Cooldown zone
  public setCooldown(target: TInternalCooldownTargetNew): void {
    const existingCooldown = this.#cooldowns.get(target);

    if (isExists(existingCooldown)) {
      existingCooldown.destroy();
    }

    const seconds = CooldownCalculator.calculate(target, this);

    const cooldown = new PlayerCooldown(this.#stats.summonerName, target, seconds);
    this.#cooldowns.set(target, cooldown);
  }

  public resetCooldown(target: TInternalCooldownTargetNew): void {
    const existingCooldown = this.#cooldowns.get(target);

    if (isExists(existingCooldown)) {
      existingCooldown.reset();
    }

    this.#cooldowns.delete(target);
  }

  public removeCooldown(target: TInternalCooldownTargetNew): void {
    this.#cooldowns.delete(target);
  }
  // #endregion Cooldown zone


  // #region Cleanup
  public destroy(): void {
    for (const cooldown of this.#cooldowns.values()) {
      cooldown.destroy();
    }
  }
  // #endregion Cleanup
}