import * as THREE from 'three';

/* ── Aliases & DOM ─────────────────────────────────────────── */
const T = THREE, $ = s => document.querySelector(s), v = $('#v');
const trailCanvas = $('#trail');
const trailCtx = trailCanvas ? trailCanvas.getContext('2d') : null;

/* ── Renderer ──────────────────────────────────────────────── */
const R = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.setSize(innerWidth, innerHeight);
R.xr.enabled = true;
R.xr.setReferenceSpaceType('local');
document.body.insertBefore(R.domElement, $('#ui'));

/* ── Scene / Camera / Raycaster ────────────────────────────── */
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 60);
const ray = new T.Raycaster();

/* ── Lighting ──────────────────────────────────────────────── */
scene.add(new T.AmbientLight(0x7766aa, 0.65));
const camLight = new T.PointLight(0xffeedd, 1.25, 25);
camera.add(camLight);
scene.add(camera);
const rimLight = new T.PointLight(0x7744ff, 0.5, 25);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

addEventListener('resize', () => {
  R.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  if (trailCanvas) {
    trailCanvas.width = innerWidth;
    trailCanvas.height = innerHeight;
  }
});
['.box', '.hub-container', '#flip'].forEach(s =>
  document.querySelectorAll(s).forEach(e =>
    e.addEventListener('beforexrselect', ev => ev.preventDefault())
  )
);

/* ── Shared Geometries & Basic Hit Sphere ──────────────────── */
const gS = new T.SphereGeometry(1, 16, 12);
const mHit = new T.MeshBasicMaterial({ visible: false });

/* ── Materials: Game 1 (Ghost Pop) ─────────────────────────── */
const mGhostBody = new T.MeshPhongMaterial({
  color: 0xc8e8ff, emissive: 0x3377aa, emissiveIntensity: 0.35,
  transparent: true, opacity: 0.78, side: T.DoubleSide, depthWrite: false, shininess: 30
});
const mGhostEye = new T.MeshPhongMaterial({ color: 0x111111, emissive: 0x00ffaa, emissiveIntensity: 1.0 });
const mGhostMouth = new T.MeshPhongMaterial({ color: 0x111111, emissive: 0x0066aa, emissiveIntensity: 0.5 });
const mGhostAura = new T.MeshPhongMaterial({
  color: 0x88ddff, emissive: 0x44aaff, emissiveIntensity: 0.6,
  transparent: true, opacity: 0.12, side: T.BackSide, depthWrite: false
});
const mStarBody = new T.MeshPhongMaterial({ color: 0xffdd44, emissive: 0xffaa00, emissiveIntensity: 0.7, shininess: 120 });
const mStarGlow = new T.MeshPhongMaterial({
  color: 0xffee66, emissive: 0xffcc00, emissiveIntensity: 0.5,
  transparent: true, opacity: 0.15, side: T.BackSide, depthWrite: false
});
const mBombBody = new T.MeshPhongMaterial({ color: 0x1a1a24, emissive: 0x220505, emissiveIntensity: 0.3, shininess: 90 });
const mBombAura = new T.MeshPhongMaterial({
  color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.8,
  transparent: true, opacity: 0.2, side: T.BackSide, depthWrite: false
});
const mBombFuse = new T.MeshPhongMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 1.5 });

/* ── Materials: Game 2 (XR Fruit Slicer) ───────────────────── */
const mWatermelon = new T.MeshPhongMaterial({ color: 0x1d7c38, emissive: 0x093315, shininess: 45 });
const mOrange = new T.MeshPhongMaterial({ color: 0xff7b00, emissive: 0x7a3000, shininess: 65 });
const mApple = new T.MeshPhongMaterial({ color: 0xdc182e, emissive: 0x4f060d, shininess: 95, specular: 0xff9999 });
const mBanana = new T.MeshPhongMaterial({ color: 0xffd700, emissive: 0x664400, shininess: 40 });
const mStrawberry = new T.MeshPhongMaterial({ color: 0xee1446, emissive: 0x5a0418, shininess: 70 });
const mCoconut = new T.MeshPhongMaterial({ color: 0x563820, emissive: 0x201208, shininess: 15 });
const mLeaf = new T.MeshPhongMaterial({ color: 0x2ecc71, emissive: 0x0d5c26, shininess: 30 });
const mWoodStem = new T.MeshPhongMaterial({ color: 0x3d2616, emissive: 0x170e08, shininess: 20 });

/* ── Materials: Game 3 (Planet Defender) ───────────────────── */
const mAsteroidStony = new T.MeshPhongMaterial({ color: 0x5a5560, emissive: 0x1a1520, shininess: 15, flatShading: true });
const mAsteroidMagma = new T.MeshPhongMaterial({ color: 0x331008, emissive: 0xff3a00, emissiveIntensity: 0.85, shininess: 30, flatShading: true });
const mAsteroidIce = new T.MeshPhongMaterial({ color: 0xa8f0ff, emissive: 0x1166aa, emissiveIntensity: 0.5, shininess: 120, transparent: true, opacity: 0.88, flatShading: true });
const mAsteroidEmp = new T.MeshPhongMaterial({ color: 0x00ff88, emissive: 0x00ee77, emissiveIntensity: 1.1, shininess: 90 });
const mAsteroidEmpRing = new T.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.75 });
const mAsteroidArmored = new T.MeshPhongMaterial({ color: 0x363d47, emissive: 0x181e28, shininess: 80, flatShading: true });
const mAsteroidArmoredGlow = new T.MeshPhongMaterial({ color: 0xff3333, emissive: 0xff1111, emissiveIntensity: 1.0 });

const mShieldDome = new T.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false });
const mShieldGlow = new T.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.06, side: T.DoubleSide, depthWrite: false });
const mBaseRing = new T.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.35 });

const mLaserCyan = new T.MeshBasicMaterial({ color: 0x00ffff });
const mLaserMagenta = new T.MeshBasicMaterial({ color: 0xff2079 });
const mLaserYellow = new T.MeshBasicMaterial({ color: 0xffd700 });

/* ── Materials: Game 4 (Catch the Fireflies) ───────────────── */
const mFireflyWing = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: T.DoubleSide });

/* ── Materials: Game 5 (Cosmic Simon Says) ─────────────────── */
const mCrystalRuby = new T.MeshPhongMaterial({ color: 0xff1744, emissive: 0x660018, shininess: 120, flatShading: true });
const mCrystalTopaz = new T.MeshPhongMaterial({ color: 0xffb300, emissive: 0x553500, shininess: 120, flatShading: true });
const mCrystalEmerald = new T.MeshPhongMaterial({ color: 0x00e676, emissive: 0x00471b, shininess: 120, flatShading: true });
const mCrystalSapphire = new T.MeshPhongMaterial({ color: 0x00b0ff, emissive: 0x002c66, shininess: 120, flatShading: true });
const mCrystalRune = new T.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.45 });

/* ── Materials: Game 6 (Whack-A-Mole AR) ───────────────────── */
const mMoleBurrowRim = new T.MeshPhongMaterial({ color: 0x474d5e, emissive: 0x141822, shininess: 85 });
const mMoleBurrowHole = new T.MeshBasicMaterial({ color: 0x07060d });
const mMoleFur = new T.MeshPhongMaterial({ color: 0x7a5230, emissive: 0x241408, shininess: 25 });
const mMoleSnout = new T.MeshPhongMaterial({ color: 0xd4a373, emissive: 0x3a2512, shininess: 20 });
const mMoleNose = new T.MeshPhongMaterial({ color: 0xff6b8b, emissive: 0x551122 });
const mMoleVisor = new T.MeshBasicMaterial({ color: 0x00f0ff });
const mMoleGold = new T.MeshPhongMaterial({ color: 0xffd700, emissive: 0x664400, shininess: 120 });
const mMoleHelmet = new T.MeshPhongMaterial({ color: 0x90a4ae, emissive: 0x263238, shininess: 100 });
const mMoleSpike = new T.MeshPhongMaterial({ color: 0xd32f2f, emissive: 0x5f0909, shininess: 60 });

/* ── Model Builders: Ghost & Star ──────────────────────────── */
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

/* ── Model Builders: Fruits ────────────────────────────────── */
function makeWatermelonMesh() {
  const g = new T.Group();
  const bodyGeo = new T.SphereGeometry(0.18, 22, 16);
  bodyGeo.scale(1, 1.25, 1);
  g.add(new T.Mesh(bodyGeo, mWatermelon));
  const stem = new T.Mesh(new T.CylinderGeometry(0.01, 0.012, 0.04, 6), mWoodStem);
  stem.position.y = 0.23; stem.rotation.z = 0.25;
  g.add(stem);
  return g;
}

function makeOrangeMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(new T.SphereGeometry(0.15, 20, 16), mOrange));
  const stem = new T.Mesh(new T.CylinderGeometry(0.007, 0.009, 0.03, 6), mWoodStem);
  stem.position.y = 0.155; g.add(stem);
  const leaf = new T.Mesh(new T.ConeGeometry(0.03, 0.065, 4), mLeaf);
  leaf.position.set(0.025, 0.16, 0); leaf.rotation.set(0, 0, -Math.PI / 3);
  g.add(leaf);
  return g;
}

function makeAppleMesh() {
  const g = new T.Group();
  const bodyGeo = new T.SphereGeometry(0.15, 20, 16);
  bodyGeo.scale(1.05, 0.95, 1.05);
  g.add(new T.Mesh(bodyGeo, mApple));
  const stem = new T.Mesh(new T.CylinderGeometry(0.007, 0.008, 0.05, 6), mWoodStem);
  stem.position.y = 0.15; stem.rotation.z = 0.18;
  g.add(stem);
  const leaf = new T.Mesh(new T.ConeGeometry(0.025, 0.055, 4), mLeaf);
  leaf.position.set(0.02, 0.16, 0); leaf.rotation.set(0, 0, -Math.PI / 3.2);
  g.add(leaf);
  return g;
}

function makeBananaMesh() {
  const g = new T.Group();
  const curve = new T.CatmullRomCurve3([
    new T.Vector3(-0.16, -0.05, 0),
    new T.Vector3(-0.07, 0.045, 0),
    new T.Vector3(0.06, 0.045, 0),
    new T.Vector3(0.15, -0.05, 0),
  ]);
  g.add(new T.Mesh(new T.TubeGeometry(curve, 16, 0.036, 8, false), mBanana));
  const stemCap = new T.Mesh(new T.CylinderGeometry(0.012, 0.018, 0.025, 6), mWoodStem);
  stemCap.position.set(-0.16, -0.05, 0); stemCap.rotation.z = Math.PI / 3.5;
  g.add(stemCap);
  const tip = new T.Mesh(new T.SphereGeometry(0.015, 6, 6), mWoodStem);
  tip.position.set(0.15, -0.05, 0);
  g.add(tip);
  return g;
}

function makeStrawberryMesh() {
  const g = new T.Group();
  const bodyGeo = new T.ConeGeometry(0.125, 0.20, 16);
  bodyGeo.rotateX(Math.PI);
  g.add(new T.Mesh(bodyGeo, mStrawberry));
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const l = new T.Mesh(new T.ConeGeometry(0.022, 0.05, 4), mLeaf);
    l.position.set(Math.cos(ang) * 0.055, 0.10, Math.sin(ang) * 0.055);
    l.rotation.set(Math.sin(ang) * 0.8, 0, -Math.cos(ang) * 0.8);
    g.add(l);
  }
  const stem = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.03, 6), mLeaf);
  stem.position.y = 0.115;
  g.add(stem);
  return g;
}

function makeCoconutMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(new T.SphereGeometry(0.16, 20, 16), mCoconut));
  const spotGeo = new T.SphereGeometry(0.015, 6, 6);
  const spotMat = new T.MeshBasicMaterial({ color: 0x1c0f06 });
  [-0.03, 0.03, 0].forEach((x, i) => {
    const y = i === 2 ? 0.135 : 0.145;
    const z = i === 2 ? 0.035 : 0;
    const s = new T.Mesh(spotGeo, spotMat);
    s.position.set(x, y, z);
    g.add(s);
  });
  return g;
}

function makeBombMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(new T.SphereGeometry(0.15, 18, 14), mBombBody));
  const neck = new T.Mesh(new T.CylinderGeometry(0.028, 0.032, 0.025, 8), mBombBody);
  neck.position.y = 0.15;
  g.add(neck);
  const fuse = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.045, 6), mBombFuse);
  fuse.position.set(0, 0.175, 0); fuse.rotation.z = 0.2;
  fuse.userData = { isFuse: true, baseScale: 1.0 };
  g.add(fuse);
  const aura = new T.Mesh(new T.SphereGeometry(0.24, 16, 12), mBombAura);
  aura.userData = { isAura: true, baseScale: 0.24 };
  g.add(aura);
  return g;
}

/* ── Model Builders: Asteroids ─────────────────────────────── */
function makeRockGeo(radius, detail = 1, jitter = 0.25) {
  const geo = new T.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
    const l = Math.hypot(vx, vy, vz) || 1;
    const factor = 1 + (Math.sin(vx * 18 + vy * 14 + vz * 11) * 0.45 + Math.cos(vz * 15) * 0.35) * jitter;
    pos.setXYZ(i, (vx / l) * radius * factor, (vy / l) * radius * factor, (vz / l) * radius * factor);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeStonyAsteroidMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(makeRockGeo(0.24, 1, 0.28), mAsteroidStony));
  const lump = new T.Mesh(makeRockGeo(0.12, 1, 0.2), mAsteroidStony);
  lump.position.set(0.14, 0.1, -0.06);
  g.add(lump);
  return g;
}

function makeMagmaAsteroidMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(makeRockGeo(0.23, 1, 0.32), mAsteroidMagma));
  g.add(new T.Mesh(new T.SphereGeometry(0.13, 12, 10), new T.MeshBasicMaterial({ color: 0xff8800 })));
  const glow = new T.Mesh(new T.SphereGeometry(0.29, 14, 10), new T.MeshBasicMaterial({
    color: 0xff3300, transparent: true, opacity: 0.24, blending: T.AdditiveBlending, depthWrite: false
  }));
  glow.userData = { isAura: true, baseScale: 0.29 };
  g.add(glow);
  return g;
}

function makeIceAsteroidMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(makeRockGeo(0.22, 1, 0.35), mAsteroidIce));
  const shardGeo = new T.ConeGeometry(0.06, 0.24, 5);
  for (let i = 0; i < 4; i++) {
    const s = new T.Mesh(shardGeo, mAsteroidIce);
    const ang = (i / 4) * Math.PI * 2;
    s.position.set(Math.cos(ang) * 0.14, Math.sin(ang) * 0.14, 0);
    s.rotation.set(Math.sin(ang) * 0.7, 0, -Math.cos(ang) * 0.7);
    g.add(s);
  }
  const glow = new T.Mesh(new T.SphereGeometry(0.27, 12, 10), new T.MeshBasicMaterial({
    color: 0x88eeff, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false
  }));
  glow.userData = { isAura: true, baseScale: 0.27 };
  g.add(glow);
  return g;
}

function makeEmpCoreMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(new T.SphereGeometry(0.15, 18, 14), mAsteroidEmp));
  const ring1 = new T.Mesh(new T.TorusGeometry(0.26, 0.012, 6, 24), mAsteroidEmpRing);
  ring1.userData = { isEmpRing1: true }; g.add(ring1);
  const ring2 = new T.Mesh(new T.TorusGeometry(0.30, 0.012, 6, 24), mAsteroidEmpRing);
  ring2.rotation.x = Math.PI / 2; ring2.userData = { isEmpRing2: true }; g.add(ring2);
  const aura = new T.Mesh(new T.SphereGeometry(0.33, 14, 10), new T.MeshBasicMaterial({
    color: 0x00ff88, transparent: true, opacity: 0.26, blending: T.AdditiveBlending, depthWrite: false
  }));
  aura.userData = { isAura: true, baseScale: 0.33 };
  g.add(aura);
  return g;
}

function makeArmoredAsteroidMesh() {
  const g = new T.Group();
  g.add(new T.Mesh(makeRockGeo(0.27, 1, 0.22), mAsteroidArmored));
  const plateGeo = new T.BoxGeometry(0.18, 0.18, 0.04);
  const plateMat = new T.MeshPhongMaterial({ color: 0x242830, emissive: 0x12151b, shininess: 90 });
  const p1 = new T.Mesh(plateGeo, plateMat); p1.position.z = 0.22; g.add(p1);
  const p2 = new T.Mesh(plateGeo, plateMat); p2.position.z = -0.22; g.add(p2);
  const p3 = new T.Mesh(plateGeo, plateMat); p3.position.x = 0.22; p3.rotation.y = Math.PI / 2; g.add(p3);
  const p4 = new T.Mesh(plateGeo, plateMat); p4.position.x = -0.22; p4.rotation.y = Math.PI / 2; g.add(p4);
  const beacon = new T.Mesh(new T.SphereGeometry(0.08, 10, 8), mAsteroidArmoredGlow);
  beacon.userData = { isBeacon: true, baseScale: 0.08 };
  g.add(beacon);
  return g;
}

/* ── Model Builders: Fireflies ─────────────────────────────── */
const FIREFLY_COLORS = [0xffd700, 0x00f0ff, 0xd946ef, 0x10b981];
function makeFireflyMesh(type) {
  const g = new T.Group();
  const c = FIREFLY_COLORS[type] || FIREFLY_COLORS[0];
  const coreMat = new T.MeshBasicMaterial({ color: c });
  const auraMat = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false });

  g.add(new T.Mesh(new T.SphereGeometry(0.08, 14, 12), coreMat));
  const aura = new T.Mesh(new T.SphereGeometry(0.20, 14, 10), auraMat);
  aura.userData = { isAura: true, baseScale: 0.20 };
  g.add(aura);

  const wingGeo = new T.PlaneGeometry(0.12, 0.07);
  const wingL = new T.Mesh(wingGeo, mFireflyWing);
  wingL.position.set(-0.06, 0.05, 0); wingL.rotation.y = 0.3;
  g.add(wingL);
  const wingR = new T.Mesh(wingGeo, mFireflyWing);
  wingR.position.set(0.06, 0.05, 0); wingR.rotation.y = -0.3;
  g.add(wingR);

  g.userData.wingL = wingL;
  g.userData.wingR = wingR;
  return g;
}

/* ── Model Builders: Cosmic Simon Crystals ─────────────────── */
const SIMON_TONES = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
const SIMON_COLORS = [0xff1744, 0xffb300, 0x00e676, 0x00b0ff];
const simonMats = [mCrystalRuby, mCrystalTopaz, mCrystalEmerald, mCrystalSapphire];

function makeSimonCrystalMesh(idx) {
  const g = new T.Group();
  const geo = new T.OctahedronGeometry(0.26, 0);
  geo.scale(1, 1.45, 1);
  const mesh = new T.Mesh(geo, simonMats[idx]);
  g.add(mesh);

  const core = new T.Mesh(new T.OctahedronGeometry(0.14, 0), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  g.add(core);

  const rune = new T.Mesh(new T.TorusGeometry(0.34, 0.015, 6, 24), mCrystalRune);
  rune.rotation.x = Math.PI / 2;
  rune.position.y = -0.45;
  g.add(rune);

  g.userData = { isSimonCrystal: true, index: idx, tone: SIMON_TONES[idx], color: SIMON_COLORS[idx], mesh, core, rune };
  return g;
}

/* ── Model Builders: Whack-A-Mole ──────────────────────────── */
function makeAstroMoleMesh(type) {
  const g = new T.Group();

  // Head
  const headMat = type === 1 ? mMoleGold : mMoleFur;
  const headMesh = new T.Mesh(new T.SphereGeometry(0.18, 18, 14), headMat);
  headMesh.scale.set(1.05, 0.95, 1);
  g.add(headMesh);

  // Snout & Nose
  const snout = new T.Mesh(new T.SphereGeometry(0.08, 14, 10), mMoleSnout);
  snout.position.set(0, -0.04, 0.14);
  snout.scale.set(1.2, 0.7, 0.8);
  g.add(snout);

  const nose = new T.Mesh(new T.SphereGeometry(0.03, 8, 8), mMoleNose);
  nose.position.set(0, -0.01, 0.20);
  g.add(nose);

  // Ears
  [-0.14, 0.14].forEach(x => {
    const ear = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), headMat);
    ear.position.set(x, 0.14, 0.02);
    g.add(ear);
  });

  if (type === 3) {
    // Spike-bot Hazard
    const hornGeo = new T.ConeGeometry(0.035, 0.12, 6);
    [-0.08, 0.08].forEach(x => {
      const horn = new T.Mesh(hornGeo, mMoleSpike);
      horn.position.set(x, 0.19, 0.05);
      horn.rotation.z = x > 0 ? -0.25 : 0.25;
      g.add(horn);
    });
    const visor = new T.Mesh(new T.BoxGeometry(0.18, 0.05, 0.04), mMoleSpike);
    visor.position.set(0, 0.04, 0.16);
    g.add(visor);
  } else if (type === 2) {
    // Cyber Helmet
    const helmet = new T.Mesh(new T.SphereGeometry(0.195, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mMoleHelmet);
    helmet.position.y = 0.02;
    g.add(helmet);
  } else {
    // Cyber Visor Goggles
    const visor = new T.Mesh(new T.BoxGeometry(0.20, 0.05, 0.04), type === 1 ? new T.MeshBasicMaterial({ color: 0xffea00 }) : mMoleVisor);
    visor.position.set(0, 0.04, 0.16);
    g.add(visor);
  }

  return g;
}

/* ── Entity Factory `mk(type)` ─────────────────────────────── */
function mk(type) {
  const g = new T.Group();
  const add = (geo, m, sx, sy, sz, x = 0, y = 0, z = 0) => {
    const o = new T.Mesh(geo, m);
    o.scale.set(sx, sy, sz); o.position.set(x, y, z); g.add(o);
    return o;
  };

  let hitRadius = 0.22;

  if (gameMode === 'ghost') {
    if (type === 0) {
      add(gGhost, mGhostBody, 1, 1, 1);
      add(gS, mGhostEye, 0.022, 0.032, 0.022, -0.055, 0.07, 0.14);
      add(gS, mGhostEye, 0.022, 0.032, 0.022, 0.055, 0.07, 0.14);
      add(gS, mGhostMouth, 0.025, 0.018, 0.018, 0, 0.0, 0.15);
      const aura = add(gS, mGhostAura, 0.3, 0.3, 0.3);
      aura.userData = { isAura: true, baseScale: 0.3 };
      hitRadius = 0.34;
    } else if (type === 1) {
      add(gStar, mStarBody, 1, 1, 1);
      const glow = add(gS, mStarGlow, 0.22, 0.22, 0.22);
      glow.userData = { isAura: true, baseScale: 0.22 };
      hitRadius = 0.25;
    } else {
      g.add(makeBombMesh());
      hitRadius = 0.24;
    }
  } else if (gameMode === 'fruit') {
    const builders = [makeWatermelonMesh, makeOrangeMesh, makeAppleMesh, makeBananaMesh, makeStrawberryMesh, makeCoconutMesh, makeBombMesh];
    const radii = [0.22, 0.16, 0.16, 0.18, 0.15, 0.17, 0.16];
    const builder = builders[type] || makeWatermelonMesh;
    g.add(builder());
    hitRadius = radii[type] || 0.18;
  } else if (gameMode === 'defender') {
    const builders = [makeStonyAsteroidMesh, makeMagmaAsteroidMesh, makeIceAsteroidMesh, makeEmpCoreMesh, makeArmoredAsteroidMesh];
    const radii = [0.26, 0.25, 0.25, 0.26, 0.32];
    const builder = builders[type] || makeStonyAsteroidMesh;
    g.add(builder());
    hitRadius = radii[type] || 0.26;
  } else if (gameMode === 'fireflies') {
    g.add(makeFireflyMesh(type));
    hitRadius = 0.28;
  }

  // Sized invisible hit sphere for raycasting
  add(gS, mHit, hitRadius, hitRadius, hitRadius);
  return g;
}

/* ── Ambient Particles & Game Environments ─────────────────── */
function createAmbientParticles() {
  const count = 120;
  const geo = new T.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const mat = new T.PointsMaterial({
    color: 0x8866dd, size: 0.045, transparent: true, opacity: 0.4,
    blending: T.AdditiveBlending, depthWrite: false
  });
  return new T.Points(geo, mat);
}
const ambientParts = createAmbientParticles();
scene.add(ambientParts);

/* ── Environment: Planet Defender ──────────────────────────── */
const defenderGroup = new T.Group();
defenderGroup.visible = false;
scene.add(defenderGroup);

const shieldRing = new T.Mesh(new T.TorusGeometry(1.65, 0.035, 6, 48), mBaseRing);
shieldRing.rotation.x = Math.PI / 2; shieldRing.position.y = -0.95;
defenderGroup.add(shieldRing);

const shieldInnerRing = new T.Mesh(new T.RingGeometry(0.7, 0.76, 32), new T.MeshBasicMaterial({
  color: 0x00f0ff, transparent: true, opacity: 0.25, side: T.DoubleSide
}));
shieldInnerRing.rotation.x = Math.PI / 2; shieldInnerRing.position.y = -0.96;
defenderGroup.add(shieldInnerRing);

const shieldDome = new T.Mesh(new T.SphereGeometry(1.7, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), mShieldDome);
shieldDome.position.y = -0.95;
defenderGroup.add(shieldDome);

const shieldGlow = new T.Mesh(new T.SphereGeometry(1.68, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mShieldGlow);
shieldGlow.position.y = -0.95;
defenderGroup.add(shieldGlow);

const planetMesh = new T.Mesh(new T.SphereGeometry(3.6, 32, 24), new T.MeshPhongMaterial({ color: 0x482882, emissive: 0x1a0a38, shininess: 80 }));
planetMesh.position.set(5.5, 12, -22);
defenderGroup.add(planetMesh);

const planetRings = new T.Mesh(new T.RingGeometry(4.4, 7.2, 40), new T.MeshBasicMaterial({ color: 0x8866dd, transparent: true, opacity: 0.38, side: T.DoubleSide }));
planetRings.rotation.set(1.1, 0.35, 0.2); planetRings.position.set(5.5, 12, -22);
defenderGroup.add(planetRings);

const planetAtmo = new T.Mesh(new T.SphereGeometry(3.9, 24, 16), new T.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.16, blending: T.AdditiveBlending }));
planetAtmo.position.set(5.5, 12, -22);
defenderGroup.add(planetAtmo);

/* ── Environment: Cosmic Simon Says ────────────────────────── */
const simonGroup = new T.Group();
simonGroup.visible = false;
scene.add(simonGroup);

const SIMON_POSITIONS = [
  new T.Vector3(-0.95, 0.05, -1.8),
  new T.Vector3(-0.32, 0.25, -1.9),
  new T.Vector3(0.32, 0.25, -1.9),
  new T.Vector3(0.95, 0.05, -1.8),
];
const simonCrystals = [];
SIMON_POSITIONS.forEach((pos, idx) => {
  const c = makeSimonCrystalMesh(idx);
  c.position.copy(pos);
  simonGroup.add(c);
  simonCrystals.push(c);
});

/* ── Environment: Whack-A-Mole Burrows ─────────────────────── */
const moleGroup = new T.Group();
moleGroup.visible = false;
scene.add(moleGroup);

const MOLE_BURROWS = [
  { pos: new T.Vector3(-1.3, -0.3, -1.7) },
  { pos: new T.Vector3(-0.6, 0.15, -2.1) },
  { pos: new T.Vector3(0.0, -0.45, -1.6) },
  { pos: new T.Vector3(0.6, 0.15, -2.1) },
  { pos: new T.Vector3(1.3, -0.3, -1.7) },
];
const burrows = [];
MOLE_BURROWS.forEach((bData, idx) => {
  const g = new T.Group();
  g.position.copy(bData.pos);

  // Collar Rim & Hole
  const rim = new T.Mesh(new T.TorusGeometry(0.26, 0.045, 8, 32), mMoleBurrowRim);
  rim.rotation.x = Math.PI / 2; g.add(rim);

  const hole = new T.Mesh(new T.CircleGeometry(0.24, 24), mMoleBurrowHole);
  hole.rotation.x = -Math.PI / 2; hole.position.y = 0.01; g.add(hole);

  // Mole container (moves up and down)
  const moleSlot = new T.Group();
  moleSlot.position.y = -0.45;
  g.add(moleSlot);

  moleGroup.add(g);
  burrows.push({
    idx, group: g, moleSlot,
    state: 'idle', // 'idle', 'rising', 'peeking', 'diving'
    timer: 0, peekDuration: 1.5,
    moleMesh: null, type: 0, hp: 1
  });
});

/* ── Game Registry & Metadata ──────────────────────────────── */
const GAMES = {
  ghost: {
    id: 'ghost', title: '👻 Ghost Pop XR', tag: '360° AR Shooter', icon: '👻',
    desc: 'Spooky ghosts are floating toward you from all directions. Point with your fingertips to pop them before they reach you. Avoid 💣 bombs and collect ⭐ stars!',
    bestKey: 'ghostpop-xr-best', hpLabel: 'HEALTH', hpIcon: '❤', targetName: 'Ghosts busted'
  },
  fruit: {
    id: 'fruit', title: '🍉 XR Fruit Slicer', tag: 'Dual Blade Action', icon: '🍉',
    desc: 'Juicy melons, apples, and bananas launch into the air! Slice them with simultaneous dual-hand laser blades. Watch out for explosive 💣 bombs!',
    bestKey: 'fruitslicer-xr-best', hpLabel: 'HEALTH', hpIcon: '❤', targetName: 'Fruits sliced'
  },
  defender: {
    id: 'defender', title: '🛡️ Planet Defender', tag: 'Space Defense', icon: '🛡️',
    desc: 'Meteors and burning asteroids are raining down from deep space! Blast them with dual-hand laser cannons before they breach the planetary energy shield!',
    bestKey: 'planetdefender-xr-best', hpLabel: 'SHIELD', hpIcon: '🛡️', targetName: 'Asteroids blasted'
  },
  fireflies: {
    id: 'fireflies', title: '✨ Catch the Fireflies', tag: 'Zen Catcher', icon: '✨',
    desc: 'A tranquil swarm of bioluminescent fireflies flutters with boid flocking physics. Gently hover your fingertips over them to charge the capture ring and gather stardust!',
    bestKey: 'fireflies-xr-best', hpLabel: 'TIMER', hpIcon: '⏳', targetName: 'Fireflies caught'
  },
  simon: {
    id: 'simon', title: '💎 Cosmic Simon Says', tag: 'Harmonic Memory', icon: '💎',
    desc: 'Four alien floating crystals play melodic chimes and light sequences. Memorize and tap the exact melodies using your hands in 3D space!',
    bestKey: 'simon-xr-best', hpLabel: 'TRIES', hpIcon: '❤', targetName: 'Rounds cleared'
  },
  mole: {
    id: 'mole', title: '🔨 Whack-A-Mole AR', tag: 'Spatial Reflex', icon: '🔨',
    desc: 'Spatial cyber burrows appear around your room! React fast and bonk the popping astro-moles with your hands, but avoid the spike-bots!',
    bestKey: 'whackmole-xr-best', hpLabel: 'HEARTS', hpIcon: '❤', targetName: 'Moles bonked'
  },
};

/* ── Global State ──────────────────────────────────────────── */
let state = 'hub', gameMode = 'ghost';
let xr = false, gyro = false, ori = { a: 0, b: 0, g: 0 };
let face = 'environment', stream = null, sess = null;
let ents = [], parts = [], score = 0, lives = 3, combo = 0, popped = 0;
let level = 1, spawnT = 1, best = 0, lastLives = 3;
let lastSliceTime = 0, sliceComboInWindow = 0;
const head = new T.Vector3(), tmp = new T.Vector3();

// Simon Says State
let simonSequence = [], simonStep = 0, simonState = 'ready', simonTimer = 0, simonPlaybackIdx = 0;

// Hover Catching Ring (Fireflies)
let hoveredFirefly = null, hoverTime = 0;

/* ── Synthesizer Audio & Haptics ───────────────────────────── */
function getAudio() {
  try { return beep.a || (beep.a = new (window.AudioContext || window.webkitAudioContext)()); }
  catch (e) { return null; }
}

function beep(f, d = 0.12) {
  const a = getAudio(); if (!a) return;
  try {
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}

function playSliceSound(multVal = 1) {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650 + Math.min(600, multVal * 80), t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
    gain.gain.setValueAtTime(0.09, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.12);
  } catch (e) {}
}

function playMissSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    gain.gain.setValueAtTime(0.07, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.2);
  } catch (e) {}
}

function playBombSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.38);
    gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.38);
  } catch (e) {}
}

function playLaserSound(baseFreq = 1200) {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    gain.gain.setValueAtTime(0.12, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.12);
  } catch (e) {}
}

function playExplosionSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    gain.gain.setValueAtTime(0.22, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.3);
  } catch (e) {}
}

function playShieldImpactSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(95, t);
    osc.frequency.linearRampToValueAtTime(310, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.4);
  } catch (e) {}
}

function playEmpSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(1500, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.55);
    gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.55);
  } catch (e) {}
}

function playChimeSound(freq = 523.25, d = 0.4) {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.18, t); gain.gain.exponentialRampToValueAtTime(0.001, t + d);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + d);
  } catch (e) {}
}

function playBonkSound(pitchMult = 1.0) {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(380 * pitchMult, t);
    osc.frequency.exponentialRampToValueAtTime(85 * pitchMult, t + 0.16);
    gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.16);
  } catch (e) {}
}

function playBuzzerSound() {
  const a = getAudio(); if (!a) return;
  try {
    const t = a.currentTime, osc = a.createOscillator(), gain = a.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(110, t);
    gain.gain.setValueAtTime(0.22, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain); gain.connect(a.destination); osc.start(t); osc.stop(t + 0.28);
  } catch (e) {}
}

function playSuccessChord() {
  [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
    setTimeout(() => playChimeSound(freq, 0.5), idx * 80);
  });
}

const buzz = n => { try { navigator.vibrate && navigator.vibrate(n) } catch (e) {} };

/* ── UI Helpers ────────────────────────────────────────────── */
function say(s, c) {
  const t = $('#toast'); t.textContent = s; t.style.color = c || '#fff';
  t.classList.remove('s'); void t.offsetWidth; t.classList.add('s');
}
function flash() { $('#fl').style.opacity = 0.45; setTimeout(() => $('#fl').style.opacity = 0, 120); }
const mult = () => 1 + Math.min(4, combo / 3 | 0);

function hud() {
  const sc = $('#sc');
  sc.textContent = score; sc.classList.remove('pop'); void sc.offsetWidth; sc.classList.add('pop');

  const g = GAMES[gameMode];
  $('#game-badge').textContent = g ? g.title : 'ARcade XR';
  $('#hp-label').textContent = g ? g.hpLabel : 'STATUS';

  const hp = $('#hp');
  if (gameMode === 'fireflies') {
    hp.textContent = '⏳ ' + Math.ceil(Math.max(0, lives)) + 's';
  } else if (gameMode === 'defender') {
    hp.textContent = '🛡️'.repeat(Math.max(0, lives));
  } else {
    hp.textContent = '❤'.repeat(Math.max(0, lives));
  }

  if (lives < lastLives) { hp.classList.remove('pulse'); void hp.offsetWidth; hp.classList.add('pulse'); }
  lastLives = lives;
  $('#lv').innerHTML = 'Lv ' + level + (mult() > 1 ? ' <small>x' + mult() + '</small>' : '');
}

function updateHubBests() {
  Object.keys(GAMES).forEach(id => {
    const bestVal = +localStorage.getItem(GAMES[id].bestKey) || 0;
    const el = $('#best-' + id);
    if (el) el.textContent = 'Best: ' + bestVal;
  });
}

function openGameLauncher(id) {
  const g = GAMES[id];
  if (!g) return;
  gameMode = id;
  $('#game-title').textContent = g.title;
  $('#game-tag').textContent = g.tag;
  $('#game-icon').textContent = g.icon;
  $('#game-desc').textContent = g.desc;
  try { best = +localStorage.getItem(g.bestKey) || 0; } catch (e) { best = 0; }
  $('#launch-best').textContent = '🏆 Personal Best: ' + best + ' pts';
  $('#hub').hidden = true;
  $('#menu').hidden = false;
}

// Hub Card & Play Button Wire-up
Object.keys(GAMES).forEach(id => {
  const card = document.querySelector(`.game-card[data-game="${id}"]`);
  if (card) card.onclick = () => openGameLauncher(id);
  const btn = $('#play-' + id);
  if (btn) btn.onclick = (e) => { e.stopPropagation(); openGameLauncher(id); };
});

$('#back-hub').onclick = () => {
  $('#menu').hidden = true;
  $('#hub').hidden = false;
  updateHubBests();
};
$('#btn-exit').onclick = () => toMenu();

/* ── Spawning ──────────────────────────────────────────────── */
const D = Math.PI / 180;
function spawn() {
  if (gameMode === 'ghost') {
    const u = Math.random();
    const type = level >= 2 && u < 0.15 ? 2 : u > 0.9 ? 1 : 0;
    const m = mk(type);
    const e = { m, type, age: 0, ph: Math.random() * 6.28 };
    const r = 2.3 + Math.random() * 1.3;
    const half = Math.atan(Math.tan(35 * D) * camera.aspect) * 0.8;
    const a = (xr || gyro) ? Math.random() * 6.283 : (Math.random() * 2 - 1) * half;
    m.position.set(head.x + Math.sin(a) * r, head.y + (Math.random() - 0.4) * 1.2, head.z - Math.cos(a) * r);
    e.sp = (type === 1 ? 0.7 : 0.45) + level * 0.06;
    m.userData.e = e;
    scene.add(m); ents.push(e);
  } else if (gameMode === 'fruit') {
    const count = (level >= 2 && Math.random() < 0.35) ? 2 : 1;
    for (let i = 0; i < count; i++) {
      let type;
      if (level >= 2 && Math.random() < 0.18) type = 6;
      else type = Math.floor(Math.random() * 6);
      const m = mk(type);
      const e = { m, type, age: 0, ph: Math.random() * 6.28 };
      const r = 1.0 + Math.random() * 1.4;
      const half = Math.atan(Math.tan(35 * D) * camera.aspect) * 0.75;
      const spread = (i === 1) ? 0.4 : -0.2;
      const a = (xr || gyro) ? (Math.random() * Math.PI) : ((Math.random() * 1.6 - 0.8) * half + spread);
      m.position.set(head.x + Math.sin(a) * r, head.y - 1.4, head.z - Math.cos(a) * r);
      e.v = new T.Vector3((Math.random() - 0.5) * 1.6 + spread * 0.5, 3.2 + Math.random() * 1.3 + (level * 0.08), (Math.random() - 0.5) * 1.2);
      e.spin = new T.Vector3((Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 5.0, (Math.random() - 0.5) * 4.5);
      m.userData.e = e;
      scene.add(m); ents.push(e);
    }
  } else if (gameMode === 'defender') {
    const count = (level >= 2 && Math.random() < 0.45) ? 2 : 1;
    for (let i = 0; i < count; i++) {
      let type = 0;
      const u = Math.random();
      if (level >= 3 && u < 0.18) type = 4;
      else if (level >= 2 && u < 0.32) type = 3;
      else if (level >= 2 && u < 0.55) type = 2;
      else if (u < 0.48) type = 1;
      else type = 0;

      const m = mk(type);
      const e = { m, type, age: 0, ph: Math.random() * 6.28, hp: type === 4 ? 2 : 1, smokeT: 0 };
      const dist = 3.2 + Math.random() * 2.2;
      const half = Math.atan(Math.tan(35 * D) * camera.aspect) * 0.85;
      const spread = (i === 1) ? 0.45 : -0.25;
      const a = (xr || gyro) ? (Math.random() * 6.283) : ((Math.random() * 1.6 - 0.8) * half + spread);

      m.position.set(head.x + Math.sin(a) * dist, head.y + 2.6 + Math.random() * 1.8, head.z - Math.cos(a) * dist);
      const target = new T.Vector3(head.x + (Math.random() - 0.5) * 1.2, head.y - 0.7, head.z + (Math.random() - 0.5) * 1.2);
      const dir = target.sub(m.position).normalize();
      e.v = dir.multiplyScalar((type === 1 ? 1.45 : type === 4 ? 0.95 : 1.15) + (level * 0.08));
      e.spin = new T.Vector3((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 3.5);
      m.userData.e = e;
      scene.add(m); ents.push(e);
    }
  } else if (gameMode === 'fireflies') {
    if (ents.length < 8 + level * 2) {
      const u = Math.random();
      const type = u > 0.92 ? 3 : u > 0.7 ? 2 : u > 0.45 ? 1 : 0;
      const m = mk(type);
      const e = {
        m, type, age: 0, hoverTime: 0, ph: Math.random() * 6.28,
        v: new T.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.8)
      };
      const rad = 1.2 + Math.random() * 1.5;
      const ang = Math.random() * Math.PI * 2;
      m.position.set(head.x + Math.cos(ang) * rad, head.y + (Math.random() - 0.3) * 1.0, head.z - 1.2 + Math.sin(ang) * 0.8);
      m.userData.e = e;
      scene.add(m); ents.push(e);
    }
  }
}

/* ── Particle Burst ────────────────────────────────────────── */
const pmCache = {};
function burstMat(c) {
  if (pmCache[c]) return pmCache[c];
  const m = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
  pmCache[c] = m; return m;
}

function burst(p, colors) {
  const colorList = Array.isArray(colors) ? colors : [colors];
  const count = 26;
  for (let i = 0; i < count; i++) {
    const c = colorList[Math.floor(Math.random() * colorList.length)];
    const m = burstMat(c);
    const o = new T.Mesh(gS, m);
    const s = 0.016 + Math.random() * 0.024;
    o.scale.setScalar(s); o.position.copy(p); scene.add(o);
    const life = 0.5 + Math.random() * 0.4;
    parts.push({
      o, v: new T.Vector3((Math.random() - 0.5) * 3.4, (Math.random() - 0.2) * 3.2, (Math.random() - 0.5) * 3.4),
      t: life, maxT: life, initS: s
    });
  }
}

function drop(e) { scene.remove(e.m); ents = ents.filter(o => o !== e); }

/* ── Fruit & Asteroid Database ─────────────────────────────── */
const FRUIT_INFO = [
  { name: 'Watermelon', pts: 10, colors: [0xff2244, 0x1d7c38, 0x111111], tag: '+10 🍉' },
  { name: 'Orange',     pts: 15, colors: [0xff7b00, 0xffb703, 0xffffff], tag: '+15 🍊' },
  { name: 'Apple',      pts: 15, colors: [0xdc182e, 0xfff8e7, 0x32b53e], tag: '+15 🍎' },
  { name: 'Banana',     pts: 20, colors: [0xffd700, 0xfffae6, 0x422917], tag: '+20 🍌' },
  { name: 'Strawberry', pts: 25, colors: [0xee1446, 0x2ecc71, 0xffa5ba], tag: '+25 🍓' },
  { name: 'Coconut',    pts: 25, colors: [0xffffff, 0x563820, 0x8c5e35], tag: '+25 🥥' },
  { name: 'Bomb',       pts: 0,  colors: [0xff3700, 0xff9900, 0x222222], tag: 'BOOM!' },
];

const ASTEROID_INFO = [
  { name: 'Stony Meteorite', pts: 10, colors: [0x776655, 0x998877, 0xffaa33], tag: '+10 🪨' },
  { name: 'Magma Meteor',     pts: 20, colors: [0xff3300, 0xff7700, 0xffeedd], tag: '+20 🔥' },
  { name: 'Crystal Asteroid', pts: 15, colors: [0x00f0ff, 0x88eeff, 0xffffff], tag: '+15 ❄️' },
  { name: 'EMP Nova Core',    pts: 35, colors: [0x00ff88, 0x00f0ff, 0xaaffff], tag: '+35 ⚡' },
  { name: 'Armored Dread',    pts: 30, colors: [0xffaa00, 0xff4400, 0x8899aa], tag: '+30 🛡️' },
];

const FIREFLY_INFO = [
  { name: 'Golden Firefly', pts: 10, tag: '+10 ✨' },
  { name: 'Azure Sprite',   pts: 20, tag: '+20 💧' },
  { name: 'Amethyst Starfly', pts: 35, tag: '+35 🔮' },
  { name: 'Queen Firefly',  pts: 60, tag: '+60 🌈' },
];

/* ── Hit & Interaction Handler ─────────────────────────────── */
function hit(e) {
  if (gameMode === 'ghost') {
    const colors = { 0: 0x88ddff, 1: 0xffdd44, 2: 0xff4444 };
    burst(e.m.position, colors[e.type] || 0xffffff);
    drop(e);
    if (e.type === 0) {
      popped++; combo++; score += 10 * mult(); level = 1 + (popped / 10 | 0);
      say('+' + 10 * mult()); beep(520 + combo * 30); buzz(15);
    } else if (e.type === 1) {
      score += 50; say('+50 ⭐', '#ffd23f'); beep(880, 0.2);
    } else {
      lives--; combo = 0; flash();
      say('BOOM -1 ❤', '#ff6b6b'); playBombSound(); buzz([60, 40, 60]);
    }
  } else if (gameMode === 'fruit') {
    const info = FRUIT_INFO[e.type] || FRUIT_INFO[0];
    burst(e.m.position, info.colors);
    drop(e);
    if (e.type === 6) {
      lives--; combo = 0; sliceComboInWindow = 0; flash();
      say('BOOM! -1 ❤', '#ff6b6b'); playBombSound(); buzz([60, 40, 60]);
    } else {
      const now = performance.now();
      if (now - lastSliceTime < 450) sliceComboInWindow++;
      else sliceComboInWindow = 1;
      lastSliceTime = now;
      popped++; combo++;
      const multiplier = mult();
      let gained = info.pts * multiplier;
      if (sliceComboInWindow >= 2) gained += sliceComboInWindow * 5;
      score += gained;
      level = 1 + Math.floor(popped / 10);
      if (sliceComboInWindow >= 2) say('COMBO x' + sliceComboInWindow + '! +' + gained, '#ffd23f');
      else say(info.tag + (multiplier > 1 ? ' x' + multiplier : ''));
      playSliceSound(multiplier + sliceComboInWindow);
      buzz(22);
    }
  } else if (gameMode === 'defender') {
    if (e.type === 4 && e.hp > 1) {
      e.hp--;
      burst(e.m.position, [0xffaa00, 0x888888, 0xffeedd]);
      say('ARMOR CRACKED! ⚡', '#ffd23f');
      beep(700, 0.1); buzz(35);
      return;
    }
    const info = ASTEROID_INFO[e.type] || ASTEROID_INFO[0];
    burst(e.m.position, info.colors);
    drop(e);
    playExplosionSound();
    if (e.type === 3) {
      playEmpSound(); flash();
      say('⚡ EMP NOVA DETONATION! ⚡', '#00ffaa');
      const shockPos = e.m.position.clone();
      createShockwave(shockPos);
      for (const other of ents.slice()) {
        if (other.m.position.distanceTo(shockPos) < 2.2) {
          burst(other.m.position, [0x00ff88, 0x00f0ff, 0xffffff]);
          drop(other);
          popped++; score += 20 * mult();
        }
      }
    }
    popped++; combo++;
    score += info.pts * mult();
    level = 1 + Math.floor(popped / 10);
    say(info.tag + (mult() > 1 ? ' x' + mult() : ''));
    buzz(25);
  }

  hud(); check();
}

/* ── Game Over & Score Evaluation ──────────────────────────── */
function check() {
  if (lives > 0 || state !== 'play') return;
  state = 'over';

  const g = GAMES[gameMode] || GAMES.ghost;
  if (score > best) {
    best = score;
    try { localStorage.setItem(g.bestKey, best); } catch (e) {}
  }

  // Calculate Rank
  let rank = 'RANK C';
  if (score >= 400) rank = '🏆 RANK S';
  else if (score >= 250) rank = '⭐ RANK A';
  else if (score >= 120) rank = 'RANK B';

  $('#over-rank').textContent = rank;
  $('#fs').textContent = score;
  $('#fb').textContent = 'Level ' + level + ' · ' + g.targetName + ': ' + popped + ' · Best: ' + best;
  $('#over').hidden = false;
  $('#hover-ring').hidden = true;
  updateHubBests();
}

/* ── Laser Bolts & Shockwaves ──────────────────────────────── */
const gLaserBolt = new T.CylinderGeometry(0.018, 0.018, 0.45, 6);
gLaserBolt.rotateX(Math.PI / 2);
let lasers = [], shockwaves = [], lastLaserTime = [0, 0], pointerLaserTime = 0;

function fireLaser(origin, dir, handSlot = 'pointer') {
  if (state !== 'play') return;
  const mat = handSlot === 0 ? mLaserCyan : handSlot === 1 ? mLaserMagenta : mLaserYellow;
  const bolt = new T.Mesh(gLaserBolt, mat);
  bolt.position.copy(origin);
  bolt.quaternion.setFromUnitVectors(new T.Vector3(0, 0, -1), dir.clone().normalize());
  scene.add(bolt);
  lasers.push({
    mesh: bolt, vel: dir.clone().normalize().multiplyScalar(36),
    life: 0.65, maxLife: 0.65, handSlot
  });
  burst(origin, handSlot === 0 ? 0x00f0ff : handSlot === 1 ? 0xff2079 : 0xffd700);
  playLaserSound(handSlot === 0 ? 1150 : handSlot === 1 ? 1350 : 1250);
}

function createShockwave(pos) {
  const geo = new T.RingGeometry(0.12, 0.22, 32);
  const mat = new T.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.95, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
  const mesh = new T.Mesh(geo, mat);
  mesh.position.copy(pos); mesh.lookAt(camera.position); scene.add(mesh);
  shockwaves.push({ mesh, t: 0.45, maxT: 0.45 });
}

/* ── Raycast Slicing, Whacking, & Simon Tapping ─────────────── */
function shoot(quiet, handSlot = 'pointer', handPos = null) {
  if (state !== 'play') return;

  if (gameMode === 'defender') {
    const origin = handPos ? handPos.clone() : camera.position.clone();
    if (!handPos) origin.addScaledVector(ray.ray.direction, 0.25);
    fireLaser(origin, ray.ray.direction.clone(), handSlot);
  }

  // Intersect Simon Crystals
  if (gameMode === 'simon') {
    if (simonState !== 'player') return;
    const h = ray.intersectObjects(simonCrystals.map(c => c.userData.mesh), true);
    if (h.length) {
      let o = h[0].object;
      while (o && !o.userData || (o.userData && !o.userData.isSimonCrystal)) o = o.parent;
      if (o && o.userData) onSimonCrystalTap(o.userData.index);
    }
    return;
  }

  // Intersect Moles
  if (gameMode === 'mole') {
    const activeMoles = burrows.filter(b => b.state === 'peeking' && b.moleMesh).map(b => b.moleMesh);
    const h = ray.intersectObjects(activeMoles, true);
    if (h.length) {
      let o = h[0].object;
      while (o && (!o.userData || o.userData.burrowIdx === undefined)) o = o.parent;
      if (o && o.userData) onWhackMole(o.userData.burrowIdx);
    }
    return;
  }

  // Intersect standard floating entities (Ghosts, Fruits, Asteroids)
  const h = ray.intersectObjects(ents.map(e => e.m), true);
  if (!h.length) { if (!quiet) beep(200, 0.05); return; }
  let o = h[0].object;
  while (o && !o.userData.e) o = o.parent;
  if (o) hit(o.userData.e);
}

/* ── Simon Says Engine ─────────────────────────────────────── */
function startSimonGame() {
  simonSequence = [Math.floor(Math.random() * 4)];
  simonStep = 0;
  simonState = 'playback';
  simonPlaybackIdx = 0;
  simonTimer = 0.8;
  say('MEMORIZE 🎵', '#00f0ff');
}

function triggerSimonPulse(idx, duration = 0.35) {
  const c = simonCrystals[idx];
  if (!c) return;
  c.scale.setScalar(1.35);
  c.userData.mesh.material.emissiveIntensity = 2.0;
  playChimeSound(c.userData.tone, duration);
  burst(c.position, c.userData.color);
  setTimeout(() => {
    c.scale.setScalar(1.0);
    c.userData.mesh.material.emissiveIntensity = 0.6;
  }, duration * 1000);
}

function onSimonCrystalTap(idx) {
  if (simonState !== 'player') return;
  triggerSimonPulse(idx, 0.25);
  buzz(20);

  if (idx === simonSequence[simonStep]) {
    simonStep++;
    score += 25 * mult();
    if (simonStep >= simonSequence.length) {
      // Sequence completed!
      popped++;
      score += 100 * level;
      level++;
      combo++;
      say('HARMONY! ROUND CLEAR 🎶', '#ffd700');
      playSuccessChord();
      simonSequence.push(Math.floor(Math.random() * 4));
      simonState = 'wait';
      simonTimer = 1.3;
    }
  } else {
    // Wrong note!
    playBuzzerSound();
    lives--; combo = 0; flash();
    say('WRONG NOTE! -1 ❤', '#ff4444');
    buzz([90, 50, 90]);
    if (lives <= 0) {
      check();
    } else {
      simonState = 'wait';
      simonTimer = 1.2;
    }
  }
  hud();
}

/* ── Whack-A-Mole Engine ───────────────────────────────────── */
function popMoleInBurrow(b) {
  b.state = 'rising';
  b.timer = 0;
  b.peekDuration = Math.max(0.85, 1.8 - level * 0.1);

  // Type: 0 standard, 1 gold, 2 helmet, 3 hazard
  const u = Math.random();
  b.type = (level >= 2 && u < 0.18) ? 3 : (u > 0.8) ? 1 : (level >= 3 && u > 0.6) ? 2 : 0;
  b.hp = b.type === 2 ? 2 : 1;

  // Rebuild mole mesh in slot
  b.moleSlot.clear();
  const m = makeAstroMoleMesh(b.type);
  m.userData = { burrowIdx: b.idx };
  b.moleMesh = m;
  b.moleSlot.add(m);
  b.moleSlot.position.y = -0.35;
}

function onWhackMole(bIdx) {
  const b = burrows[bIdx];
  if (!b || b.state !== 'peeking') return;

  if (b.type === 2 && b.hp > 1) {
    b.hp--;
    burst(b.group.position, [0xffd700, 0xaaaaaa]);
    say('HELMET CRACKED! ⚡', '#ffd23f');
    playBonkSound(1.3);
    buzz(30);
    return;
  }

  if (b.type === 3) {
    // Spike-bot Hazard
    playExplosionSound();
    burst(b.group.position, [0xff0000, 0xff6b8b, 0x222222]);
    lives--; combo = 0; flash();
    say('OUCH! SPIKE-BOT! -1 ❤', '#ff4444');
    buzz([80, 50, 100]);
  } else {
    // Whacked!
    const pts = b.type === 1 ? 40 : b.type === 2 ? 30 : 15;
    popped++; combo++;
    score += pts * mult();
    level = 1 + Math.floor(popped / 8);
    burst(b.group.position, b.type === 1 ? [0xffd700, 0xffea00, 0xffffff] : [0x7a5230, 0x00f0ff, 0xffffff]);
    playBonkSound(b.type === 1 ? 1.6 : 1.0);
    say((b.type === 1 ? '+40 🌟 GOLDEN' : '+15 🐹') + ' BONK!', '#00f0ff');
    buzz(25);
  }

  b.state = 'diving';
  b.timer = 0;
  hud(); check();
}

/* ── XR Controller & Pointer Listeners ─────────────────────── */
const ctl = R.xr.getController(0);
scene.add(ctl);
ctl.addEventListener('select', () => {
  const m = ctl.matrixWorld;
  ray.ray.origin.setFromMatrixPosition(m); ray.ray.direction.set(0, 0, -1).transformDirection(m);
  shoot(false, 1, ray.ray.origin);
});

let isPointerDown = false;
let mouseTrail = [];
let prevPointerPos = { x: -1, y: -1 };

window.addEventListener('pointerdown', e => {
  if (R.xr.isPresenting) return;
  isPointerDown = true;
  prevPointerPos.x = e.clientX; prevPointerPos.y = e.clientY;
  mouseTrail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  ray.setFromCamera(new T.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (gameMode === 'defender') {
    pointerLaserTime = performance.now();
    shoot(false, 'pointer');
  } else {
    shoot();
  }
});

window.addEventListener('pointermove', e => {
  if (!isPointerDown || R.xr.isPresenting) return;
  const now = performance.now();
  mouseTrail.push({ x: e.clientX, y: e.clientY, t: now });
  if (state === 'play') {
    if (gameMode === 'fruit' && prevPointerPos.x >= 0) {
      const dist = Math.hypot(e.clientX - prevPointerPos.x, e.clientY - prevPointerPos.y);
      const steps = Math.min(5, Math.max(1, Math.ceil(dist / 18)));
      for (let s = 1; s <= steps; s++) {
        const sx = prevPointerPos.x + (e.clientX - prevPointerPos.x) * (s / steps);
        const sy = prevPointerPos.y + (e.clientY - prevPointerPos.y) * (s / steps);
        ray.setFromCamera(new T.Vector2((sx / innerWidth) * 2 - 1, -(sy / innerHeight) * 2 + 1), camera);
        shoot(true);
      }
    } else if (gameMode === 'defender' && now - pointerLaserTime > 160) {
      pointerLaserTime = now;
      ray.setFromCamera(new T.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
      shoot(true, 'pointer');
    }
  }
  prevPointerPos.x = e.clientX; prevPointerPos.y = e.clientY;
});

window.addEventListener('pointerup', () => {
  isPointerDown = false;
  prevPointerPos.x = -1; prevPointerPos.y = -1;
});

/* ── Main Engine Update Loop ───────────────────────────────── */
function update(dt) {
  if (gameMode !== 'simon' && gameMode !== 'mole') {
    spawnT -= dt;
    if (spawnT <= 0) {
      spawn();
      spawnT = Math.max(0.65, 1.6 - level * 0.08);
    }
  }

  // Update Fireflies Zen Timer
  if (gameMode === 'fireflies') {
    lives -= dt;
    if (lives <= 0) {
      lives = 0;
      hud();
      check();
      return;
    }
    hud();
  }

  // Update Cosmic Simon Says State Machine
  if (gameMode === 'simon') {
    if (simonState === 'wait') {
      simonTimer -= dt;
      if (simonTimer <= 0) {
        simonState = 'playback';
        simonPlaybackIdx = 0;
        simonTimer = 0.5;
        say('MEMORIZE 🎵', '#00f0ff');
      }
    } else if (simonState === 'playback') {
      simonTimer -= dt;
      if (simonTimer <= 0) {
        if (simonPlaybackIdx < simonSequence.length) {
          triggerSimonPulse(simonSequence[simonPlaybackIdx], 0.35);
          simonPlaybackIdx++;
          simonTimer = 0.55;
        } else {
          simonState = 'player';
          simonStep = 0;
          say('YOUR TURN! 👆', '#00ff88');
        }
      }
    }
    // Idle rotation for crystals
    simonCrystals.forEach((c, idx) => {
      c.userData.mesh.rotation.y += dt * 0.8;
      c.userData.rune.rotation.z += dt * 0.5;
    });
  }

  // Update Whack-A-Mole Burrows
  if (gameMode === 'mole') {
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnT = Math.max(0.8, 2.2 - level * 0.12);
      const idleBurrows = burrows.filter(b => b.state === 'idle');
      if (idleBurrows.length > 0) {
        const target = idleBurrows[Math.floor(Math.random() * idleBurrows.length)];
        popMoleInBurrow(target);
      }
    }

    burrows.forEach(b => {
      if (b.state === 'rising') {
        b.moleSlot.position.y += dt * 2.8;
        if (b.moleSlot.position.y >= 0.22) {
          b.moleSlot.position.y = 0.22;
          b.state = 'peeking';
          b.timer = b.peekDuration;
        }
      } else if (b.state === 'peeking') {
        b.timer -= dt;
        if (b.timer <= 0) {
          b.state = 'diving';
        }
      } else if (b.state === 'diving') {
        b.moleSlot.position.y -= dt * 3.2;
        if (b.moleSlot.position.y <= -0.45) {
          b.moleSlot.position.y = -0.45;
          b.state = 'idle';
          b.moleSlot.clear();
          b.moleMesh = null;
        }
      }
    });
  }

  // Update Floating Entities
  let currentHoverCandidate = null;
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

      if (dist < 0.42) {
        drop(e);
        if (e.type === 0) {
          lives--; combo = 0; flash(); say('Boo! -1 ❤', '#ff6b6b'); beep(160, 0.25); buzz(120); hud(); check();
        }
      }
    } else if (gameMode === 'fruit') {
      m.position.addScaledVector(e.v, dt);
      e.v.y -= 4.8 * dt; // Gravity
      m.rotation.x += e.spin.x * dt;
      m.rotation.y += e.spin.y * dt;
      m.rotation.z += e.spin.z * dt;

      if (m.position.y < head.y - 2.4) {
        drop(e);
        if (e.type < 6) {
          lives--; combo = 0; sliceComboInWindow = 0; flash();
          say('Missed! -1 ❤', '#ff6b6b'); playMissSound(); buzz(120); hud(); check();
        } else {
          say('Bomb avoided! 👍', '#44ff88'); score += 5; hud();
        }
      }
    } else if (gameMode === 'defender') {
      m.position.addScaledVector(e.v, dt);
      m.rotation.x += e.spin.x * dt;
      m.rotation.y += e.spin.y * dt;
      m.rotation.z += e.spin.z * dt;

      if (e.type === 3) {
        m.children.forEach(ch => {
          if (ch.userData && ch.userData.isEmpRing1) ch.rotation.z += dt * 4;
          if (ch.userData && ch.userData.isEmpRing2) ch.rotation.y += dt * 3.5;
          if (ch.userData && ch.userData.isAura) ch.scale.setScalar(ch.userData.baseScale * (1 + Math.sin(e.age * 6) * 0.15));
        });
      } else if (e.type === 1) {
        e.smokeT += dt;
        if (e.smokeT > 0.07) {
          e.smokeT = 0;
          burst(m.position, [0xff4400, 0xffaa00]);
        }
      }

      const shieldCenter = tmp.set(head.x, head.y - 0.7, head.z);
      if (m.position.distanceTo(shieldCenter) < 1.45 || m.position.y < head.y - 1.1) {
        drop(e);
        burst(m.position, [0x00f0ff, 0xff3300, 0xffffff]);
        playShieldImpactSound();
        lives--; combo = 0; flash();
        say('SHIELD BREACH! -1 🛡️', '#ff4444');
        buzz([80, 50, 100]);
        if (shieldDome) {
          shieldDome.material.color.setHex(0xff3333);
          shieldDome.material.opacity = 0.65;
        }
        hud(); check();
      }
    } else if (gameMode === 'fireflies') {
      // Boid / Flocking Physics
      m.position.addScaledVector(e.v, dt);
      m.position.y += Math.sin(e.age * 2.5 + e.ph) * 0.005;

      // Gentle wing flapping
      if (m.userData.wingL && m.userData.wingR) {
        const flap = Math.sin(e.age * 26) * 0.7;
        m.userData.wingL.rotation.y = flap;
        m.userData.wingR.rotation.y = -flap;
      }

      // Attract toward center viewing bubble
      const targetCenter = tmp.set(head.x, head.y + 0.1, head.z - 1.6);
      const toCenter = tmp.sub(m.position);
      if (toCenter.length() > 1.8) {
        e.v.addScaledVector(toCenter.normalize(), dt * 0.8);
      }
      e.v.clampLength(0.2, 0.9);

      // Raycast hover detection for Catching
      const screenPos = m.position.clone().project(camera);
      const isVisible = screenPos.z > 0 && screenPos.z < 1;
      if (isVisible) {
        const sx = ((screenPos.x + 1) / 2) * innerWidth;
        const sy = ((-screenPos.y + 1) / 2) * innerHeight;
        let isHovered = false;

        hands.forEach(h => {
          if (h.active && Math.hypot(h.x - sx, h.y - sy) < 55) isHovered = true;
        });
        if (isPointerDown && Math.hypot(prevPointerPos.x - sx, prevPointerPos.y - sy) < 65) isHovered = true;

        if (isHovered && !currentHoverCandidate) {
          currentHoverCandidate = { e, sx, sy };
        }
      }
    }
  }

  // Handle Firefly Hover Capture
  const ringEl = $('#hover-ring');
  const ringFill = $('#ring-fill');
  if (gameMode === 'fireflies') {
    if (currentHoverCandidate) {
      const { e, sx, sy } = currentHoverCandidate;
      e.hoverTime += dt;
      const progress = Math.min(1, e.hoverTime / 0.75);

      ringEl.hidden = false;
      ringEl.style.transform = `translate(${sx - 60}px, ${sy - 60}px)`;
      ringFill.style.strokeDashoffset = `${264 * (1 - progress)}`;

      if (e.hoverTime >= 0.75) {
        // Caught!
        drop(e);
        const info = FIREFLY_INFO[e.type] || FIREFLY_INFO[0];
        burst(e.m.position, [FIREFLY_COLORS[e.type], 0xffffff, 0xffea00]);
        playChimeSound(660 + e.type * 120, 0.45);
        popped++; combo++;
        score += info.pts * mult();
        lives = Math.min(60, lives + 2); // Bonus time!
        say(info.tag + ' CAUGHT! ✨', '#ffd700');
        buzz(25);

        if (e.type === 3) {
          // Queen Firefly triggers a swarm gathering pulse!
          say('👑 QUEEN SWARM BONUS! ✨', '#00ff88');
          for (const other of ents.slice()) {
            if (other.m.position.distanceTo(e.m.position) < 1.6) {
              burst(other.m.position, [0xffffff, 0x00ff88]);
              drop(other);
              popped++; score += 15 * mult();
            }
          }
        }

        ringEl.hidden = true;
        hud();
      }
    } else {
      ringEl.hidden = true;
    }
  } else {
    ringEl.hidden = true;
  }

  // Update Laser Projectiles
  for (const l of lasers.slice()) {
    l.mesh.position.addScaledVector(l.vel, dt);
    l.life -= dt;
    let hitTarget = false;
    for (const e of ents) {
      if (e.m.position.distanceTo(l.mesh.position) < (e.type === 4 ? 0.38 : 0.3)) {
        hitTarget = true;
        hit(e);
        break;
      }
    }
    if (hitTarget || l.life <= 0) {
      scene.remove(l.mesh);
      lasers = lasers.filter(item => item !== l);
    }
  }

  // Update Shockwaves
  for (const sw of shockwaves.slice()) {
    sw.t -= dt;
    const prog = 1 - sw.t / sw.maxT;
    sw.mesh.scale.setScalar(0.2 + prog * 3.0);
    sw.mesh.material.opacity = Math.max(0, (sw.t / sw.maxT) * 0.95);
    if (sw.t <= 0) {
      scene.remove(sw.mesh);
      shockwaves = shockwaves.filter(item => item !== sw);
    }
  }

  // Defender Base Shield Animations
  if (gameMode === 'defender') {
    if (shieldDome && shieldDome.material.opacity > 0.18) {
      shieldDome.material.opacity = Math.max(0.18, shieldDome.material.opacity - dt * 0.9);
      shieldDome.material.color.lerp(new T.Color(0x00f0ff), dt * 3.5);
    }
    if (shieldRing) shieldRing.rotation.z += dt * 0.4;
    if (shieldInnerRing) shieldInnerRing.rotation.z -= dt * 0.3;
    if (planetRings) planetRings.rotation.z += dt * 0.05;
  }
}

function updateParts(dt) {
  for (const p of parts) {
    p.o.position.addScaledVector(p.v, dt); p.v.y -= 2.8 * dt; p.t -= dt;
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
const onOri = e => { if (e.alpha == null) return; gyro = true; ori = { a: e.alpha, b: e.beta, g: e.gamma }; };

/* ── Blade Trail Canvas Rendering ──────────────────────────── */
function renderBladeTrails() {
  if (!trailCtx || !trailCanvas) return;
  const w = innerWidth, h = innerHeight;
  if (trailCanvas.width !== w || trailCanvas.height !== h) {
    trailCanvas.width = w; trailCanvas.height = h;
  }
  trailCtx.clearRect(0, 0, w, h);
  const now = performance.now();
  const maxAge = 180;

  hands.forEach(handState => {
    handState.trail = handState.trail.filter(pt => now - pt.t < maxAge);
    const pts = handState.trail;
    if (pts.length < 2) return;

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const progress = 1 - Math.min(1, (now - p1.t) / maxAge);
      const width = Math.max(1, progress * 16);

      trailCtx.beginPath();
      trailCtx.moveTo(p0.x, p0.y); trailCtx.lineTo(p1.x, p1.y);
      trailCtx.lineCap = 'round'; trailCtx.lineJoin = 'round';
      trailCtx.strokeStyle = handState.trailColor;
      trailCtx.shadowColor = handState.color;
      trailCtx.shadowBlur = 14 * progress;
      trailCtx.lineWidth = width;
      trailCtx.stroke();

      trailCtx.beginPath();
      trailCtx.moveTo(p0.x, p0.y); trailCtx.lineTo(p1.x, p1.y);
      trailCtx.strokeStyle = `rgba(255, 255, 255, ${progress * 0.95})`;
      trailCtx.shadowBlur = 0;
      trailCtx.lineWidth = Math.max(1, width * 0.35);
      trailCtx.stroke();
    }
  });

  if (mouseTrail.length > 1) {
    mouseTrail = mouseTrail.filter(pt => now - pt.t < maxAge);
    for (let i = 1; i < mouseTrail.length; i++) {
      const p0 = mouseTrail[i - 1], p1 = mouseTrail[i];
      const progress = 1 - Math.min(1, (now - p1.t) / maxAge);
      const width = Math.max(1, progress * 15);

      trailCtx.beginPath();
      trailCtx.moveTo(p0.x, p0.y); trailCtx.lineTo(p1.x, p1.y);
      trailCtx.lineCap = 'round';
      trailCtx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      trailCtx.shadowColor = '#ffd700';
      trailCtx.shadowBlur = 12 * progress;
      trailCtx.lineWidth = width;
      trailCtx.stroke();
    }
  }
}

/* ── Main Engine Loop ──────────────────────────────────────── */
let last = 0;
R.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
  if (!R.xr.isPresenting && gyro) applyOri();
  head.setFromMatrixPosition(camera.matrixWorld);
  if (hand) trackHands();
  if (state === 'play') update(dt);
  updateParts(dt); updateAmbient(dt);
  renderBladeTrails();
  R.render(scene, camera);
});

async function cam(f) {
  face = f; if (stream) stream.getTracks().forEach(t => t.stop());
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: f }, width: { ideal: 1280 } }, audio: false });
    v.srcObject = stream; await v.play(); v.style.display = 'block'; v.style.transform = f === 'user' ? 'scaleX(-1)' : ''; return true;
  } catch (e) { v.style.display = 'none'; return false; }
}

/* ── Lifecycle: Begin Game & Return to Hub ─────────────────── */
function begin() {
  ents.forEach(e => scene.remove(e.m)); ents = [];
  lasers.forEach(l => scene.remove(l.mesh)); lasers = [];
  shockwaves.forEach(s => scene.remove(s.mesh)); shockwaves = [];

  score = 0; level = 1; combo = 0; popped = 0; spawnT = 0.8;
  lastLives = 3; lastSliceTime = 0; sliceComboInWindow = 0;
  state = 'play';

  // Toggle Environment Groups
  defenderGroup.visible = (gameMode === 'defender');
  simonGroup.visible = (gameMode === 'simon');
  moleGroup.visible = (gameMode === 'mole');

  // Specific game initial state
  if (gameMode === 'fireflies') {
    lives = 60; // 60 seconds timer
  } else if (gameMode === 'simon') {
    lives = 3;
    startSimonGame();
  } else if (gameMode === 'mole') {
    lives = 3;
    burrows.forEach(b => {
      b.state = 'idle';
      b.moleSlot.clear();
      b.moleMesh = null;
    });
  } else {
    lives = 3;
  }

  $('#menu').hidden = true;
  $('#over').hidden = true;
  $('#hud').hidden = false;
  hud();
}

function toMenu() {
  state = 'hub'; hand = false;
  defenderGroup.visible = false;
  simonGroup.visible = false;
  moleGroup.visible = false;

  ents.forEach(e => scene.remove(e.m)); ents = [];
  lasers.forEach(l => scene.remove(l.mesh)); lasers = [];
  shockwaves.forEach(s => scene.remove(s.mesh)); shockwaves = [];

  hands.forEach(h => {
    h.active = false;
    h.cur.style.display = 'none';
    h.trail = [];
  });
  if (trailCtx && trailCanvas) trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  $('#hud').hidden = true;
  $('#over').hidden = true;
  $('#menu').hidden = true;
  $('#hub').hidden = false;
  $('#flip').hidden = true;
  $('#hover-ring').hidden = true;
  updateHubBests();
}

$('#cm').onclick = async () => {
  hand = false;
  const phone = matchMedia('(pointer:coarse)').matches;
  if (phone && window.DeviceOrientationEvent) {
    try { if (DeviceOrientationEvent.requestPermission && await DeviceOrientationEvent.requestPermission() !== 'granted') throw 0; addEventListener('deviceorientation', onOri); } catch (e) {}
  }
  const ok = await cam(phone ? 'environment' : 'user');
  if (!ok) $('#note').textContent = 'No camera access here, playing on space background.';
  $('#flip').hidden = !ok; begin();
};
$('#flip').onclick = () => cam(face === 'user' ? 'environment' : 'user');
$('#xr').onclick = async () => {
  try {
    sess = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local'], optionalFeatures: ['dom-overlay'], domOverlay: { root: $('#ui') } });
    sess.addEventListener('end', () => { xr = false; sess = null; v.style.display = stream ? 'block' : 'none'; toMenu(); });
    v.style.display = 'none'; await R.xr.setSession(sess); xr = true; begin();
  } catch (e) { $('#note').textContent = 'AR could not start: ' + (e.message || e); }
};
$('#again').onclick = begin;
$('#menuBtn').onclick = () => { if (sess) sess.end(); else toMenu(); };

(async () => {
  let ok = false; try { ok = !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')); } catch (e) {}
  $('#xr').hidden = !ok;
  updateHubBests();
})();

/* ── Dual-Hand Tracking Engine ─────────────────────────────── */
const MP_VERSION = '0.10.14';
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + MP_VERSION + '/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
let hand = false, hl = null, lastVT = -1;

const hands = [
  { id: 0, tag: 'L', cur: $('#c0'), color: '#00f0ff', trailColor: 'rgba(0, 240, 255, 0.9)', x: -1, y: -1, prevX: -1, prevY: -1, active: false, trail: [] },
  { id: 1, tag: 'R', cur: $('#c1'), color: '#ff2079', trailColor: 'rgba(255, 32, 121, 0.9)', x: -1, y: -1, prevX: -1, prevY: -1, active: false, trail: [] },
];

async function initHands() {
  if (hl) return;
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const fs = await FilesetResolver.forVisionTasks(WASM);
  const make = d => HandLandmarker.createFromOptions(fs, {
    baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numHands: 2,
    minHandDetectionConfidence: 0.45, minHandPresenceConfidence: 0.45, minTrackingConfidence: 0.45,
  });
  try { hl = await make('GPU'); } catch (e) { hl = await make('CPU'); }
}

function trackHands() {
  if (!hl || v.readyState < 2 || v.currentTime === lastVT) return;
  lastVT = v.currentTime;
  let r; try { r = hl.detectForVideo(v, performance.now()); } catch (e) { return; }

  const vw = v.videoWidth, vh = v.videoHeight, w = innerWidth, h = innerHeight;
  const s = Math.max(w / vw, h / vh), dw = vw * s, dh = vh * s, ox = (w - dw) / 2, oy = (h - dh) / 2, mir = face === 'user';

  const detected = [];
  if (r && r.landmarks) {
    for (let i = 0; i < r.landmarks.length; i++) {
      const lm = r.landmarks[i];
      if (!lm) continue;
      const tip = lm[8]; // Index Fingertip
      if (!tip) continue;
      const rawX = ox + (mir ? 1 - tip.x : tip.x) * dw;
      const rawY = oy + tip.y * dh;
      detected.push({ rawX, rawY });
    }
  }

  const now = performance.now();
  if (detected.length === 0) {
    hands.forEach(hState => {
      hState.active = false;
      hState.cur.style.display = 'none';
      hState.prevX = -1; hState.prevY = -1;
    });
    return;
  }

  const assignments = [-1, -1];
  if (detected.length === 1) {
    const d = detected[0];
    let bestSlot = 0;
    const dist0 = hands[0].active ? Math.hypot(hands[0].x - d.rawX, hands[0].y - d.rawY) : 99999;
    const dist1 = hands[1].active ? Math.hypot(hands[1].x - d.rawX, hands[1].y - d.rawY) : 99999;
    if (dist1 < dist0 && dist1 < 450) bestSlot = 1;
    else if (dist0 < 450) bestSlot = 0;
    else bestSlot = d.rawX > w / 2 ? 1 : 0;
    assignments[bestSlot] = 0;
  } else if (detected.length >= 2) {
    if (detected[0].rawX < detected[1].rawX) {
      assignments[0] = 0; assignments[1] = 1;
    } else {
      assignments[0] = 1; assignments[1] = 0;
    }
  }

  hands.forEach((handState, slotIdx) => {
    const detIdx = assignments[slotIdx];
    if (detIdx === -1) {
      handState.active = false;
      handState.cur.style.display = 'none';
      handState.prevX = -1; handState.prevY = -1;
      return;
    }

    const d = detected[detIdx];
    if (!handState.active || handState.x < 0) {
      handState.x = d.rawX; handState.y = d.rawY;
    } else {
      handState.x += (d.rawX - handState.x) * 0.72;
      handState.y += (d.rawY - handState.y) * 0.72;
    }
    handState.active = true;

    handState.cur.style.display = 'block';
    handState.cur.style.transform = `translate(${handState.x - 19}px, ${handState.y - 19}px)`;
    handState.trail.push({ x: handState.x, y: handState.y, t: now });

    if (state === 'play') {
      if (handState.prevX >= 0) {
        const moveDist = Math.hypot(handState.x - handState.prevX, handState.y - handState.prevY);
        if (gameMode === 'fruit') {
          const steps = Math.min(5, Math.max(1, Math.ceil(moveDist / 18)));
          for (let s = 1; s <= steps; s++) {
            const sx = handState.prevX + (handState.x - handState.prevX) * (s / steps);
            const sy = handState.prevY + (handState.y - handState.prevY) * (s / steps);
            ray.setFromCamera(new T.Vector2((sx / w) * 2 - 1, -(sy / h) * 2 + 1), camera);
            shoot(true);
          }
        } else if (gameMode === 'ghost') {
          ray.setFromCamera(new T.Vector2((handState.x / w) * 2 - 1, -(handState.y / h) * 2 + 1), camera);
          shoot(true);
        } else if (gameMode === 'defender') {
          ray.setFromCamera(new T.Vector2((handState.x / w) * 2 - 1, -(handState.y / h) * 2 + 1), camera);
          if (now - lastLaserTime[slotIdx] > 180) {
            lastLaserTime[slotIdx] = now;
            const handOrigin = new T.Vector3((handState.x / w) * 2 - 1, -(handState.y / h) * 2 + 1, 0.5).unproject(camera);
            shoot(true, slotIdx, handOrigin);
          }
        } else if (gameMode === 'simon' || gameMode === 'mole') {
          ray.setFromCamera(new T.Vector2((handState.x / w) * 2 - 1, -(handState.y / h) * 2 + 1), camera);
          shoot(true);
        }
      }
    }

    handState.prevX = handState.x;
    handState.prevY = handState.y;
  });
}

$('#hd').onclick = async () => {
  $('#note').textContent = 'Initializing AI Hand Tracking Landmarker...';
  try {
    removeEventListener('deviceorientation', onOri); gyro = false; camera.quaternion.identity();
    if (!await cam('user')) throw new Error('Camera access was denied or no camera was found.');
    await initHands(); hand = true; $('#flip').hidden = false; $('#note').textContent = ''; begin();
  } catch (e) { $('#note').textContent = 'Hand mode could not start: ' + (e.message || e); }
};
