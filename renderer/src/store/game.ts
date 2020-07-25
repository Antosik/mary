import { writable } from "svelte/store";


interface IGameStore {
  isLive: boolean;
  me?: TInternalPlayerStatsNew;
  players: TInternalPlayerStatsNew[];
  playercooldowns: IInternalPlayerCooldownNew[];
  objectcooldowns: IInternalObjectCooldownNew[];
}


function createGameStore() {
  const getInitialStore = (): IGameStore => ({ isLive: false, me: undefined, players: [], playercooldowns: [], objectcooldowns: [] });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { subscribe, update } = writable<IGameStore>(getInitialStore());

  const setLive = (isLive: boolean) => isLive ? update(store => ({ ...store, isLive })) : reset();
  const setMe = (me: TInternalPlayerStatsNew) => update(store => ({ ...store, me }));
  const setPlayers = (players: TInternalPlayerStatsNew[]) => update(store => ({ ...store, players }));
  const setPlayerCooldowns = (playercooldowns: IInternalPlayerCooldownNew[]) => update(store => ({ ...store, playercooldowns }));
  const setPlayerCooldown = (cooldown: IInternalPlayerCooldownNew) => update(store => {

    const updatedCooldowns: IInternalPlayerCooldownNew[] = store.playercooldowns.filter(cd => cd.id !== cooldown.id);

    if (cooldown.end > new Date()) {
      updatedCooldowns.push(cooldown);
    }

    return { ...store, playercooldowns: updatedCooldowns };
  });
  const setObjectCooldowns = (objectcooldowns: IInternalObjectCooldownNew[]) => update(store => ({ ...store, objectcooldowns }));
  const setObjectCooldown = (cooldown: IInternalObjectCooldownNew) => update(store => {

    const updatedCooldowns: IInternalObjectCooldownNew[] = store.objectcooldowns.filter(cd => cd.id !== cooldown.id);

    if (cooldown.end > new Date()) {
      updatedCooldowns.push(cooldown);
    }

    return { ...store, objectcooldowns: updatedCooldowns };
  });
  const reset = () => update(() => getInitialStore());

  return {
    subscribe,

    setLive,
    setMe,
    setPlayers,

    setPlayerCooldown,
    setPlayerCooldowns,
    setObjectCooldown,
    setObjectCooldowns,

    reset
  };
}

export const gameStore = createGameStore();