<script lang="typescript">
  import type { ClientRPC } from "@mary-web/data/rpc";
  import { onMount } from "svelte";
  import { settingsStore } from "@mary-web/store/settings";

  export let rpc: ClientRPC;

  const submit = async () => await rpc.invoke("settings:save", $settingsStore);

  onMount(async () => {
    settingsStore.setSettings(await rpc.invoke("settings:load"));
  });
</script>

<style>
  form {
    width: 80%;
    margin: 20px auto;
    align-items: center;
    display: grid;
    grid-gap: 20px 40px;
    grid-template-columns: 1fr max-content;
  }
  input {
    justify-self: center;
  }
  .note {
    grid-column: 1 / 3;
    font-size: 12px;
  }
  .submit {
    grid-column: 1 / 3;
  }
</style>

<form on:submit|preventDefault={submit}>
  <!--
  <label for="overlayLaunch">Enable overlay</label>
  <input
    type="checkbox"
    id="overlayLaunch"
    name="overlayLaunch"
    checked={$settingsStore.overlayLaunch}
    on:change={(e) => settingsStore.setSetting('overlayLaunch', e.target.checked)} />

  {#if $settingsStore.overlayLaunch}
    <div class="note">Overlay doesn't work in Fullscreen mode!</div>

    <label for="overlayKey">Keys</label>
    <input
      type="text"
      id="overlayKey"
      name="overlayKey"
      value={$settingsStore.overlayKey} />

    <label for="overlayWindowName">Window Name</label>
    <input
      type="text"
      id="overlayWindowName"
      name="overlayWindowName"
      value={$settingsStore.overlayWindowName}
      on:change={(e) => settingsStore.setSetting('overlayWindowName', e.target.value)} />
  {/if}
  -->

  <label for="showAllyTeam">Show ally team cooldowns</label>
  <input
    type="checkbox"
    id="showAllyTeam"
    name="showAllyTeam"
    checked={$settingsStore.showAllyTeam}
    on:change={(e) => settingsStore.setSetting('showAllyTeam', e.target.checked)} />

  <label for="showEnemyTeam">Show enemy team cooldowns</label>
  <input
    type="checkbox"
    id="showEnemyTeam"
    name="showEnemyTeam"
    checked={$settingsStore.showEnemyTeam}
    on:change={(e) => settingsStore.setSetting('showEnemyTeam', e.target.checked)} />

  <label for="showObjects">Show objects duration</label>
  <input
    type="checkbox"
    id="showObjects"
    name="showObjects"
    checked={$settingsStore.showObjects}
    on:change={(e) => settingsStore.setSetting('showObjects', e.target.checked)} />

  <label for="lanAvailability">Enable LAN connections (experimental)</label>
  <input
    type="checkbox"
    id="lanAvailability"
    name="lanAvailability"
    checked={$settingsStore.lanAvailability}
    on:change={(e) => settingsStore.setSetting('lanAvailability', e.target.checked)} />
  <button type="submit" class="submit">Save</button>
</form>
