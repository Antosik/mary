/* eslint-disable @typescript-eslint/unbound-method */
import type { CooldownService } from "@mary-main/services/cooldown";
import type { MainRPC } from "@mary-main/utils/rpc";

import { Result } from "@mary-shared/utils/result";

export class CooldownController {

  private _rpc: MainRPC;
  private _cooldownService: CooldownService;

  public constructor(
    rpc: MainRPC,
    cooldownService: CooldownService
  ) {
    this._rpc = rpc;
    this._cooldownService = cooldownService;

    // Event handlers binding
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    this._onCooldownsPing = this._onCooldownsPing.bind(this);
    this._handleCooldownsGet = this._handleCooldownsGet.bind(this);
    this._handleCooldownsSet = this._handleCooldownsSet.bind(this);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  }

  public handleEvents(): this {
    return this
      ._handleCooldownEvents()
      ._handleRPCEvents();
  }

  // #region LCU Events Handling (Inner)
  private _handleCooldownEvents(): this {
    this._cooldownService.addListener("cooldowns:ping", this._onCooldownsPing);

    return this;
  }

  private _onCooldownsPing(cooldowns: IInternalCooldown[]) {
    this._rpc.send("cooldowns:get", cooldowns);
  }
  // #endregion LCU Events Handling (Inner)

  // #region RPC Events Handling (Outer)
  private _handleRPCEvents(): this {

    this._rpc.setHandler("cooldowns:get", this._handleCooldownsGet);
    this._rpc.setHandler("cooldowns:set", this._handleCooldownsSet);

    return this;
  }

  private _handleCooldownsGet() {
    return Result.create(this._cooldownService.getCooldowns(), "success");
  }

  private _handleCooldownsSet(summonerName: string, championName: string, target: string) {
    return Result.create(this._cooldownService.setCooldown(summonerName, championName, target), "success");
  }
  // #endregion RPC Events Handling (Outer)
}