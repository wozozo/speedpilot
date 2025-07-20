#!/bin/bash

# Build and package the Chrome extension for store submission

echo "Building SpeedPilot Chrome Extension..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -f speedpilot-*.zip

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "Error: Build failed. dist/ directory not found."
    exit 1
fi

# Create temporary directory for packaging
echo "Preparing files for packaging..."
TEMP_DIR=$(mktemp -d)
EXTENSION_NAME="speedpilot"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)

# Copy necessary files
cp -r dist/ "$TEMP_DIR/"
cp -r icons/ "$TEMP_DIR/"
mkdir -p "$TEMP_DIR/src"
cp -r src/popup/ "$TEMP_DIR/src/popup/"
cp -r src/options/ "$TEMP_DIR/src/options/"
cp manifest.json "$TEMP_DIR/"

# Create the zip file
ZIP_NAME="${EXTENSION_NAME}-v${VERSION}.zip"
PROJECT_ROOT=$(pwd)
echo "Creating ${ZIP_NAME}..."

cd "$TEMP_DIR"
zip -r "${PROJECT_ROOT}/${ZIP_NAME}" . -x "*.DS_Store" "*/\.DS_Store"
cd "$PROJECT_ROOT"

# Clean up
rm -rf "$TEMP_DIR"

# Final check
if [ -f "${ZIP_NAME}" ]; then
    echo "✅ Extension packaged successfully: ${ZIP_NAME}"
    echo ""
    echo "📁 Package contents:"
    unzip -l "${ZIP_NAME}" | grep -E "manifest.json|\.js|\.html|\.png" | head -20
    echo ""
    echo "📏 Package size: $(du -h ${ZIP_NAME} | cut -f1)"
    echo ""
    echo "🚀 Ready for Chrome Web Store submission!"
else
    echo "❌ Error: Failed to create ${ZIP_NAME}"
    exit 1
fi