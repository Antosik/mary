<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { isExists, isNotExists } from "@mary-shared/utils/typeguards";

  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let summonerSpell: string;
  export let side = "left";
  export let cooldown: IInternalCooldownNew;

  const dispatch = createEventDispatcher();
  const onMouseDown = (e: Event) => {
    const { which, button } = e as MouseEvent;

    if ((which === 3 || button === 2) && isExists(cooldown)) {
      dispatch("right-click");
      return;
    }

    if ((which === 1 || button === 0) && isNotExists(cooldown)) {
      dispatch("left-click");
    }
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
  on:mousedown={onMouseDown}>
  <span class="spell-icon">
    <img src="./img/spells/{summonerSpell}.png" alt={summonerSpell} />
  </span>
  {#if isExists(cooldown)}
    <span
      class="cooldown-timer"
      class:cooldown-timer--side-left={side === 'left'}
      class:cooldown-timer--side-right={side === 'right'}>
      <TimeCounter end={cooldown.end} />
    </span>
  {/if}
</button>
