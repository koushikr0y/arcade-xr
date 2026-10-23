# 🌌 ARcade XR — Spatial Mixed Reality Arcade Hub

[![Live Demo](https://img.shields.io/badge/Demo-Play%20Online-00f0ff?style=for-the-badge&logo=vercel)](https://arcade-xr.vercel.app)
[![Itch.io Ready](https://img.shields.io/badge/Itch.io-Compatible-ff2079?style=for-the-badge&logo=itchdotio)](https://itch.io)
[![Three.js](https://img.shields.io/badge/Three.js-0.128-7c5cff?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-AI%20Vision-00ff88?style=for-the-badge&logo=google)](https://developers.google.com/mediapipe)

> **Transform your physical room into a futuristic holographic arcade.**  
> Play 6 spatial games in your browser using bare-hand AI computer vision tracking, immersive WebXR passthrough, or responsive touch/mouse controls — **zero installs, zero downloads.**

---

## 🎮 The 6 Spatial Games

### 1. 👻 Ghost Pop XR *(360° Spatial Shooter)*
Mischievous glowing ghosts float in from all angles around your physical space. Point your fingertips to pop them before they vanish.
* **Mechanics**: 360° spatial tracking, combo multipliers, hazard skull-bombs to avoid, and golden bonus stars!
* **Controls**: Point index fingertip at ghosts to pop.

### 2. 🍉 XR Fruit Slicer *(Dual Laser Blade Action)*
Flying watermelons, pineapples, bananas, and coconuts launch into the air. Slice them with dual glowing energy katanas!
* **Mechanics**: Simultaneous dual-hand blade ribbons, fruit halves splitting with velocity physics, and juice splatter particle bursts.
* **Controls**: Swipe with your left or right hand to slice.

### 3. 🛡️ Planet Defender *(Orbital Base Defense)*
Raining meteors threaten the planetary shield base orbiting in front of you. Blast them with dual laser cannons!
* **Mechanics**: Orbital shields, meteor physics, and tactical EMP Nova screen clearing shocks.
* **Controls**: Aim your laser reticles at falling meteors to blast them.

### 4. ✨ Catch the Fireflies *(Zen Hover Catcher)*
Immerse yourself in a soothing swarm of bioluminescent fireflies simulated with boid flocking algorithms.
* **Mechanics**: Gentle radial hover-capture ring, relaxing ambient movement, and celestial chime soundscapes.
* **Controls**: Hover your hand over a firefly until the circular capture ring fills.

### 5. 💎 Cosmic Simon Says *(Harmonic Crystal Memory)*
Floating alien crystals illuminate and play melodic synthesizer tones in sequential patterns.
* **Mechanics**: Multi-step audio-visual memory challenge, procedurally generated chime arpeggios, and harmonic resonance effects.
* **Controls**: Memorize the sequence and tap the corresponding crystals in exact order.

### 6. 🔨 Whack-A-Mole AR *(Spatial Reflex Arena)*
Spatial cyber burrows emerge in a hexagonal formation in your physical environment. Bonk astro-moles before they hide!
* **Mechanics**: Fast-twitch reflex timing, burrow state machines, wooden bonk acoustics, and penalty spike-bots.
* **Controls**: Rapidly strike the active mole with your fingertip cursor.

---

## 🚀 Key Features

* **🖐️ AI Hand Tracking Engine**: Uses Google MediaPipe Vision to detect 21 3D joint landmarks per hand via your standard webcam or front camera. No special VR controllers needed!
* **🕶️ WebXR Passthrough Support**: Seamlessly transitions to full immersive AR passthrough on Meta Quest 2/3/Pro and compatible Android WebXR devices.
* **📱 Universal Touch & Mouse Mode**: Smooth fallback mode allowing the game to run on any mobile phone, tablet, desktop browser, or platforms like YouTube Playables.
* **🎵 Real-Time Web Audio Synthesizers**: 100% procedurally generated synthesizer audio (laser zaps, harmonic crystal chimes, mallet bonks, combo buzzers, and victory chords) without external audio file latency.
* **⚡ Cyberpunk Holographic UI**: Sci-fi visor cockpit HUD with real-time score tracking, combo multiplier flames, elapsed match timer, and AI tracking radar telemetry.

---

## 🕹️ Controls & Input Modes

| Input Mode | Compatible Devices | How It Works |
| :--- | :--- | :--- |
| **🖐️ Play with Hand Tracking** *(Recommended)* | PC, Mac, Laptop, iPhone, Android | Uses front camera/webcam AI to track both hands in real-time. |
| **🕶️ Start Full Immersive AR** | Meta Quest 2/3/Pro, Android Chrome | Launches native WebXR passthrough into your room. |
| **📱 Camera / Touch Mode** | Any Phone, Tablet, PC | Uses device orientation with on-screen tap or mouse click. |

---

## 🛠️ Development & Local Run

Requires **Node.js 18+**:

```bash
# Clone the repository
git clone https://github.com/koushikr0y/arcade-xr.git
cd arcade-xr

# Install dependencies
npm install

# Run local development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Packaging for Itch.io & Web Portals
```bash
npm run package:itch
```
This produces `arcade-xr-itch.zip` ready for upload to Itch.io or web game portals, with all relative asset paths configured.

---

## 📂 Project Structure

```
├── index.html                 # Game hub, cockpit HUD, and modals
├── src/
│   ├── main.js                # Game state machines, 6 game loops, Three.js 3D engine & audio synths
│   └── style.css              # Cyberpunk cockpit HUD, marquee arch & theme styles
├── scripts/
│   └── package-itch.py        # Automated zip packager for web platforms
├── itch-assets/               # Game icon (1:1), action screenshot (16:9), hub screenshot (16:9)
└── vite.config.js             # Vite configuration with relative base paths
```

---

## 📄 License
MIT License. Open-source and free to play!
