import type { Input as ElectronInput } from "electron";
import { UiohookKeyboardEvent as UiohookInput, UiohookKey } from "uiohook-napi";

import { getKeyRawCode, getPrettyKeyCode } from "@mary-shared/utils/keys";
import { isNotExists } from "@mary-shared/utils/typeguards";


export function getKeyCodeFromElectronInput(input: ElectronInput): string {
  const { code, control: ctrlKey, shift: shiftKey, alt: altKey } = input;
  return getPrettyKeyCode({ shiftKey, ctrlKey, altKey, code: getKeyRawCode(code) });
}


const UiohookToName: Map<number, string> = new Map<number, string>(Object.entries(UiohookKey).map(([k, v]) => ([v, k])));
export function getKeyCodeFromUiohookInput(e: UiohookInput): string {
  const { ctrlKey, shiftKey, altKey, keycode } = e;

  const rawCode = UiohookToName.get(keycode);
  if (isNotExists(rawCode)) {
    return "unknown";
  }

  return getPrettyKeyCode({ shiftKey, ctrlKey, altKey, code: rawCode });
}