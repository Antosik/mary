/* eslint-disable @typescript-eslint/unbound-method */
import type { LiveClientAPI } from "@mary-main/connectors/LiveClientAPI";
import type { LiveClientAPIPing } from "@mary-main/connectors/LiveClientAPI/ping";


export class LiveClientService {

  private _liveClientApi: LiveClientAPI;
  private _liveClientApiPing: LiveClientAPIPing;

  constructor(liveClientAPI: LiveClientAPI, liveClientAPIPing: LiveClientAPIPing) {
    this._liveClientApi = liveClientAPI;
    this._liveClientApiPing = liveClientAPIPing;

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    this.converterPlayerToInternal = this.converterPlayerToInternal.bind(this);
    this._converterItemToInternal = this._converterItemToInternal.bind(this);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  }


  // #region Listeners
  public addListener(event: string, callback: (...args: any[]) => any): this {
    this._liveClientApiPing.addListener(event, callback);
    return this;
  }
  public removeListener(event: string): this {
    this._liveClientApiPing.removeAllListeners(event);
    return this;
  }
  // #endregion Listeners


  public async start(): Promise<void> {
    return await this._liveClientApiPing.start();
  }

  public stop(): void {
    return this._liveClientApiPing.stop();
  }

  public destroy(): void {
    this._liveClientApiPing.stop();
    this._liveClientApiPing.removeAllListeners();
  }

  // #region Calls
  public async getPlayersList(): Promise<IInternalPlayerInfo[]> {
    const players = await this._liveClientApi.getPlayersList();
    return players.map(this.converterPlayerToInternal);
  }

  public async getPlayerSummonerSpells(summonerName: string): Promise<string[]> {
    const spells = await this._liveClientApi.getPlayerSummonerSpells(summonerName);
    return this._converterSummonerSpellsToInternal(spells);
  }

  public async getPlayerMainRunes(summonerName: string): Promise<IInternalPlayerRunes> {
    const runes = await this._liveClientApi.getPlayerMainRunes(summonerName);
    return this._converterRunesToInternal(runes);
  }

  public async getPlayerItems(summonerName: string): Promise<IInternalPlayerItem[]> {
    return await this._liveClientApi.getPlayerItems(summonerName);
  }

  public async getGameStats(): Promise<ILiveAPIGameStats> {
    return await this._liveClientApi.getGameStats();
  }
  // #endregion Calls


  // #region Converters
  public converterPlayerToInternal(player: ILiveAPIPlayer): IInternalPlayerInfo {
    return {
      summonerName: player.summonerName,

      championName: player.rawChampionName.split("_")[3],
      level: player.level,
      scores: player.scores,
      team: player.team,

      isDead: player.isDead,
      respawnTimer: player.respawnTimer,

      items: player.items.map(this._converterItemToInternal),
      runes: this._converterRunesToInternal(player.runes),
      summonerSpells: this._converterSummonerSpellsToInternal(player.summonerSpells),
    };
  }

  private _converterItemToInternal(item: ILiveAPIPlayerItem): IInternalPlayerItem {
    return {
      count: item.count,
      displayName: item.displayName,
      itemID: item.itemID,
      slot: item.slot,
    };
  }

  private _converterRunesToInternal(item: ILiveAPIPlayerMainRunes): IInternalPlayerRunes {
    return {
      primary: {
        displayName: item.primaryRuneTree.displayName,
        runeID: item.primaryRuneTree.id
      },
      secondary: {
        displayName: item.secondaryRuneTree.displayName,
        runeID: item.secondaryRuneTree.id
      }
    };
  }

  private _converterSummonerSpellsToInternal(item: ILiveAPIPlayerSummonerSpells): string[] {
    return [item.summonerSpellOne, item.summonerSpellTwo].map(spell => spell.rawDisplayName.split("_")[2]);
  }
  // #endregion Converters
}