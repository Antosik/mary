import type { AttachEvent } from "electron-overlay-window";
import type { UiohookKeyboardEvent } from "uiohook-napi";

import { systemPreferences, dialog } from "electron";
import { uIOhook } from "uiohook-napi";

import { OverlayWindow } from "@mary-main/ui/overlay";
import { MainRPC } from "@mary-main/utils/rpc";
import { RPC_OVERLAY_ID } from "@mary-shared/utils/rpc";
import { getKeyCodeFromUiohookInput } from "@mary-main/utils/keys";


export class MaryOverlay implements IMaryOutput, IDestroyable {

  #settings: TOverlaySettings;
  #window: OverlayWindow;
  #rpc: MainRPC;

  public static launch(settings: TOverlaySettings): MaryOverlay {

    const parameters: TOverlaySettings = {
      overlayKey: "Backquote",
      overlayWindowName: "League of Legends (TM) Client",
      ...settings
    };

    return new this(parameters);
  }

  private constructor(settings: TOverlaySettings) {

    this.#settings = settings;
    this.#window = new OverlayWindow(this.#settings);
    this.#rpc = new MainRPC(RPC_OVERLAY_ID, this.#window);

    /* eslint-disable @typescript-eslint/ban-ts-comment */
    this.#window.addListener("overlay:attached", this._onOverlayAttached); // @ts-ignore
    this.#window.addListener("overlay:active-change", this._onOverlayActiveChange); // @ts-ignore
    /* eslint-enable @typescript-eslint/ban-ts-comment */
  }

  // #region Getters & Setters
  public get window(): OverlayWindow {
    return this.#window;
  }

  public get events(): MainRPC {
    return this.#rpc;
  }
  // #endregion Getters & Setters


  // #region Main
  public send({ event, data }: TMessageContainer): void {
    this.#rpc.send(event, data);
  }

  public hideOverlay(): void {
    this.#window.focusMain();
  }
  // #endregion Main


  // #region Overlay events
  private _onOverlayAttached = (e: AttachEvent) => {

    if (!e.hasAccess) {
      dialog.showErrorBox(
        "PoE window - No access",
        // ----------------------
        "Path of Exile is running with administrator rights.\n" +
        "\n" +
        "You need to restart Awakened PoE Trade with administrator rights."
      );
      return;
    }

    if (process.platform === "win32" && !systemPreferences.isAeroGlassEnabled()) {
      dialog.showErrorBox(
        "Windows 7 - Aero",
        // ----------------------
        'You must enable Windows Aero in "Appearance and Personalization".\n' +
        "It is required to create a transparent overlay window."
      );
      return;
    }

    this._bindKeys();
  };

  private _onOverlayActiveChange = (isActive: boolean) => {
    this.#rpc.emit("overlay:active-change", isActive);
  };
  // #endregion Overlay events


  // #region Key bindings
  private _bindKeys() {
    uIOhook.addListener("keydown", this._onKeyDown);
    uIOhook.start();
  }

  private _onKeyDown = (e: UiohookKeyboardEvent): void => {
    if (this.#settings.overlayKey === getKeyCodeFromUiohookInput(e)) {
      this.#window.toggleOverlay();
    }
  };
  // #endregion


  // #region Cleanup
  public destroy(): void {
    this.#rpc.destroy();

    if (!this.#window.isDestroyed()) {
      this.#window.close();
    }
  }
  // #endregion Cleanup
}