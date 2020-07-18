import { writable } from "svelte/store";

interface IGameStore {
  players: IInternalPlayerInfo[];
  cooldowns: IInternalCooldown[];
}

function createGameStore() {
  const getInitialStore = (): IGameStore => ({ players: [], cooldowns: [] });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { subscribe, update } = writable<IGameStore>(getInitialStore());

  const setPlayers = (players: IInternalPlayerInfo[]) => update(store => ({ ...store, players }));
  const setCooldowns = (cooldowns: IInternalCooldown[]) => update(store => ({ ...store, cooldowns }));

  const reset = () => update(() => getInitialStore());

  return {
    subscribe,

    setPlayers,
    setCooldowns,

    reset
  };
}

export const gameStore = createGameStore();