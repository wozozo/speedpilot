# Chrome Web Store Publishing Checklist

## Current Release

- Version: `1.0.0`
- Visibility: Public
- Category: Productivity
- Package command: `npm run package`
- Package output: `speedpilot-v1.0.0.zip`

## Pre-Submission Validation

- [ ] Run `npm run check`
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Run `npm run package`
- [ ] Confirm `manifest.json` is at the ZIP root
- [ ] Confirm ZIP includes runtime `.js`, popup/options HTML/CSS, and icons
- [ ] Confirm ZIP excludes `.ts`, `.map`, `.d.ts`, `node_modules`, `coverage`, tests, docs, and source-only files

Useful commands:

```bash
npm run check
npm test
npm run build
npm run package
unzip -l speedpilot-v1.0.0.zip
```

## Required Release Materials

- [x] Manifest V3 file
- [x] Runtime icons: `16`, `24`, `32`, `48`, `128`, `512`
- [x] Privacy policy: `PRIVACY_POLICY.md`
- [x] Store listing draft: `STORE_LISTING.md`
- [x] Package script: `scripts/build-extension.sh`
- [x] Screenshot assets: `store-assets/screenshot-*.png`
- [x] Small promotional tile: `store-assets/small-promo-440x280.png`

## Chrome Web Store Fields

Use the values in `STORE_LISTING.md`.

Privacy practices:

- Data collection: No user data collected by the developer
- Remote code: No
- Ads: No
- In-app purchases: No
- Third-party services: No
- Privacy policy URL: published URL for `PRIVACY_POLICY.md`

Permission justification:

- `storage`: Saves user settings
- `<all_urls>` content script match: Required to control HTML5 videos on arbitrary video websites
- Netflix MAIN-world script: Required only on Netflix to seek through Netflix's own player API

## Manual Acceptance Test

- [ ] Load unpacked extension after `npm run build`
- [ ] HTML5 video: `D` increases speed
- [ ] HTML5 video: `S` decreases speed
- [ ] HTML5 video: `X` skips forward
- [ ] HTML5 video: `Z` skips backward
- [ ] Overlay appears and updates when speed changes
- [ ] Popup opens and displays current shortcuts
- [ ] Options page saves speed increment, skip duration, opacity, and shortcut changes
- [ ] Disabled-site pattern disables shortcuts after page reload
- [ ] Netflix skip shortcuts use the Netflix seek bridge
- [ ] Normal use does not emit routine SpeedPilot debug logs

## Submission Steps

1. Open https://chrome.google.com/webstore/devconsole.
2. Confirm the developer account and one-time registration are complete.
3. Click New Item and upload `speedpilot-v1.0.0.zip`.
4. Fill Store Listing, Privacy Practices, and Distribution using this checklist and `STORE_LISTING.md`.
5. Upload screenshots and the small promotional tile from `store-assets/`.
6. Set visibility to Public.
7. Submit for review.

## After Publication

- [ ] Add the Chrome Web Store URL to `README.md`
- [ ] Create a matching Git tag or GitHub Release
- [ ] Monitor review feedback and GitHub issues
- [ ] For updates, increment `manifest.json` and `package.json` versions before packaging
