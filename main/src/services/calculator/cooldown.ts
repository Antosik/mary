import type { Player } from "@mary-main/model/player";

import { ULTIMATE_HUNTER_ID, COSMIC_INSIGHT_ID } from "@mary-main/consts/runes";
import { spells, TELEPORT_CONST } from "@mary-main/consts/spells";
import abilityData from "@mary-main/consts/ability.json";
import passiveAbilityData from "@mary-main/consts/passive.json";
import ultimateAbilityData from "@mary-main/consts/ultimate.json";
import { isBlank, isNotExists, isEmpty, isExists } from "@mary-shared/utils/typeguards";


const UltimateAbility = ultimateAbilityData as Record<string, number[]>;
const PassiveAbility = passiveAbilityData as Record<string, number>;
const Ability = abilityData as Record<string, Array<{ target: TInternalCooldownTargetAbility, cooldowns: number[] }>>;


export class CooldownCalculator {

  private static _passiveTargets: TInternalCooldownTarget[] = ["P"];
  private static _abilityTargets: TInternalCooldownTarget[] = ["Q", "W", "E", "R"];
  private static _summonerSpellsTargets: TInternalCooldownTarget[] = ["D", "F"];

  private static _getInitialPassiveAbilityCooldown(_: TInternalCooldownTarget, stats: TInternalPlayerStats): number {
    return stats.track?.P && isExists(PassiveAbility[stats.championName])
      ? PassiveAbility[stats.championName]
      : 0;
  }

  private static _getInitialUltimateAbilityCooldown(_: TInternalCooldownTarget, stats: TInternalPlayerStats): number {

    const cd: number[] = UltimateAbility[stats.championName];
    if (isEmpty(cd) || !stats.track?.R) {
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

  private static _getInitialAbilityCooldown(target: TInternalCooldownTarget, stats: TInternalPlayerStats): number {

    if (!stats.track?.[target] || isEmpty(Ability[stats.championName])) {
      return 0;
    }

    const ability = Ability[stats.championName].find(a => a.target === target);
    if (isNotExists(ability)) {
      return 0;
    }

    const skillLevelTemp = Math.ceil(stats.level / 2);
    const skillLevel = skillLevelTemp > 5 ? 5 : skillLevelTemp;

    return isExists(ability.cooldowns[skillLevel - 1])
      ? ability.cooldowns[skillLevel - 1]
      : 0;
  }

  private static _getSummonerSpellInfo(target: TInternalCooldownTarget, stats: TInternalPlayerStats): ISpellInfo | undefined {

    const [D, F] = stats.summonerSpells.values();
    const summonerSpell: string = target === "D" ? D : F;

    if (isBlank(summonerSpell)) {
      return;
    }

    return spells.find(spell => spell.id === summonerSpell);
  }

  private static _getInitialSummonerSpellCooldown(target: TInternalCooldownTarget, stats: TInternalPlayerStats): number {

    const summonerSpellInfo = CooldownCalculator._getSummonerSpellInfo(target, stats);

    if (isNotExists(summonerSpellInfo)) {
      return 0;
    }

    return typeof summonerSpellInfo.cooldown === "function"
      ? summonerSpellInfo.cooldown(stats.level)
      : summonerSpellInfo.cooldown;
  }

  private static _getInitialTargetCooldown(target: TInternalCooldownTarget, stats: TInternalPlayerStats): number {

    if (CooldownCalculator._passiveTargets.includes(target)) {
      return CooldownCalculator._getInitialPassiveAbilityCooldown(target, stats);
    }

    if (target === "R") {
      return CooldownCalculator._getInitialUltimateAbilityCooldown(target, stats);
    }

    if (CooldownCalculator._abilityTargets.includes(target)) {
      return CooldownCalculator._getInitialAbilityCooldown(target, stats);
    }

    if (CooldownCalculator._summonerSpellsTargets.includes(target)) {
      return CooldownCalculator._getInitialSummonerSpellCooldown(target, stats);
    }

    return 0;
  }


  private static _reduceCooldownArray(previous: number, item: TInternalCooldownReduction) {
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

  private static _calculateUltimateCooldown(_: TInternalCooldownTarget, initialCooldown: number, player: Player): number {

    // Base CDR: Items & Runes
    let CDR = 0;
    CDR += player.cdr.items.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR += player.cdr.runes.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR = CooldownCalculator._maxCDRCheck(CDR, player);

    // Extra CDR: Hunter & Air Dragons
    let extraCDR = 0;
    if (player.stats.runes.has(ULTIMATE_HUNTER_ID)) {
      extraCDR += -0.05 + player.cdr.kills.size * -0.04;
    }
    extraCDR += player.cdr.dragons.filter(c => c.target === "Ultimate Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);

    const extraInitialCooldown = initialCooldown + initialCooldown * extraCDR;
    return extraInitialCooldown + extraInitialCooldown * CDR;
  }

  private static _calculateAbilitiesCooldown(_: TInternalCooldownTarget, initialCooldown: number, player: Player): number {

    // Base CDR: Items & Runes
    let CDR = 0;
    CDR += player.cdr.runes.filter(c => c.target === "Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR += player.cdr.items.filter(c => c.target === "Ability").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR = CooldownCalculator._maxCDRCheck(CDR, player);

    return initialCooldown + initialCooldown * CDR;
  }

  private static _calculateSummonerSpellsCooldown(target: TInternalCooldownTarget, initialCooldown: number, player: Player): number {

    const summonerSpellInfo = CooldownCalculator._getSummonerSpellInfo(target, player.stats);
    if (summonerSpellInfo?.id === TELEPORT_CONST) {
      return initialCooldown;
    }

    let CDR = 0;
    CDR += player.cdr.map.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR += player.cdr.runes.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);
    CDR += player.cdr.items.filter(c => c.target === "Summoner Spell").reduce(CooldownCalculator._reduceCooldownArray.bind(this), 0);

    return initialCooldown + initialCooldown * CDR;
  }

  public static calculate(target: TInternalCooldownTarget, player: Player): number {

    const initialCooldown = CooldownCalculator._getInitialTargetCooldown(target, player.stats);
    if (initialCooldown === 0) {
      return 0;
    }

    if (target === "P") {
      return initialCooldown;
    }

    if (target === "R") {
      return CooldownCalculator._calculateUltimateCooldown(target, initialCooldown, player);
    }

    if (CooldownCalculator._abilityTargets.includes(target)) {
      return CooldownCalculator._calculateAbilitiesCooldown(target, initialCooldown, player);
    }

    if (CooldownCalculator._summonerSpellsTargets.includes(target)) {
      return CooldownCalculator._calculateSummonerSpellsCooldown(target, initialCooldown, player);
    }

    return 0;
  }
}