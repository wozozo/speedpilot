import { vi } from "vitest";

Object.defineProperty(window, "chrome", {
  value: {
    storage: {
      sync: {
        get: vi.fn((keys, callback) => {
          const defaultSettings = {
            settings: {
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
            },
          };
          if (callback) {
            callback(defaultSettings);
          }
          return Promise.resolve(defaultSettings);
        }),
        set: vi.fn((items, callback) => {
          if (callback) {
            callback();
          }
          return Promise.resolve();
        }),
      },
      onChanged: {
        addListener: vi.fn(),
      },
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
      sendMessage: vi.fn(),
    },
  },
  writable: true,
});

global.HTMLMediaElement.prototype.play = vi.fn();
global.HTMLMediaElement.prototype.pause = vi.fn();
