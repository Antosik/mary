import { Cooldown } from "@mary-main/model/cooldown";
import { Events } from "@mary-main/utils/events";


export class ObjectCooldown extends Cooldown implements IInternalObjectCooldown, IDestroyable {

  public static fromRawValue(rawValue: IInternalObjectCooldown): ObjectCooldown | undefined {

    const now = new Date();
    if (now > rawValue.end) {
      return;
    }

    const seconds = (rawValue.end.getTime() - now.getTime()) / 1e3;
    return new ObjectCooldown(rawValue.team, rawValue.target, seconds, rawValue.lane);
  }

  private static _generateId(
    team: ILiveAPIPlayerTeam,
    target: TInternalCooldownObject,
    lane?: ILiveAPIMapLane
  ) {
    return `${team}-${target}-${lane ?? ""}`;
  }

  #target: TInternalCooldownObject;
  #team: ILiveAPIPlayerTeam;
  #lane?: ILiveAPIMapLane;

  public constructor(
    team: ILiveAPIPlayerTeam,
    target: TInternalCooldownObject,
    seconds: number,
    lane?: ILiveAPIMapLane
  ) {

    super(ObjectCooldown._generateId(team, target, lane), seconds, () => this._emit());

    this.#team = team;
    this.#target = target;
    this.#lane = lane;

    this._emit();
  }

  // #region Getters & Setters
  public get team(): ILiveAPIPlayerTeam {
    return this.#team;
  }
  public get target(): TInternalCooldownObject {
    return this.#target;
  }
  public get lane(): ILiveAPIMapLane | undefined {
    return this.#lane;
  }
  public get rawValue(): IInternalObjectCooldown {
    return {
      team: this.#team,
      target: this.#target,
      lane: this.#lane,
      ...super.rawValue
    };
  }
  // #endregion Getters & Setters


  // #region Internal
  private _emit(): void {
    Events.emit("data:cooldown:object", this);
  }

  public reset(): void {
    this.destroy();
    this._emit();
  }
  // #endregion Internal
}