<script lang="typescript">
  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let icon: string;
  export let cooldown: IInternalCooldown;
  export let direction: "left" | "right" = "left";
</script>

<style>
  .spell {
    position: relative;
  }
  .spell__icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid #000;
    max-width: 100%;
    box-sizing: border-box;
  }
  .spell__cd {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
      1px 1px 0 #000;
  }
  .spell--direction-left .spell__cd {
    transform: translateX(100%);
    right: 0;
  }
  .spell--direction-right .spell__cd {
    transform: translateX(-100%);
    left: 0;
  }
</style>

<div
  class="spell spell--mini"
  class:spell--direction-left={direction === 'left'}
  class:spell--direction-right={direction === 'right'}>
  <img src={icon} alt="Spell icon" class="spell__icon" />
  <span class="spell__cd flex-center">
    <TimeCounter end={cooldown.end} />
  </span>
</div>
