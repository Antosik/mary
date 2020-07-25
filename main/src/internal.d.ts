declare type TInternalCooldownReduction = {
  id: number;
  count: number;
};

declare type IInternalStaticCooldownMap = {
  map: TInternalCooldownReduction;
  runes: TInternalCooldownReduction[];
};

declare type IInternalDynamicCooldownMap = {
  items: TInternalCooldownReduction[];
  dragons: TInternalCooldownReduction[];
  kills: TInternalCooldownReduction[];
};

declare type TInternalPlayerCooldownsMap = IInternalStaticCooldownMap & IInternalDynamicCooldownMap;

declare interface IInternalGameStorage {
  gameInfo: ILiveAPIGameStats;
  players: IInternalPlayerInfo[];
  events: ILiveAPIGameEvent[];
  cooldowns: Record<string, TInternalPlayerCooldownsMap>;
}