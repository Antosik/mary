<script lang="typescript">
  import { createEventDispatcher, onDestroy } from "svelte";

  export let time: Date;

  const dispatch = createEventDispatcher();
  let timediff: number = 0;
  let timer: number;

  const initTimer = (endTime: Date) => {
    if (timer) clearInterval(timer);

    timediff = (endTime.getTime() - Date.now()) / 1000;
    timer = setInterval(() => {
      timediff -= 0.2;

      if (timediff <= 0) {
        clearInterval(timer);
        dispatch("completed");
      }
    }, 200);
  };

  $: initTimer(new Date(time));

  const formatTime = (count: number) => count.toFixed(1);

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

{#if time && timediff > 0}{formatTime(timediff)}s{/if}
