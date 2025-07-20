import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("VideoController", () => {
  let videoElement: HTMLVideoElement;
  let VideoController: typeof import("../content").VideoController;
  let controller: InstanceType<typeof import("../content").VideoController>;

  beforeEach(async () => {
    // Reset modules before each test
    vi.resetModules();

    document.body.innerHTML = "";
    videoElement = document.createElement("video");
    videoElement.src = "test.mp4";
    document.body.appendChild(videoElement);

    // Set a proper URL to avoid "Extension is disabled on this site"
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/video" },
      writable: true,
    });

    vi.clearAllMocks();
    vi.useFakeTimers();

    // Import fresh module
    const contentModule = await import("../content");
    VideoController = contentModule.VideoController;
  });

  afterEach(() => {
    // Clean up any controller instances
    if (controller?.destroy) {
      controller.destroy();
    }
    vi.resetModules();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  describe("Initialization", () => {
    it("should initialize when video element exists", async () => {
      const controller = new VideoController();
      await vi.waitFor(() => {
        expect(controller).toBeDefined();
      });
    });

    it("should load settings from chrome storage", async () => {
      const mockGet = vi.mocked(chrome.storage.sync.get);
      mockGet.mockImplementation((_keys, callback) => {
        const settings = {
          settings: {
            speedIncrement: 0.5,
            skipSeconds: 15,
            shortcuts: {
              decreaseSpeed: "q",
              increaseSpeed: "w",
              skipBackward: "e",
              skipForward: "r",
            },
            hideController: false,
            forceLastSavedSpeed: true,
            controllerOpacity: 0.7,
            disabledSites: ["example.com"],
          },
        };
        if (callback) {
          callback(settings);
        }
        return Promise.resolve(settings);
      });

      new VideoController();
      await vi.waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("settings");
      });
    });

    it("should not initialize if site is disabled", async () => {
      const mockGet = vi.mocked(chrome.storage.sync.get);
      mockGet.mockImplementation((_keys, callback) => {
        const settings = {
          settings: {
            ...DEFAULT_SETTINGS,
            disabledSites: [".*test.*"],
          },
        };
        if (callback) {
          callback(settings);
        }
        return Promise.resolve(settings);
      });

      Object.defineProperty(window, "location", {
        value: { href: "https://test.com" },
        writable: true,
      });

      const controller = new VideoController();
      await vi.waitFor(() => {
        expect(controller).toBeDefined();
      });
    });
  });

  describe("Video Detection", () => {
    it("should detect video elements on page load", async () => {
      new VideoController();
      await vi.waitFor(() => {
        expect(document.querySelector("video")).toBeTruthy();
      });
    });

    it("should detect dynamically added video elements", async () => {
      new VideoController();

      const newVideo = document.createElement("video");
      newVideo.src = "new-test.mp4";
      document.body.appendChild(newVideo);

      await vi.waitFor(() => {
        expect(document.querySelectorAll("video").length).toBe(2);
      });
    });
  });

  describe("Keyboard Controls", () => {
    beforeEach(() => {
      controller = new VideoController();
    });

    it("should increase playback speed on increase key press", async () => {
      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Set initial speed
      videoElement.playbackRate = 1;

      const event = new KeyboardEvent("keydown", { key: "s" });
      document.dispatchEvent(event);

      // Speed should have increased
      await vi.waitFor(() => {
        expect(videoElement.playbackRate).toBeGreaterThan(1);
      });
    });

    it("should decrease playback speed on decrease key press", async () => {
      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Set initial speed
      videoElement.playbackRate = 1.5;

      const event = new KeyboardEvent("keydown", { key: "a" });
      document.dispatchEvent(event);

      // Speed should have decreased
      await vi.waitFor(() => {
        expect(videoElement.playbackRate).toBeLessThan(1.5);
      });
    });

    it("should not decrease speed below 0.25", async () => {
      videoElement.playbackRate = 0.25;

      const event = new KeyboardEvent("keydown", { key: "a" });
      document.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(videoElement.playbackRate).toBe(0.25);
      });
    });

    it("should skip backward on skip backward key press", async () => {
      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Mock duration to avoid NaN issues
      Object.defineProperty(videoElement, "duration", {
        get: () => 100,
        configurable: true,
      });
      videoElement.currentTime = 30;

      const event = new KeyboardEvent("keydown", { key: "z" });
      document.dispatchEvent(event);

      // Should skip backward
      await vi.waitFor(() => {
        expect(videoElement.currentTime).toBeLessThan(30);
      });
    });

    it("should skip forward on skip forward key press", async () => {
      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Mock duration to avoid NaN issues
      Object.defineProperty(videoElement, "duration", {
        get: () => 100,
        configurable: true,
      });
      videoElement.currentTime = 10;

      const event = new KeyboardEvent("keydown", { key: "x" });
      document.dispatchEvent(event);

      // Should skip forward
      await vi.waitFor(() => {
        expect(videoElement.currentTime).toBeGreaterThan(10);
      });
    });

    it("should not skip beyond video duration", async () => {
      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Mock duration to avoid NaN issues
      Object.defineProperty(videoElement, "duration", {
        get: () => 100,
        configurable: true,
      });
      videoElement.currentTime = 95;

      const event = new KeyboardEvent("keydown", { key: "x" });
      document.dispatchEvent(event);

      // Should not go beyond duration
      await vi.waitFor(() => {
        expect(videoElement.currentTime).toBeLessThanOrEqual(100);
        expect(videoElement.currentTime).toBeGreaterThan(95);
      });
    });

    it("should ignore keyboard events when typing in input fields", async () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      videoElement.playbackRate = 1;

      const event = new KeyboardEvent("keydown", { key: "s" });
      input.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(videoElement.playbackRate).toBe(1);
      });
    });
  });

  describe("Speed Overlay", () => {
    beforeEach(() => {
      controller = new VideoController();
    });

    it("should show speed overlay when speed changes", async () => {
      // Wait for video to be detected and overlay created
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Set initial speed
      videoElement.playbackRate = 1;

      const event = new KeyboardEvent("keydown", { key: "s" });
      document.dispatchEvent(event);

      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
        // Check if overlay shows the current speed
        expect(overlay?.textContent).toMatch(/\d+(\.\d+)?x/);
      });
    });

    it("should hide speed overlay after timeout", async () => {
      // Wait for video to be detected and overlay created
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      const event = new KeyboardEvent("keydown", { key: "s" });
      document.dispatchEvent(event);

      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
        expect(overlay.style.opacity).toBe("1");
      });

      // Fast forward time
      vi.advanceTimersByTime(2500);

      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay.style.opacity).toBe("0.5");
      });
    });

    it("should update existing overlay on multiple speed changes", async () => {
      // Wait for video to be detected and overlay created
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      // Set initial speed
      videoElement.playbackRate = 1;

      const increaseEvent = new KeyboardEvent("keydown", { key: "s" });
      document.dispatchEvent(increaseEvent);

      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        const currentSpeed = videoElement.playbackRate;
        expect(overlay?.textContent).toContain(`${currentSpeed}x`);
      });

      document.dispatchEvent(increaseEvent);

      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        const currentSpeed = videoElement.playbackRate;
        expect(overlay?.textContent).toContain(`${currentSpeed}x`);
      });
    });
  });

  describe("Settings Updates", () => {
    it("should update settings when chrome storage changes", async () => {
      new VideoController();

      // Wait for initial setup
      await vi.waitFor(() => {
        const mockListener = vi.mocked(chrome.storage.onChanged.addListener);
        expect(mockListener).toHaveBeenCalled();
      });

      const mockListener = vi.mocked(chrome.storage.onChanged.addListener);
      const changeCallback = mockListener.mock.calls[0][0];

      const newSettings = {
        ...DEFAULT_SETTINGS,
        speedIncrement: 0.5,
        shortcuts: {
          decreaseSpeed: "q",
          increaseSpeed: "w",
          skipBackward: "e",
          skipForward: "r",
        },
      };

      changeCallback(
        {
          settings: {
            newValue: newSettings,
            oldValue: DEFAULT_SETTINGS,
          },
        },
        "sync",
      );

      // Wait for video to be detected
      await vi.waitFor(() => {
        const overlay = document.querySelector(".speedpilot-overlay");
        expect(overlay).toBeTruthy();
      });

      videoElement.playbackRate = 1;

      const event = new KeyboardEvent("keydown", { key: "w" });
      document.dispatchEvent(event);

      await vi.waitFor(() => {
        expect(videoElement.playbackRate).toBe(1.5);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid regex patterns in disabled sites", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mockGet = vi.mocked(chrome.storage.sync.get);
      mockGet.mockImplementationOnce((_keys, callback) => {
        const settings = {
          settings: {
            ...DEFAULT_SETTINGS,
            disabledSites: ["[invalid regex"],
          },
        };
        if (callback) {
          callback(settings);
        }
        return Promise.resolve(settings);
      });

      new VideoController();

      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "SpeedPilot: Invalid regex pattern:",
          "[invalid regex",
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle storage load failures gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mockGet = vi.mocked(chrome.storage.sync.get);
      mockGet.mockRejectedValue(new Error("Storage error"));

      new VideoController();

      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "SpeedPilot: Failed to load settings",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

const DEFAULT_SETTINGS = {
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
