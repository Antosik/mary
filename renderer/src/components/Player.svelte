<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { isNotEmpty } from "@mary-shared/utils/typeguards";

  import SummonerSpell from "@mary-web/components/SummonerSpell.svelte";
  import TimeCounter from "@mary-web/components/TimeCounter.svelte";
  import ChampionR from "@mary-web/components/ChampionR.svelte";

  export let summonerName: string;
  export let championName: string;
  export let summonerSpells: Set<string> = new Set<string>();

  export let team: "ORDER" | "CHAOS";

  export let isDead: boolean = false;
  export let respawnTimer: number = 0;

  export let cooldowns: IInternalPlayerCooldownNew[] = [];

  const dispatch = createEventDispatcher();

  let respawnTime: Date;
  $: respawnTime = new Date(Date.now() + respawnTimer * 1e3);

  function getCooldown(cooldowns: IInternalPlayerCooldownNew[], target: string) {
    return cooldowns.find((cd) => cd.target === target);
  }

  function setCooldown(target: string) {
    dispatch("cooldown-set", {
      summonerName,
      target,
    });
  }

  function resetCooldown(target: string) {
    dispatch("cooldown-reset", {
      summonerName,
      target,
    });
  }

  const onDeadTimerDone = () => (isDead = false);

  let player: HTMLDivElement | undefined = undefined;
</script>

<style>
  .player {
    display: grid;
    position: relative;
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
    position: absolute;
    top: 30px;
    z-index: 3;
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
  .player--team-order .player__r {
    left: 30px;
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
  .player--team-chaos .player__r {
    top: 30px;
    left: -10px;
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
        src="./img/champions/{championName}.png"
        alt={championName} />
    {:else}
      <img
        src="https://cdn.communitydragon.org/latest/champion/generic/square"
        alt="???" />
    {/if}

    {#if isDead && respawnTimer > 0}
      <span class="player__respawn-timer absolute-full flex-center">
        <TimeCounter end={respawnTime} on:completed={onDeadTimerDone} />
      </span>
    {/if}

    <div class="player__r">
      <ChampionR
        {championName}
        cooldown={getCooldown(cooldowns, 'R')}
        on:left-click={() => setCooldown('R')}
        on:right-click={() => resetCooldown('R')} />
    </div>
  </div>
  {#if summonerSpells.size}
    <ul class="player__spells">
      {#each [...summonerSpells.values()] as summonerSpell, i (summonerSpell)}
        <li class="player__spells-item">
          <SummonerSpell
            {summonerSpell}
            cooldown={getCooldown(cooldowns, i === 0 ? 'D' : 'F')}
            side={team === 'ORDER' ? 'left' : 'right'}
            on:left-click={() => setCooldown(i === 0 ? 'D' : 'F')}
            on:right-click={() => resetCooldown(i === 0 ? 'D' : 'F')} />
        </li>
      {/each}
    </ul>
  {/if}
</div>
