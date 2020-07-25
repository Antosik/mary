type TResultStatus = "unknown" | "success" | "warning" | "error";
interface IResult<T> { notification?: string, error?: Error, data?: T, status: TResultStatus }

declare interface IRPCHandlerResponse {
  status: "ok" | "error";
  notification?: string;
  data?: unknown;
}

declare type TRPCHandlerFunc<T = unknown> = (...args: any[]) => void | Promise<void> | IResult<T> | Promise<IResult<T>>; // eslint-disable-line @typescript-eslint/no-explicit-any

declare type TRPCHandlerEvent = "live:connect" | "cooldowns:object:get" | "cooldowns:player:get" | "cooldown:player:set" | "cooldown:player:reset";