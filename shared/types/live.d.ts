declare interface ILiveAPIPlayerSummonerSpell {
  displayName: string;
  rawDescription: string;
  rawDisplayName: string;
}

declare interface ILiveAPIPlayerSummonerSpells {
  summonerSpellOne: ILiveAPIPlayerSummonerSpell;
  summonerSpellTwo: ILiveAPIPlayerSummonerSpell;
}

declare interface ILiveAPIPlayerMainRune {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

declare interface ILiveAPIPlayerMainRunes {
  keystone: ILiveAPIPlayerMainRune;
  primaryRuneTree: ILiveAPIPlayerMainRune;
  secondaryRuneTree: ILiveAPIPlayerMainRune;
}

declare interface ILiveAPIPlayerItem {
  canUse: boolean;
  consumable: boolean;
  count: number;
  displayName: string;
  itemID: number;
  price: number;
  rawDescription: string;
  rawDisplayName: string;
  slot: 1 | 2 | 3 | 4 | 5 | 6;
}

declare interface ILiveAPIPlayerScore {
  assists: number;
  creepScore: number;
  deaths: number;
  kills: number;
  wardScore: number;
}

declare type ILiveAPIPlayerTeam = "ORDER" | "CHAOS";
declare type ILiveAPIMapLane = "TOP" | "MID" | "BOT";

declare interface ILiveAPIPlayer {
  championName: string;
  isBot: false;
  isDead: false;
  items: ILiveAPIPlayerItem[];
  level: number;
  position: "MIDDLE";
  rawChampionName: string;
  respawnTimer: number;
  runes: ILiveAPIPlayerMainRunes;
  scores: ILiveAPIPlayerScore;
  skinID: number;
  summonerName: string;
  summonerSpells: ILiveAPIPlayerSummonerSpells;
  team: ILiveAPIPlayerTeam;
}

// Docs: http://static.developer.riotgames.com/docs/lol/gameModes.json
declare type ILiveAPIGameMode = "CLASSIC" | "ARAM" | "URF" | "TUTORIAL";

// Docs: http://static.developer.riotgames.com/docs/lol/maps.json
declare interface ILiveAPIGameStats {
  gameMode: ILiveAPIGameMode;
  gameTime: number;
  mapName: string;
  mapNumber: number;
  mapTerrain: string;
}


// #region Events
declare type ILiveAPIGameEventObjectType =
  | "DragonKill" | "HeraldKill" | "BaronKill";
declare type ILiveAPIGameEventKillWithAssistersType =
  | "TurretKilled" | "InhibKilled" | ILiveAPIGameEventObjectType | "ChampionKill";
declare type ILiveAPIGameEventKillType =
  | "FirstBrick" | ILiveAPIGameEventKillWithAssistersType | "Multikill" | "Ace";
declare type ILiveAPIGameEventType =
  | "GameStart" | "MinionsSpawning" | ILiveAPIGameEventKillType;

declare interface ILiveAPIGameBaseEvent<T extends ILiveAPIGameEventType> {
  EventID: 0;
  EventName: T;
  EventTime: 0;
}
declare interface ILiveAPIGameBaseKillEvent<T extends ILiveAPIGameEventKillType> extends ILiveAPIGameBaseEvent<T> {
  KillerName: string;
}
declare interface ILiveAPIGameBaseKillWithAssistersEvent<T extends ILiveAPIGameEventKillWithAssistersType> extends ILiveAPIGameBaseKillEvent<T> {
  Assisters: string[];
}
declare interface ILiveAPIGameBaseObjectKillEvent<T extends ILiveAPIGameEventObjectType> extends ILiveAPIGameBaseKillWithAssistersEvent<T> {
  Stolen: "False" | "True";
}

declare type ILiveAPIDragonType = "Earth" | "Water" | "Fire" | "Air" | "Elder";

declare type ILiveAPIGameStartEvent = ILiveAPIGameBaseEvent<"GameStart">;
declare type ILiveAPIMinionsSpawningEvent = ILiveAPIGameBaseEvent<"MinionsSpawning">;
declare type ILiveAPIFirstBrickEvent = ILiveAPIGameBaseKillEvent<"FirstBrick">;
declare type ILiveAPITurretKilledEvent = ILiveAPIGameBaseKillWithAssistersEvent<"TurretKilled"> & { TurretKilled: string };
declare type ILiveAPIInhibKilledEvent = ILiveAPIGameBaseKillWithAssistersEvent<"InhibKilled"> & { InhibKilled: string };
declare type ILiveAPIDragonKillEvent = ILiveAPIGameBaseObjectKillEvent<"DragonKill"> & { DragonType: ILiveAPIDragonType };
declare type ILiveAPIHeraldKillEvent = ILiveAPIGameBaseObjectKillEvent<"HeraldKill">;
declare type ILiveAPIBaronKillEvent = ILiveAPIGameBaseObjectKillEvent<"BaronKill">;
declare type ILiveAPIChampionKillEvent = ILiveAPIGameBaseKillWithAssistersEvent<"ChampionKill"> & { VictimName: string };
declare type ILiveAPIMultikillEvent = ILiveAPIGameBaseKillEvent<"Multikill"> & { KillStreak: 2 | 3 | 4 | 5 };
declare type ILiveAPIAceEvent = ILiveAPIGameBaseEvent<"Ace"> & { Acer: string, AcingTeam: ILiveAPIPlayerTeam };

declare type ILiveAPIGameEvent =
  | ILiveAPIGameStartEvent
  | ILiveAPIMinionsSpawningEvent
  | ILiveAPIFirstBrickEvent
  | ILiveAPITurretKilledEvent
  | ILiveAPIInhibKilledEvent
  | ILiveAPIDragonKillEvent
  | ILiveAPIHeraldKillEvent
  | ILiveAPIBaronKillEvent
  | ILiveAPIChampionKillEvent
  | ILiveAPIMultikillEvent
  | ILiveAPIAceEvent;
// #endregion Event