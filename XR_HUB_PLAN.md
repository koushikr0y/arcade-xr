# ARcade XR - Project Plan

This document tracks the step-by-step transformation of "Ghost Pop XR" into a unified multi-game ARcade XR hub. We will implement these one at a time, ensuring quality and stability before moving to the next.

## 🟢 Phase 1: Architecture & Games 1-2
- [x] **Main Menu Refactor**: Create a hub screen to select which game to play.
- [x] **Engine Decoupling**: Refactor `main.js` so core XR/Hand-tracking features are shared, but game logic (spawning, hitting, updating) is modular.
- [x] **Game 1: Ghost Pop**: Port existing game logic into the new modular structure.
- [x] **Game 2: XR Fruit Slicer**:
  - [x] Fruits launch from bottom and fall in a parabolic arc.
  - [x] Slicing mechanic with simultaneous dual-hand support.
  - [x] 6 Food varieties (Watermelon, Orange, Apple, Banana, Strawberry, Coconut) + Bomb hazard.
  - [x] Resolved early detection bug with accurate bounding hitboxes and index fingertip raycasting.
  - [x] High-precision blade sights (Cyan Left, Magenta Right) with glowing blade trails.
  - [x] Tailored multi-color splatter particle bursts for each food item.

## 🟢 Phase 2: Game 3 - Planet Defender
- [x] **Add sci-fi environment**: Holographic planetary shield dome, base energy rings on floor, and distant celestial ringed planet with atmospheric halo.
- [x] **Asteroids rain from above**: 5 varieties (Stony, Magma with fire smoke trails, Ice crystal, EMP Nova Core, Armored Dread with 2 HP) plummeting toward defense perimeter.
- [x] **Laser shooting mechanic**: Dual-hand rapid pulse cannons (Cyan left, Magenta right) firing 3D glowing laser bolts with synthesised blaster audio and instant target responsiveness.
- [x] **Base shield mechanics**: Planetary energy shield with 3-cell health system (`🛡️🛡️🛡️`), impact ripples, red breach flash, and tactical EMP shockwaves that detonate nearby asteroids in mid-air.

## 🟢 Phase 3: Game 4 - Catch the Fireflies
- [x] **Gentle, non-violent game mode**: Tranquil 60-second stardust gathering challenge with bonus time on captures.
- [x] **Boid/flocking physics**: Realistic swarm center attraction, collision avoidance, and fluttering wings.
- [x] **Hover-to-catch mechanic**: Circular radial SVG progress ring charges when hovering fingertip/cursor over firefly for 0.75s.
- [x] **4 Firefly Varieties**: Golden Firefly, Azure Sprite, Amethyst Starfly, and Prismatic Queen with swarm-burst effect!

## 🟢 Phase 4: Game 5 - Cosmic Simon Says
- [x] **4 floating memory crystals**: Ruby, Topaz, Emerald, and Sapphire with glowing cores and floating rune plinths.
- [x] **Memory sequence logic**: Progressive rounds with automated playback and sequence verification.
- [x] **Harmonic audio chimes**: Synthesized pentatonic tones (C4, E4, G4, C5), triumphant chords on round wins, and error buzzers.

## 🟢 Phase 5: Game 6 - Whack-A-Mole AR
- [x] **Spatial cyber burrows**: 5 holographic warp burrows distributed around the physical room in 3D space.
- [x] **Astro Moles popping on timers**: Smooth sine/cubic ease-in pop-ups with peeking and diving animations.
- [x] **4 Mole Varieties**: Standard Astro Mole, Golden VIP Mole, Cyber Helmet Mole (2 HP), and Spike-Bot Hazard (penalty!).
- [x] **Fast reaction mechanics**: Instant fingertip whacking with star bursts and cartoon bonk audio effects.

---
*Status: All 6 ARcade XR Games & Professional Mixed Reality Hub Complete!*
