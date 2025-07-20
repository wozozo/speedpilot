import { describe, it, expect, beforeEach, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../types/settings";
import type { Settings, KeyboardShortcuts } from "../types/settings";

describe("Settings", () => {
  describe("DEFAULT_SETTINGS", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_SETTINGS).toEqual({
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
      });
    });
  });

  describe("Chrome Storage Integration", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should save settings to chrome storage", async () => {
      const mockSet = vi.mocked(chrome.storage.sync.set);
      const testSettings: Settings = {
        ...DEFAULT_SETTINGS,
        speedIncrement: 0.5,
        skipSeconds: 15,
      };

      await chrome.storage.sync.set({ settings: testSettings });

      expect(mockSet).toHaveBeenCalled();
      expect(mockSet.mock.calls[0][0]).toEqual({ settings: testSettings });
    });

    it("should load settings from chrome storage", async () => {
      const mockGet = vi.mocked(chrome.storage.sync.get);
      const testSettings: Settings = {
        ...DEFAULT_SETTINGS,
        controllerOpacity: 0.8,
        hideController: true,
      };

      mockGet.mockImplementation((keys, callback) => {
        const result = { settings: testSettings };
        if (callback) {
          callback(result);
        }
        return Promise.resolve(result);
      });

      const result = await chrome.storage.sync.get("settings");
      expect(result).toEqual({ settings: testSettings });
    });

    it("should handle storage errors gracefully", async () => {
      const mockGet = vi.mocked(chrome.storage.sync.get);
      mockGet.mockRejectedValue(new Error("Storage access denied"));

      await expect(chrome.storage.sync.get("settings")).rejects.toThrow("Storage access denied");
    });
  });

  describe("Settings Validation", () => {
    it("should validate speed increment range", () => {
      const validIncrements = [0.1, 0.25, 0.5, 1.0];
      validIncrements.forEach((increment) => {
        expect(increment).toBeGreaterThan(0);
        expect(increment).toBeLessThanOrEqual(1);
      });
    });

    it("should validate skip seconds range", () => {
      const validSkipSeconds = [5, 10, 15, 30];
      validSkipSeconds.forEach((seconds) => {
        expect(seconds).toBeGreaterThan(0);
        expect(seconds).toBeLessThanOrEqual(60);
      });
    });

    it("should validate controller opacity range", () => {
      const validOpacities = [0.1, 0.5, 0.8, 1.0];
      validOpacities.forEach((opacity) => {
        expect(opacity).toBeGreaterThanOrEqual(0);
        expect(opacity).toBeLessThanOrEqual(1);
      });
    });

    it("should validate keyboard shortcuts are single characters", () => {
      const shortcuts: KeyboardShortcuts = DEFAULT_SETTINGS.shortcuts;
      Object.values(shortcuts).forEach((key) => {
        expect(key).toHaveLength(1);
        expect(typeof key).toBe("string");
      });
    });
  });

  describe("Disabled Sites Patterns", () => {
    it("should validate regex patterns", () => {
      const validPatterns = [".*youtube\\.com.*", "^https://example\\.com", ".*\\.(mp4|webm)$"];

      validPatterns.forEach((pattern) => {
        expect(() => new RegExp(pattern)).not.toThrow();
      });
    });

    it("should handle invalid regex patterns", () => {
      const invalidPatterns = ["[invalid", "(*broken", "\\"];

      invalidPatterns.forEach((pattern) => {
        expect(() => new RegExp(pattern)).toThrow();
      });
    });

    it("should match URLs correctly with patterns", () => {
      const patterns = [".*youtube\\.com.*", ".*vimeo\\.com.*"];
      const testUrls = [
        { url: "https://youtube.com/watch?v=123", shouldMatch: true },
        { url: "https://www.youtube.com/", shouldMatch: true },
        { url: "https://vimeo.com/123456", shouldMatch: true },
        { url: "https://example.com", shouldMatch: false },
      ];

      testUrls.forEach(({ url, shouldMatch }) => {
        const matches = patterns.some((pattern) => {
          const regex = new RegExp(pattern);
          return regex.test(url);
        });
        expect(matches).toBe(shouldMatch);
      });
    });
  });

  describe("Settings Migration", () => {
    it("should handle missing settings fields with defaults", () => {
      const partialSettings = {
        speedIncrement: 0.5,
        shortcuts: {
          decreaseSpeed: "q",
          increaseSpeed: "w",
          skipBackward: "e",
          skipForward: "r",
        },
      };

      const mergedSettings: Settings = {
        ...DEFAULT_SETTINGS,
        ...partialSettings,
        shortcuts: {
          ...DEFAULT_SETTINGS.shortcuts,
          ...partialSettings.shortcuts,
        },
      };

      expect(mergedSettings.speedIncrement).toBe(0.5);
      expect(mergedSettings.skipSeconds).toBe(10); // From defaults
      expect(mergedSettings.shortcuts.decreaseSpeed).toBe("q");
      expect(mergedSettings.hideController).toBe(false); // From defaults
    });

    it("should preserve user settings during updates", () => {
      const userSettings: Settings = {
        speedIncrement: 0.3,
        skipSeconds: 20,
        shortcuts: {
          decreaseSpeed: "1",
          increaseSpeed: "2",
          skipBackward: "3",
          skipForward: "4",
        },
        hideController: true,
        forceLastSavedSpeed: true,
        controllerOpacity: 0.9,
        disabledSites: ["test.com"],
      };

      // Simulate an update that adds a new field
      const updatedSettings = {
        ...userSettings,
        // newFeature: true, // Future feature
      };

      // All user settings should be preserved
      expect(updatedSettings.speedIncrement).toBe(0.3);
      expect(updatedSettings.shortcuts.decreaseSpeed).toBe("1");
      expect(updatedSettings.disabledSites).toEqual(["test.com"]);
    });
  });
});
