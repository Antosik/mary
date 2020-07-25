export class GameDataTransformer {

  public static transformToInternal(value: ILiveAPIGameStats): TInternalGameStatsNew {

    return {
      gameTime: value.gameTime,
      mapId: value.mapNumber
    };
  }
}