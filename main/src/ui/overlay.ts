import type { AttachEvent } from "electron-overlay-window";

import { BrowserWindow } from "electron";
import { overlayWindow as overlay } from "electron-overlay-window";
import isDev from "electron-is-dev";
import { join as joinPath, resolve as resolvePath } from "path";

import { getKeyCodeFromElectronInput } from "@mary-main/utils/keys";
import { isNotBlank } from "@mary-shared/utils/typeguards";


export class OverlayWindow extends BrowserWindow {

  #isActive: boolean;
  #overlaySettings: TOverlaySettings;

  constructor(overlaySettings: TOverlaySettings) {
    super({
      title: "Mary Overlay",

      ...overlay.WINDOW_OPTS,

      width: 800,
      height: 600,
      resizable: false,

      webPreferences: {
        nodeIntegration: true
      },
    });

    this.#isActive = false;
    this.#overlaySettings = overlaySettings;

    const htmlPath = isDev ? resolvePath("target", "overlay.html") : joinPath(process.resourcesPath, "overlay.html");
    void this.loadFile(htmlPath);

    this.setIgnoreMouseEvents(true);
    this.webContents.on("before-input-event", this._handleKeyInput);

    this.addListener("ready-to-show", this._onReadyToShow);
  }

  // #region Getters & Setters
  get isActive(): boolean {
    return this.#isActive;
  }

  set isActive(active: boolean) {
    if (this.isActive !== active) {
      this.#isActive = active;
      this.emit("overlay:active-change", this.#isActive);
    }
  }
  // #endregion Getters & Setters


  // #region Overlay logic
  public toggleOverlay(): void {

    if (this.isActive) {
      this.focusMain();
    } else {
      this.focusOverlay();
    }
  }

  public focusMain = (): void => {

    if (this.isActive) {
      this.setIgnoreMouseEvents(true);
      overlay.focusTarget();
      this.isActive = false;
    }
  };

  public focusOverlay = (): void => {

    if (!this.isActive) {
      this.setIgnoreMouseEvents(false);
      overlay.activateOverlay();
      this.isActive = true;
    }
  };
  // #endregion Overlay logic


  // #region Events handlers
  private _onReadyToShow = () => {
    overlay.once("attach", this._onOverlayAttach);
    if (isNotBlank(this.#overlaySettings.overlayWindowName)) {
      overlay.attachTo(this, this.#overlaySettings.overlayWindowName);
    }
  };

  private _onOverlayAttach = (e: AttachEvent) => {

    if (this.isActive) {
      this.isActive = false;
      this.setIgnoreMouseEvents(true);
    }

    this.emit("overlay:attached", e);
  };

  private _handleKeyInput = (event: Electron.Event, input: Electron.Input) => {

    if (input.type !== "keyDown") {
      return;
    }

    const code = getKeyCodeFromElectronInput(input);

    switch (code) {
      case "Escape":
      case "Ctrl + W": {
        event.preventDefault();
        process.nextTick(this.focusMain);
        this.emit("overlay:close");
        break;
      }
      case this.#overlaySettings.overlayKey: {
        event.preventDefault();
        process.nextTick(this.focusOverlay);
        this.emit("overlay:open");
        break;
      }
    }
  };
  // #endregion Events handlers


  // #region Cleanup
  public destroy(): void {
    super.destroy();

    this.removeListener("ready-to-show", this._onReadyToShow);
  }
  // #endregion Cleanup
}