<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { isExists } from "@mary-shared/utils/typeguards";

  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let championName: string;
  export let cooldown: IInternalCooldownNew;

  const dispatch = createEventDispatcher();
  const onClick = () => dispatch("set");
  const onDoubleClick = () => dispatch("reset");
</script>

<style>
  .champion-r {
    border: 0;
    cursor: pointer;
    background: none;
  }

  .champion-r--cooldown .champion-r-icon:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2;
    content: "";
  }

  .champion-r--cooldown .cooldown-timer {
    font-weight: bold;
    font-size: 10px;
  }
</style>

<button
  type="button"
  class="champion-r"
  class:champion-r--cooldown={isExists(cooldown)}
  on:click={onClick}
  on:dblclick={onDoubleClick}>
  <span class="champion-r-icon">
    <img
      src="https://cdn.communitydragon.org/latest/champion/{championName}/ability-icon/r"
      alt="R" />
  </span>
  {#if isExists(cooldown)}
    <span class="cooldown-timer">
      <TimeCounter end={cooldown.end} />
    </span>
  {/if}
</button>
