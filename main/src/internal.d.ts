declare interface IMaryOutput {
  send(container: TMessageContainer): void;
}

declare type TOverlaySettings = {
  overlayKey?: string;
  overlayWindowName?: string;
};


// #region Modules definition
declare module "@polka/send-type" {
  import { ServerResponse } from "http";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function send(res: ServerResponse, code: number, data?: any, headers?: any): void;
  export default send;
}
// #endregion Modules definition


// #region BrowserWindow extending
declare namespace Electron {

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface BrowserWindow {
    addListener(event: "overlay:attached", listener: (event: any) => void): this;
    addListener(event: "overlay:active-change", listener: (isActive: boolean) => void): this;
  }
}
// #endregion BrowserWindow extending