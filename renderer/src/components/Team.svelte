<script lang="typescript">
  export let players: TInternalPlayerStatsNew[] = [];
</script>

{#if players.length > 0}
  {#each players as player (player.summonerName)}
    <li class="player">
      <slot {player} />
    </li>
  {:else}None{/each}
{/if}
