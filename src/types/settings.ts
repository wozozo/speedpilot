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
