import { Agent as httpsAgent } from "https";

import axios from "axios";

import { logError } from "@mary-main/utils/log";
import { wait } from "@mary-shared/utils/wait";


export class LiveClientAPI {
  private static ENDPOINT = "https://127.0.0.1:2999/liveclientdata";
  private static RETRY_INTERVAL = 3;
  private static RETRY_COUNT = 3;

  public async getPlayersList(): Promise<ILiveAPIPlayer[]> {
    return await this.request("playerlist") as ILiveAPIPlayer[];
  }

  public async getPlayerSummonerSpells(summonerName: string): Promise<ILiveAPIPlayerSummonerSpells> {
    return await this.request("playersummonerspells", { summonerName }) as ILiveAPIPlayerSummonerSpells;
  }

  public async getPlayerMainRunes(summonerName: string): Promise<ILiveAPIPlayerMainRunes> {
    return await this.request("playermainrunes", { summonerName }) as ILiveAPIPlayerMainRunes;
  }

  public async getPlayerItems(summonerName: string): Promise<ILiveAPIPlayerItem[]> {
    return await this.request("playeritems", { summonerName }) as ILiveAPIPlayerItem[];
  }

  public async getGameStats(): Promise<ILiveAPIGameStats> {
    return await this.request("gamestats") as ILiveAPIGameStats;
  }

  private async request(path: string, params = {}, retry = LiveClientAPI.RETRY_COUNT): Promise<unknown> {
    return axios
      .get<unknown>(`${LiveClientAPI.ENDPOINT}/${path}`, { params, httpsAgent: new httpsAgent({ rejectUnauthorized: false }) })
      .then(({ data }) => data)
      .catch(error => {
        const retryIndex = LiveClientAPI.RETRY_COUNT - retry;
        logError(`"[LiveClientAPI] (${retryIndex}/${LiveClientAPI.RETRY_COUNT}): "${path}" "${(params && JSON.stringify(params)) ?? ""}" --- `, error);

        if (retry === 0) {
          throw error;
        }

        return wait(LiveClientAPI.RETRY_INTERVAL * retryIndex)
          .then(() => this.request(path, params, retry - 1));
      });
  }
}