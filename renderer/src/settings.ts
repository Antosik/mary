/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import Settings from "./client/Settings.svelte";
import { ClientRPC } from "./data/rpc";
import { RPC_SETTINGS_ID } from "@mary-shared/utils/rpc";


const app = new Settings({
  target: document.getElementById("app") ?? document.body,
  props: {
    rpc: new ClientRPC(RPC_SETTINGS_ID)
  }
});


export default app;
