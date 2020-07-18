<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { onMouseLeave } from "../utils/mouseEvents";
  import { isExists } from "@mary-shared/utils/typeguards";

  import TimeCounter from "./TimeCounter.svelte";

  export let summonerSpell: string;
  export let side = "left";
  export let cooldown: IInternalCooldown;

  const dispatch = createEventDispatcher();
  const onSpellClick = () => {
    dispatch("click");
    onMouseLeave();
  };
</script>

<style>
  .spell {
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .spell--cooldown .spell-icon:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2;
    content: "";
  }
</style>

<button
  type="button"
  class="spell"
  class:spell--cooldown={isExists(cooldown)}
  disabled={isExists(cooldown)}
  on:click={onSpellClick}>
  <span class="spell-icon">
    <img src="./img/spells/{summonerSpell}.png" alt={summonerSpell} />
  </span>
  {#if isExists(cooldown)}
    <span
      class="cooldown-timer"
      class:cooldown-timer--side-left={side === 'left'}
      class:cooldown-timer--side-right={side === 'right'}>
      <TimeCounter time={cooldown.end} />
    </span>
  {/if}
</button>
