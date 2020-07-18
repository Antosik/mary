// Map of RuneID to Summoner Spell CDR
export const SS_RUNE_CDR_MAP = new Map<number, number>([
  [8300, -0.05]
]);

// Map of ItemID to CDR
export const ABILITY_RUNE_CDR_MAP = new Map<number, number | ILevelDependantCD>([
  [8300, -0.05],
  [8200, (level: number) => level >= 10 ? 10 : 0]
]);