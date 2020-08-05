import { BARON_BUFF_DURATION, INHIB_KILL_DURATION, ELDER_BUFF_DURATION } from "@mary-main/consts/game";
import { ObjectCooldown } from "@mary-main/model/objectcooldown";
import { Player } from "@mary-main/model/player";
import { GameDataTransformer } from "@mary-main/services/transform/gamedata";
import { GameEventTransformer } from "@mary-main/services/transform/gameevent";
import { PlayerTransformer } from "@mary-main/services/transform/player";
import { isNotExists, isEmpty, isNotEmpty, isExists } from "@mary-shared/utils/typeguards";
import { logError } from "@mary-main/utils/log";


export class Game implements IInternalGame, IDestroyable {

  public static isTheSameGames(first: Game, second: Game): boolean {
    if (isNotExists(first.stats) || isNotExists(second.stats)) {
      return false;
    }

    return first.stats.gameTime < second.stats.gameTime
      && first.gid === second.gid;
  }

  #me: string;
  #stats: TInternalGameStats;
  #players: Map<string, Player>;
  #events: TInternalGameEvent[];
  #cooldowns: Map<string, ObjectCooldown>;

  #isPlayersMapGenerated: boolean;

  constructor(
    me: string,
    stats: ILiveAPIGameStats,
    players?: ILiveAPIPlayer[],
    events?: TInternalGameEvent[],
    cooldowns?: IInternalObjectCooldown[]
  ) {
    this.#me = me;
    this.#stats = GameDataTransformer.transformToInternal(stats);
    this.#players = new Map<string, Player>();
    this.#events = [];
    this.#cooldowns = new Map<string, ObjectCooldown>();

    this.#isPlayersMapGenerated = false;

    if (isNotEmpty(players)) {
      this.setPlayers(players);
    }
    if (isNotEmpty(events)) {
      this.setEvents(events);
    }
    if (isNotEmpty(cooldowns)) {
      this.setObjectCooldowns(cooldowns);
    }
  }

  // #region Getters & Setters
  public get gid(): string {
    return Array.from(this.#players.keys()).join("#");
  }
  public get me(): string {
    return this.#me;
  }
  public get mePlayer(): Player | undefined {
    return this.#players.get(this.#me);
  }
  public get stats(): TInternalGameStats {
    return this.#stats;
  }
  public get events(): TInternalGameEvent[] {
    return this.#events;
  }
  public get players(): Map<string, Player> {
    return this.#players;
  }
  public get rawValue(): number {
    return this.#stats.mapId;
  }
  // #endregion Getters & Setters


  // #region Custom Getters & Setters
  public getPlayersCooldowns(): IInternalPlayerCooldown[] {
    let cooldowns: IInternalPlayerCooldown[] = [];
    for (const player of this.#players.values()) {
      cooldowns = cooldowns.concat(player.rawCooldowns);
    }
    return cooldowns;
  }

  public getObjectsCooldowns(): IInternalObjectCooldown[] {
    let cooldowns: IInternalObjectCooldown[] = [];
    for (const objectCooldown of this.#cooldowns.values()) {
      cooldowns = cooldowns.concat(objectCooldown.rawValue);
    }
    return cooldowns;
  }

  public setEvents(value: ILiveAPIGameEvent[]): void {
    const oldEvents = this.#events;
    this.#events = value;
    this._onEventsChange(oldEvents, value);
  }

  public setPlayers(value: ILiveAPIPlayer[]): void {

    for (const rawPlayer of value) {

      if (rawPlayer.isBot) {
        continue;
      }

      const existingPlayer = this.#players.get(rawPlayer.summonerName);
      const transformedRawPlayer = PlayerTransformer.transformToInternal(rawPlayer);

      if (isExists(existingPlayer)) {

        existingPlayer.stats = transformedRawPlayer;
      } else if (!this.#isPlayersMapGenerated) {

        const newPlayer = new Player(transformedRawPlayer);
        newPlayer.setMapType(this.#stats.mapId);
        this.#players.set(newPlayer.stats.summonerName, newPlayer);
      } else {

        logError(`"[MaryServer]" Player not found - ${JSON.stringify(rawPlayer)}`);
        throw new Error("Player not found");
      }
    }

    if (!this.#isPlayersMapGenerated) {
      this.#isPlayersMapGenerated = true;
    }
  }

  private setObjectCooldowns(value: IInternalObjectCooldown[]): void {
    for (const item of value) {
      const cooldown = ObjectCooldown.fromRawValue(item);
      if (isExists(cooldown)) {
        this.#cooldowns.set(cooldown.id, cooldown);
      }
    }
  }

  public removeObjectCooldown(id: string): void {
    const cooldown = this.#cooldowns.get(id);
    if (isExists(cooldown)) {
      cooldown.destroy();
      this.#cooldowns.delete(id);
    }
  }
  // #endregion Custom Setters


  // #region Events handlers
  private _onEventsChange(oldEvents: TInternalGameEvent[], newEvents: TInternalGameEvent[]): void {

    const isInit = isEmpty(oldEvents);
    if (isInit && !this.#isPlayersMapGenerated) {
      return;
    }

    if (oldEvents.length === newEvents.length) {
      return;
    }

    const oldEventsIds = oldEvents.map(event => event.EventID);
    for (const newEvent of newEvents) {
      if (oldEventsIds.includes(newEvent.EventID)) {
        continue;
      }

      if (newEvent.EventName === "BaronKill") {
        this._onBaronKillEvent(newEvent, isInit);
        continue;
      }

      if (newEvent.EventName === "InhibKilled") {
        this._onInhibKillEvent(newEvent, isInit);
        continue;
      }

      if (newEvent.EventName === "DragonKill") {
        this._onDragonKillEvent(newEvent, isInit);
        continue;
      }

      if (newEvent.EventName === "ChampionKill") {
        this._onChampionKillEvent(newEvent);
        continue;
      }
    }
  }

  private _onBaronKillEvent(event: ILiveAPIBaronKillEvent, isInit: boolean): void {

    if (isInit) {
      return;
    }

    const baronKillEvent = GameEventTransformer.transformBaronKillEvent(event, this);

    const cooldown = new ObjectCooldown(baronKillEvent.team, "Baron", BARON_BUFF_DURATION);
    this.#cooldowns.set(cooldown.id, cooldown);
  }

  private _onInhibKillEvent(event: ILiveAPIInhibKilledEvent, isInit: boolean): void {

    if (isInit) {
      return;
    }

    const inhibKillEvent = GameEventTransformer.transformInhibKilledEvent(event);

    const cooldown = new ObjectCooldown(inhibKillEvent.team, "Inhib", INHIB_KILL_DURATION, inhibKillEvent.lane);
    this.#cooldowns.set(cooldown.id, cooldown);
  }

  private _onDragonKillEvent(event: ILiveAPIDragonKillEvent, isInit: boolean): void {

    const dragonKillEvent = GameEventTransformer.transformDragonKillEvent(event, this);

    for (const player of this.#players.values()) {
      if (dragonKillEvent.team === player.team) {
        player.addDragonEvent(dragonKillEvent);
      }
    }

    if (dragonKillEvent.dragonType === "Elder" && !isInit) {

      const cooldown = new ObjectCooldown(dragonKillEvent.team, "Elder", ELDER_BUFF_DURATION);
      this.#cooldowns.set(cooldown.id, cooldown);
      return;
    }

  }

  private _onChampionKillEvent(event: ILiveAPIChampionKillEvent): void {

    const championKillEvent = GameEventTransformer.transformChampionKillEvent(event, this);
    if (isNotExists(championKillEvent)) {
      return;
    }

    this.#players.get(championKillEvent.killer)!.addKillEvent(championKillEvent);
    for (const assisterName of championKillEvent.assisters) {
      const assisterPlayer = this.#players.get(assisterName)!;
      assisterPlayer.addKillEvent(championKillEvent);
    }
  }
  // #endregion Events handlers


  // #region Cleanup
  public destroy(): void {
    for (const player of this.#players.values()) {
      player.destroy();
    }
    for (const cooldown of this.#cooldowns.values()) {
      cooldown.destroy();
    }
  }
  // #endregion Cleanup
}