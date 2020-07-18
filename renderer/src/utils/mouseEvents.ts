import { remote } from "electron";


export function onMouseEnter(): void {
  const win = remote.getCurrentWindow();
  win.setIgnoreMouseEvents(false);
}

export function onMouseLeave(): void {
  const win = remote.getCurrentWindow();
  win.setIgnoreMouseEvents(true, {
    forward: true
  });
}

export function setAlwaysOnTop(): void {
  const win = remote.getCurrentWindow();
  win.setAlwaysOnTop(true, "pop-up-menu");
}

export function unsetAlwaysOnTop(): void {
  const win = remote.getCurrentWindow();
  win.setAlwaysOnTop(false);
}

export function startListeningToIgnoreMouseEvents(el: HTMLElement): void {
  el.addEventListener("mouseenter", onMouseEnter);
  el.addEventListener("mouseleave", onMouseLeave);
}

export function stopListeningToIgnoreMouseEvents(el: HTMLElement): void {
  el.removeEventListener("mouseenter", onMouseEnter);
  el.removeEventListener("mouseleave", onMouseLeave);
}