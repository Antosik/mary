import { EventEmitter } from "events";

import { spells } from "@mary-main/calculator/consts/spells";
import { SummonerSpellCooldownCalculator } from "@mary-main/calculator/spells";
import { UltimateAbilityCooldownCalculator } from "@mary-main/calculator/ultimate";
import { gameStore } from "@mary-main/store/game";
import { isEmpty, isNotExists, isExists } from "@mary-shared/utils/typeguards";


export class CooldownService extends EventEmitter {

  private static CD_RESET_INTERVAL = 3e3;
  private _cdResetTimer?: NodeJS.Timer;

  private _cooldowns: IInternalCooldown[];

  constructor() {
    super();

    this._cooldowns = [];

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    this._updateCooldowns = this._updateCooldowns.bind(this);
    /* eslint-disable-next-line @typescript-eslint/unbound-method */
    this._cdResetTimer = setInterval(this._updateCooldowns, CooldownService.CD_RESET_INTERVAL);
  }

  public getCooldowns(): IInternalCooldown[] {
    return this._cooldowns;
  }

  public setCooldown(summonerName: string, championName: string, target: string): IInternalCooldown | undefined {

    const gameMode = gameStore.get("gameMode");
    if (isNotExists(gameMode)) {
      return;
    }

    const players = gameStore.get("players") ?? [];
    if (isEmpty(players)) {
      return;
    }

    const playerInfo = players.find(player => player.summonerName === summonerName && player.championName === championName);
    if (isNotExists(playerInfo)) {
      return;
    }

    const cooldownTime = target === "R"
      ? this._calculateCooldownForR(playerInfo, players)
      : this._calculateCooldownForSpell(target, playerInfo, gameMode);
    if (isNotExists(cooldownTime)) {
      return;
    }

    const cooldown: IInternalCooldown = {
      summonerName,
      championName,
      start: new Date(),
      end: new Date(Date.now() + cooldownTime * 1000),
      target
    };

    const filteredCooldowns = this._cooldowns.filter(c => !(c.championName === championName && c.summonerName === summonerName && c.target === target));
    this._cooldowns = [...filteredCooldowns, cooldown];

    this.emit("cooldowns:ping", this._cooldowns);

    return cooldown;
  }

  public resetCooldowns(): void {
    this._cooldowns = [];
  }

  public destroy(): void {
    if (isExists(this._cdResetTimer)) {
      clearInterval(this._cdResetTimer);
    }
  }

  private _calculateCooldownForSpell(target: string, playerInfo: IInternalPlayerInfo, gameMode: ILiveAPIGameMode): number | undefined {
    if (!playerInfo.summonerSpells.includes(target)) {
      return undefined;
    }

    const spellInfo = spells.find(spell => spell.id === target);
    if (isNotExists(spellInfo)) {
      return undefined;
    }

    return SummonerSpellCooldownCalculator.calculate(spellInfo, playerInfo, gameMode);
  }

  private _calculateCooldownForR(playerInfo: IInternalPlayerInfo, players: IInternalPlayerInfo[]): number | undefined {
    const events = gameStore.get("events") ?? [];
    return UltimateAbilityCooldownCalculator.calculate(playerInfo, players, events);
  }

  private _updateCooldowns(): void {
    const now = new Date();
    this._cooldowns = this._cooldowns.filter(cd => cd.end > now);

    this.emit("cooldowns:ping", this._cooldowns);
  }
}