import { getKeyRawCode, getPrettyKeyCode } from "@mary-shared/utils/keys";


export function getKeyCodeFromHTMLInput(input: KeyboardEvent): string {
  const { code, ctrlKey, shiftKey, altKey } = input;
  return getPrettyKeyCode({ shiftKey, ctrlKey, altKey, code: getKeyRawCode(code) });
}