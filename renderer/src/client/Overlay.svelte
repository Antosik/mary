<script lang="typescript">
  import type { ClientRPC } from "@mary-web/data/rpc";

  import { onMount, onDestroy } from "svelte";
  import { groupByTeam } from "@mary-shared/utils/summoner";
  import { isNotEmpty, isExists, isNotExists } from "@mary-shared/utils/typeguards";

  import { gameStore } from "@mary-web/store/game";
  import { settingsStore } from "@mary-web/store/settings";

  import Team from "@mary-web/components/Team.svelte";
  import Player from "@mary-web/components/Player.svelte";
  import GameObject from "@mary-web/components/GameObject.svelte";

  export let rpc: ClientRPC;

  let _isActive;
  $: _isActive = false;

  const onClickOutsideTeams = (event: MouseEvent) => {
    if (
      isNotExists((event.target as HTMLElement).closest(".player__spells"))
      && isNotExists((event.target as HTMLElement).closest(".player__r"))
    ) {
      rpc.invoke("overlay:hide");
    }
  }

  const onMe = gameStore.setMe;
  const onPlayers = gameStore.setPlayers;
  const onPlayerCooldownGet = gameStore.setPlayerCooldown;
  const onObjectCooldownGet = gameStore.setObjectCooldown;
  const onOverlayActiveChange = (isActive: boolean) => {
    _isActive = isActive;
  };
  const onSettingsUpdated = (data: IInternalSettingsNew) => {
    settingsStore.setSettings(data);
  };

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

  let showOrderTeam: boolean;
  let showChaosTeam: boolean;
  $: showOrderTeam =
    ($gameStore.me?.team === "ORDER" && $settingsStore.showAllyTeam) ||
    ($gameStore.me?.team === "CHAOS" && $settingsStore.showEnemyTeam);
  $: showChaosTeam =
    ($gameStore.me?.team === "CHAOS" && $settingsStore.showAllyTeam) ||
    ($gameStore.me?.team === "ORDER" && $settingsStore.showEnemyTeam);

  function getPlayerCooldowns(
    player: IInternalPlayerInfo
  ): IInternalCooldownNew[] {
    return $gameStore.playercooldowns.filter(
      (cd) => cd.summonerName === player.summonerName
    );
  }

  onMount(async () => {
    document.addEventListener('click', onClickOutsideTeams);

    rpc.addListener("overlay:active-change", onOverlayActiveChange);
    rpc.addListener("settings:updated", onSettingsUpdated);
    rpc.addListener("live:connected", onConnected);
    rpc.addListener("live:me", onMe);
    rpc.addListener("live:players", onPlayers);
    rpc.addListener("live:disconnected", onDisconnected);
    rpc.addListener("cooldown:player:ping", onPlayerCooldownGet);
    rpc.addListener("cooldown:object:ping", onObjectCooldownGet);

    settingsStore.setSettings(await rpc.invoke("settings:load"));
    rpc.send("live:connect");
  });

  onDestroy(() => {
    document.removeEventListener('click', onClickOutsideTeams);

    rpc.removeListener("overlay:active-change", onOverlayActiveChange);
    rpc.removeListener("settings:updated", onSettingsUpdated);
    rpc.removeListener("live:connected", onConnected);
    rpc.removeListener("live:me", onMe);
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

    background: none;
    opacity: 0.8;
    color: #fff;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0 1fr;
  }
  .game.game--overlay-active {
    background: rgba(0, 0, 0, 0.3);
    opacity: 1;
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
  class:game--overlay-active={_isActive}
  class:game--with-objects={isNotEmpty($gameStore.objectcooldowns)}>
  {#if $gameStore.isLive && isExists($gameStore.me)}
    {#if $settingsStore.showObjects}
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
    {/if}

    <ul class="game__players game__players--order">
      {#if teams['ORDER'].length > 0 && showOrderTeam}
        <Team players={teams['ORDER']} let:player>
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
      {#if teams['CHAOS'].length > 0 && showChaosTeam}
        <Team players={teams['CHAOS']} let:player>
          <Player
            team="CHAOS"
            {...player}
            cooldowns={getPlayerCooldowns(player)}
            on:cooldown-set={onCooldownSet}
            on:cooldown-reset={onCooldownReset} />
        </Team>
      {/if}
    </ul>
  {/if}
</div>
