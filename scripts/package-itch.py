#!/usr/bin/env python3
"""
Packages dist/ directory into an Itch.io compliant zip archive (arcade-xr-itch.zip).
Ensures index.html is at the zip root, with relative paths for sandboxed iframes.
"""

import os
import zipfile

OUTPUT_ZIP = "arcade-xr-itch.zip"
DIST_DIR = "dist"

def package_itch():
    if not os.path.exists(DIST_DIR):
        print(f"Error: '{DIST_DIR}' directory not found. Please run 'npm run build' first.")
        exit(1)
        
    print(f"Packaging '{DIST_DIR}/' into '{OUTPUT_ZIP}'...")
    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(DIST_DIR):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, DIST_DIR)
                zf.write(abs_path, rel_path)
                print(f"  + {rel_path}")

    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"\n[OK] Successfully created {OUTPUT_ZIP} ({size_mb:.2f} MB)")
    print("Ready for upload to Itch.io (HTML5 playable in browser)!")

if __name__ == "__main__":
    package_itch()
