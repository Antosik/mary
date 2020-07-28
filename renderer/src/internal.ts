/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import Internal from "./client/Internal.svelte";


const app = new Internal({
  target: document.getElementById("app") ?? document.body
});


export default app;
