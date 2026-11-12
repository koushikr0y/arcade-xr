#!/usr/bin/env bash
set -e

# Auto-detect JAVA_HOME if not present
if [ -z "$JAVA_HOME" ]; then
  for candidate in \
    "/opt/android-studio/jbr" \
    "/usr/lib/jvm/java-17-openjdk-amd64" \
    "/usr/lib/jvm/java-21-openjdk-amd64" \
    "/usr/lib/jvm/default-java"
  do
    if [ -d "$candidate" ]; then
      export JAVA_HOME="$candidate"
      export PATH="$JAVA_HOME/bin:$PATH"
      break
    fi
  done
fi

TARGET="${1:-debug}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "⚡ Syncing web assets..."
cd "$PROJECT_ROOT"
npm run android:sync

echo "🔨 Building Android APK ($TARGET)..."
cd "$PROJECT_ROOT/android"

if [ "$TARGET" = "release" ]; then
  ./gradlew assembleRelease
  echo ""
  echo "✅ Release APK built successfully!"
  echo "📦 Location: android/app/build/outputs/apk/release/app-release.apk"
else
  ./gradlew assembleDebug
  echo ""
  echo "✅ Debug APK built successfully!"
  echo "📦 Location: android/app/build/outputs/apk/debug/app-debug.apk"
fi
