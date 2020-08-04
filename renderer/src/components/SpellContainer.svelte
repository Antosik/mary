<script lang="typescript">
  import { createEventDispatcher } from "svelte";
  import { isExists } from "@mary-shared/utils/typeguards";

  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let icon: string;
  export let cooldown: IInternalCooldown;
  export let rounded: boolean = false;

  const dispatch = createEventDispatcher();
  const onClick = () => dispatch("set");
  const onDoubleClick = () => dispatch("reset");
</script>

<style>
  .spell {
    position: relative;
    display: flex;

    background: none;
    border: none;
    cursor: pointer;

    width: 100%;
    height: 100%;
  }
  .spell--rounded {
    border-radius: 50%;
    overflow: hidden;
  }
  .spell__icon {
    width: 100%;
    height: 100%;
  }
  .spell__cd {
    font-size: 90%;
    background: rgba(0, 0, 0, 0.6);
    color: #dc4141;
    font-weight: bold;
    z-index: 2;
  }
</style>

<button
  type="button"
  class="spell"
  class:spell--rounded={rounded}
  on:click={onClick}
  on:dblclick={onDoubleClick}>
  <img src={icon} alt="Spell icon" class="spell__icon" />
  {#if isExists(cooldown)}
    <span class="spell__cd absolute-full flex-center">
      <TimeCounter end={cooldown.end} />
    </span>
  {/if}
</button>
