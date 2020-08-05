import { EventEmitter } from "events";


export class EventsWithInvoke extends EventEmitter implements IDestroyable {

  #handlers: Map<string, TRPCHandlerFunc>;

  constructor() {
    super();

    this.#handlers = new Map<string, TRPCHandlerFunc>();
  }

  protected get handlers(): Map<string, TRPCHandlerFunc> {
    return this.#handlers;
  }

  public getHandler(event: string): TRPCHandlerFunc | undefined {
    return this.#handlers.get(event);
  }

  public setHandler(event: string, handler: TRPCHandlerFunc): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.#handlers.set(event, handler);
  }

  public destroy(): void {
    this.#handlers.clear();

    this.removeAllListeners();
  }
}