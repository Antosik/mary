import Store from "electron-store";


const createGameStore = () => new Store<Partial<IInternalGameStorage>>({
  name: "livegame",
  defaults: {
    gameInfo: undefined,
    players: [],
    events: [],
    cooldowns: undefined
  }
});


export const gameStore = createGameStore();