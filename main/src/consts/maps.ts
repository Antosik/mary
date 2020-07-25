// Map of MapId to Summoner Spell CDR
export const SS_MAP_CDR_MAP = new Map<number, number>([
  [12, -0.1] // Howling Abyss
]);

// Map of Inhibitor LaneId to Lane
export const INHIB_LANEID_LANE_MAP = new Map<string, ILiveAPIMapLane>([
  ["L1", "TOP"],
  ["C1", "MID"],
  ["R1", "BOT"]
]);

// Map of TeamId to Team
export const INHIB_TEAMID_TEAM_MAP = new Map<string, ILiveAPIPlayerTeam>([
  ["T1", "ORDER"],
  ["T2", "CHAOS"]
]);