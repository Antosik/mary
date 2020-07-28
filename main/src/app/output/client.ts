import { MainRPC } from "@mary-main/utils/rpc";
import { MainWindow } from "@mary-main/ui/main";
import { RPC_MAIN_ID } from "@mary-shared/utils/rpc";


export class MaryClient implements IMaryOutput, IDestroyable {

  #window: MainWindow;
  #rpc: MainRPC;

  public static launch(): MaryClient {
    return new this();
  }

  private constructor() {
    this.#window = new MainWindow();
    this.#rpc = new MainRPC(RPC_MAIN_ID, this.#window);
  }

  public get window(): MainWindow {
    return this.#window;
  }

  public get events(): MainRPC {
    return this.#rpc;
  }

  public send({ event, data }: TMessageContainer): void {
    this.#rpc.send(event, data);
  }

  public destroy(): void {
    this.#rpc.destroy();
    this.#window.close();
  }
}