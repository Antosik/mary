/* eslint-disable @typescript-eslint/no-explicit-any */

// #region Main
declare type IKeyValue = Record<string, any>;
declare type TAnyFunc = (...args: any[]) => any;
declare interface IDestroyable {
  destroy(): void;
}
// #endregion Main


// #region Transformed League Data
declare type ILevelDependantCD = (level: number) => number;
declare interface ISpellInfo {
  id: string;
  name: string;
  cooldown: number | ILevelDependantCD;
}
declare type TInternalCooldownTargetAbility = "Q" | "W" | "E";
declare type TInternalCooldownTargetUltimate = "R";
declare type TInternalCooldownTargetSummonerSpell = "D" | "F";
declare type TInternalCooldownTargetPassive = "P";
declare type TInternalCooldownTarget =
  | TInternalCooldownTargetAbility
  | TInternalCooldownTargetUltimate
  | TInternalCooldownTargetSummonerSpell
  | TInternalCooldownTargetPassive;
declare type TInternalCooldownObject =
  | "Elder"
  | "Baron"
  | "Inhib";
declare type TInternalCooldownReductionTarget =
  | "Ability"
  | "Ultimate Ability"
  | "Summoner Spell";
declare interface IInternalCooldown {
  id: string;
  start: Date;
  end: Date;
}
declare interface IInternalPlayerCooldown extends IInternalCooldown {
  target: TInternalCooldownTarget;
  summonerName: string;
}
declare interface IInternalObjectCooldown extends IInternalCooldown {
  target: TInternalCooldownObject;
  team: ILiveAPIPlayerTeam;
  lane?: ILiveAPIMapLane;
}
declare type TInternalCooldownReduction = {
  id: number;
  count: number;
  target: TInternalCooldownReductionTarget;
};
declare type TInternalCooldownReductionItem = TInternalCooldownReduction & {
  isHaste: boolean;
};
declare type TInternalMapInfoCDRMap = {
  map: TInternalCooldownReduction[];
};
declare type TInternalStatsCDRMap = {
  items: TInternalCooldownReductionItem[];
  runes: TInternalCooldownReduction[];
};
declare type TInternalEventsCDRMap = {
  kills: Set<string>;
  dragons: TInternalCooldownReduction[];
};
declare type TInternalPlayerCDRMap = TInternalMapInfoCDRMap & TInternalStatsCDRMap & TInternalEventsCDRMap;
declare type TInternalPlayerTrackTargets = Record<TInternalCooldownTarget, boolean>;
declare type TInternalPlayerStats = {
  summonerName: string;
  championName: string;
  team: ILiveAPIPlayerTeam;

  level: number;
  items: Set<number>;
  runes: Set<number>;
  summonerSpells: Set<string>;

  isDead: boolean;
  respawnTimer: number;

  track?: TInternalPlayerTrackTargets;
};
declare interface IInternalPlayer {
  stats: TInternalPlayerStats;
  cooldowns?: Map<TInternalCooldownTarget, IInternalCooldown>;
  cdr?: TInternalPlayerCDRMap;
}
declare type TInternalChampionKillEvent = {
  id: number;
  killer: string;
  assisters: Set<string>;
  victim: string;
};
declare type TInternalBaronKillEvent = {
  id: number;
  team: ILiveAPIPlayerTeam;
};
declare type TInternalDragonKillEvent = {
  id: number;
  team: ILiveAPIPlayerTeam;
  dragonType: ILiveAPIDragonType;
};
declare type TInternalInhibKillEvent = {
  team: ILiveAPIPlayerTeam;
  lane: ILiveAPIMapLane;
};
declare type TInternalGameStats = {
  gameTime: number;
  mapId: number;
};
declare type TInternalGameEvent = ILiveAPIGameEvent;
declare interface IInternalGame {
  me: string;
  stats: TInternalGameStats;
  players?: Map<string, IInternalPlayer>;
  events?: TInternalGameEvent[];
  cooldowns?: Map<string, IInternalObjectCooldown>;
}
// #endregion Transformed League Data


declare interface IInternalSettings {
  overlayLaunch: boolean;
  overlayKey: string;
  overlayWindowName: string;
  showAllyTeam: boolean;
  showEnemyTeam: boolean;
  showObjects: boolean;
  lanAvailability: boolean;
}