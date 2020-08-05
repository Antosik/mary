<script lang="typescript">
  import TimeCounter from "@mary-web/components/TimeCounter.svelte";

  export let target: TInternalCooldownObject;
  export let end: Date;
  export let lane: string;

  export let direction: "left" | "right" = "left";
  export let size: "big" | "normal" | "mini" = "normal";

  let icon: string;
  $: icon = target === "Inhib" ? lane! : target;
</script>

<style>
  .object {
    display: flex;
    width: 90px;
    height: 30px;

    border: 1px solid black;
    border-radius: 15px;
  }
  .object--size-big {
    width: 150px;
    height: 50px;
    border-radius: 25px;
  }
  .object--size-mini {
    width: 60px;
    height: 20px;
    border-radius: 10px;
  }
  .object__icon {
    width: 30px;
    height: 100%;
    border-radius: 50%;
    box-shadow: 0 0 0 1px black;
  }
  .object__icon__img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
  .object--size-big .object__icon {
    width: 50px;
  }
  .object--size-mini .object__icon {
    width: 20px;
  }
  .object__cd {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
  }
  .object--size-mini .object__cd {
    font-size: 14px;
    font-weight: bold;
  }
  .object--size-big .object__cd {
    font-size: 18px;
    font-weight: bold;
  }
  .object--direction-left {
    flex-direction: row;
  }
  .object--direction-right {
    flex-direction: row-reverse;
  }
  .object--type-baron {
    color: #fff;
    background: linear-gradient();
    background-image: linear-gradient(to right, #3b1a75, #893bcf);
  }
  .object--type-elder {
    color: #fff;
    background-image: linear-gradient(to right, #23b5a5, #524952);
  }
  .object--type-inhib {
    background-color: #fff;
  }
  .object--type-inhib .object__icon__img {
    width: 60%;
    height: 60%;
  }
</style>

<div
  class="object"
  class:object--size-big={size === 'big'}
  class:object--size-mini={size === 'mini'}
  class:object--direction-left={direction === 'left'}
  class:object--direction-right={direction === 'right'}
  class:object--type-baron={target === 'Baron'}
  class:object--type-elder={target === 'Elder'}
  class:object--type-inhib={target === 'Inhib'}>
  <div class="object__icon flex-center">
    <img
      src="./img/objects/{icon}.png"
      alt={target}
      class="object__icon__img" />
  </div>
  <span class="object__cd">
    <TimeCounter {end} />
  </span>
</div>
