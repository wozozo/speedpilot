# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## SpeedPilot Chrome Extension

A Chrome extension that enhances video playback control on YouTube and other video sites through keyboard shortcuts.

## Commands

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript (outputs to dist/)
- `npm run watch` - Watch mode for development (auto-compile on changes)
- `npm run format` - Format code using Biome
- `npm run lint` - Lint code using Biome
- `npm run check` - Combined lint and format check

### Loading the Extension
1. Run `npm run build` to compile
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select the speedpilot directory

## Architecture

The extension follows Chrome Extension Manifest V3 architecture:

- **Content Script** (`src/content.ts`): Core video control logic injected into web pages
  - `VideoController` class manages video detection and control
  - MutationObserver watches for new video elements
  - Handles keyboard shortcuts and speed overlay display

- **Popup** (`src/popup/`): Quick access interface showing current shortcuts
  - Displays current keyboard mappings
  - Links to options page

- **Options Page** (`src/options/`): Full settings configuration interface
  - Keyboard shortcut customization
  - Speed increment settings
  - Per-site disable functionality using regex patterns
  - Advanced settings (opacity, force speed, etc.)

- **Type Definitions** (`src/types/settings.ts`): Shared TypeScript interfaces for settings

## Key Implementation Details

1. **No bundler**: Uses TypeScript compiler directly (no webpack)
2. **No background script**: All logic runs in content script
3. **Storage**: Chrome Storage API for settings persistence with real-time sync
4. **Video Detection**: MutationObserver watches for dynamically loaded videos
5. **Speed Overlay**: Absolute positioned div in top-left corner with configurable opacity

## Development Notes

- TypeScript strict mode is enabled - ensure all types are properly defined
- Biome enforces double quotes and semicolons
- Output files go to `dist/` directory (gitignored)
- Extension reloads are required after building changes
- Console logs in content script appear in the web page's console, not the extension's