import type { Window } from "./ui/window";

import { LiveClientAPI } from "./connectors/LiveClientAPI";
import { LiveClientAPIPing } from "./connectors/LiveClientAPI/ping";

import { LiveClientService } from "./services/live";
import { LiveClientController } from "./controllers/live";
import { CooldownService } from "./services/cooldown";
import { CooldownController } from "./controllers/cooldown";

import { MainRPC } from "./utils/rpc";


export class Mary {
  private _liveClientApi: LiveClientAPI;
  private _liveClientApiPing: LiveClientAPIPing;

  private _window: Window;
  private _rpc: MainRPC;

  private _liveClientService: LiveClientService;
  private _liveClientController: LiveClientController;
  private _cooldownService: CooldownService;
  private _cooldownController: CooldownController;


  public static mount(window: Window): Mary {
    return new this(window);
  }

  constructor(window: Window) {

    this._window = window;
    this._rpc = new MainRPC(window);

    this._liveClientApi = new LiveClientAPI();
    this._liveClientApiPing = new LiveClientAPIPing();

    this._liveClientService = new LiveClientService(this._liveClientApi, this._liveClientApiPing);
    this._liveClientController = new LiveClientController(this._rpc, this._liveClientService);
    this._liveClientController.handleEvents();


    this._cooldownService = new CooldownService();
    this._cooldownController = new CooldownController(this._rpc, this._cooldownService);
    this._cooldownController.handleEvents();

    this._rpc.addListener("live:disconnected", () => this._cooldownService.resetCooldowns());
  }

  public destroy(): void {
    this._cooldownService.destroy();
    this._liveClientService.destroy();
    this._rpc.destroy();
  }
}