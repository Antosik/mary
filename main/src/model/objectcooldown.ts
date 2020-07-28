import { Cooldown } from "@mary-main/model/cooldown";
import { Events } from "@mary-main/utils/events";


export class ObjectCooldown extends Cooldown implements IInternalObjectCooldownNew, IDestroyable {

  public static fromRawValue(rawValue: IInternalObjectCooldownNew): ObjectCooldown | undefined {

    const now = new Date();
    if (now > rawValue.end) {
      return;
    }

    const seconds = (rawValue.end.getTime() - now.getTime()) / 1e3;
    return new ObjectCooldown(rawValue.team, rawValue.target, seconds, rawValue.lane);
  }

  private static _generateId(
    team: ILiveAPIPlayerTeam,
    target: TInternalCooldownObjectNew,
    lane?: ILiveAPIMapLane
  ) {
    return `${team}-${target}-${lane ?? ""}`;
  }

  #target: TInternalCooldownObjectNew;
  #team: ILiveAPIPlayerTeam;
  #lane?: ILiveAPIMapLane;

  public constructor(
    team: ILiveAPIPlayerTeam,
    target: TInternalCooldownObjectNew,
    seconds: number,
    lane?: ILiveAPIMapLane
  ) {

    super(ObjectCooldown._generateId(team, target, lane), seconds, () => Events.emit("data:cooldown:object", this));

    this.#team = team;
    this.#target = target;
    this.#lane = lane;

    Events.emit("data:cooldown:object", this);
  }

  // #region Getters & Setters
  public get team(): ILiveAPIPlayerTeam {
    return this.#team;
  }
  public get target(): TInternalCooldownObjectNew {
    return this.#target;
  }
  public get lane(): ILiveAPIMapLane | undefined {
    return this.#lane;
  }
  public get rawValue(): IInternalObjectCooldownNew {
    return {
      team: this.#team,
      target: this.#target,
      lane: this.#lane,
      ...super.rawValue
    };
  }
  // #endregion Getters & Setters


  // #region Internal
  public reset(): void {
    this.destroy();
    Events.emit("data:cooldown:object", this);
  }
  // #endregion Internal
}