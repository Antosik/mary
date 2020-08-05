/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import App from "./client/App.svelte";
import { ClientRPC } from "./data/ws";


const app = new App({
  target: document.getElementById("app") ?? document.body,
  props: {
    rpc: new ClientRPC()
  }
});


export default app;
