export class Cooldown implements IInternalCooldownNew {

  private static INTERVAL_SIZE = 5e3;

  #intervalTimer: NodeJS.Timer;

  #id: string;
  #start: Date;
  #end: Date;

  #handler: TAnyFunc;

  public constructor(id: string, seconds: number, handler: TAnyFunc) {

    this.#id = id;
    this.#start = new Date();
    this.#end = new Date(Date.now() + seconds * 1e3);

    this.#handler = handler;

    this._pingAfterTimeout = this._pingAfterTimeout.bind(this); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    this.#intervalTimer = setInterval(
      this._pingAfterTimeout,                                   // eslint-disable-line @typescript-eslint/unbound-method
      Cooldown.INTERVAL_SIZE
    );
  }

  // #region Getters & Setters
  public get id(): string {
    return this.#id;
  }
  public get start(): Date {
    return this.#start;
  }
  public get end(): Date {
    return this.#end;
  }
  public get rawValue(): IInternalCooldownNew {
    return {
      id: this.#id,
      start: this.#start,
      end: this.#end
    };
  }
  // #endregion Getters & Setters


  protected _pingAfterTimeout(): void {
    if (new Date() >= this.#end) {
      this.updateTime();
    }
    this.#handler();
  }

  public updateTime(): void {
    this.#end = new Date(0);
  }

  // #region Cleanup
  public destroy(): void {
    this.updateTime();
    clearInterval(this.#intervalTimer);
  }
  // #endregion Cleanup
}