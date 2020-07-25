<script lang="typescript">
  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let target: TInternalCooldownObjectNew;
  export let end: Date;
  export let team: ILiveAPIPlayerTeam;
  export let lane: ILiveAPIMapLane | undefined = undefined;

  let icon: string;
  $: icon = target === "Inhib" ? lane! : target;
</script>

<style>
  .object {
    display: grid;
    grid-template-areas:
      "icon name"
      "icon cooldown";
    grid-template-columns: 40px 1fr;
    grid-template-rows: 20px 20px;
  }

  .object__icon {
    grid-area: icon;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .object__icon__img {
    border-radius: 50%;
    width: 30px;
    height: 30px;
  }
  .object__name {
    grid-area: name;
    display: flex;
    align-items: center;
  }
  .object__cooldown {
    grid-area: cooldown;
    display: flex;
    align-items: center;
  }
</style>

<div
  class="object"
  class:object--team-order={team === 'ORDER'}
  class:object--team-chaos={team === 'CHAOS'}>
  <div class="object__icon">
    <img src="./img/objects/{icon}.png" alt={target} class="object__icon__img" />
  </div>
  <span class="object__name">{target}</span>
  <span class="object__cooldown">
    <TimeCounter {end} />
  </span>
</div>
