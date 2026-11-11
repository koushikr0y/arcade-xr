#!/usr/bin/env bash
set -e

if [ -z "$CAPACITOR_ANDROID_STUDIO_PATH" ] && [ "$(uname -s)" = "Linux" ]; then
  for candidate in \
    "/opt/android-studio/bin/studio" \
    "/opt/android-studio/bin/studio.sh" \
    "/usr/bin/android-studio" \
    "/usr/local/android-studio/bin/studio" \
    "/usr/local/android-studio/bin/studio.sh" \
    "$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio" \
    "$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"
  do
    if [ -x "$candidate" ]; then
      export CAPACITOR_ANDROID_STUDIO_PATH="$candidate"
      break
    fi
  done

  if [ -z "$CAPACITOR_ANDROID_STUDIO_PATH" ] && command -v android-studio >/dev/null 2>&1; then
    export CAPACITOR_ANDROID_STUDIO_PATH="$(command -v android-studio)"
  fi
fi

if [ -n "$CAPACITOR_ANDROID_STUDIO_PATH" ]; then
  echo "🚀 Launching Android Studio: $CAPACITOR_ANDROID_STUDIO_PATH"
fi

exec npx cap open android
