<script lang="typescript">
  export let team: "ORDER" | "CHAOS";
  export let players: IInternalPlayerInfo[] = [];
</script>

<style>
  ul {
    position: absolute;
    top: 40%;
    transform: translateY(-50%);

    display: grid;
    grid-gap: 10px;
  }
  ul.team--order {
    left: 0;
  }
  ul.team--chaos {
    right: 0;
  }
</style>

{#if players.length > 0}
  <ul
    class="team"
    class:team--order={team === 'ORDER'}
    class:team--chaos={team === 'CHAOS'}>
    {#each players as player (player.summonerName)}
      <li class="player">
        <slot {player} />
      </li>
    {:else}None{/each}
  </ul>
{/if}
