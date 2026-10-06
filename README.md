# ARcade XR

**Live Demo:** [https://arcade-xr.vercel.app](https://arcade-xr.vercel.app) *(Update this link after deploying)*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/koushikr0y/arcade-xr)

An AR arcade game. Android Chrome gets full WebXR (back camera, ghosts anchored in your room). iPhone, other phones and PCs use a camera + motion-sensor mode.

## Why the front camera and hand gestures do not work in WebXR
WebXR `immersive-ar` on phones only gives the browser the **back camera**, and it never exposes the camera image to your code. Hand tracking in WebXR only exists on headsets (Quest, Vision Pro). So front camera and hand gestures cannot be done with WebXR on a phone.

This project therefore has three modes:
- **Start AR** (Android Chrome): real WebXR, back camera, tap to shoot.
- **Play with hands**: front camera + MediaPipe hand tracking. Your index fingertips are cursors; touch a ghost in the air to pop it. Works on iPhone, Android and PC. Needs internet on first load (model and wasm come from jsDelivr and Google storage).
- **Play with camera**: back camera + motion sensors, tap to shoot.

## Run it
Requires Node 18+ and VS Code.

```bash
npm install
npm run dev
```
Open http://localhost:5173. (Or in VS Code: Terminal > Run Task > "Dev server".)

## Share a link with testers (needs HTTPS for camera and WebXR)
Pick one:

1. **VS Code Port Forwarding (easiest, no install).** Run `npm run dev`, open the **Ports** tab, click **Forward a Port**, enter `5173`, right-click it and set **Port Visibility: Public**. Copy the `https://...devtunnels.ms` link. Sign in with GitHub when asked.
2. **Cloudflare quick tunnel (no account).** Install `cloudflared`, then run `cloudflared tunnel --url http://localhost:5173` and copy the `https://*.trycloudflare.com` link.
3. **localtunnel.** Run `npm run share` (or the "Start and share" task). Testers may see a reminder page asking for a password: it is the public IP of the computer running the tunnel.
4. **Same Wi-Fi only.** Run `npm run dev:https`, then open `https://<your-computer-ip>:5173` on the phone and accept the self-signed certificate warning.

Keep `npm run dev` running while people test. The link stops working when you close it.

## Permanent link
```bash
npm run build
```
Drag the `dist` folder onto https://app.netlify.com/drop (or push to Vercel / GitHub Pages) for a stable HTTPS URL.

## Testing notes
- Full AR ("Start AR" button): Android + Chrome only, and the page must be opened in its own tab over HTTPS.
- iPhone Safari has no WebXR, so it uses the camera + gyroscope mode and asks for motion permission.
- If the camera does not start, check the browser's site permissions and that the URL is HTTPS.
- Phone screen recording captures the AR view for Reels.

## Structure
```
index.html        page + UI markup
src/main.js       game logic (three.js 0.128 via npm)
src/style.css     styles
vite.config.js    dev server (LAN + tunnel hosts allowed, optional HTTPS)
.vscode/          tasks, Chrome debug launch, extension tips
```
