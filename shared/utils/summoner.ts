export function groupByTeam<T extends { team: ILiveAPIPlayerTeam }>(arr: T[]): Record<ILiveAPIPlayerTeam, T[]> {
  return arr.reduce(
    function (rv, x) {
      const team = x.team;
      (rv[team] = rv[team] || []).push(x);
      return rv;
    },
    { "ORDER": [] as T[], "CHAOS": [] as T[] },
  );
}

export function getPlayerNameToTeamMap(arr: TInternalPlayerStats[]): Map<string, ILiveAPIPlayerTeam> {
  const result = new Map<string, ILiveAPIPlayerTeam>();

  for (const summoner of arr) {
    result.set(summoner.summonerName, summoner.team);
  }

  return result;
}