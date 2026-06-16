import { normalizeSettings } from "../types/settings.js";

class PopupController {
  private openSettingsButton: HTMLButtonElement;
  private shortcutElements: {
    decrease: HTMLElement;
    increase: HTMLElement;
    backward: HTMLElement;
    forward: HTMLElement;
  };

  constructor() {
    this.openSettingsButton = document.getElementById("open-settings") as HTMLButtonElement;
    this.shortcutElements = {
      decrease: document.getElementById("key-decrease") as HTMLElement,
      increase: document.getElementById("key-increase") as HTMLElement,
      backward: document.getElementById("key-backward") as HTMLElement,
      forward: document.getElementById("key-forward") as HTMLElement,
    };

    this.init();
  }

  private async init() {
    await this.loadShortcuts();
    this.setupEventListeners();
  }

  private async loadShortcuts() {
    try {
      const data = await chrome.storage.sync.get("settings");
      const settings = normalizeSettings(data.settings);

      this.shortcutElements.decrease.textContent = settings.shortcuts.decreaseSpeed.toUpperCase();
      this.shortcutElements.increase.textContent = settings.shortcuts.increaseSpeed.toUpperCase();
      this.shortcutElements.backward.textContent = settings.shortcuts.skipBackward.toUpperCase();
      this.shortcutElements.forward.textContent = settings.shortcuts.skipForward.toUpperCase();
    } catch (error) {
      console.error("Failed to load shortcuts:", error);
    }
  }

  private setupEventListeners() {
    this.openSettingsButton.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
