declare interface IClientRPC {
  send(event: TRPCHandlerEvent, ...data: unknown[]): void;
  invoke<T>(event: TRPCHandlerEvent, ...data: unknown[]): Promise<T | undefined>;
  addListener(event: string, listener: (func: TAnyFunc) => void): any;
  removeListener(event: string, listener: (func: TAnyFunc) => void): any;
}