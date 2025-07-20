# Chrome Web Store Publishing Checklist

## ✅ Pre-submission Checklist

### Code Preparation
- [ ] Run `npm run build` to compile TypeScript
- [ ] Run `npm run lint` to check for code issues
- [ ] Run `npm run format` to ensure consistent formatting
- [ ] Test the extension thoroughly on multiple websites
- [ ] Verify all features work as expected

### Required Files
- [x] manifest.json with proper metadata
- [x] Icon files (16x16, 48x48, 128x128) in `icons/` directory
- [x] Privacy Policy (PRIVACY_POLICY.md)
- [x] Store listing information (STORE_LISTING.md)
- [x] Build script (`scripts/build-extension.sh`)

### Package Creation
1. Run `npm run package` to create the distribution ZIP file
2. The script will generate `speedpilot-v1.0.0.zip`
3. Verify the ZIP contains all necessary files

### Icon Creation
**Note**: The placeholder icon files need to be replaced with actual PNG images.
1. Use the provided `icons/icon.svg` as a base
2. Generate PNG files using the `scripts/generate-icons.sh` script
3. Or create icons manually with these specifications:
   - 16x16 pixels (toolbar icon)
   - 48x48 pixels (extensions page)
   - 128x128 pixels (Chrome Web Store)

### Screenshots Needed (1280x800 or 640x400)
1. [ ] Main screenshot showing extension in action on YouTube
2. [ ] Options page screenshot
3. [ ] Popup view screenshot
4. [ ] Multi-platform demonstration (Netflix, Vimeo, etc.)
5. [ ] Speed overlay close-up

### Promotional Images Needed
1. [ ] Small tile (440x280)
2. [ ] Large tile (920x680)
3. [ ] Marquee (1400x560)

## 📝 Chrome Web Store Submission Steps

1. **Create Developer Account**
   - Go to https://chrome.google.com/webstore/devconsole
   - Pay one-time $5 developer fee
   - Verify your account

2. **Create New Item**
   - Click "New Item"
   - Upload the ZIP file (`speedpilot-v1.0.0.zip`)
   - Fill in the store listing information from STORE_LISTING.md

3. **Add Visual Assets**
   - Upload all screenshots
   - Upload promotional images
   - Ensure icon is properly displayed

4. **Set Distribution**
   - Set visibility to "Public"
   - Select all countries/regions
   - Set appropriate categories

5. **Privacy & Permissions**
   - Link to privacy policy (host PRIVACY_POLICY.md on GitHub Pages)
   - Explain permission usage as documented

6. **Submit for Review**
   - Review all information
   - Submit for review
   - Wait 1-3 business days for approval

## 🚀 Post-Publication

1. **GitHub Repository**
   - Add Chrome Web Store link to README
   - Create a release tag matching the version
   - Consider adding installation instructions

2. **Monitor Reviews**
   - Check user feedback regularly
   - Address any reported issues promptly
   - Update based on user suggestions

3. **Future Updates**
   - Increment version in manifest.json and package.json
   - Update CHANGELOG (create if needed)
   - Test thoroughly before each update
   - Use `npm run package` for each new version

## ⚠️ Important Notes

- Ensure all keyboard shortcuts are clearly documented
- Test on various video platforms before submission
- Keep the extension focused on its core functionality
- Respond to user reviews professionally
- Maintain the open-source repository