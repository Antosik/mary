export const spells: ISpellInfo[] = [
  { "id": "SummonerBarrier", "name": "Barrier", "cooldown": 180 },
  { "id": "SummonerBoost", "name": "Cleanse", "cooldown": 210 },
  { "id": "SummonerDot", "name": "Ignite", "cooldown": 180 },
  { "id": "SummonerExhaust", "name": "Exhaust", "cooldown": 210 },
  { "id": "SummonerFlash", "name": "Flash", "cooldown": 300 },
  { "id": "SummonerHaste", "name": "Ghost", "cooldown": 210 },
  { "id": "SummonerHeal", "name": "Heal", "cooldown": 240 },
  { "id": "SummonerMana", "name": "Clarity", "cooldown": 240 },
  { "id": "SummonerSmite", "name": "Smite ", "cooldown": 90 },
  { "id": "SummonerTeleport", "name": "Teleport", "cooldown": (level: number): number => 430.588 - 10.588 * level },
  { "id": "SummonerSnowball", "name": "Mark", "cooldown": 80 },
];

export const SMITE_CONST = "SummonerSmite";