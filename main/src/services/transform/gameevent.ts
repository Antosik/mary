import type { Game } from "@mary-main/model/game";

import { INHIB_LANEID_LANE_MAP, INHIB_TEAMID_TEAM_MAP } from "@mary-main/consts/maps";
import { isNotExists } from "@mary-shared/utils/typeguards";


export class GameEventTransformer {

  private static _neutrals = ["Turret", "Minion", "Unknown", "Dragon"];

  public static transformInhibKilledEvent(event: ILiveAPIInhibKilledEvent): TInternalInhibKillEvent {

    const [targetRaw, teamRaw, laneRaw] = event.InhibKilled.split("_");

    const team = INHIB_TEAMID_TEAM_MAP.get(teamRaw);
    const lane = INHIB_LANEID_LANE_MAP.get(laneRaw);

    if (targetRaw !== "Barracks" || isNotExists(team) || isNotExists(lane)) {
      throw new Error("Invalid event");
    }

    return {
      team,
      lane
    };
  }

  public static transformBaronKillEvent(event: ILiveAPIBaronKillEvent, game: Game): TInternalBaronKillEvent {

    const baronKillPlayer = game.players.get(event.KillerName);
    if (isNotExists(baronKillPlayer)) {
      throw new Error("Player not found");
    }

    return {
      id: event.EventID,
      team: baronKillPlayer.team
    };
  }

  public static transformDragonKillEvent(event: ILiveAPIDragonKillEvent, game: Game): TInternalDragonKillEvent {

    const dragonKillPlayer = game.players.get(event.KillerName);
    if (isNotExists(dragonKillPlayer)) {
      throw new Error("Player not found");
    }

    return {
      id: event.EventID,
      dragonType: event.DragonType,
      team: dragonKillPlayer.team
    };
  }

  public static transformChampionKillEvent(event: ILiveAPIChampionKillEvent, game: Game): TInternalChampionKillEvent | undefined {

    for (const neutral of GameEventTransformer._neutrals) {
      if (event.KillerName.includes(neutral)) {
        return undefined;
      }
    }

    const killerPlayer = game.players.get(event.KillerName);
    if (isNotExists(killerPlayer) || !game.players.has(event.VictimName)) {
      throw new Error("Player not found");
    }

    const assisters = event.Assisters.filter(assisterName => game.players.has(assisterName));

    return {
      id: event.EventID,
      killer: event.KillerName,
      assisters: new Set(assisters),
      victim: event.VictimName,
    };
  }
}