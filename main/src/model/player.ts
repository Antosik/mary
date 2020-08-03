import { PlayerCooldown } from "@mary-main/model/playercooldown";
import { CooldownCalculator } from "@mary-main/services/calculator/cooldown";
import { CDRCalculator } from "@mary-main/services/calculator/cdr";
import { Events } from "@mary-main/utils/events";
import { isExists, areSetsNotEqual, isNotEmpty } from "@mary-shared/utils/typeguards";


export class Player implements IInternalPlayer, IDestroyable {

  #stats: TInternalPlayerStats;
  #cooldowns: Map<TInternalCooldownTarget, PlayerCooldown>;
  #cdr: TInternalPlayerCDRMap;

  #isMapCalculated: boolean;

  constructor(
    stats: TInternalPlayerStats,
    cooldowns?: IInternalPlayerCooldown[],
    cdr?: TInternalPlayerCDRMap
  ) {
    this.#stats = stats;
    this.#cooldowns = new Map<TInternalCooldownTarget, PlayerCooldown>();
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
  public get cdr(): TInternalPlayerCDRMap {
    return this.#cdr;
  }
  public get stats(): TInternalPlayerStats {
    return this.#stats;
  }
  public set stats(value: TInternalPlayerStats) {
    const oldStats = this.#stats;
    this.#stats = value;
    this._onStatsChange(oldStats, value);
  }
  public get rawCooldowns(): IInternalPlayerCooldown[] {
    const results: IInternalPlayerCooldown[] = [];
    for (const cooldown of this.#cooldowns.values()) {
      results.push(cooldown);
    }
    return results;
  }
  public get rawValue(): TInternalPlayerStats {
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

  public setPlayerCooldowns(value: IInternalPlayerCooldown[]): void {
    for (const item of value) {
      const cooldown = PlayerCooldown.fromRawValue(item);
      if (isExists(cooldown)) {
        this.#cooldowns.set(cooldown.target, cooldown);
      }
    }
  }
  // #endregion Custom Getters & Setters


  // #region Internal
  private _onStatsChange(oldStats: TInternalPlayerStats, newStats: TInternalPlayerStats): void {

    if (oldStats.isDead !== newStats.isDead) {
      Events.emit("data:player:dead", this);
    }

    if (areSetsNotEqual(oldStats.runes, newStats.runes)) {
      this._calculateCDRFromRunes(newStats);
    }

    if (areSetsNotEqual(oldStats.items, newStats.items)) {
      this._calculateCDRFromItems(newStats);
    }
  }

  private _calculateCDRFromItems(stats: TInternalPlayerStats) {
    this.#cdr.items = CDRCalculator.calculateCDRFromItems(stats);
  }

  private _calculateCDRFromRunes(stats: TInternalPlayerStats) {
    this.#cdr.runes = CDRCalculator.calculateCDRFromRunes(stats);
  }
  // #endregion Internal


  // #region Cooldown zone
  public setCooldown(target: TInternalCooldownTarget): void {
    const existingCooldown = this.#cooldowns.get(target);

    if (isExists(existingCooldown)) {
      existingCooldown.destroy();
    }

    const seconds = CooldownCalculator.calculate(target, this);

    const cooldown = new PlayerCooldown(this.#stats.summonerName, target, seconds);
    this.#cooldowns.set(target, cooldown);
  }

  public resetCooldown(target: TInternalCooldownTarget): void {
    const existingCooldown = this.#cooldowns.get(target);

    if (isExists(existingCooldown)) {
      existingCooldown.reset();
    }

    this.#cooldowns.delete(target);
  }

  public removeCooldown(target: TInternalCooldownTarget): void {
    const existingCooldown = this.#cooldowns.get(target);

    if (isExists(existingCooldown)) {
      existingCooldown.destroy();
      this.#cooldowns.delete(target);
    }
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