import { ipcRenderer, remote } from "electron";
import { isExists } from "@mary-shared/utils/typeguards";

const win = remote.getCurrentWindow();

const toggleMaximized = () => {
  if (win.isMaximized()) {
    document.body.classList.add("window-maximized");
  } else {
    document.body.classList.remove("window-maximized");
  }
};

function handleWindowControls() {

  const onHide = () => win.minimize();
  const onMaximize = () => win.maximize();
  const onUnmaximize = () => win.unmaximize();
  const onClose = () => win.close();

  const settingsButton = document.getElementById("settings-button");
  if (isExists(settingsButton)) {
    settingsButton.addEventListener("click", async () => {
      await ipcRenderer.invoke("main", { event: "settings:open", data: undefined });
    });
  }

  document.getElementById("hide-button")!.addEventListener("click", onHide);
  document.getElementById("unmaximize-button")!.addEventListener("click", onUnmaximize);
  document.getElementById("maximize-button")!.addEventListener("click", onMaximize);
  document.getElementById("close-button")!.addEventListener("click", onClose);

  // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
  toggleMaximized();
  win.addListener("maximize", toggleMaximized);
  win.addListener("unmaximize", toggleMaximized);
}

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    handleWindowControls();
  }
};

window.onbeforeunload = () => {
  win.removeListener("maximize", toggleMaximized);
  win.removeListener("unmaximize", toggleMaximized);
};