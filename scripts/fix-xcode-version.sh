#!/bin/bash
# Fix Xcode project version for compatibility with Xcode 15.x
# XcodeGen generates objectVersion=77 (Xcode 16.2+), but we need 60 (Xcode 15.x)

PROJECT_FILE="src-tauri/gen/apple/app.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
    sed -i '' 's/objectVersion = 77;/objectVersion = 60;/' "$PROJECT_FILE"
    echo "✓ Fixed Xcode project version (77 -> 60) for Xcode 15.x compatibility"
else
    echo "✗ Project file not found: $PROJECT_FILE"
    exit 1
fi
