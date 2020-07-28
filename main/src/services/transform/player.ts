import { SMITE_CONST } from "@mary-main/consts/spells";


export class PlayerTransformer {

  private static _transformChampionName(rawChampionName: string): string {
    return rawChampionName.split("_")[3];
  }

  private static _transformSummonerSpell(spell: ILiveAPIPlayerSummonerSpell): string {
    if (spell.rawDisplayName.includes(SMITE_CONST)) {
      return SMITE_CONST;
    }

    return spell.rawDisplayName.split("_")[2]; // TODO: Proper validation
  }

  public static transformToInternal(player: ILiveAPIPlayer): TInternalPlayerStatsNew {

    const items = player.items.map(item => item.itemID);
    const runes = [player.runes.primaryRuneTree.id, player.runes.secondaryRuneTree.id];
    const summonerSpells = [player.summonerSpells.summonerSpellOne, player.summonerSpells.summonerSpellTwo]
      .map(spell => PlayerTransformer._transformSummonerSpell(spell));

    return {
      summonerName: player.summonerName,
      championName: PlayerTransformer._transformChampionName(player.rawChampionName),
      team: player.team,

      level: player.level,
      items: new Set(items),
      runes: new Set(runes),
      summonerSpells: new Set(summonerSpells),

      isDead: player.isDead,
      respawnTimer: player.respawnTimer
    };
  }
}