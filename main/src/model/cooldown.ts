export class Cooldown implements IInternalCooldown, IDestroyable {

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

    this.#intervalTimer = setInterval(
      this._pingAfterTimeout,
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
  public get rawValue(): IInternalCooldown {
    return {
      id: this.#id,
      start: this.#start,
      end: this.#end
    };
  }
  // #endregion Getters & Setters


  // #region Internal
  protected _pingAfterTimeout = (): void => {
    if (new Date() >= this.#end) {
      this.updateTime();
    }
    this.#handler();
  };

  public updateTime(): void {
    this.#end = new Date(0);
  }
  // #endregion Internal


  // #region Cleanup
  public destroy(): void {
    this.updateTime();
    clearInterval(this.#intervalTimer);
  }
  // #endregion Cleanup
}