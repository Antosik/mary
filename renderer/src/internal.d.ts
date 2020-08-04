/* eslint-disable @typescript-eslint/no-explicit-any */
declare interface IClientRPC {

  send(event: TRPCHandlerEvent, ...data: unknown[]): void;
  invoke<T>(event: TRPCHandlerEvent, ...data: unknown[]): Promise<T | undefined>;

  setOpenHandler(handler?: TAnyFunc): void;

  addListener(event: string, listener: TAnyFunc): any;

  addListener(event: "settings:updated", handler: (data: IInternalSettings) => any): any;
  addListener(event: "live:connected", handler: () => any): any;
  addListener(event: "live:me", handler: (me: TInternalPlayerStats) => any): any;
  addListener(event: "live:players", handler: (players: TInternalPlayerStats[]) => any): any;
  addListener(event: "live:disconnected", handler: () => void): any;
  addListener(event: "cooldown:player:ping", handler: (cooldown: IInternalPlayerCooldown) => any): any;
  addListener(event: "cooldown:object:ping", handler: (cooldown: IInternalObjectCooldown) => any): any;


  removeListener(event: string, listener: TAnyFunc): any;
}