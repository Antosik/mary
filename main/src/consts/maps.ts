// Map of MapId to Summoner Spell CDR
export const SS_MAP_CDR_MAP = new Map<number, number>([
  [12, -0.4], // Howling Abyss
  [21, -0.4] // Nexus Blitz
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