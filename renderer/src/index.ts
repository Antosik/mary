/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import App from "./client/App.svelte";
import { ClientRPC } from "./data/rpc";
import { RPC_MAIN_ID } from "@mary-shared/utils/rpc";


const app = new App({
  target: document.getElementById("app") ?? document.body,
  props: {
    rpc: new ClientRPC(RPC_MAIN_ID)
  }
});


export default app;
