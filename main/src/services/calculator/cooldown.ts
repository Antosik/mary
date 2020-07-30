import type { Player } from "@mary-main/model/player";

import { ULTIMATE_HUNTER_ID, COSMIC_INSIGHT_ID } from "@mary-main/consts/runes";
import { spells, TELEPORT_CONST } from "@mary-main/consts/spells";
import ultimateAbilityData from "@mary-main/consts/ultimate.json";
import { isBlank, isNotExists, isEmpty } from "@mary-shared/utils/typeguards";


const Ultimate: Record<string, number[]> = ultimateAbilityData;


export class CooldownCalculator {

  private static _passiveTargets: TInternalCooldownTargetNew[] = ["P"];
  private static _abilityTargets: TInternalCooldownTargetNew[] = ["Q", "W", "E", "R"];
  private static _summonerSpellsTargets: TInternalCooldownTargetNew[] = ["D", "F"];

  private static _getInitialPassiveAbilityCooldown(_: TInternalCooldownTargetNew, stats: TInternalPlayerStatsNew): number {

    if (stats.championName === "Зак" || stats.championName === "Zac") {
      return 300;
    }

    if (stats.championName === "Анивия" || stats.championName === "Anivia") {
      return 240;
    }

    return 0;
  }

  private static _getInitialAbilityCooldown(_: TInternalCooldownTargetNew, stats: TInternalPlayerStatsNew): number {

    const cd: number[] = Ultimate[stats.championName];
    if (isEmpty(cd)) {
      return 0;
    }

    if (stats.level >= 16) {
      return cd[2];
    }

    if (stats.level >= 11) {
      return cd[1];
    }

    if (stats.level >= 6) {
      return cd[0];
    }

    return 0;
  }

  private static _getSummonerSpellInfo(target: TInternalCooldownTargetNew, stats: TInternalPlayerStatsNew): ISpellInfo | undefined {

    const [D, F] = stats.summonerSpells.values();
    const summonerSpell: string = target === "D" ? D : F;

    if (isBlank(summonerSpell)) {
      return;
    }

    return spells.find(spell => spell.id === summonerSpell);
  }

  private static _getInitialSummonerSpellCooldown(target: TInternalCooldownTargetNew, stats: TInternalPlayerStatsNew): number {

    const summonerSpellInfo = CooldownCalculator._getSummonerSpellInfo(target, stats);

    if (isNotExists(summonerSpellInfo)) {
      return 0;
    }

    return typeof summonerSpellInfo.cooldown === "function"
      ? summonerSpellInfo.cooldown(stats.level)
      : summonerSpellInfo.cooldown;
  }

  private static _getInitialTargetCooldown(target: TInternalCooldownTargetNew, stats: TInternalPlayerStatsNew): number {

    if (CooldownCalculator._passiveTargets.includes(target)) {
      return CooldownCalculator._getInitialPassiveAbilityCooldown(target, stats);
    }

    if (CooldownCalculator._abilityTargets.includes(target)) {
      return CooldownCalculator._getInitialAbilityCooldown(target, stats);
    }

    if (CooldownCalculator._summonerSpellsTargets.includes(target)) {
      return CooldownCalculator._getInitialSummonerSpellCooldown(target, stats);
    }

    return 0;
  }

  private static _reduceCooldownArray(previous: number, item: TInternalCooldownReductionNew) {
    return previous + item.count;
  }

  private static _maxCDRCheck(cdr: number, player: Player): number {

    if (cdr >= -0.4) {
      return cdr;
    }

    return player.stats.runes.has(COSMIC_INSIGHT_ID)
      ? -0.45
      : -0.4;
  }

  public static calculate(target: TInternalCooldownTargetNew, player: Player): number {

    const initialCooldown = CooldownCalculator._getInitialTargetCooldown(target, player.stats);
    if (initialCooldown === 0) {
      return 0;
    }

    if (target === "P") {
      return initialCooldown;
    }

    let cdr = 0;

    if (target === "R") {

      cdr += player.cdr.items.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
      cdr += player.cdr.runes.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);

      cdr = CooldownCalculator._maxCDRCheck(cdr, player);

      let extra_cdr = 0;
      if (player.stats.runes.has(ULTIMATE_HUNTER_ID)) {
        extra_cdr += -0.05 + player.cdr.kills.size * -0.04;
      }
      extra_cdr += player.cdr.dragons.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);

      const extraInitialCooldown = initialCooldown + initialCooldown * extra_cdr;
      return extraInitialCooldown + extraInitialCooldown * cdr;
    }

    if (CooldownCalculator._abilityTargets.includes(target)) {

      cdr += player.cdr.runes.filter(c => c.target === "Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
      cdr += player.cdr.items.filter(c => c.target === "Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
      cdr = CooldownCalculator._maxCDRCheck(cdr, player);

    } else if (CooldownCalculator._summonerSpellsTargets.includes(target)) {

      const summonerSpellInfo = CooldownCalculator._getSummonerSpellInfo(target, player.stats);
      if (summonerSpellInfo?.name === TELEPORT_CONST) {
        return initialCooldown;
      }

      cdr += player.cdr.map.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
      cdr += player.cdr.runes.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
      cdr += player.cdr.items.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    }

    return initialCooldown + initialCooldown * cdr;
  }
}