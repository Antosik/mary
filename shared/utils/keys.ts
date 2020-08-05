export function getKeyRawCode(code: string): string {
  if (code.startsWith("Key")) {
    return code.substr("Key".length);
  }
  if (code.startsWith("Digit")) {
    return code.substr("Digit".length);
  }
  return code;
}

export function getPrettyKeyCode({ shiftKey, ctrlKey, altKey, code }: { shiftKey: boolean, ctrlKey: boolean, altKey: boolean, code: string }): string {

  if (shiftKey && altKey) return `Shift + Alt + ${code}`;
  else if (ctrlKey && shiftKey) return `Ctrl + Shift + ${code}`;
  else if (ctrlKey && altKey) return `Ctrl + Alt + ${code}`;
  else if (altKey) return `Alt + ${code}`;
  else if (ctrlKey) return `Ctrl + ${code}`;
  else if (shiftKey) return `Shift + ${code}`;

  return code;
}