<script lang="typescript">
  import { onMount, onDestroy } from "svelte";
  import { groupByTeam } from "@mary-shared/utils/summoner";

  import { rpc } from "./data/rpc";
  import { gameStore } from "./store/game";

  import Team from "./components/Team.svelte";
  import Player from "./components/Player.svelte";
  import GameObject from "./components/GameObject.svelte";
  import { isNotEmpty } from "@mary-shared/utils/typeguards";

  const onPlayers = gameStore.setPlayers;
  const onPlayerCooldownGet = gameStore.setPlayerCooldown;
  const onObjectCooldownGet = gameStore.setObjectCooldown;

  const onConnected = async () => {
    const [playercooldowns, objectcooldowns] = (await Promise.all([
      rpc.invoke("cooldowns:player:get"),
      rpc.invoke("cooldowns:object:get"),
    ])) as [IInternalPlayerCooldownNew[], IInternalObjectCooldownNew[]];
    gameStore.setPlayerCooldowns(playercooldowns);
    gameStore.setObjectCooldowns(objectcooldowns);
    gameStore.setLive(true);
  };
  const onDisconnected = () => {
    gameStore.setLive(false);
  };
  const onCooldownSet = async (e: Event) => {
    const data = (e as CustomEvent).detail as {
      summonerName: string;
      target: string;
    };
    await rpc.invoke("cooldown:player:set", data.summonerName, data.target);
  };
  const onCooldownReset = async (e: Event) => {
    const data = (e as CustomEvent).detail as {
      summonerName: string;
      target: string;
    };
    await rpc.invoke("cooldown:player:reset", data.summonerName, data.target);
  };

  let teams: Record<string, TInternalPlayerStatsNew[]>;
  $: teams = groupByTeam($gameStore.players);

  let objectCooldowns: Record<string, IInternalObjectCooldownNew[]>;
  $: objectCooldowns = groupByTeam($gameStore.objectcooldowns);

  function getPlayerCooldowns(
    player: IInternalPlayerInfo
  ): IInternalCooldownNew[] {
    return $gameStore.playercooldowns.filter(
      (cd) => cd.summonerName === player.summonerName
    );
  }

  onMount(async () => {
    rpc.addListener("live:connected", onConnected);
    rpc.addListener("live:players", onPlayers);
    rpc.addListener("live:disconnected", onDisconnected);
    rpc.addListener("cooldown:player:ping", onPlayerCooldownGet);
    rpc.addListener("cooldown:object:ping", onObjectCooldownGet);

    await rpc.invoke("live:connect");
  });

  onDestroy(() => {
    rpc.removeListener("live:connected", onConnected);
    rpc.removeListener("live:players", onPlayers);
    rpc.removeListener("live:disconnected", onDisconnected);
    rpc.removeListener("cooldown:player:ping", onPlayerCooldownGet);
    rpc.removeListener("cooldown:object:ping", onObjectCooldownGet);
  });
</script>

<style>
  .game {
    width: 100%;
    height: 100%;
    position: relative;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0 1fr;
  }
  .game--with-objects {
    grid-template-rows: auto 1fr;
  }
  .game:not(.game--live) {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
  .game__objects {
    display: grid;
    grid-gap: 10px;
    grid-template-rows: repeat(2, 1fr);
    grid-template-columns: repeat(2, 1fr);
  }
  .game__players {
    display: grid;
    grid-gap: 10px;
    align-items: center;
  }
</style>

<div
  class="game"
  class:game--live={$gameStore.isLive}
  class:game--with-objects={isNotEmpty($gameStore.objectcooldowns)}>
  {#if $gameStore.isLive}
    <ul class="game__objects game__objects--order">
      {#if objectCooldowns['ORDER'].length > 0}
        {#each objectCooldowns['ORDER'] as object (object.id)}
          <GameObject {...object} />
        {/each}
      {/if}
    </ul>
    <ul class="game__objects game__objects--chaos">
      {#if objectCooldowns['CHAOS'].length > 0}
        {#each objectCooldowns['CHAOS'] as object (object.id)}
          <GameObject {...object} />
        {/each}
      {/if}
    </ul>

    <ul class="game__players game__players--order">
      {#if teams['ORDER'].length > 0}
        <Team team="ORDER" players={teams['ORDER']} let:player>
          <Player
            team="ORDER"
            {...player}
            cooldowns={getPlayerCooldowns(player)}
            on:cooldown-set={onCooldownSet}
            on:cooldown-reset={onCooldownReset} />
        </Team>
      {/if}
    </ul>
    <ul class="game__players game__objects--chaos">
      {#if teams['CHAOS'].length > 0}
        <Team team="CHAOS" players={teams['CHAOS']} let:player>
          <Player
            team="CHAOS"
            {...player}
            cooldowns={getPlayerCooldowns(player)}
            on:cooldown-set={onCooldownSet}
            on:cooldown-reset={onCooldownReset} />
        </Team>
      {/if}
    </ul>
  {:else}Игра не запущена{/if}
</div>
