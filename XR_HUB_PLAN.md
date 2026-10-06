# ARcade XR - Project Plan

This document tracks the step-by-step transformation of "Ghost Pop XR" into a unified multi-game ARcade XR hub. We will implement these one at a time, ensuring quality and stability before moving to the next.

## 🟢 Phase 1: Architecture & Game 1 (Current)
- [ ] **Main Menu Refactor**: Create a hub screen to select which game to play.
- [ ] **Engine Decoupling**: Refactor `main.js` so core XR/Hand-tracking features are shared, but game logic (spawning, hitting, updating) is modular.
- [ ] **Game 1: Ghost Pop**: Port existing game logic into the new modular structure.
- [ ] **Game 2: XR Fruit Slicer**: 
  - Fruits launch from bottom and fall in a parabolic arc.
  - Slicing mechanic (passing hand cursor through fruits).
  - New 3D models/colors for fruits (Watermelon, Orange, Bomb).
  - Particle effects for sliced fruits.

## ⚪ Phase 2: Game 3 - Planet Defender
- [ ] Add sci-fi environment.
- [ ] Asteroids rain from above.
- [ ] Laser shooting mechanic from hands to asteroids.
- [ ] Base shield mechanics (health system).

## ⚪ Phase 3: Game 4 - Catch the Fireflies
- [ ] Gentle, non-violent game mode.
- [ ] Boid/flocking physics for firefly movement.
- [ ] Hover-to-catch mechanic (cursor must stay on target for 1 second).

## ⚪ Phase 4: Game 5 - Cosmic Simon Says
- [ ] 4 stationary floating crystals around the player.
- [ ] Memory/sequence logic (Simons Says).
- [ ] Musical notes and light emission for crystals.

## ⚪ Phase 5: Game 6 - Whack-A-Mole AR
- [ ] Spatial anchors spawned around the physical room.
- [ ] Moles pop in and out on timers.
- [ ] Fast reaction mechanics and 360-degree awareness.

---
*Status: Starting Phase 1...*
