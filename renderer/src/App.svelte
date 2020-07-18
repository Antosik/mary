<script lang="typescript">
  import { onMount, onDestroy } from "svelte";
  import { groupByTeam } from "@mary-shared/utils/summoner";

  import { rpc } from "./data/rpc";
  import { gameStore } from "./store/game";

  import Team from "./components/Team.svelte";
  import Player from "./components/Player.svelte";

  const onPlayers = gameStore.setPlayers;
  const onCooldowns = gameStore.setCooldowns;
  const onDisconnect = gameStore.reset;

  const onConnected = () => rpc.invoke("cooldowns:get");
  const onCooldown = async (e: Event) => {
    const { summonerName, championName, target } = (e as CustomEvent)
      .detail as { summonerName: string; championName: string; target: string };
    await rpc.invoke("cooldowns:set", summonerName, championName, target);
  };

  let teams: Record<string, IInternalPlayerInfo[]>;
  $: teams = groupByTeam($gameStore.players);

  function getCooldowns(player: IInternalPlayerInfo): IInternalCooldown[] {
    return $gameStore.cooldowns.filter(
      (cd) =>
        cd.summonerName === player.summonerName &&
        cd.championName === player.championName
    );
  }

  onMount(() => {
    rpc.invoke("live:connect");

    rpc.addListener("live:connected", onConnected);
    rpc.addListener("live:players", onPlayers);
    rpc.addListener("live:disconnected", onDisconnect);
    rpc.addListener("cooldowns:get", onCooldowns);
  });

  onDestroy(() => {
    rpc.removeListener("live:players", onPlayers);
    rpc.removeListener("live:disconnected", onDisconnect);
  });
</script>

{#if teams['ORDER'].length > 0}
  <Team team="ORDER" players={teams['ORDER']} let:player>
    <Player
      team="ORDER"
      {...player}
      cooldowns={getCooldowns(player)}
      on:cooldown={onCooldown} />
  </Team>
{/if}

{#if teams['CHAOS'].length > 0}
  <Team team="CHAOS" players={teams['CHAOS']} let:player>
    <Player
      team="CHAOS"
      {...player}
      cooldowns={getCooldowns(player)}
      on:cooldown={onCooldown} />
  </Team>
{/if}
