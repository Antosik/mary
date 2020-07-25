import { ABILITY_ITEM_CDR_MAP, ABILITY_ITEM_CDR_MAP_HASTE, SS_ITEM_CDR_MAP } from "@mary-main/consts/items";
import { SS_MAP_CDR_MAP } from "@mary-main/consts/maps";
import { isExists } from "@mary-shared/utils/typeguards";


export class CDRCalculator {

  private static _constructCDRItem(id: number, target: TInternalCooldownReductionTargetNew, count: number): TInternalCooldownReductionNew {
    return {
      id,
      target,
      count,
    };
  }

  public static calculateCDRFromItems(newStats: TInternalPlayerStatsNew): TInternalCooldownReductionItemNew[] {

    const ssItems: TInternalCooldownReductionItemNew[] = [];
    const abilityItems: TInternalCooldownReductionItemNew[] = [];
    const abilityHasteItems: TInternalCooldownReductionItemNew[] = [];

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

  public static calculateCDRFromRunes(newStats: TInternalPlayerStatsNew): TInternalCooldownReductionNew[] {

    const ssRunes: TInternalCooldownReductionNew[] = [];
    const abilityRunes: TInternalCooldownReductionNew[] = [];

    for (const rune of newStats.runes) {

      const ssCDR = SS_ITEM_CDR_MAP.get(rune);
      if (isExists(ssCDR)) {
        ssRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Summoner Spell", ssCDR) });
      }

      const abilityCDR = ABILITY_ITEM_CDR_MAP.get(rune);
      if (isExists(abilityCDR)) {
        abilityRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Ability", abilityCDR) });
        abilityRunes.push({ ...CDRCalculator._constructCDRItem(rune, "Ultimate Ability", abilityCDR) });
      }
    }

    return [...ssRunes, ...abilityRunes];
  }

  public static calculateCDRFromMap(mapId: number): TInternalCooldownReductionNew[] {

    const ssMaps: TInternalCooldownReductionNew[] = [];

    const mapCDR = SS_MAP_CDR_MAP.get(mapId);
    if (isExists(mapCDR)) {
      ssMaps.push({ ...CDRCalculator._constructCDRItem(mapId, "Summoner Spell", mapCDR) });
    }

    return [...ssMaps];
  }
}