<script lang="typescript">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let speed = 0.5;
  export let end: Date;

  const dispatch = createEventDispatcher();
  let timediff: number = 0;
  let timer: number;

  const initTimer = (endTime: Date) => {
    if (timer) clearInterval(timer);

    timediff = (endTime.getTime() - Date.now()) / 1000;
    timer = setInterval(() => {
      timediff -= speed;

      if (timediff <= 0) {
        clearInterval(timer);
        dispatch("completed");
      }
    }, speed * 1e3);
  };

  $: initTimer(new Date(end));

  const formatTime = (count: number) => count.toFixed(0);
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      initTimer(new Date(end));
    }
  };

  onMount(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onDestroy(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    clearInterval(timer);
  });
</script>

{#if end && timediff > 0}{formatTime(timediff)}s{/if}
