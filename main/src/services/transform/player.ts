import { SMITE_CONST } from "@mary-main/consts/spells";
import abilityData from "@mary-main/consts/ability.json";
import passiveAbilityData from "@mary-main/consts/passive.json";
import ultimateAbilityData from "@mary-main/consts/ultimate.json";
import { isExists } from "@mary-shared/utils/typeguards";


const UltimateAbility = ultimateAbilityData as Record<string, number[]>;
const PassiveAbility = passiveAbilityData as Record<string, number>;
const Ability = abilityData as Record<string, Array<{ target: TInternalCooldownTargetAbility, cooldowns: number[]}>>;


export class PlayerTransformer {

  private static _transformChampionName(rawChampionName: string): string {
    return rawChampionName.split("_")[3];     // TODO: Proper validation
  }

  private static _transformSummonerSpell(spell: ILiveAPIPlayerSummonerSpell): string {
    if (spell.rawDisplayName.includes(SMITE_CONST)) {
      return SMITE_CONST;
    }

    return spell.rawDisplayName.split("_")[2]; // TODO: Proper validation
  }

  private static _getCalculateTargetMap(championName: string): TInternalPlayerTrackTargets {

    const result: TInternalPlayerTrackTargets = {
      P: false,
      Q: false, W: false, E: false, R: false,
      D: true, F: true
    };

    if (isExists(UltimateAbility[championName])) {
      result.R = true;
    }

    if (isExists(PassiveAbility[championName])) {
      result.P = true;
    }

    if (isExists(Ability[championName])) {
      for (const ability of Ability[championName]) {
        result[ability.target] = true;
      }
    }

    return result;
  }

  public static transformToInternal(player: ILiveAPIPlayer): TInternalPlayerStats {

    const items = player.items.map(item => item.itemID);
    const runes = [player.runes.primaryRuneTree.id, player.runes.secondaryRuneTree.id];
    const summonerSpells = [player.summonerSpells.summonerSpellOne, player.summonerSpells.summonerSpellTwo]
      .map(spell => PlayerTransformer._transformSummonerSpell(spell));
    const championName = PlayerTransformer._transformChampionName(player.rawChampionName);

    return {
      summonerName: player.summonerName,
      championName,
      team: player.team,

      level: player.level,
      items: new Set(items),
      runes: new Set(runes),
      summonerSpells: new Set(summonerSpells),

      isDead: player.isDead,
      respawnTimer: player.respawnTimer,

      track: PlayerTransformer._getCalculateTargetMap(championName)
    };
  }
}