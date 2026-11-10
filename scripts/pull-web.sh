#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🤖 ARcade XR - Sync Web App to Android"
echo "=========================================="

echo "📥 Pulling latest web changes from origin/main..."
git pull origin main

echo "📦 Updating dependencies..."
npm install

echo "⚡ Building web app (Vite)..."
npm run build

echo "📲 Syncing assets to native Android project..."
npx cap sync android

echo "🎉 Done! Android app is updated with latest web changes."
echo "👉 Run 'npm run android:open' to launch Android Studio."
