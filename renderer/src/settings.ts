/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import Settings from "./client/Settings.svelte";

const app = new Settings({
  target: document.getElementById("app") ?? document.body
});

export default app;
