# SpeedPilot - YouTube Video Control Chrome Extension

A Chrome extension that adds keyboard shortcuts to control video playback speed and navigation on YouTube and other video sites.

## Features

- **Speed Control**: Adjust playback speed with keyboard shortcuts
- **Skip Navigation**: Jump forward/backward in the video
- **Speed Overlay**: Visual display of current playback speed
- **Customizable Settings**: Configure speed increment and skip duration

## Keyboard Shortcuts

- `A` - Decrease playback speed
- `S` - Increase playback speed
- `Z` - Skip backward
- `X` - Skip forward

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `speedpilot` directory

## Development

- `npm run build` - Build the extension
- `npm run watch` - Watch for changes and rebuild
- `npm run format` - Format code with Biome
- `npm run lint` - Lint code with Biome

## Settings

Click the extension icon to access settings:
- **Speed Increment**: How much to change speed with each key press (default: 0.25x)
- **Skip Seconds**: How many seconds to skip forward/backward (default: 10s)

## Supported Sites

- YouTube
- Any website using HTML5 video elements

## Tech Stack

- TypeScript
- Chrome Extension Manifest V3
- Biome (formatting & linting)