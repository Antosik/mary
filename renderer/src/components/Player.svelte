<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { isExists } from "@mary-shared/utils/typeguards";

  import TimeCounter from "@mary-web/components/TimeCounter.svelte";
  import SpellContainer from "./SpellContainer.svelte";

  export let summonerName: string;
  export let championName: string;
  export let summonerSpells: Set<string> = new Set<string>();
  export let isDead: boolean = false;
  export let respawnTimer: number = 0;

  export let cooldowns: IInternalPlayerCooldown[] = [];
  export let direction: "left" | "right" = "left";

  const dispatch = createEventDispatcher();

  let respawnTime: Date;
  $: respawnTime = new Date(Date.now() + respawnTimer * 1e3);

  let summonerSpellsArray: string[] = [];
  $: summonerSpellsArray = [...summonerSpells];

  const getCooldown = (cooldowns: IInternalPlayerCooldown[], target: string) =>
    cooldowns.find((cd) => cd.target === target);
  const setCooldown = (target: string) => {
    dispatch("cooldown-set", { summonerName, target });
  };
  const resetCooldown = (target: string) => {
    dispatch("cooldown-reset", { summonerName, target });
  };
  const onDeadTimerDone = () => (isDead = false);
</script>

<style>
  .player {
    display: grid;
    position: relative;
  }
  .player__name {
    font-size: 16px;
    grid-area: playerName;
  }
  .player__spells {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-area: summonerSpells;
  }
  .player__champion {
    position: relative;
    grid-area: championIcon;
  }
  .player__champion__icon {
    width: 100%;
    height: 100%;
  }
  .player__champion__cd {
    background: rgba(0, 0, 0, 0.6);
    color: #dc4141;
    font-weight: bold;
    z-index: 2;
  }
  .player__ultimate {
    width: 50%;
    height: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(20%, 20%);
    z-index: 3;
    grid-area: championIcon;
  }
  .player--direction-left {
    grid-template-areas:
      "playerName playerName"
      "summonerSpells championIcon";
    grid-template-columns: 1fr 2fr;
    grid-template-rows: max-content max-content;
  }
  .player--direction-left .player__name {
    text-align: left;
  }
  .player--direction-right {
    grid-template-areas:
      "playerName playerName"
      "championIcon summonerSpells";
    grid-template-columns: 1fr 2fr;
    grid-template-rows: max-content max-content;
  }
  .player--direction-right .player__name {
    text-align: right;
  }
</style>

<div
  class="player"
  class:player--direction-left={direction === 'left'}
  class:player--direction-right={direction === 'right'}>
  <h3 class="player__name">{summonerName}</h3>
  <ul class="player__spells">
    {#if isExists(summonerSpellsArray[0])}
      <li class="player__spells__item">
        <SpellContainer
          icon="./img/spells/{summonerSpellsArray[0]}.png"
          cooldown={getCooldown(cooldowns, 'D')}
          on:set={() => setCooldown('D')}
          on:reset={() => resetCooldown('D')} />
      </li>
    {/if}
    {#if isExists(summonerSpellsArray[1])}
      <li class="player__spells__item">
        <SpellContainer
          icon="./img/spells/{summonerSpellsArray[1]}.png"
          cooldown={getCooldown(cooldowns, 'F')}
          on:set={() => setCooldown('F')}
          on:reset={() => resetCooldown('F')} />
      </li>
    {/if}
  </ul>
  <div class="player__champion" class:player__champion--dead={isDead}>
    {#if championName}
      <img
        src="./img/champions/{championName}.png"
        alt={championName}
        class="player__champion__icon absolute-full" />
    {:else}
      <img
        src="./img/champions/square.png"
        alt="???"
        class="player__champion__icon absolute-full" />
    {/if}

    {#if isDead && respawnTimer > 0}
      <span class="player__champion__cd absolute-full flex-center">
        <TimeCounter end={respawnTime} on:completed={onDeadTimerDone} />
      </span>
    {/if}
  </div>
  <div class="player__ultimate">
    <SpellContainer
      rounded
      icon="./img/abilities/{championName}R.png"
      cooldown={getCooldown(cooldowns, 'R')}
      on:set={() => setCooldown('R')}
      on:reset={() => resetCooldown('R')} />
  </div>
</div>
