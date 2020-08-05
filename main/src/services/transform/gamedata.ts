export class GameDataTransformer {

  public static transformToInternal(value: ILiveAPIGameStats): TInternalGameStats {

    return {
      gameTime: value.gameTime,
      mapId: value.mapNumber
    };
  }
}