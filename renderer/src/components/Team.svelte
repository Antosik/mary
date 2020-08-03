<script lang="typescript">
  export let id: ILiveAPIPlayerTeam;
  export let players: TInternalPlayerStats[] = [];
</script>

<style>
  .team {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .team__player {
    max-width: 100px;
    margin: 4px 0;
  }
  .team--order {
    justify-self: left;
  }
  .team--chaos {
    justify-self: right;
  }
</style>

{#if players.length > 0}
  <ul
    class="team"
    class:team--order={id === 'ORDER'}
    class:team--chaos={id === 'CHAOS'}>
    {#each players as player (player.summonerName)}
      <li class="team__player">
        <slot {player} />
      </li>
    {/each}
  </ul>
{/if}
