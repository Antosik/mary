import { ABILITY_ITEM_CDR_MAP, ABILITY_ITEM_CDR_MAP_HASTE, SS_ITEM_CDR_MAP } from "@mary-main/consts/items";
import { SS_MAP_CDR_MAP } from "@mary-main/consts/maps";
import { SS_RUNE_CDR_MAP, ABILITY_RUNE_CDR_MAP } from "@mary-main/consts/runes";
import { isExists } from "@mary-shared/utils/typeguards";


export class CDRCalculator {

  private static _constructCDRItem(id: number, target: TInternalCooldownReductionTarget, count: number): TInternalCooldownReduction {
    return {
      id,
      target,
      count,
    };
  }

  public static calculateCDRFromItems(newStats: TInternalPlayerStats): TInternalCooldownReductionItem[] {

    const ssItems: TInternalCooldownReductionItem[] = [];
    const abilityItems: TInternalCooldownReductionItem[] = [];
    const abilityHasteItems: TInternalCooldownReductionItem[] = [];

    for (const item of newStats.items) {

      const ssCDR = SS_ITEM_CDR_MAP.get(item);
      if (isExists(ssCDR)) {
        ssItems.push({ ...CDRCalculator._constructCDRItem(item, "Summoner Spell", ssCDR), isHaste: false });
      }

      const abilityCDR = ABILITY_ITEM_CDR_MAP.get(item);
      if (isExists(abilityCDR)) {
        abilityItems.push({ ...CDRCalculator._constructCDRItem(item, "Ability", abilityCDR), isHaste: false });
        abilityItems.push({ ...CDRCalculator._constructCDRItem(item, "Ultimate Ability", abilityCDR), isHaste: false });
      }

      const abilityCDRHaste = ABILITY_ITEM_CDR_MAP_HASTE.get(item);
      if (isExists(abilityCDRHaste) && abilityHasteItems.length === 0) {
        abilityHasteItems.push({ ...CDRCalculator._constructCDRItem(item, "Ability", abilityCDRHaste), isHaste: true });
        abilityHasteItems.push({ ...CDRCalculator._constructCDRItem(item, "Ultimate Ability", abilityCDRHaste), isHaste: true });
      }
    }

    return [...ssItems, ...abilityItems, ...abilityHasteItems];
  }

  public static calculateCDRFromRunes(newStats: TInternalPlayerStats): TInternalCooldownReduction[] {

    const ssRunes: TInternalCooldownReduction[] = [];
    const abilityRunes: TInternalCooldownReduction[] = [];

    for (const rune of newStats.runes) {

      const ssCDR = SS_RUNE_CDR_MAP.get(rune);
      if (isExists(ssCDR)) {
        ssRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Summoner Spell", ssCDR) });
      }

      const abilityCDR = ABILITY_RUNE_CDR_MAP.get(rune);
      if (isExists(abilityCDR)) {

        const abilityCDRRune = typeof abilityCDR === "function"
          ? abilityCDR(newStats.level)
          : abilityCDR;

        abilityRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Ability", abilityCDRRune) });
        abilityRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Ultimate Ability", abilityCDRRune) });
      }
    }

    return [...ssRunes, ...abilityRunes];
  }

  public static calculateCDRFromMap(mapId: number): TInternalCooldownReduction[] {

    const ssMaps: TInternalCooldownReduction[] = [];

    const mapCDR = SS_MAP_CDR_MAP.get(mapId);
    if (isExists(mapCDR)) {
      ssMaps.push({ ...CDRCalculator._constructCDRItem(mapId, "Summoner Spell", mapCDR) });
    }

    return [...ssMaps];
  }
}