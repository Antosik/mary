import axios from "axios";
import { Agent as httpsAgent } from "https";

import { logError } from "@mary-main/utils/log";
import { wait } from "@mary-shared/utils/wait";


export class LiveClientAPI {

  private static ENDPOINT = "https://127.0.0.1:2999/liveclientdata";
  private static RETRY_INTERVAL = 3;
  private static RETRY_COUNT = 3;

  public static async getPlayersList(): Promise<ILiveAPIPlayer[]> {
    return await LiveClientAPI.request<ILiveAPIPlayer[]>("playerlist");
  }

  public static async getPlayerSummonerSpells(summonerName: string): Promise<ILiveAPIPlayerSummonerSpells> {
    return await LiveClientAPI.request<ILiveAPIPlayerSummonerSpells>("playersummonerspells", { summonerName });
  }

  public static async getPlayerMainRunes(summonerName: string): Promise<ILiveAPIPlayerMainRunes> {
    return await LiveClientAPI.request<ILiveAPIPlayerMainRunes>("playermainrunes", { summonerName });
  }

  public static async getPlayerItems(summonerName: string): Promise<ILiveAPIPlayerItem[]> {
    return await LiveClientAPI.request<ILiveAPIPlayerItem[]>("playeritems", { summonerName });
  }

  public static async getGameStats(): Promise<ILiveAPIGameStats> {
    return await LiveClientAPI.request<ILiveAPIGameStats>("gamestats");
  }

  public static async getGameEvents(): Promise<ILiveAPIGameEvent[]> {
    return await LiveClientAPI.request<{ Events: ILiveAPIGameEvent[] }>("eventdata").then(({ Events }) => Events);
  }

  private static async request<T>(path: string, params = {}, retry = LiveClientAPI.RETRY_COUNT): Promise<T> {
    return axios
      .get<T>(`${LiveClientAPI.ENDPOINT}/${path}`, { params, httpsAgent: new httpsAgent({ rejectUnauthorized: false }) })
      .then(({ data }) => data)
      .catch(error => {
        const retryIndex = LiveClientAPI.RETRY_COUNT - retry;
        logError(`"[LiveClientAPI] (${retryIndex}/${LiveClientAPI.RETRY_COUNT}): "${path}" "${(params && JSON.stringify(params)) ?? ""}" --- `, error);

        if (retry === 0) {
          throw error;
        }

        return wait(LiveClientAPI.RETRY_INTERVAL * retryIndex)
          .then(() => LiveClientAPI.request(path, params, retry - 1));
      });
  }
}