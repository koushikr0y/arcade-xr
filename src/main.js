import * as THREE from 'three';

/* ── Aliases & DOM ─────────────────────────────────────────── */
const T = THREE, $ = s => document.querySelector(s), v = $('#v');

/* ── Renderer ──────────────────────────────────────────────── */
const R = new T.WebGLRenderer({ antialias: true, alpha: true });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.setSize(innerWidth, innerHeight);
R.xr.enabled = true;
R.xr.setReferenceSpaceType('local');
document.body.insertBefore(R.domElement, $('#ui'));

/* ── Scene / Camera / Raycaster ────────────────────────────── */
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 60);
const ray = new T.Raycaster();

/* ── Lighting (Phase 3) ───────────────────────────────────── */
scene.add(new T.AmbientLight(0x554488, 0.5));
const camLight = new T.PointLight(0xffeedd, 1.0, 20);
camera.add(camLight);
scene.add(camera);
const rimLight = new T.PointLight(0x7744ff, 0.35, 25);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

addEventListener('resize', () => {
  R.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
['.box', '#flip'].forEach(s =>
  document.querySelectorAll(s).forEach(e =>
    e.addEventListener('beforexrselect', ev => ev.preventDefault())
  )
);

/* ── Materials ─────────────────────────────────────────────── */
// Ghost
const mGhostBody = new T.MeshPhongMaterial({
  color: 0xc8e8ff, emissive: 0x3377aa, emissiveIntensity: 0.35,
  transparent: true, opacity: 0.72, side: T.DoubleSide, depthWrite: false, shininess: 30
});
const mGhostEye = new T.MeshPhongMaterial({ color: 0x111111, emissive: 0x00ffaa, emissiveIntensity: 1.0 });
const mGhostMouth = new T.MeshPhongMaterial({ color: 0x111111, emissive: 0x0066aa, emissiveIntensity: 0.5 });
const mGhostAura = new T.MeshPhongMaterial({
  color: 0x88ddff, emissive: 0x44aaff, emissiveIntensity: 0.6,
  transparent: true, opacity: 0.12, side: T.BackSide, depthWrite: false
});

// Star
const mStarBody = new T.MeshPhongMaterial({ color: 0xffdd44, emissive: 0xffaa00, emissiveIntensity: 0.7, shininess: 120 });
const mStarGlow = new T.MeshPhongMaterial({
  color: 0xffee66, emissive: 0xffcc00, emissiveIntensity: 0.5,
  transparent: true, opacity: 0.15, side: T.BackSide, depthWrite: false
});

// Bomb
const mBombBody = new T.MeshPhongMaterial({ color: 0x1a1a2a, emissive: 0x440000, emissiveIntensity: 0.3, shininess: 80 });
const mBombAura = new T.MeshPhongMaterial({
  color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.7,
  transparent: true, opacity: 0.18, side: T.BackSide, depthWrite: false
});
const mBombFuse = new T.MeshPhongMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.2 });

// Fruits
const mWatermelon = new T.MeshPhongMaterial({ color: 0x22aa44, emissive: 0x115522, shininess: 40 });
const mOrange = new T.MeshPhongMaterial({ color: 0xff8800, emissive: 0xaa4400, shininess: 50 });

// Invisible hit sphere
const mHit = new T.MeshBasicMaterial({ visible: false });

/* ── Geometries ────────────────────────────────────────────── */
const gS = new T.SphereGeometry(1, 16, 12);

// Ghost body
function makeGhostGeo() {
  const pts = [], N = 30;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let r;
    if (t < 0.35) r = Math.sin(t / 0.35 * Math.PI * 0.5) * 0.17;
    else if (t < 0.7) r = 0.17 - (t - 0.35) / 0.35 * 0.015;
    else {
      const w = (t - 0.7) / 0.3;
      r = 0.155 + Math.sin(w * Math.PI * 2.5) * 0.02;
      r *= Math.max(0.005, 1 - w * w * 0.85);
    }
    pts.push(new T.Vector2(Math.max(0.002, r), (0.5 - t) * 0.42));
  }
  return new T.LatheGeometry(pts, 14);
}
const gGhost = makeGhostGeo();

// Star
function makeStarGeo() {
  const shape = new T.Shape();
  const outer = 0.11, inner = 0.045, spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const geo = new T.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  geo.center();
  return geo;
}
const gStar = makeStarGeo();

/* ── Entity Creation ───────────────────────────────────────── */
function mk(type) {
  const g = new T.Group();
  const add = (geo, m, sx, sy, sz, x = 0, y = 0, z = 0) => {
    const o = new T.Mesh(geo, m);
    o.scale.set(sx, sy, sz); o.position.set(x, y, z); g.add(o);
    return o;
  };

  if (gameMode === 'ghost') {
    if (type === 0) {
      add(gGhost, mGhostBody, 1, 1, 1);
      add(gS, mGhostEye, 0.022, 0.032, 0.022, -0.055, 0.07, 0.14);
      add(gS, mGhostEye, 0.022, 0.032, 0.022, 0.055, 0.07, 0.14);
      add(gS, mGhostMouth, 0.025, 0.018, 0.018, 0, 0.0, 0.15);
      const aura = add(gS, mGhostAura, 0.3, 0.3, 0.3);
      aura.userData = { isAura: true, baseScale: 0.3 };
    } else if (type === 1) {
      add(gStar, mStarBody, 1, 1, 1);
      const glow = add(gS, mStarGlow, 0.22, 0.22, 0.22);
      glow.userData = { isAura: true, baseScale: 0.22 };
    } else {
      add(gS, mBombBody, 0.15, 0.15, 0.15);
      const fuse = add(gS, mBombFuse, 0.018, 0.018, 0.018, 0, 0.16, 0);
      fuse.userData = { isFuse: true, baseScale: 0.018 };
      const aura = add(gS, mBombAura, 0.24, 0.24, 0.24);
      aura.userData = { isAura: true, baseScale: 0.24 };
    }
  } else if (gameMode === 'fruit') {
    if (type === 0) {
      // Watermelon
      add(gS, mWatermelon, 0.18, 0.22, 0.18);
    } else if (type === 1) {
      // Orange
      add(gS, mOrange, 0.15, 0.15, 0.15);
    } else {
      // Bomb (reuse)
      add(gS, mBombBody, 0.15, 0.15, 0.15);
      const fuse = add(gS, mBombFuse, 0.018, 0.018, 0.018, 0, 0.16, 0);
      fuse.userData = { isFuse: true, baseScale: 0.018 };
      const aura = add(gS, mBombAura, 0.24, 0.24, 0.24);
      aura.userData = { isAura: true, baseScale: 0.24 };
    }
  }

  add(gS, mHit, 0.45, 0.45, 0.45);
  return g;
}

/* ── Ambient Floating Particles ────────────────────────────── */
function createAmbientParticles() {
  const count = 100;
  const geo = new T.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const mat = new T.PointsMaterial({
    color: 0x8866dd, size: 0.045, transparent: true, opacity: 0.35,
    blending: T.AdditiveBlending, depthWrite: false
  });
  return new T.Points(geo, mat);
}
const ambientParts = createAmbientParticles();
scene.add(ambientParts);

/* ── Game State ─────────────────────────────────────────────── */
let state = 'hub', gameMode = 'ghost';
let xr = false, gyro = false, ori = { a: 0, b: 0, g: 0 };
let face = 'environment', stream = null, sess = null;
let ents = [], parts = [], score = 0, lives = 3, combo = 0, popped = 0;
let level = 1, spawnT = 1, best = 0, lastLives = 3;
const head = new T.Vector3(), tmp = new T.Vector3();

/* ── Audio & Haptics ───────────────────────────────────────── */
function beep(f, d = 0.12) {
  try {
    const a = beep.a || (beep.a = new (window.AudioContext || window.webkitAudioContext)());
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}
const buzz = n => { try { navigator.vibrate && navigator.vibrate(n) } catch (e) {} };

/* ── UI Helpers ────────────────────────────────────────────── */
function say(s, c) {
  const t = $('#toast'); t.textContent = s; t.style.color = c || '#fff';
  t.classList.remove('s'); void t.offsetWidth; t.classList.add('s');
}
function flash() { $('#fl').style.opacity = 0.45; setTimeout(() => $('#fl').style.opacity = 0, 120) }
const mult = () => 1 + Math.min(4, combo / 3 | 0);
function hud() {
  const sc = $('#sc');
  sc.textContent = score; sc.classList.remove('pop'); void sc.offsetWidth; sc.classList.add('pop');
  const hp = $('#hp');
  hp.textContent = '❤'.repeat(Math.max(0, lives));
  if (lives < lastLives) { hp.classList.remove('pulse'); void hp.offsetWidth; hp.classList.add('pulse') }
  lastLives = lives;
  $('#lv').innerHTML = 'Lv ' + level + (mult() > 1 ? ' <small>x' + mult() + '</small>' : '');
}

/* ── Hub Menu Logic ────────────────────────────────────────── */
$('#btn-ghost').onclick = () => {
  gameMode = 'ghost';
  $('#game-title').textContent = '👻 Ghost Pop XR';
  $('#game-desc').textContent = 'Ghosts are floating toward you from all around the room. Tap them to bust them before they reach you. Avoid 💣, grab ⭐ for bonus points!';
  try { best = +localStorage.getItem('ghostpop-xr-best') || 0 } catch (e) {}
  $('#hub').hidden = true; $('#menu').hidden = false;
};
$('#btn-fruit').onclick = () => {
  gameMode = 'fruit';
  $('#game-title').textContent = '🍉 XR Fruit Slicer';
  $('#game-desc').textContent = 'Fruits launch from the ground into the air! Slice them with your fingers before they fall. Avoid 💣!';
  try { best = +localStorage.getItem('fruitslicer-xr-best') || 0 } catch (e) {}
  $('#hub').hidden = true; $('#menu').hidden = false;
};
$('#back-hub').onclick = () => {
  $('#menu').hidden = true; $('#hub').hidden = false;
};

/* ── Spawn ─────────────────────────────────────────────────── */
const D = Math.PI / 180;
function spawn() {
  const u = Math.random();
  const type = level >= 2 && u < 0.15 ? 2 : u > 0.9 ? 1 : 0;
  const m = mk(type);
  const e = { m, type, age: 0, ph: Math.random() * 6.28 };

  if (gameMode === 'ghost') {
    const r = 2.3 + Math.random() * 1.3;
    const half = Math.atan(Math.tan(35 * D) * camera.aspect) * 0.8;
    const a = (xr || gyro) ? Math.random() * 6.283 : (Math.random() * 2 - 1) * half;
    m.position.set(head.x + Math.sin(a) * r, head.y + (Math.random() - 0.4) * 1.2, head.z - Math.cos(a) * r);
    e.sp = (type === 1 ? 0.7 : 0.45) + level * 0.06;
  } else if (gameMode === 'fruit') {
    // Spawn below player and shoot up
    const r = 1.0 + Math.random() * 1.5;
    const half = Math.atan(Math.tan(35 * D) * camera.aspect) * 0.8;
    const a = (xr || gyro) ? Math.random() * Math.PI : (Math.random() * 2 - 1) * half;
    
    // Position below eye level
    m.position.set(head.x + Math.sin(a) * r, head.y - 1.5, head.z - Math.cos(a) * r);
    
    // Upward velocity vector (parabola)
    const vx = (Math.random() - 0.5) * 1.5;
    const vy = 3.0 + Math.random() * 1.5 + (level * 0.1);
    const vz = (Math.random() - 0.5) * 1.5;
    e.v = new T.Vector3(vx, vy, vz);
    
    // Random spin
    e.spin = new T.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(3);
  }

  m.userData.e = e;
  scene.add(m); ents.push(e);
}

/* ── Particle Burst ────────────────────────────────────────── */
const pmCache = {};
function burstMat(c) {
  if (pmCache[c]) return pmCache[c];
  const m = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
  pmCache[c] = m; return m;
}
function burst(p, c) {
  const m = burstMat(c);
  for (let i = 0; i < 22; i++) {
    const o = new T.Mesh(gS, m);
    const s = 0.015 + Math.random() * 0.02;
    o.scale.setScalar(s); o.position.copy(p); scene.add(o);
    const life = 0.55 + Math.random() * 0.35;
    parts.push({ o, v: new T.Vector3((Math.random() - 0.5) * 2.8, (Math.random() - 0.2) * 2.8, (Math.random() - 0.5) * 2.8), t: life, maxT: life, initS: s });
  }
}

function drop(e) { scene.remove(e.m); ents = ents.filter(o => o !== e) }

function hit(e) {
  let colors;
  if (gameMode === 'ghost') colors = { 0: 0x88ddff, 1: 0xffdd44, 2: 0xff4444 };
  else colors = { 0: 0x44ff44, 1: 0xff8800, 2: 0xff4444 };
  
  burst(e.m.position, colors[e.type] || 0xffffff);
  drop(e);

  if (e.type === 0) {
    popped++; combo++; score += 10 * mult(); level = 1 + (popped / 10 | 0);
    say('+' + 10 * mult()); beep(520 + combo * 30); buzz(15);
  } else if (e.type === 1) {
    score += 50; say('+50 ⭐', '#ffd23f'); beep(880, 0.2);
  } else {
    lives--; combo = 0; flash();
    say('BOOM -1 ❤', '#ff6b6b'); beep(120, 0.3); buzz([60, 40, 60]);
  }
  hud(); check();
}

function check() {
  if (lives > 0 || state !== 'play') return;
  state = 'over';
  const key = gameMode === 'ghost' ? 'ghostpop-xr-best' : 'fruitslicer-xr-best';
  if (score > best) { best = score; try { localStorage.setItem(key, best) } catch (e) {} }
  $('#fs').textContent = score;
  const targetName = gameMode === 'ghost' ? 'Ghosts busted' : 'Fruits sliced';
  $('#fb').textContent = 'Level ' + level + ' · ' + targetName + ': ' + popped + ' · Best: ' + best;
  $('#over').hidden = false;
}

/* ── Shooting / Slicing ────────────────────────────────────── */
function shoot(quiet) {
  if (state !== 'play') return;
  const h = ray.intersectObjects(ents.map(e => e.m), true);
  if (!h.length) { if (!quiet) beep(200, 0.05); return }
  let o = h[0].object;
  while (o && !o.userData.e) o = o.parent;
  if (o) hit(o.userData.e);
}

/* ── Controller ────────────────────────────────────────────── */
const ctl = R.xr.getController(0);
scene.add(ctl);
ctl.addEventListener('select', () => {
  const m = ctl.matrixWorld;
  ray.ray.origin.setFromMatrixPosition(m); ray.ray.direction.set(0, 0, -1).transformDirection(m);
  shoot();
});
R.domElement.addEventListener('pointerdown', e => {
  if (R.xr.isPresenting) return;
  ray.setFromCamera(new T.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  shoot();
});

/* ── Entity Update ─────────────────────────────────────────── */
function update(dt) {
  spawnT -= dt;
  if (spawnT <= 0) { spawn(); spawnT = Math.max(0.7, 1.7 - level * 0.09) }

  for (const e of ents.slice()) {
    e.age += dt;
    const m = e.m;

    if (gameMode === 'ghost') {
      const d = tmp.subVectors(head, m.position), dist = d.length();
      m.position.addScaledVector(d.multiplyScalar(1 / dist), e.sp * dt);
      m.position.y += Math.sin(e.age * 3 + e.ph) * 0.15 * dt;

      if (e.type === 1) m.rotation.y += dt * 3;
      else m.lookAt(head);

      if (e.type === 0) {
        m.children[0].position.y = Math.sin(e.age * 5 + e.ph) * 0.03;
        m.children.forEach(ch => { if (ch.userData.isAura) ch.scale.setScalar(ch.userData.baseScale * (1 + Math.sin(e.age * 4) * 0.08)); });
      } else if (e.type === 1) {
        m.children.forEach(ch => { if (ch.userData.isAura) ch.scale.setScalar(ch.userData.baseScale * (1 + Math.sin(e.age * 5) * 0.12)); });
      } else {
        const urgency = Math.max(1, 6 - dist * 2);
        m.children.forEach(ch => {
          if (ch.userData.isFuse) ch.scale.setScalar(ch.userData.baseScale * (0.5 + Math.random() * 0.5));
          if (ch.userData.isAura) ch.scale.setScalar(ch.userData.baseScale * (1 + Math.sin(e.age * urgency) * 0.18));
        });
      }

      if (dist < 0.45) {
        drop(e);
        if (e.type === 0) {
          lives--; combo = 0; flash(); say('Boo! -1 ❤', '#ff6b6b'); beep(160, 0.25); buzz(120); hud(); check();
        }
      }
    } else if (gameMode === 'fruit') {
      // Physics for fruit (parabola)
      m.position.addScaledVector(e.v, dt);
      e.v.y -= 5.0 * dt; // Gravity
      
      // Spinning
      m.rotation.x += e.spin.x * dt;
      m.rotation.y += e.spin.y * dt;
      m.rotation.z += e.spin.z * dt;

      if (e.type === 2) {
        m.children.forEach(ch => {
          if (ch.userData.isFuse) ch.scale.setScalar(ch.userData.baseScale * (0.5 + Math.random() * 0.5));
          if (ch.userData.isAura) ch.scale.setScalar(ch.userData.baseScale * (1 + Math.sin(e.age * 6) * 0.18));
        });
      }

      // Drop if it falls below player too much
      if (m.position.y < head.y - 2.5) {
        drop(e);
        // If a fruit drops without being sliced, you lose a life
        if (e.type === 0 || e.type === 1) {
          lives--; combo = 0; flash(); say('Dropped! -1 ❤', '#ff6b6b'); beep(160, 0.25); buzz(120); hud(); check();
        }
      }
    }
  }
}

function updateParts(dt) {
  for (const p of parts) {
    p.o.position.addScaledVector(p.v, dt); p.v.y -= 2.5 * dt; p.t -= dt;
    p.o.scale.setScalar(p.initS * Math.max(0, p.t / p.maxT));
    if (p.t <= 0) scene.remove(p.o);
  }
  parts = parts.filter(p => p.t > 0);
}
function updateAmbient(dt) { ambientParts.rotation.y += dt * 0.03; ambientParts.rotation.x += dt * 0.01; }

const zee = new T.Vector3(0, 0, 1), eu = new T.Euler(), q0 = new T.Quaternion(), q1 = new T.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
function applyOri() {
  const o = (screen.orientation ? screen.orientation.angle : window.orientation || 0) * D;
  const q = camera.quaternion;
  eu.set(ori.b * D, ori.a * D, -ori.g * D, 'YXZ');
  q.setFromEuler(eu); q.multiply(q1); q.multiply(q0.setFromAxisAngle(zee, -o));
}
const onOri = e => { if (e.alpha == null) return; gyro = true; ori = { a: e.alpha, b: e.beta, g: e.gamma } };

let last = 0;
R.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
  if (!R.xr.isPresenting && gyro) applyOri();
  head.setFromMatrixPosition(camera.matrixWorld);
  if (hand) trackHands();
  if (state === 'play') update(dt);
  updateParts(dt); updateAmbient(dt);
  R.render(scene, camera);
});

async function cam(f) {
  face = f; if (stream) stream.getTracks().forEach(t => t.stop());
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: f }, width: { ideal: 1280 } }, audio: false });
    v.srcObject = stream; await v.play(); v.style.display = 'block'; v.style.transform = f === 'user' ? 'scaleX(-1)' : ''; return true;
  } catch (e) { v.style.display = 'none'; return false }
}

function begin() {
  ents.forEach(e => scene.remove(e.m)); ents = []; score = 0; lives = 3; combo = 0; popped = 0; level = 1; spawnT = 0.8;
  lastLives = 3; state = 'play';
  $('#menu').hidden = true; $('#over').hidden = true; $('#hud').hidden = false;
  hud();
}
function toMenu() {
  state = 'hub'; hand = false;
  document.querySelectorAll('.cur').forEach(c => c.style.display = 'none');
  $('#hud').hidden = true; $('#over').hidden = true; $('#menu').hidden = true; $('#hub').hidden = false; $('#flip').hidden = true;
}

$('#cm').onclick = async () => {
  hand = false;
  const phone = matchMedia('(pointer:coarse)').matches;
  if (phone && window.DeviceOrientationEvent) {
    try { if (DeviceOrientationEvent.requestPermission && await DeviceOrientationEvent.requestPermission() !== 'granted') throw 0; addEventListener('deviceorientation', onOri); } catch (e) {}
  }
  const ok = await cam(phone ? 'environment' : 'user');
  if (!ok) $('#note').textContent = 'No camera access here, so you will play on a plain background.';
  $('#flip').hidden = !ok; begin();
};
$('#flip').onclick = () => cam(face === 'user' ? 'environment' : 'user');
$('#xr').onclick = async () => {
  try {
    sess = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local'], optionalFeatures: ['dom-overlay'], domOverlay: { root: $('#ui') } });
    sess.addEventListener('end', () => { xr = false; sess = null; v.style.display = stream ? 'block' : 'none'; toMenu() });
    v.style.display = 'none'; await R.xr.setSession(sess); xr = true; begin();
  } catch (e) { $('#note').textContent = 'AR could not start: ' + (e.message || e) }
};
$('#again').onclick = begin;
$('#menuBtn').onclick = () => { if (sess) sess.end(); else toMenu() };

(async () => {
  let ok = false; try { ok = !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) } catch (e) {}
  $('#xr').hidden = !ok;
  $('#hub-note').textContent = ok ? 'Full AR is available.' : 'Full AR needs Android Chrome. Uses camera + motion sensors instead.';
})();

const MP_VERSION = '0.10.14';
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + MP_VERSION + '/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
let hand = false, hl = null, lastVT = -1;
const cursors = [$('#c0'), $('#c1')];
const smoothPos = [{ x: -1, y: -1 }, { x: -1, y: -1 }];
const SMOOTH = 0.35, FINGERTIPS = [4, 8, 12, 16, 20], CONFIDENCE_MIN = 0.55;

async function initHands() {
  if (hl) return;
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const fs = await FilesetResolver.forVisionTasks(WASM);
  const make = d => HandLandmarker.createFromOptions(fs, {
    baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 2,
    minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
  });
  try { hl = await make('GPU') } catch (e) { hl = await make('CPU') }
}

function trackHands() {
  if (!hl || v.readyState < 2 || v.currentTime === lastVT) return;
  lastVT = v.currentTime;
  let r; try { r = hl.detectForVideo(v, performance.now()) } catch (e) { return }

  const vw = v.videoWidth, vh = v.videoHeight, w = innerWidth, h = innerHeight;
  const s = Math.max(w / vw, h / vh), dw = vw * s, dh = vh * s, ox = (w - dw) / 2, oy = (h - dh) / 2, mir = face === 'user';

  cursors.forEach((c, i) => {
    const landmarks = r.landmarks[i];
    if (!landmarks) { c.style.display = 'none'; smoothPos[i].x = -1; return }
    const handed = r.handedness && r.handedness[i];
    if (handed && handed[0] && handed[0].score < CONFIDENCE_MIN) { c.style.display = 'none'; smoothPos[i].x = -1; return; }

    const indexTip = landmarks[8];
    if (!indexTip) { c.style.display = 'none'; return }

    let rawX = ox + (mir ? 1 - indexTip.x : indexTip.x) * dw, rawY = oy + indexTip.y * dh;
    if (smoothPos[i].x < 0) { smoothPos[i].x = rawX; smoothPos[i].y = rawY; }
    else { smoothPos[i].x += (rawX - smoothPos[i].x) * SMOOTH; smoothPos[i].y += (rawY - smoothPos[i].y) * SMOOTH; }

    c.style.display = 'block'; c.style.transform = 'translate(' + (smoothPos[i].x - 22) + 'px,' + (smoothPos[i].y - 22) + 'px)';

    if (state === 'play') {
      for (const fi of FINGERTIPS) {
        const tip = landmarks[fi]; if (!tip) continue;
        const tx = ox + (mir ? 1 - tip.x : tip.x) * dw, ty = oy + tip.y * dh;
        ray.setFromCamera(new T.Vector2(tx / w * 2 - 1, -ty / h * 2 + 1), camera); shoot(true);
      }
    }
  });
}

$('#hd').onclick = async () => {
  $('#note').textContent = 'Loading hand tracking (first load takes a few seconds)...';
  try {
    removeEventListener('deviceorientation', onOri); gyro = false; camera.quaternion.identity();
    if (!await cam('user')) throw new Error('Camera permission was denied or no camera was found.');
    await initHands(); hand = true; $('#flip').hidden = false; $('#note').textContent = ''; begin();
  } catch (e) { $('#note').textContent = 'Hand mode failed: ' + (e.message || e) }
};
