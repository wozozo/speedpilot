export interface KeyboardShortcuts {
  decreaseSpeed: string;
  increaseSpeed: string;
  skipBackward: string;
  skipForward: string;
}

export interface Settings {
  speedIncrement: number;
  skipSeconds: number;
  shortcuts: KeyboardShortcuts;
  hideController: boolean;
  forceLastSavedSpeed: boolean;
  controllerOpacity: number;
  disabledSites: string[];
}

export const DEFAULT_SETTINGS: Settings = {
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

export const SETTINGS_LIMITS = {
  speedIncrement: { min: 0.05, max: 1 },
  skipSeconds: { min: 1, max: 60 },
  controllerOpacity: { min: 0.1, max: 1 },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readShortcut(value: unknown, fallback: string): string {
  return typeof value === "string" && /^[a-z0-9]$/i.test(value) ? value.toLowerCase() : fallback;
}

function readDisabledSites(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.disabledSites;

  return value
    .filter((site): site is string => typeof site === "string")
    .map((site) => site.trim())
    .filter((site) => site.length > 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampSettings(settings: Settings): Settings {
  return {
    ...settings,
    speedIncrement: clamp(
      settings.speedIncrement,
      SETTINGS_LIMITS.speedIncrement.min,
      SETTINGS_LIMITS.speedIncrement.max,
    ),
    skipSeconds: clamp(
      Math.round(settings.skipSeconds),
      SETTINGS_LIMITS.skipSeconds.min,
      SETTINGS_LIMITS.skipSeconds.max,
    ),
    controllerOpacity: clamp(
      settings.controllerOpacity,
      SETTINGS_LIMITS.controllerOpacity.min,
      SETTINGS_LIMITS.controllerOpacity.max,
    ),
  };
}

export function normalizeSettings(value: unknown): Settings {
  const source = isRecord(value) ? value : {};
  const shortcuts = isRecord(source.shortcuts) ? source.shortcuts : {};

  return clampSettings({
    speedIncrement: readNumber(source.speedIncrement, DEFAULT_SETTINGS.speedIncrement),
    skipSeconds: readNumber(source.skipSeconds, DEFAULT_SETTINGS.skipSeconds),
    shortcuts: {
      decreaseSpeed: readShortcut(
        shortcuts.decreaseSpeed,
        DEFAULT_SETTINGS.shortcuts.decreaseSpeed,
      ),
      increaseSpeed: readShortcut(
        shortcuts.increaseSpeed,
        DEFAULT_SETTINGS.shortcuts.increaseSpeed,
      ),
      skipBackward: readShortcut(shortcuts.skipBackward, DEFAULT_SETTINGS.shortcuts.skipBackward),
      skipForward: readShortcut(shortcuts.skipForward, DEFAULT_SETTINGS.shortcuts.skipForward),
    },
    hideController:
      typeof source.hideController === "boolean"
        ? source.hideController
        : DEFAULT_SETTINGS.hideController,
    forceLastSavedSpeed:
      typeof source.forceLastSavedSpeed === "boolean"
        ? source.forceLastSavedSpeed
        : DEFAULT_SETTINGS.forceLastSavedSpeed,
    controllerOpacity: readNumber(source.controllerOpacity, DEFAULT_SETTINGS.controllerOpacity),
    disabledSites: readDisabledSites(source.disabledSites),
  });
}
