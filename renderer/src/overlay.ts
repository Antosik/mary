/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import Overlay from "./client/Overlay.svelte";
import { ClientRPC } from "./data/rpc";
import { RPC_OVERLAY_ID } from "@mary-shared/utils/rpc";


const app = new Overlay({
  target: document.getElementById("app") ?? document.body,
  props: {
    rpc: new ClientRPC(RPC_OVERLAY_ID)
  }
});


export default app;
