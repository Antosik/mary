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


declare type IRPCHandlerFunc = (...args: any[]) => IRPCHandlerResponse | Promise<IRPCHandlerResponse>; // eslint-disable-line @typescript-eslint/no-explicit-any

declare interface IRPCHandlerResponse {
  status: "ok" | "error";
  notification?: string;
  data?: unknown;
}

declare type RPCHandlerEventType = "live:connect" | "cooldowns:get" | "cooldowns:set";

declare type IKeyValue = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
declare type TAnyFunc = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
