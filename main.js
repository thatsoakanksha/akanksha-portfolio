import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 1300);
});

const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcbe7ff, 25, 70);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(-4, 5.5, 13);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 22;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2.05;
controls.enablePan = false;
controls.target.set(2.2, 2, 0);

const sun = new THREE.DirectionalLight(0xffffff, 1.05);
sun.position.set(10, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;   sun.shadow.camera.bottom = -20;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
scene.add(new THREE.HemisphereLight(0xbde0ff, 0x4a7a2a, 0.4));

const world = new THREE.Group();
scene.add(world);

function makeBlockMaterial(color, opts = {}) {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 16, 16);
  const noise = opts.noise ?? 18;
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() * 16) | 0, y = (Math.random() * 16) | 0;
    const s = (Math.random() * noise * 2 - noise) | 0;
    ctx.fillStyle = shade(color, s);
    ctx.fillRect(x, y, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  return new THREE.MeshLambertMaterial({ map: t });
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = ((n >> 16) & 255) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const matGrassTop = makeBlockMaterial('#7cba3d');
const matGrassSide = makeBlockMaterial('#8a5a3b', { noise: 22 });
const matDirt = makeBlockMaterial('#7d4f2e');

function grassBlock(x, y, z) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mats = [matGrassSide, matGrassSide, matGrassTop, matDirt, matGrassSide, matGrassSide];
  const m = new THREE.Mesh(geo, mats);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

const SIZE = 11;
for (let x = -SIZE; x <= SIZE; x++) {
  for (let z = -SIZE; z <= SIZE; z++) {
    const dist = Math.sqrt(x * x + z * z);
    if (dist > SIZE) continue;
    const h = Math.round(Math.sin(x * 0.4) * 0.6 + Math.cos(z * 0.5) * 0.5);
    world.add(grassBlock(x, h, z));
    for (let y = h - 1; y >= h - 2; y--) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matDirt);
      m.position.set(x, y, z);
      m.receiveShadow = true; world.add(m);
    }
  }
}

function tree(px, pz) {
  const trunkMat = makeBlockMaterial('#6b3f1e');
  const leafMat = makeBlockMaterial('#3aa83a');
  for (let i = 1; i <= 4; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), trunkMat);
    t.position.set(px, i, pz);
    t.castShadow = true; world.add(t);
  }
  for (let x = -2; x <= 2; x++)
    for (let z = -2; z <= 2; z++)
      for (let y = 4; y <= 6; y++) {
        if (Math.abs(x) === 2 && Math.abs(z) === 2 && y > 5) continue;
        if (y === 6 && (Math.abs(x) === 2 || Math.abs(z) === 2)) continue;
        const l = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), leafMat);
        l.position.set(px + x, y, pz + z);
        l.castShadow = true; world.add(l);
      }
}
tree(-7, -5);
tree(8, -3);
tree(-6, 7);

const character = new THREE.Group();
character.position.set(2.2, 1.5, 0);
scene.add(character);

const SKINS = {
  default: {
    skin: '#f1c1a4', hair: '#3b2412',
    top: '#ff7eb6', topAccent: '#e75ca0',
    bottom: '#2c3e80', shoes: '#3b2412',
    accessory: null,
    label: 'Akanksha — Creative Mode'
  },
  pwc: {
    skin: '#f1c1a4', hair: '#3b2412',
    top: '#1d1d1d', topAccent: '#ff7900',
    bottom: '#101010', shoes: '#000000',
    accessory: 'briefcase',
    label: 'PwC Mode — Digital Strategy Consultant'
  },
  isb: {
    skin: '#f1c1a4', hair: '#2a1a0d',
    top: '#0a2d8f', topAccent: '#ffffff',
    bottom: '#1a1a1a', shoes: '#3b2412',
    accessory: 'laptop',
    label: 'ISB Mode — Sr. Brand & Strategic Consultant'
  },
  brunel: {
    skin: '#f1c1a4', hair: '#3b2412',
    top: '#1f2a55', topAccent: '#ffd24a',
    bottom: '#000000', shoes: '#1a1a1a',
    accessory: 'cap',
    label: 'Brunel Mode — MBA Candidate, London'
  },
  elen: {
    skin: '#f1c1a4', hair: '#3b2412',
    top: '#f5cfd9', topAccent: '#d4577d',
    bottom: '#3a1a25', shoes: '#2a1015',
    accessory: 'lipstick',
    label: 'Elen Rivas Mode — Digital Marketing, London'
  }
};

let parts = {};
let accessoryGroup = new THREE.Group();
character.add(accessoryGroup);

function box(w, h, d, color) {
  const mat = makeBlockMaterial(color);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  return m;
}

function buildCharacter(skin) {
  for (const k in parts) character.remove(parts[k]);
  parts = {};
  while (accessoryGroup.children.length) accessoryGroup.remove(accessoryGroup.children[0]);

  parts.head = box(1, 1, 1, skin.skin);
  parts.head.position.set(0, 2.1, 0);
  character.add(parts.head);

  const eyeL = box(0.16, 0.16, 0.05, '#1a1a1a'); eyeL.position.set(-0.22, 2.18, 0.52);
  const eyeR = box(0.16, 0.16, 0.05, '#1a1a1a'); eyeR.position.set(0.22, 2.18, 0.52);
  const mouth = box(0.32, 0.06, 0.05, '#7a2030'); mouth.position.set(0, 1.92, 0.52);
  parts.eyeL = eyeL; parts.eyeR = eyeR; parts.mouth = mouth;
  character.add(eyeL, eyeR, mouth);

  parts.hairTop = box(1.04, 0.18, 1.04, skin.hair);
  parts.hairTop.position.set(0, 2.65, 0);
  parts.hairBack = box(1.04, 0.9, 0.18, skin.hair);
  parts.hairBack.position.set(0, 2.1, -0.5);
  parts.hairPony = box(0.3, 0.9, 0.3, skin.hair);
  parts.hairPony.position.set(0, 1.7, -0.65);
  character.add(parts.hairTop, parts.hairBack, parts.hairPony);

  parts.torso = box(1.05, 1.4, 0.6, skin.top);
  parts.torso.position.set(0, 0.95, 0);
  character.add(parts.torso);

  parts.accent = box(1.07, 0.2, 0.62, skin.topAccent);
  parts.accent.position.set(0, 1.45, 0);
  character.add(parts.accent);

  parts.armL = box(0.4, 1.4, 0.4, skin.top);
  parts.armL.position.set(-0.72, 0.95, 0);
  parts.armR = box(0.4, 1.4, 0.4, skin.top);
  parts.armR.position.set(0.72, 0.95, 0);
  character.add(parts.armL, parts.armR);

  parts.handL = box(0.4, 0.3, 0.4, skin.skin); parts.handL.position.set(-0.72, 0.15, 0);
  parts.handR = box(0.4, 0.3, 0.4, skin.skin); parts.handR.position.set(0.72, 0.15, 0);
  character.add(parts.handL, parts.handR);

  parts.legL = box(0.5, 1.3, 0.5, skin.bottom);
  parts.legL.position.set(-0.26, -0.4, 0);
  parts.legR = box(0.5, 1.3, 0.5, skin.bottom);
  parts.legR.position.set(0.26, -0.4, 0);
  character.add(parts.legL, parts.legR);

  parts.shoeL = box(0.52, 0.2, 0.7, skin.shoes); parts.shoeL.position.set(-0.26, -1.15, 0.1);
  parts.shoeR = box(0.52, 0.2, 0.7, skin.shoes); parts.shoeR.position.set(0.26, -1.15, 0.1);
  character.add(parts.shoeL, parts.shoeR);

  if (skin.accessory === 'cap') {
    const cap = box(1.2, 0.1, 1.2, '#000000'); cap.position.set(0, 2.78, 0);
    const top = box(0.4, 0.2, 0.4, '#000000'); top.position.set(0, 2.93, 0);
    const tassel = box(0.08, 0.5, 0.08, skin.topAccent); tassel.position.set(0.35, 2.7, 0);
    accessoryGroup.add(cap, top, tassel);
  } else if (skin.accessory === 'briefcase') {
    const cs = box(0.6, 0.5, 0.18, '#5b3a1a'); cs.position.set(0.95, 0.0, 0.0);
    const handle = box(0.35, 0.08, 0.06, '#2a1a08'); handle.position.set(0.95, 0.32, 0);
    accessoryGroup.add(cs, handle);
  } else if (skin.accessory === 'laptop') {
    // ISB - silver laptop in hand
    const base = box(0.7, 0.05, 0.55, '#c0c0c0'); base.position.set(0.95, 0.05, 0);
    const lid = box(0.7, 0.5, 0.05, '#c0c0c0'); lid.position.set(0.95, 0.32, -0.25); lid.rotation.x = -0.2;
    const screen = box(0.55, 0.4, 0.02, '#0a2d8f'); screen.position.set(0.95, 0.32, -0.22); screen.rotation.x = -0.2;
    accessoryGroup.add(base, lid, screen);
  } else if (skin.accessory === 'lipstick') {
    // Elen Rivas - lipstick tube
    const tube = box(0.16, 0.35, 0.16, '#d4577d'); tube.position.set(0.95, 0.25, 0);
    const cap2 = box(0.18, 0.18, 0.18, '#3a1a25'); cap2.position.set(0.95, 0.55, 0);
    const stick = box(0.1, 0.15, 0.1, '#a73355'); stick.position.set(0.95, 0.7, 0);
    // small floating heart
    const heart = box(0.18, 0.18, 0.05, '#ff5577'); heart.position.set(-0.95, 1.5, 0.3);
    accessoryGroup.add(tube, cap2, stick, heart);
  }

  character.scale.set(0.01, 0.01, 0.01);
}

let currentSkin = 'default';
buildCharacter(SKINS.default);

function setSkin(name) {
  if (!SKINS[name]) return;
  currentSkin = name;
  buildCharacter(SKINS[name]);
  showToast(SKINS[name].label);

  document.querySelectorAll('[data-skin]').forEach(el => {
    el.classList.toggle('active', el.dataset.skin === name);
  });
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  character.scale.lerp(new THREE.Vector3(1, 1, 1), 0.18);

  character.position.y = 1.5 + Math.sin(t * 1.8) * 0.08;
  character.position.x = 2.2;
  character.rotation.y = Math.sin(t * 0.4) * 0.3;

  if (parts.armL) parts.armL.rotation.x = Math.sin(t * 1.8) * 0.25;
  if (parts.armR) parts.armR.rotation.x = -Math.sin(t * 1.8) * 0.25;
  if (parts.hairPony) parts.hairPony.rotation.x = Math.sin(t * 1.8) * 0.2;

  controls.update();
  renderer.render(scene, camera);
}
animate();

function showToast(text) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = '✨ ' + text;
  t.classList.add('show');
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(() => t.classList.remove('show'), 2400);
}

/* Skin pills (in hero) — morph only, never scroll */
document.querySelectorAll('.skin-pill').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const s = btn.dataset.skin;
    if (s) setSkin(s);
  });
});

/* Quest cards — morph hero, scroll up so user SEES it, then scroll back */
document.querySelectorAll('.quest-block').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const s = btn.dataset.skin;
    if (!s) return;

    // remember current scroll position
    const returnY = window.scrollY;
    const hero = document.getElementById('hero');
    const heroVisible = hero.getBoundingClientRect().bottom > 100;

    // morph immediately
    setSkin(s);

    // if hero isn't on screen, fly up to it briefly, then back
    if (!heroVisible) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: returnY, behavior: 'smooth' });
      }, 2400);
    }
  });
});

/* Tooltip for hotbar */
const tip = document.getElementById('tooltip');
document.querySelectorAll('.slot').forEach(s => {
  s.addEventListener('mouseenter', () => {
    tip.innerHTML = s.dataset.tip || '';
    tip.classList.add('show');
  });
  s.addEventListener('mousemove', e => {
    tip.style.left = e.clientX + 'px';
    tip.style.top = e.clientY + 'px';
  });
  s.addEventListener('mouseleave', () => tip.classList.remove('show'));
});

/* Smooth scroll for nav + Start Adventure button */
document.querySelectorAll('.hud-nav a, a[data-scroll], a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href?.startsWith('#') && href.length > 1) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* Reveal-on-scroll */
const io = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (en.isIntersecting) {
      en.target.style.opacity = '1';
      en.target.style.transform = 'translateY(0)';
      io.unobserve(en.target);
    }
  }
}, { threshold: 0.08 });

document.querySelectorAll('.panel, .quest-block, .ach, .realm, .dirt-card, .stats-card, .extra-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .8s ease, transform .8s ease';
  io.observe(el);
});

/* Spacebar cycles skins */
const order = ['default', 'pwc', 'isb', 'brunel', 'elen'];
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    const i = order.indexOf(currentSkin);
    setSkin(order[(i + 1) % order.length]);
  }
});
