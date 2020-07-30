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

declare interface IDestroyable {
  destroy(): void;
}

declare interface IMaryOutput {
  send(container: TMessageContainer): void;
}

declare type TOverlaySettings = {
  overlayKey?: string;
  overlayWindowName?: string;
};

declare module "@polka/send-type" {
  import { ServerResponse } from "http";

  function send(res: ServerResponse, code: number, data?: any, headers?: any): void;
  export default send;
}
