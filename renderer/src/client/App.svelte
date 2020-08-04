<script lang="typescript">
  import { onMount, onDestroy } from "svelte";
  import { groupByTeam } from "@mary-shared/utils/summoner";
  import { isExists } from "@mary-shared/utils/typeguards";

  import { gameStore } from "@mary-web/store/game";
  import { settingsStore } from "@mary-web/store/settings";

  import Team from "@mary-web/components/Team.svelte";
  import Player from "@mary-web/components/Player.svelte";
  import GameObject from "@mary-web/components/GameObject.svelte";

  export let rpc: IClientRPC;
  let width: number;

  const onMe = gameStore.setMe;
  const onPlayers = gameStore.setPlayers;
  const onPlayerCooldownGet = gameStore.setPlayerCooldown;
  const onObjectCooldownGet = gameStore.setObjectCooldown;
  const onSettingsUpdated = (data: IInternalSettings) => {
    settingsStore.setSettings(data);
  };

  const onConnected = async () => {
    const [playercooldowns, objectcooldowns] = (await Promise.all([
      rpc.invoke("cooldowns:player:get"),
      rpc.invoke("cooldowns:object:get"),
    ])) as [IInternalPlayerCooldown[], IInternalObjectCooldown[]];
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

  let teams: Record<string, TInternalPlayerStats[]>;
  $: teams = groupByTeam($gameStore.players);

  let objectCooldowns: Record<string, IInternalObjectCooldown[]>;
  $: objectCooldowns = groupByTeam(
    $gameStore.objectcooldowns.filter((el) => el.target === "Inhib")
  );

  let baronCooldown: IInternalObjectCooldown | undefined;
  $: baronCooldown = $gameStore.objectcooldowns.find(
    (el) => el.target === "Baron"
  );

  let elderCooldown: IInternalObjectCooldown | undefined;
  $: elderCooldown = $gameStore.objectcooldowns.find(
    (el) => el.target === "Elder"
  );

  let showOrderTeam: boolean;
  let showChaosTeam: boolean;
  $: showOrderTeam =
    ($gameStore.me?.team === "ORDER" && $settingsStore.showAllyTeam) ||
    ($gameStore.me?.team === "CHAOS" && $settingsStore.showEnemyTeam);
  $: showChaosTeam =
    ($gameStore.me?.team === "CHAOS" && $settingsStore.showAllyTeam) ||
    ($gameStore.me?.team === "ORDER" && $settingsStore.showEnemyTeam);

  function getPlayerCooldowns(
    player: TInternalPlayerStats
  ): IInternalCooldown[] {
    return $gameStore.playercooldowns.filter(
      (cd) => cd.summonerName === player.summonerName
    );
  }

  onMount(async () => {
    rpc.setOpenHandler(() => rpc.send("live:connect"));

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
    padding: 4px 0;

    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 0.75fr 0.75fr 5fr 1.75fr;
    grid-gap: 4px;
    grid-template-areas:
      ". baron baron ."
      ". elder elder ."
      "order . . chaos"
      "orderObj orderObj chaosObj chaosObj";
  }
  @media all and (min-width: 600px) {
    .game {
      grid-template-columns: 1fr 2.75fr 2.75fr 1fr;
      grid-template-rows: 1.5fr 5fr 1.5fr;
      grid-template-areas:
        ". baron elder ."
        "order orderObj chaosObj chaos"
        ". . . .";
    }
  }
  :global(.team--order) {
    grid-area: order;
  }
  :global(.team--chaos) {
    grid-area: chaos;
  }
  .game:not(.game--live) {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
  .game__object--list {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media all and (min-width: 600px) {
    .game__object--list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
  :global(.game__object--list > *) {
    margin: 4px;
  }
  .game__object--baron {
    justify-self: center;
    grid-area: baron;
  }
  .game__object--elder {
    justify-self: center;
    grid-area: elder;
  }
  .game__object--order {
    justify-self: right;
    grid-area: orderObj;
  }
  .game__object--chaos {
    justify-self: left;
    grid-area: chaosObj;
  }
</style>

<div
  bind:clientWidth={width}
  class="game"
  class:game--live={$gameStore.isLive}>
  {#if $gameStore.isLive && isExists($gameStore.me)}
    {#if $settingsStore.showObjects}
      {#if isExists(baronCooldown)}
        <div class="game__object game__object--baron">
          <GameObject
            {...baronCooldown}
            direction="right"
            size={width > 600 ? 'big' : 'normal'} />
        </div>
      {/if}

      {#if isExists(elderCooldown)}
        <div class="game__object game__object--elder">
          <GameObject
            {...elderCooldown}
            direction="left"
            size={width > 600 ? 'big' : 'normal'} />
        </div>
      {/if}

      {#if objectCooldowns['ORDER'].length > 0}
        <ul class="game__object game__object--list game__object--order">
          {#each objectCooldowns['ORDER'] as object (object.id)}
            <GameObject
              {...object}
              direction="right"
              size={width > 600 ? 'normal' : 'mini'} />
          {/each}
        </ul>
      {/if}

      {#if objectCooldowns['CHAOS'].length > 0}
        <ul class="game__object game__object--list game__object--chaos">
          {#each objectCooldowns['CHAOS'] as object (object.id)}
            <GameObject
              {...object}
              direction="left"
              size={width > 600 ? 'normal' : 'mini'} />
          {/each}
        </ul>
      {/if}
    {/if}

    {#if showOrderTeam}
      <Team id="ORDER" players={teams['ORDER']} let:player>
        <Player
          {...player}
          direction="left"
          cooldowns={getPlayerCooldowns(player)}
          on:cooldown-set={onCooldownSet}
          on:cooldown-reset={onCooldownReset} />
      </Team>
    {/if}

    {#if teams['CHAOS'].length > 0 && showChaosTeam}
      <Team id="CHAOS" players={teams['CHAOS']} let:player>
        <Player
          {...player}
          direction="right"
          cooldowns={getPlayerCooldowns(player)}
          on:cooldown-set={onCooldownSet}
          on:cooldown-reset={onCooldownReset} />
      </Team>
    {/if}
  {:else}Игра не запущена{/if}
</div>
