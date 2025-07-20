import { DEFAULT_SETTINGS, type Settings } from "../types/settings";

class OptionsController {
  private currentDisabledSites: string[] = [];
  private elements: {
    speedIncrement: HTMLInputElement;
    skipSeconds: HTMLInputElement;
    hideController: HTMLInputElement;
    forceLastSpeed: HTMLInputElement;
    controllerOpacity: HTMLInputElement;
    opacityValue: HTMLSpanElement;
    disabledSites: HTMLTextAreaElement;
    saveButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    statusDiv: HTMLDivElement;
    shortcuts: {
      decreaseSpeed: HTMLInputElement;
      increaseSpeed: HTMLInputElement;
      skipBackward: HTMLInputElement;
      skipForward: HTMLInputElement;
    };
  };

  constructor() {
    this.elements = {
      speedIncrement: document.getElementById("speed-increment") as HTMLInputElement,
      skipSeconds: document.getElementById("skip-seconds") as HTMLInputElement,
      hideController: document.getElementById("hide-controller") as HTMLInputElement,
      forceLastSpeed: document.getElementById("force-last-speed") as HTMLInputElement,
      controllerOpacity: document.getElementById("controller-opacity") as HTMLInputElement,
      opacityValue: document.getElementById("opacity-value") as HTMLSpanElement,
      disabledSites: document.getElementById("disabled-sites") as HTMLTextAreaElement,
      saveButton: document.getElementById("save-button") as HTMLButtonElement,
      resetButton: document.getElementById("reset-button") as HTMLButtonElement,
      statusDiv: document.getElementById("status") as HTMLDivElement,
      shortcuts: {
        decreaseSpeed: document.getElementById("key-decrease-speed") as HTMLInputElement,
        increaseSpeed: document.getElementById("key-increase-speed") as HTMLInputElement,
        skipBackward: document.getElementById("key-skip-backward") as HTMLInputElement,
        skipForward: document.getElementById("key-skip-forward") as HTMLInputElement,
      },
    };

    this.init();
  }

  private async init() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  private async loadSettings() {
    try {
      const data = await chrome.storage.sync.get("settings");
      const settings: Settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };

      // Basic settings
      this.elements.speedIncrement.value = settings.speedIncrement.toString();
      this.elements.skipSeconds.value = settings.skipSeconds.toString();

      // Display settings
      this.elements.hideController.checked = settings.hideController;
      this.elements.controllerOpacity.value = settings.controllerOpacity.toString();
      this.elements.opacityValue.textContent = settings.controllerOpacity.toString();

      // Playback settings
      this.elements.forceLastSpeed.checked = settings.forceLastSavedSpeed;

      // Keyboard shortcuts
      this.elements.shortcuts.decreaseSpeed.value = settings.shortcuts.decreaseSpeed;
      this.elements.shortcuts.increaseSpeed.value = settings.shortcuts.increaseSpeed;
      this.elements.shortcuts.skipBackward.value = settings.shortcuts.skipBackward;
      this.elements.shortcuts.skipForward.value = settings.shortcuts.skipForward;

      // Disabled sites
      this.currentDisabledSites = settings.disabledSites;
      this.elements.disabledSites.value = settings.disabledSites.join("\n");
    } catch (error) {
      console.error("Failed to load settings:", error);
      this.showStatus("Failed to load settings", false);
    }
  }

  private setupEventListeners() {
    // Save button (for disabled sites only)
    this.elements.saveButton.addEventListener("click", () => this.saveSettings());

    // Reset button
    this.elements.resetButton.addEventListener("click", () => this.resetSettings());

    // Auto-save on blur for basic settings
    this.elements.speedIncrement.addEventListener("blur", () => this.autoSave());
    this.elements.skipSeconds.addEventListener("blur", () => this.autoSave());

    // Auto-save on change for checkboxes
    this.elements.hideController.addEventListener("change", () => this.autoSave());
    this.elements.forceLastSpeed.addEventListener("change", () => this.autoSave());

    // Opacity slider
    this.elements.controllerOpacity.addEventListener("input", () => {
      this.elements.opacityValue.textContent = this.elements.controllerOpacity.value;
    });
    this.elements.controllerOpacity.addEventListener("change", () => this.autoSave());

    // Keyboard shortcut inputs
    for (const input of Object.values(this.elements.shortcuts)) {
      input.addEventListener("keydown", (e) => {
        e.preventDefault();
        const key = e.key.toLowerCase();
        if (key.length === 1 && /^[a-z0-9]$/i.test(key)) {
          input.value = key;
        }
      });
      input.addEventListener("blur", () => this.autoSave());
    }
  }

  private async autoSave() {
    const settings: Settings = {
      speedIncrement:
        Number.parseFloat(this.elements.speedIncrement.value) || DEFAULT_SETTINGS.speedIncrement,
      skipSeconds: Number.parseInt(this.elements.skipSeconds.value) || DEFAULT_SETTINGS.skipSeconds,
      hideController: this.elements.hideController.checked,
      forceLastSavedSpeed: this.elements.forceLastSpeed.checked,
      controllerOpacity:
        Number.parseFloat(this.elements.controllerOpacity.value) ||
        DEFAULT_SETTINGS.controllerOpacity,
      shortcuts: {
        decreaseSpeed:
          this.elements.shortcuts.decreaseSpeed.value || DEFAULT_SETTINGS.shortcuts.decreaseSpeed,
        increaseSpeed:
          this.elements.shortcuts.increaseSpeed.value || DEFAULT_SETTINGS.shortcuts.increaseSpeed,
        skipBackward:
          this.elements.shortcuts.skipBackward.value || DEFAULT_SETTINGS.shortcuts.skipBackward,
        skipForward:
          this.elements.shortcuts.skipForward.value || DEFAULT_SETTINGS.shortcuts.skipForward,
      },
      // Keep current disabled sites (don't auto-save these)
      disabledSites: this.currentDisabledSites || [],
    };

    try {
      await chrome.storage.sync.set({ settings });
      this.showStatus("Settings saved", true, 1500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.showStatus("Failed to save settings", false);
    }
  }

  private async saveSettings() {
    // This method now only saves disabled sites
    const settings: Settings = {
      speedIncrement:
        Number.parseFloat(this.elements.speedIncrement.value) || DEFAULT_SETTINGS.speedIncrement,
      skipSeconds: Number.parseInt(this.elements.skipSeconds.value) || DEFAULT_SETTINGS.skipSeconds,
      hideController: this.elements.hideController.checked,
      forceLastSavedSpeed: this.elements.forceLastSpeed.checked,
      controllerOpacity:
        Number.parseFloat(this.elements.controllerOpacity.value) ||
        DEFAULT_SETTINGS.controllerOpacity,
      shortcuts: {
        decreaseSpeed:
          this.elements.shortcuts.decreaseSpeed.value || DEFAULT_SETTINGS.shortcuts.decreaseSpeed,
        increaseSpeed:
          this.elements.shortcuts.increaseSpeed.value || DEFAULT_SETTINGS.shortcuts.increaseSpeed,
        skipBackward:
          this.elements.shortcuts.skipBackward.value || DEFAULT_SETTINGS.shortcuts.skipBackward,
        skipForward:
          this.elements.shortcuts.skipForward.value || DEFAULT_SETTINGS.shortcuts.skipForward,
      },
      disabledSites: this.elements.disabledSites.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    };

    try {
      await chrome.storage.sync.set({ settings });
      this.currentDisabledSites = settings.disabledSites;
      this.showStatus("Disabled sites saved!", true);
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.showStatus("Failed to save settings", false);
    }
  }

  private async resetSettings() {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      try {
        await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
        await this.loadSettings();
        this.showStatus("Settings reset to defaults", true);
      } catch (error) {
        console.error("Failed to reset settings:", error);
        this.showStatus("Failed to reset settings", false);
      }
    }
  }

  private statusTimeout?: number;

  private showStatus(message: string, success: boolean, duration = 3000) {
    // Clear any existing timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    this.elements.statusDiv.textContent = message;
    this.elements.statusDiv.className = `status ${success ? "success" : "error"} show`;

    this.statusTimeout = window.setTimeout(() => {
      this.elements.statusDiv.classList.remove("show");
      setTimeout(() => {
        this.elements.statusDiv.textContent = "";
        this.elements.statusDiv.className = "status";
      }, 300); // Wait for fade animation
    }, duration);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new OptionsController();
});
