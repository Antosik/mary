import { Cooldown } from "@mary-main/model/cooldown";
import { Events } from "@mary-main/utils/events";


export class PlayerCooldown extends Cooldown implements IInternalPlayerCooldownNew, IDestroyable {

  public static fromRawValue(rawValue: IInternalPlayerCooldownNew): PlayerCooldown | undefined {

    const now = new Date();
    if (now > rawValue.end) {
      return;
    }

    const seconds = (rawValue.end.getTime() - now.getTime()) / 1e3;
    return new PlayerCooldown(rawValue.summonerName, rawValue.target, seconds);
  }

  private static _generateId(summonerName: string, target: TInternalCooldownTargetNew) {
    return `${summonerName}-${target}`;
  }

  #summonerName: string;
  #target: TInternalCooldownTargetNew;

  public constructor(
    summonerName: string,
    target: TInternalCooldownTargetNew,
    seconds: number
  ) {
    super(PlayerCooldown._generateId(summonerName, target), seconds, () => Events.emit("data:cooldown:player", this));

    this.#summonerName = summonerName;
    this.#target = target;

    Events.emit("data:cooldown:player", this);
  }

  // #region Getters & Setters
  public get summonerName(): string {
    return this.#summonerName;
  }
  public get target(): TInternalCooldownTargetNew {
    return this.#target;
  }
  public get rawValue(): IInternalPlayerCooldownNew {
    return {
      summonerName: this.#summonerName,
      target: this.#target,
      ...super.rawValue
    };
  }
  // #endregion Getters & Setters


  // #region Internal
  public reset(): void {
    this.destroy();
    Events.emit("data:cooldown:player", this);
  }
  // #endregion Internal
}