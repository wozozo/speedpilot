#!/bin/bash

# Generate icons from icon-512.png using macOS sips command

echo "Generating icons from icon-512.png..."

# Check if source icon exists
if [ ! -f "icons/icon-512.png" ]; then
    echo "Error: icons/icon-512.png not found!"
    exit 1
fi

# Use sips (built-in on macOS)
echo "Using sips (macOS native tool)..."
sips -z 16 16 icons/icon-512.png --out icons/icon-16.png
sips -z 24 24 icons/icon-512.png --out icons/icon-24.png
sips -z 32 32 icons/icon-512.png --out icons/icon-32.png
sips -z 48 48 icons/icon-512.png --out icons/icon-48.png
sips -z 128 128 icons/icon-512.png --out icons/icon-128.png

echo ""
echo "✅ Icons generated successfully!"
echo "  ✓ icons/icon-16.png"
echo "  ✓ icons/icon-24.png"
echo "  ✓ icons/icon-32.png"
echo "  ✓ icons/icon-48.png"
echo "  ✓ icons/icon-128.png"
