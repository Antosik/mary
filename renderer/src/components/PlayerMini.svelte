<script lang="typescript">
  import SpellContainerMini from "@mary-web/components/SpellContainerMini.svelte";

  export let championName: string;
  export let summonerSpells: Set<string> = new Set<string>();

  export let cooldowns: IInternalPlayerCooldown[] = [];
  export let direction: "left" | "right" = "left";

  let summonerSpellsArray: string[] = [];
  $: summonerSpellsArray = [...summonerSpells];
</script>

<style>
  .player {
    display: flex;
    direction: row;
    position: relative;
  }
  .player__champion,
  .player__target {
    width: 30px;
    height: 30px;
  }
  .player__champion {
    border: 1px solid black;
    border-radius: 50%;
    z-index: 3;
  }
  .player__target {
    position: absolute;
    bottom: 0;
    z-index: 2;
  }
  .player--mini.player--direction-left .player__target {
    right: 0;
    transform: translateX(12px);
  }
  .player--mini.player--direction-right .player__target {
    left: 0;
    transform: translateX(calc(-100% + 12px));
  }
</style>

{#each cooldowns as cooldown (cooldown.id)}
  <div
    class="player player--mini"
    class:player--direction-left={direction === 'left'}
    class:player--direction-right={direction === 'right'}>
    <img
      src="./img/champions/{championName}.png"
      alt={championName}
      class="player__champion" />

    <div class="player__target">
      {#if cooldown.target === 'R'}
        <SpellContainerMini icon="./img/abilities/{championName}R.png" {cooldown} {direction} />
      {:else if cooldown.target === 'D'}
        <SpellContainerMini icon="./img/spells/{summonerSpellsArray[0]}.png" {cooldown} {direction} />
      {:else if cooldown.target === 'F'}
        <SpellContainerMini icon="./img/spells/{summonerSpellsArray[1]}.png" {cooldown} {direction} />
      {/if}
    </div>
  </div>
{/each}
