<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import { getKeyCodeFromHTMLInput } from "@mary-web/utils/keys";

  export let value: string;

  const dispatch = createEventDispatcher();
  const onKeyPress = (event: KeyboardEvent) => {
    dispatch("change", getKeyCodeFromHTMLInput(event));
  };
</script>

<input type="text" on:keypress|preventDefault|stopPropagation={onKeyPress} {value} />
