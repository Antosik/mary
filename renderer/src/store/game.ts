import { writable } from "svelte/store";


interface IGameStore {
  isLive: boolean;
  me?: TInternalPlayerStats;
  players: TInternalPlayerStats[];
  playercooldowns: IInternalPlayerCooldown[];
  objectcooldowns: IInternalObjectCooldown[];
}


function createGameStore() {
  const getInitialStore = (): IGameStore => ({ isLive: false, me: undefined, players: [], playercooldowns: [], objectcooldowns: [] });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { subscribe, update } = writable<IGameStore>(getInitialStore());

  const sortCooldowns = (a: IInternalCooldown, b: IInternalCooldown) => a.end < b.end ? -1 : 1;
  const setLive = (isLive: boolean) => isLive ? update(store => ({ ...store, isLive })) : reset();
  const setMe = (me: TInternalPlayerStats) => update(store => ({ ...store, me }));
  const setPlayers = (players: TInternalPlayerStats[]) => update(store => ({ ...store, players }));
  const setPlayerCooldowns = (playercooldowns: IInternalPlayerCooldown[]) => update(store =>
    ({ ...store, playercooldowns: playercooldowns.sort(sortCooldowns) })
  );
  const setPlayerCooldown = (cooldown: IInternalPlayerCooldown) => update(store => {

    const updatedCooldowns: IInternalPlayerCooldown[] = store.playercooldowns.filter(cd => cd.id !== cooldown.id);

    if (cooldown.end > new Date()) {
      updatedCooldowns.push(cooldown);
    }


    return { ...store, playercooldowns: updatedCooldowns.sort(sortCooldowns) };
  });
  const setObjectCooldowns = (objectcooldowns: IInternalObjectCooldown[]) => update(store =>
    ({ ...store, objectcooldowns: objectcooldowns.sort(sortCooldowns) })
  );
  const setObjectCooldown = (cooldown: IInternalObjectCooldown) => update(store => {

    const updatedCooldowns: IInternalObjectCooldown[] = store.objectcooldowns.filter(cd => cd.id !== cooldown.id);

    if (cooldown.end > new Date()) {
      updatedCooldowns.push(cooldown);
    }

    return { ...store, objectcooldowns: updatedCooldowns.sort(sortCooldowns) };
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