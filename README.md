# SpeedPilot

Chrome extension for controlling HTML5 video playback with keyboard shortcuts.

SpeedPilot works on YouTube, Netflix, and other sites that use standard video elements. It adds simple shortcuts for changing playback speed and skipping through videos, plus an options page for customizing behavior.

## Features

- Increase or decrease playback speed
- Skip forward or backward
- Show a small speed overlay on the video
- Customize shortcut keys, speed step, and skip duration
- Keep the last used speed for new videos
- Disable the extension on selected sites with regex patterns

## Default Shortcuts

| Key | Action |
| --- | --- |
| `S` | Decrease speed |
| `D` | Increase speed |
| `Z` | Skip backward |
| `X` | Skip forward |

Shortcuts can be changed from the extension options page.

## Install Locally

```bash
pnpm install
pnpm build
```

Then load the extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this repository directory.

After rebuilding, reload the extension from `chrome://extensions/`.

## Development

```bash
pnpm build         # compile TypeScript into dist/
pnpm watch         # rebuild on TypeScript changes
pnpm format        # format src/ with oxfmt
pnpm lint          # lint with oxlint
pnpm check         # lint and check formatting
pnpm test          # run tests
```

## Settings

Open the popup and click Open Settings.

Available settings:

- Speed increment: default `0.25x`
- Skip seconds: default `10`
- Overlay visibility and opacity
- Force last saved speed
- Keyboard shortcuts
- Disabled site patterns

## Project Structure

```text
src/content.ts          Main video control logic
src/netflix-seek.ts     Netflix seek bridge
src/options/            Options page
src/popup/              Extension popup
src/types/settings.ts   Shared settings types
dist/                   Build output
```

## Tech Stack

- Chrome Extension Manifest V3
- TypeScript
- Chrome Storage Sync
- oxfmt and oxlint
- Vitest
