import { MainRPC } from "@mary-main/utils/rpc";
import { SettingsWindow } from "@mary-main/ui/settings";
import { RPC_SETTINGS_ID } from "@mary-shared/utils/rpc";


export class MarySettings implements IMaryOutput, IDestroyable {

  #window: SettingsWindow;
  #rpc: MainRPC;

  public static launch(): MarySettings {
    return new this();
  }
  

  private constructor() {
    this.#window = new SettingsWindow();
    this.#rpc = new MainRPC(RPC_SETTINGS_ID, this.#window);
  }


  // #region Getters & Setters
  public get window(): SettingsWindow {
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
  // #endregion Main


  // #region Cleanup
  public destroy(): void {
    this.#rpc.destroy();

    if (!this.#window.isDestroyed()) {
      this.#window.close();
    }
  }
  // #endregion Cleanup
}