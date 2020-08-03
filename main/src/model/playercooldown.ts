import { Cooldown } from "@mary-main/model/cooldown";
import { Events } from "@mary-main/utils/events";


export class PlayerCooldown extends Cooldown implements IInternalPlayerCooldown, IDestroyable {

  public static fromRawValue(rawValue: IInternalPlayerCooldown): PlayerCooldown | undefined {

    const now = new Date();
    if (now > rawValue.end) {
      return;
    }

    const seconds = (rawValue.end.getTime() - now.getTime()) / 1e3;
    return new PlayerCooldown(rawValue.summonerName, rawValue.target, seconds);
  }

  private static _generateId(summonerName: string, target: TInternalCooldownTarget) {
    return `${summonerName}-${target}`;
  }

  #summonerName: string;
  #target: TInternalCooldownTarget;

  public constructor(
    summonerName: string,
    target: TInternalCooldownTarget,
    seconds: number
  ) {
    super(PlayerCooldown._generateId(summonerName, target), seconds, () => this._emit());

    this.#summonerName = summonerName;
    this.#target = target;

    this._emit();
  }

  // #region Getters & Setters
  public get summonerName(): string {
    return this.#summonerName;
  }
  public get target(): TInternalCooldownTarget {
    return this.#target;
  }
  public get rawValue(): IInternalPlayerCooldown {
    return {
      summonerName: this.#summonerName,
      target: this.#target,
      ...super.rawValue
    };
  }
  // #endregion Getters & Setters


  // #region Internal
  private _emit(): void {
    Events.emit("data:cooldown:player", this);
  }

  public reset(): void {
    this.destroy();
    this._emit();
  }
  // #endregion Internal
}