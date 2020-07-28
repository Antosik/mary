declare interface IInternalPlayerRune {
  displayName: string;
  runeID: number;
}

declare interface IInternalPlayerRunes {
  primary: IInternalPlayerRune;
  secondary: IInternalPlayerRune;
}

declare interface IInternalPlayerItem {
  count: number;
  displayName: string;
  itemID: number;
  slot: 1 | 2 | 3 | 4 | 5 | 6;
}

declare interface IInternalPlayerInfo extends Record<string, any> {
  summonerName: string;

  championName: string;
  level: number;
  scores: ILiveAPIPlayerScore;
  team: ILiveAPIPlayerTeam;

  isDead: boolean;
  respawnTimer: number;

  items: IInternalPlayerItem[];
  runes: IInternalPlayerRunes;
  summonerSpells: string[];
}

declare interface IInternalCooldown {
  summonerName: string;
  championName: string;
  start: Date;
  end: Date;
  target: string;
}

declare type ILevelDependantCD = (level: number) => number;
declare interface ISpellInfo {
  id: string;
  name: string;
  cooldown: number | ILevelDependantCD;
}


declare type IKeyValue = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
declare type TAnyFunc = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any



declare type TInternalCooldownTargetNew =
  | "Q" | "W" | "E" | "R"
  | "D" | "F"             // first and second summoner skills
  | "P";                  // passive
declare type TInternalCooldownObjectNew =
  | "Elder"
  | "Baron"
  | "Inhib";
declare type TInternalCooldownReductionTargetNew =
  | "Ability"
  | "Ultimate Ability"
  | "Summoner Spell";
declare interface IInternalCooldownNew {
  id: string;
  start: Date;
  end: Date;
}
declare interface IInternalPlayerCooldownNew extends IInternalCooldownNew {
  target: TInternalCooldownTargetNew;
  summonerName: string;
}
declare interface IInternalObjectCooldownNew extends IInternalCooldownNew {
  target: TInternalCooldownObjectNew;
  team: ILiveAPIPlayerTeam;
  lane?: ILiveAPIMapLane;
}
declare type TInternalCooldownReductionNew = {
  id: number;
  count: number;
  target: TInternalCooldownReductionTargetNew;
};
declare type TInternalCooldownReductionItemNew = TInternalCooldownReductionNew & {
  isHaste: boolean;
};
declare type TInternalMapInfoCDRMapNew = {
  map: TInternalCooldownReductionNew[];
};
declare type TInternalStatsCDRMapNew = {
  items: TInternalCooldownReductionItemNew[];
  runes: TInternalCooldownReductionNew[];
};
declare type TInternalEventsCDRMapNew = {
  kills: Set<string>;
  dragons: TInternalCooldownReductionNew[];
};
declare type TInternalPlayerCDRMapNew = TInternalMapInfoCDRMapNew & TInternalStatsCDRMapNew & TInternalEventsCDRMapNew;
declare type TInternalPlayerStatsNew = {
  summonerName: string;
  championName: string;
  team: ILiveAPIPlayerTeam;

  level: number;
  items: Set<number>;
  runes: Set<number>;
  summonerSpells: Set<string>;

  isDead: boolean;
  respawnTimer: number;
};
declare interface IInternalPlayerNew {
  stats: TInternalPlayerStatsNew;
  cooldowns?: Map<TInternalCooldownTargetNew, IInternalCooldownNew>;
  cdr?: TInternalPlayerCDRMapNew;
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
declare type TInternalGameStatsNew = {
  gameTime: number;
  mapId: number;
};
declare type TInternalGameEventNew = ILiveAPIGameEvent;
declare interface IInternalGameNew {
  me: string;
  stats: TInternalGameStatsNew;
  players?: Map<string, IInternalPlayerNew>;
  events?: TInternalGameEventNew[];
  cooldowns?: Map<string, IInternalObjectCooldownNew>;
}
declare interface IInternalSettingsNew {
  overlayLaunch: boolean;
  overlayKey: string;
  overlayWindowName: string;
  showAllyTeam: boolean;
  showEnemyTeam: boolean;
  showObjects: boolean;
  lanAvailability: boolean;
}

declare type TMessageContainer<T = unknown> = {
  event: string;
  data?: undefined | IResult<T>;
};