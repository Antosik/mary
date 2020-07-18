import { SS_ITEM_CDR_MAP } from "@mary-main/calculator/consts/items";
import { SS_GAMEMODE_CDR_MAP } from "@mary-main/calculator/consts/game";
import { SS_RUNE_CDR_MAP } from "@mary-main/calculator/consts/runes";


export class SummonerSpellCooldownCalculator {

  private static getEffectFromItems(items: IInternalPlayerItem[]): number {
    const APPLIABLE_ITEM_IDS = Array.from(SS_ITEM_CDR_MAP.keys());

    let resultEffect = 0;

    const itemsFound = items.filter(item => APPLIABLE_ITEM_IDS.includes(item.itemID));
    for (const itemFound of itemsFound) {
      const effect = SS_ITEM_CDR_MAP.get(itemFound.itemID)!;
      resultEffect += effect;
    }

    return resultEffect;
  }

  private static getEffectFromRunes(runes: IInternalPlayerRunes): number {
    const APPLIABLE_RUNES_IDS = Array.from(SS_RUNE_CDR_MAP.keys());

    let resultEffect = 0;

    const runesFound = [runes.primary, runes.secondary]
      .filter(rune => APPLIABLE_RUNES_IDS.includes(rune.runeID));
    for (const runeFound of runesFound) {
      const effect = SS_RUNE_CDR_MAP.get(runeFound.runeID)!;
      resultEffect += effect;
    }

    return resultEffect;
  }

  private static getEffectFromGameMode(gameMode: ILiveAPIGameMode): number {
    const gameModeFound = SS_GAMEMODE_CDR_MAP.get(gameMode);

    return gameModeFound ?? 0;
  }

  public static calculate(spell: ISpellInfo, playerInfo: IInternalPlayerInfo, gameMode: ILiveAPIGameMode): number {
    const originalCD = typeof spell.cooldown === "function"
      ? spell.cooldown(playerInfo.level)
      : spell.cooldown;

    const itemsEffect = SummonerSpellCooldownCalculator.getEffectFromItems(playerInfo.items);
    const runesEffect = SummonerSpellCooldownCalculator.getEffectFromRunes(playerInfo.runes);
    const gameModesEffect = SummonerSpellCooldownCalculator.getEffectFromGameMode(gameMode);

    return originalCD + itemsEffect * originalCD + runesEffect * originalCD + gameModesEffect * originalCD;
  }
}