import Store from "electron-store";


interface IGameStorePrototype {
  gameMode?: ILiveAPIGameMode;
  players: IInternalPlayerInfo[];
  events: ILiveAPIGameEvent[];
}


const createGameStore = () => new Store<IGameStorePrototype>({
  name: "game",
  defaults: {
    gameMode: undefined,
    players: [],
    events: []
  }
});

export const gameStore = createGameStore();