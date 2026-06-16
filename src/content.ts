// Content script must be self-contained due to Chrome Extension limitations
// Duplicate type definitions from settings.ts to avoid ES module imports

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
    decreaseSpeed: "s",
    increaseSpeed: "d",
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
  checkIntervalId?: number;
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
      } catch {
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
        this.detectInitialPlaybackRate();
        this.createSpeedOverlay();
      }
    };

    observeVideos();

    this.observer = new MutationObserver(() => {
      if (!this.video || !document.contains(this.video)) {
        observeVideos();
      }

      // Check if overlay was removed and recreate it
      if (this.video && this.speedOverlay) {
        if (!document.contains(this.speedOverlay.element)) {
          console.log("SpeedPilot: Overlay was removed, recreating...");
          this.speedOverlay = null;
          this.createSpeedOverlay();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private detectInitialPlaybackRate() {
    if (!this.video) return;

    // Listen for playback rate changes
    this.video.addEventListener("ratechange", () => {
      if (this.speedOverlay) {
        this.updateSpeedDisplay(false);
      }
    });

    // Listen for video play event to ensure overlay exists
    this.video.addEventListener("play", () => {
      if (!this.speedOverlay || !document.contains(this.speedOverlay.element)) {
        console.log("SpeedPilot: Recreating overlay on play event");
        this.speedOverlay = null;
        this.createSpeedOverlay();
      }
    });

    // Wait a bit for the video to load and apply any default speed
    setTimeout(() => {
      if (this.video && this.video.playbackRate !== 1) {
        console.log("SpeedPilot: Detected initial playback rate:", this.video.playbackRate);
        if (this.speedOverlay) {
          this.updateSpeedDisplay(false);
        }
      }
    }, 500);
  }

  private createSpeedOverlay() {
    if (!this.video || this.speedOverlay || this.settings.hideController) return;

    const overlay = document.createElement("div");
    overlay.className = "speedpilot-overlay";
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
      transition: opacity 0.3s;
      opacity: ${this.settings.controllerOpacity};
      width: auto;
      height: auto;
      max-width: 100px;
      z-index: 2147483647;
      display: block !important;
      visibility: visible !important;
    `;

    // Find parent with position relative/absolute/fixed to anchor the overlay
    let parentWithPosition = this.video.parentElement;
    while (parentWithPosition) {
      const position = window.getComputedStyle(parentWithPosition).position;
      if (position === "relative" || position === "absolute" || position === "fixed") {
        break;
      }
      parentWithPosition = parentWithPosition.parentElement;
    }

    // If no positioned parent found, use video's direct parent and make it relative
    if (!parentWithPosition) {
      parentWithPosition = this.video.parentElement;
      if (parentWithPosition) {
        parentWithPosition.style.position = "relative";
      }
    }

    let checkIntervalId: number | undefined;
    if (parentWithPosition) {
      parentWithPosition.appendChild(overlay);

      // Periodically check if overlay still exists (for aggressive DOM cleaners)
      checkIntervalId = window.setInterval(() => {
        if (!document.contains(overlay)) {
          console.log("SpeedPilot: Overlay removed by site, recreating...");
          clearInterval(checkIntervalId);
          this.speedOverlay = null;
          this.createSpeedOverlay();
        }
      }, 1000);
    }

    this.speedOverlay = {
      element: overlay,
      checkIntervalId,
    };

    this.updateSpeedDisplay(false);

    // If forceLastSavedSpeed is enabled, set the video speed
    if (this.settings.forceLastSavedSpeed && this.video) {
      const savedSpeed = localStorage.getItem("speedpilot_last_speed");
      if (savedSpeed) {
        this.video.playbackRate = Number.parseFloat(savedSpeed);
        this.updateSpeedDisplay(false);
      }
    }
  }

  private updateSpeedDisplay(showImmediately = true) {
    if (!this.speedOverlay || !this.video) return;

    const speed = this.video.playbackRate;
    this.speedOverlay.element.textContent = `${speed}x`;

    if (showImmediately) {
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

    const duration = this.video.duration;
    const currentTime = this.video.currentTime;

    // Check for valid duration and currentTime
    if (Number.isNaN(duration) || Number.isNaN(currentTime)) return;

    const targetTime = Math.max(0, Math.min(duration, currentTime + seconds));

    // Netflix uses MSE with a custom playback engine; writing video.currentTime
    // directly corrupts its state and triggers an error page. Seek through
    // Netflix's own player API via the MAIN-world helper instead.
    if (location.hostname.endsWith("netflix.com")) {
      window.dispatchEvent(
        new CustomEvent("speedpilot-netflix-seek", { detail: { timeMs: targetTime * 1000 } }),
      );
      return;
    }

    this.video.currentTime = targetTime;
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.speedOverlay) {
      if (this.speedOverlay.checkIntervalId) {
        clearInterval(this.speedOverlay.checkIntervalId);
      }
      if (this.speedOverlay.timeoutId) {
        clearTimeout(this.speedOverlay.timeoutId);
      }
      this.speedOverlay.element.remove();
    }
  }
}

// Export for testing
export { VideoController };

// Only run in production (not in test environment)
if (typeof process === "undefined" || process.env.NODE_ENV !== "test") {
  console.log("SpeedPilot: Content script loaded");
  const _controller = new VideoController();
  console.log("SpeedPilot: Controller created");
}
