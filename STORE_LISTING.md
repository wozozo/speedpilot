# Chrome Web Store Listing

## Basic Information

Name: SpeedPilot - Video Speed Controller

Summary: Control HTML5 video speed and seeking with customizable keyboard shortcuts.

Category: Productivity

Language: English

Visibility: Public

Support URL: https://github.com/wozozo/speedpilot/issues

Homepage URL: https://github.com/wozozo/speedpilot

Privacy Policy URL: Host `PRIVACY_POLICY.md` from the repository, for example with GitHub Pages.

## Single Purpose

SpeedPilot lets users control HTML5 video playback speed and seeking with keyboard shortcuts.

## Detailed Description

SpeedPilot adds simple keyboard controls for videos on YouTube, Netflix, and other sites that use HTML5 video.

Use it to speed up lectures, slow down detailed tutorials, or jump forward and backward without reaching for the video player controls.

Main features:

- Increase or decrease video playback speed
- Skip forward or backward by a configurable number of seconds
- Customize shortcut keys
- Show a small optional speed overlay
- Reuse the last selected speed when enabled
- Disable the extension on selected sites with user-defined patterns

Default shortcuts:

- S: Decrease speed
- D: Increase speed
- Z: Skip backward
- X: Skip forward

Privacy:

- No analytics or tracking
- No SpeedPilot-owned servers
- Settings are stored with Chrome Storage Sync
- Last selected speed is stored locally only when that option is enabled

Source code and support are available on GitHub:
https://github.com/wozozo/speedpilot

## Privacy Practices

Data collection: No user data is collected by the developer.

Data storage: User settings are stored with Chrome Storage Sync. If the user has Chrome sync enabled, Chrome may sync those settings through the user's Google account. SpeedPilot does not receive that data.

Remote code: None.

Third-party services: None.

Ads or affiliate behavior: None.

## Permission Justifications

`storage`: Saves user settings such as shortcuts, speed increment, skip duration, overlay preference, and disabled-site patterns.

`content_scripts.matches` on `<all_urls>`: Runs the video controller on pages that may contain HTML5 video. This is required for the extension's single purpose: controlling videos on arbitrary video websites. The script only interacts with video elements, keyboard events, and the optional SpeedPilot overlay.

Netflix MAIN-world content script: Runs only on `*.netflix.com` to call Netflix's own player seek API. This avoids corrupting Netflix playback state when users press the skip shortcuts.

## Store Assets

Required:

- Store icon: `icons/icon-128.png`
- Screenshots: `store-assets/screenshot-*.png`
- Small promotional tile: `store-assets/small-promo-440x280.png`

Optional:

- Marquee promotional tile: not included for the first release

## Reviewer Test Instructions

1. Load the extension package in Chrome.
2. Open a page with an HTML5 video.
3. Press `D` to increase speed and confirm the overlay updates.
4. Press `S` to decrease speed.
5. Press `X` and `Z` to seek forward and backward.
6. Open the extension popup and confirm shortcut labels are shown.
7. Open Options, change a shortcut or speed increment, and confirm it is saved.
8. Add a disabled-site pattern for the current page, reload the page, and confirm shortcuts no longer affect the video.
