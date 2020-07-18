import { ABILITY_ITEM_CDR_MAP, ABILITY_ITEM_CDR_HASTE } from "@mary-main/calculator/consts/items";
import { ABILITY_RUNE_CDR_MAP } from "@mary-main/calculator/consts/runes";
import { isExists, isEmpty } from "@mary-shared/utils/typeguards";
import { getPlayerNameToTeamMap } from "@mary-shared/utils/summoner";
import ultimateAbilityData from "@mary-main/calculator/consts/ultimate.json";


const Ultimate: Record<string, number[]> = ultimateAbilityData;


export class UltimateAbilityCooldownCalculator {

  private static getEffectFromItems(items: IInternalPlayerItem[]): number {
    const APPLIABLE_ITEM_IDS = Array.from(ABILITY_ITEM_CDR_MAP.keys());

    let resultEffect = 0;

    const itemsFound = items.filter(item => APPLIABLE_ITEM_IDS.includes(item.itemID));
    for (const itemFound of itemsFound) {
      const effect = ABILITY_ITEM_CDR_MAP.get(itemFound.itemID)!;
      resultEffect += effect;
    }

    const hasteItemsFound = items.find(item => ABILITY_ITEM_CDR_HASTE.includes(item.itemID));
    if (isExists(hasteItemsFound)) {
      resultEffect += -0.1;
    }

    return resultEffect;
  }

  private static getEffectFromRunes(level: number, runes: IInternalPlayerRunes): number {
    const APPLIABLE_RUNES_IDS = Array.from(ABILITY_RUNE_CDR_MAP.keys());

    let resultEffect = 0;

    const runesFound = [runes.primary, runes.secondary]
      .filter(rune => APPLIABLE_RUNES_IDS.includes(rune.runeID));

    for (const runeFound of runesFound) {

      const effect = ABILITY_RUNE_CDR_MAP.get(runeFound.runeID)!;
      const effectCDR = typeof effect === "function"
        ? effect(level)
        : effect;

      resultEffect += effectCDR;
    }

    return resultEffect;
  }

  private static getEffectFromGameEvents(playerName: string, teams: Map<string, ILiveAPIPlayerTeam>, events: ILiveAPIGameEvent[]): number {
    let result = 0;

    for (const event of events) {
      if (event.EventName === "DragonKill" && event.DragonType === "Air" && teams.get(event.KillerName) === teams.get(playerName)) {
        result += -0.1;
      }
    }

    return result;
  }

  public static calculate(playerInfo: IInternalPlayerInfo, players: IInternalPlayerInfo[], events: ILiveAPIGameEvent[]): number {
    const cd: number[] = Ultimate[playerInfo.championName];
    if (isEmpty(cd)) {
      return 0;
    }

    let originalCD = 0;
    if (playerInfo.level >= 16) {
      originalCD = cd[2];
    } else if (playerInfo.level >= 11) {
      originalCD = cd[1];
    } else if (playerInfo.level >= 6) {
      originalCD = cd[0];
    }

    const itemsEffect = UltimateAbilityCooldownCalculator.getEffectFromItems(playerInfo.items);
    const runesEffect = UltimateAbilityCooldownCalculator.getEffectFromRunes(playerInfo.level, playerInfo.runes);
    const gameEventsEffect = UltimateAbilityCooldownCalculator.getEffectFromGameEvents(playerInfo.summonerName, getPlayerNameToTeamMap(players), events);

    return originalCD + itemsEffect * originalCD + runesEffect * originalCD + gameEventsEffect * originalCD;
  }
}