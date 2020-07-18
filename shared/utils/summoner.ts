export function groupByTeam(arr: IInternalPlayerInfo[]): Record<ILiveAPIPlayerTeam, IInternalPlayerInfo[]> {
  return arr.reduce(
    function (rv, x) {
      const team = x.team;
      (rv[team] = rv[team] || []).push(x);
      return rv;
    },
    { "ORDER": [] as IInternalPlayerInfo[], "CHAOS": [] as IInternalPlayerInfo[] },
  );
}

export function getPlayerNameToTeamMap(arr: IInternalPlayerInfo[]): Map<string, ILiveAPIPlayerTeam> {
  const result = new Map<string, ILiveAPIPlayerTeam>();

  for (const summoner of arr) {
    result.set(summoner.summonerName, summoner.team);
  }

  return result;
}