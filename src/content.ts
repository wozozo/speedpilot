interface KeyboardShortcuts {
  decreaseSpeed: string;
  increaseSpeed: string;
  skipBackward: string;
  skipForward: string;
}

interface Settings {
  speedIncrement: number;
  skipSeconds: number;
  shortcuts: KeyboardShortcuts;
  hideController: boolean;
  forceLastSavedSpeed: boolean;
  controllerOpacity: number;
  disabledSites: string[];
}

const DEFAULT_SETTINGS: Settings = {
  speedIncrement: 0.25,
  skipSeconds: 10,
  shortcuts: {
    decreaseSpeed: "a",
    increaseSpeed: "s",
    skipBackward: "z",
    skipForward: "x",
  },
  hideController: false,
  forceLastSavedSpeed: false,
  controllerOpacity: 0.5,
  disabledSites: [],
};

interface SpeedOverlay {
  element: HTMLDivElement;
  timeoutId?: number;
}

interface StorageData {
  settings: Settings;
}

class VideoController {
  private settings: Settings = DEFAULT_SETTINGS;
  private speedOverlay: SpeedOverlay | null = null;
  private video: HTMLVideoElement | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    console.log("SpeedPilot: Initializing...");
    this.init();
  }

  private async init() {
    await this.loadSettings();

    // Check if the current site is disabled
    if (this.isSiteDisabled()) {
      console.log("SpeedPilot: Extension is disabled on this site");
      return;
    }

    this.setupVideoObserver();
    this.setupKeyboardListeners();
  }

  private isSiteDisabled(): boolean {
    const currentUrl = window.location.href;
    return this.settings.disabledSites.some((pattern) => {
      try {
        const regex = new RegExp(pattern);
        return regex.test(currentUrl);
      } catch (e) {
        console.error("SpeedPilot: Invalid regex pattern:", pattern);
        return false;
      }
    });
  }

  private async loadSettings() {
    try {
      const data = await chrome.storage.sync.get("settings");
      const storageData = data as StorageData;
      if (storageData.settings) {
        this.settings = storageData.settings;
      }
    } catch (error) {
      console.error("SpeedPilot: Failed to load settings", error);
    }

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        this.settings = changes.settings.newValue || DEFAULT_SETTINGS;
      }
    });
  }

  private setupVideoObserver() {
    const observeVideos = () => {
      const videos = document.querySelectorAll("video");
      console.log("SpeedPilot: Found", videos.length, "video(s)");
      if (videos.length > 0) {
        this.video = videos[0] as HTMLVideoElement;
        console.log("SpeedPilot: Video element attached");
        this.createSpeedOverlay();
      }
    };

    observeVideos();

    this.observer = new MutationObserver(() => {
      if (!this.video || !document.contains(this.video)) {
        observeVideos();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private createSpeedOverlay() {
    if (!this.video || this.speedOverlay || this.settings.hideController) return;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.3s;
      opacity: ${this.settings.controllerOpacity};
    `;

    const videoContainer = this.video.closest("div") || document.body;
    videoContainer.style.position = "relative";
    videoContainer.appendChild(overlay);

    this.speedOverlay = {
      element: overlay,
    };

    this.updateSpeedDisplay();

    // If forceLastSavedSpeed is enabled, set the video speed
    if (this.settings.forceLastSavedSpeed && this.video) {
      const savedSpeed = localStorage.getItem("speedpilot_last_speed");
      if (savedSpeed) {
        this.video.playbackRate = Number.parseFloat(savedSpeed);
      }
    }
  }

  private updateSpeedDisplay() {
    if (!this.speedOverlay || !this.video) return;

    const speed = this.video.playbackRate;
    this.speedOverlay.element.textContent = `${speed}x`;

    this.speedOverlay.element.style.opacity = "1";

    if (this.speedOverlay.timeoutId) {
      clearTimeout(this.speedOverlay.timeoutId);
    }

    this.speedOverlay.timeoutId = window.setTimeout(() => {
      if (this.speedOverlay) {
        this.speedOverlay.element.style.opacity = String(this.settings.controllerOpacity);
      }
    }, 2000);
  }

  private setupKeyboardListeners() {
    document.addEventListener("keydown", (event) => {
      if (!this.video) return;

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Debug: Log key press
      console.log("SpeedPilot: Key pressed:", event.key, "Code:", event.code);

      const key = event.key.toLowerCase();

      if (key === this.settings.shortcuts.decreaseSpeed) {
        event.preventDefault();
        this.changeSpeed(-this.settings.speedIncrement);
      } else if (key === this.settings.shortcuts.increaseSpeed) {
        event.preventDefault();
        this.changeSpeed(this.settings.speedIncrement);
      } else if (key === this.settings.shortcuts.skipBackward) {
        event.preventDefault();
        this.skip(-this.settings.skipSeconds);
      } else if (key === this.settings.shortcuts.skipForward) {
        event.preventDefault();
        this.skip(this.settings.skipSeconds);
      }
    });
  }

  private changeSpeed(delta: number) {
    if (!this.video) return;

    const newSpeed = Math.max(0.25, Math.min(4, this.video.playbackRate + delta));
    this.video.playbackRate = newSpeed;
    this.updateSpeedDisplay();

    // Save the speed if forceLastSavedSpeed is enabled
    if (this.settings.forceLastSavedSpeed) {
      localStorage.setItem("speedpilot_last_speed", String(newSpeed));
    }
  }

  private skip(seconds: number) {
    if (!this.video) return;

    this.video.currentTime = Math.max(
      0,
      Math.min(this.video.duration, this.video.currentTime + seconds),
    );
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.speedOverlay) {
      this.speedOverlay.element.remove();
    }
  }
}

console.log("SpeedPilot: Content script loaded");
const controller = new VideoController();
console.log("SpeedPilot: Controller created");
