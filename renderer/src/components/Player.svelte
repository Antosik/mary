<script lang="typescript">
  import { onMount, onDestroy } from "svelte";
  import { isExists, isNotEmpty } from "@mary-shared/utils/typeguards";
  import { rpc } from "@mary-web/data/rpc";
  import {
    startListeningToIgnoreMouseEvents,
    stopListeningToIgnoreMouseEvents,
  } from "@mary-web/utils/mouseEvents";

  import SummonerSpell from "./SummonerSpell.svelte";
  import TimeCounter from "./TimeCounter.svelte";
  import ChampionR from "./ChampionR.svelte";

  export let summonerName: string;
  export let championName: string;
  export let summonerSpells: string[] = [];

  export let team: "ORDER" | "CHAOS";

  export let isDead: boolean = false;
  export let respawnTimer: number = 0;

  let respawnTime: Date;
  $: respawnTime = new Date(Date.now() + respawnTimer * 1e3);

  export let cooldowns: IInternalCooldown[] = [];

  function getCooldown(cooldowns: IInternalCooldown[], target: string) {
    return cooldowns.find((cd) => cd.target === target);
  }

  async function setCooldown(target: string) {
    const cooldown = await rpc.invoke<IInternalCooldown>(
      "cooldowns:set",
      summonerName,
      championName,
      target
    );
    if (isExists(cooldown)) {
      cooldowns.push(cooldown);
    }
  }

  const onDeadTimerDone = () => (isDead = false);

  let player: HTMLDivElement | undefined = undefined;

  onMount(() => {
    startListeningToIgnoreMouseEvents(player!);
  });
  onDestroy(() => {
    stopListeningToIgnoreMouseEvents(player!);
  });
</script>

<style>
  .player {
    display: grid;
    position: relative;
    opacity: 0.7;
  }
  .player:hover {
    opacity: 1;
  }

  .player__name {
    grid-area: playerName;
    font-size: 16px;
  }
  .player__champion {
    position: relative;
    grid-area: championIcon;
  }

  .player__spells {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-area: summonerSpells;
  }
  .player__spells-item {
    width: 24px;
    height: 24px;
  }

  .player__r {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    overflow: hidden;
    top: 30px;
    left: 30px;
    position: absolute;
  }

  .player--has-cd {
    opacity: 0.85;
  }

  .player--dead .player__champion:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2;
    content: "";
  }
  .player--dead .player__respawn-timer {
    color: var(--cooldown-time);
    font-weight: bold;
    z-index: 3;
  }

  .player--team-order {
    grid-template-areas:
      "playerName playerName playerName"
      "summonerSpells championIcon .";
    grid-template-columns: 24px 50px 1fr;
    grid-template-rows: 1fr 50px;
  }
  .player--team-order .player__name {
    text-align: left;
  }

  .player--team-chaos {
    grid-template-areas:
      "playerName playerName playerName"
      ". championIcon summonerSpells";
    grid-template-columns: 1fr 50px 24px;
    grid-template-rows: 1fr 50px;
  }
  .player--team-chaos .player__name {
    text-align: right;
  }
</style>

<div
  class="player"
  class:player--has-cd={isNotEmpty(cooldowns)}
  class:player--dead={isDead}
  class:player--team-order={team === 'ORDER'}
  class:player--team-chaos={team === 'CHAOS'}
  bind:this={player}>
  <h3 class="player__name">{summonerName}</h3>
  <div class="player__champion">
    {#if championName}
      <img
        src="https://cdn.communitydragon.org/latest/champion/{championName}/square"
        alt={championName} />
    {:else}
      <img
        src="https://cdn.communitydragon.org/latest/champion/generic/square"
        alt="???" />
    {/if}

    {#if isDead && respawnTimer > 0}
      <span class="player__respawn-timer absolute-full flex-center">
        <TimeCounter time={respawnTime} on:completed={onDeadTimerDone} />
      </span>
    {/if}

    <div class="player__r">
      <ChampionR
        {championName}
        cooldown={getCooldown(cooldowns, 'R')}
        on:click={() => setCooldown('R')} />
    </div>
  </div>
  <ul class="player__spells">
    {#each summonerSpells as summonerSpell (summonerSpell)}
      <li class="player__spells-item">
        <SummonerSpell
          {summonerSpell}
          cooldown={getCooldown(cooldowns, summonerSpell)}
          side={team === 'ORDER' ? 'left' : 'right'}
          on:click={() => setCooldown(summonerSpell)} />
      </li>
    {/each}
  </ul>
</div>
