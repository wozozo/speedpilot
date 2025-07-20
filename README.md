# SpeedPilot - Video Speed Control Chrome Extension

A Chrome extension that enhances video playback control across any website through customizable keyboard shortcuts.

## Features

### Core Video Controls
- **Speed Control**: Adjust playback speed from 0.25x to 4.0x
- **Time Navigation**: Skip forward/backward in videos
- **Speed Overlay**: Visual display with configurable opacity and fade effects
- **Force Speed**: Automatically apply last used speed to new videos

### Customization Options
- **Keyboard Shortcuts**: Fully customizable single-key shortcuts
- **Speed Increment**: Adjustable from 0.05x to 1.0x
- **Skip Duration**: Configurable from 1 to 60 seconds
- **Overlay Settings**: Hide completely or adjust opacity (0.1-1.0)
- **Per-Site Disable**: Use regex patterns to exclude specific sites

## Default Keyboard Shortcuts

- `A` - Decrease playback speed
- `S` - Increase playback speed
- `Z` - Skip backward
- `X` - Skip forward

All shortcuts can be customized in the extension settings.

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

- `npm run build` - Build the extension (compiles TypeScript to dist/)
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run format` - Format code with Biome
- `npm run lint` - Lint code with Biome
- `npm run check` - Combined lint and format check

## Settings

Access settings by clicking the extension icon and then "Open Settings":

### Basic Controls
- **Speed Increment**: Adjust speed change amount (0.05x - 1.0x, default: 0.25x)
- **Skip Seconds**: Set skip duration (1-60 seconds, default: 10s)

### Keyboard Shortcuts
- Customize any shortcut to your preferred single-key binding
- Input protection prevents accidental triggers while typing

### Display Options
- **Hide Controller**: Toggle speed overlay visibility
- **Controller Opacity**: Adjust overlay transparency (0.1-1.0, default: 0.5)

### Advanced Settings
- **Force Last Saved Speed**: Auto-apply previous speed to new videos
- **Disabled Sites**: Add regex patterns to exclude specific websites

## Supported Sites

- YouTube
- Any website using HTML5 video elements
- Automatically detects dynamically loaded videos

## Technical Details

### Architecture
- **Manifest V3**: Latest Chrome extension architecture
- **Content Script**: Core logic injected into web pages
- **No Background Script**: Lightweight implementation
- **TypeScript**: Strict mode enabled for type safety

### Features
- **MutationObserver**: Detects dynamically loaded videos
- **Chrome Storage Sync**: Settings synchronized across devices
- **Real-time Updates**: Settings apply without page reload
- **Smart Positioning**: Overlay attaches to video container

### Tech Stack
- TypeScript (direct compilation, no bundler)
- Chrome Extension Manifest V3
- Biome (formatting & linting)
- Chrome Storage Sync API