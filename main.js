 /* =========================================================
   ASTRO KHEWAN SHARMA JYOTISH KENDRA — js/main.js  (FIXED)
   3D universe engine (Three.js r128) + app bootstrap.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt));
  const smooth = (t) => t * t * (3 - 2 * t);
  const dampV = (vec, target, lambda, dt) => vec.lerp(target, 1 - Math.exp(-lambda * dt));

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function safeCall(objName, method, arg) {
    try {
      const obj = window[objName];
      if (obj && typeof obj[method] === 'function') return obj[method](arg);
    } catch (err) {
      console.error('[' + objName + '.' + method + ']', err);
    }
  }

  const params = new URLSearchParams(location.search);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobile =
    coarsePointer ||
    /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ---------- Quality tiers ---------- */
  const TIERS = {
    low:    { dpr: 1.25, stars: 3500,  dust: 500,  nebula: 4, tex: 1024, aa: false },
    medium: { dpr: 1.6,  stars: 8000,  dust: 1100, nebula: 6, tex: 2048, aa: true  },
    high:   { dpr: 2,    stars: 15000, dust: 2000, nebula: 8, tex: 4096, aa: true  }
  };

  function detectTier() {
    const forced = params.get('quality');
    if (forced && TIERS[forced]) return forced;
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    if (isMobile) return mem >= 6 && cores >= 8 ? 'medium' : 'low';
    return cores >= 4 ? 'high' : 'medium';
  }

  function webglAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  /* ---------- App state ---------- */
  const state = {
    mode: 'hero',
    selectedId: null,
    focusId: null,
    focusT: 0,
    focusDir: 0,
    focusSnap: false,
    hl: 0,
    hoverId: null,
    running: false
  };

  const SECTION_IDS = ['hero', 'about', 'planets', 'services', 'why', 'booking', 'contact'];
  const POSES = {
    hero:    { pos: [0, 9, 46],    look: [0, 3, 0]  },
    about:   { pos: [-16, 17, 42], look: [4, -1, 0] },
    planets: { pos: [0, 30, 46],   look: [0, -2, 0] },
    far:     { pos: [20, 26, 60],  look: [0, 0, 0]  }
  };
  const CANVAS_OPACITY = { hero: 1, about: 0.5, planets: 1, far: 0.32 };
  const ORBIT_SQUASH = 0.92;

  let THREE_ = null;
  let renderer, scene, camera, canvas;
  let sunLight, starsPoints, dustPoints, nebulaGroup, orbitGroup, planetRoot, glowSprite;
  let quality = 'medium', cfg = TIERS.medium, textureSize = 2048;
  let dprCap = 1.5, dprNow = 1.5, dprMin = 0.8;
  let width = window.innerWidth, height = window.innerHeight;
  let planets = [];
  const planetMap = new Map();
  const sections = {};
  const poseNow = {};
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let rafId = 0, lastRender = 0, elapsed = 0;
  let viewOffsetOn = false;
  const perf = { frames: 0, acc: 0, goodWindows: 0 };
  const starUniformSets = [];
  let rc = null, ndc = null;
  const v = {};

  /* ---------- Loader ---------- */
  const loaderEl = $('#loader');
  const loaderBar = $('#loader-progress');
  let loaderHidden = false;
  const loaderStart = performance.now();

  function setProgress(p) {
    if (loaderBar) loaderBar.style.width = Math.round(clamp(p, 0, 1) * 100) + '%';
  }
  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    const wait = Math.max(0, 900 - (performance.now() - loaderStart));
    setTimeout(function () {
      setProgress(1);
      if (loaderEl) {
        loaderEl.classList.add('is-hidden');
        loaderEl.setAttribute('aria-busy', 'false');
      }
      document.body.classList.add('is-ready');
    }, wait);
  }

  function enableFallback() {
    const fb = $('#webgl-fallback');
    if (fb) fb.hidden = false;
    const cv = $('#universe-canvas');
    if (cv) cv.style.display = 'none';
    const vg = $('.universe-vignette');
    if (vg) vg.style.display = 'none';
  }

  /* ---------- Procedural textures ---------- */
  function makeNebulaTexture(size, hueA, hueB, seed) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const rnd = mulberry32(seed);
    for (let i = 0; i < 28; i++) {
      const x = size * (0.2 + 0.6 * rnd());
      const y = size * (0.2 + 0.6 * rnd());
      const r = size * (0.1 + 0.26 * rnd());
      const hue = rnd() < 0.55 ? hueA : hueB;
      const light = 30 + rnd() * 28;
      const a = 0.07 + rnd() * 0.13;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'hsla(' + hue + ',70%,' + light + '%,' + a + ')');
      grad.addColorStop(1, 'hsla(' + hue + ',70%,' + light + '%,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
    }
    g.globalCompositeOperation = 'destination-in';
    const mask = g.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
    mask.addColorStop(0, 'rgba(255,255,255,1)');
    mask.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = mask;
    g.fillRect(0, 0, size, size);
    const tex = new THREE_.CanvasTexture(c);
    tex.encoding = THREE_.sRGBEncoding;
    return tex;
  }

  function makeGlowTexture() {
    const s = 256;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0.0, 'rgba(255,236,190,0)');
    grad.addColorStop(0.55, 'rgba(255,225,160,0)');
    grad.addColorStop(0.72, 'rgba(236,196,118,0.55)');
    grad.addColorStop(0.85, 'rgba(230,194,122,0.18)');
    grad.addColorStop(1.0, 'rgba(230,194,122,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    const tex = new THREE_.CanvasTexture(c);
    tex.encoding = THREE_.sRGBEncoding;
    return tex;
  }

  /* ---------- Star / dust shader ---------- */
  const POINT_VERT = [
    'attribute float aSize; attribute float aPhase; attribute vec3 aColor;',
    'uniform float uTime; uniform float uPR; uniform float uAtt; uniform float uTwinkle; uniform float uDrift;',
    'varying vec3 vColor; varying float vAlpha;',
    'void main(){',
    '  vColor = aColor;',
    '  vec3 p = position;',
    '  p += vec3(sin(uTime*0.10+aPhase*20.0), cos(uTime*0.12+aPhase*31.0), sin(uTime*0.08+aPhase*11.0)) * uDrift;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime*(0.6+aPhase*1.8) + aPhase*40.0));',
    '  vAlpha = tw;',
    '  float att = mix(1.0, 60.0 / max(-mv.z, 1.0), uAtt);',
    '  gl_PointSize = max(aSize * uPR * att, 0.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  const POINT_FRAG = [
    'precision mediump float;',
    'uniform float uOpacity;',
    'varying vec3 vColor; varying float vAlpha;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  float a = smoothstep(0.5, 0.0, d);',
    '  a = pow(a, 1.6);',
    '  gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);',
    '}'
  ].join('\n');

  function makePointMaterial(opts) {
    const m = new THREE_.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: Math.min(dprNow, 2) },
        uAtt: { value: opts.attenuate ? 1 : 0 },
        uTwinkle: { value: reducedMotion ? 0 : opts.twinkle },
        uDrift: { value: reducedMotion ? 0 : opts.drift },
        uOpacity: { value: opts.opacity }
      },
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE_.AdditiveBlending
    });
    starUniformSets.push(m.uniforms);
    return m;
  }

  /* ---------- Universe objects ---------- */
  function buildStars(count) {
    const rnd = mulberry32(20261125);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = 320 + rnd() * 520;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(th) * s * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = Math.sin(th) * s * r;

      const k = rnd();
      let c;
      if (k < 0.55) c = [1.0, 1.0, 1.0];
      else if (k < 0.78) c = [0.72, 0.82, 1.0];
      else if (k < 0.93) c = [1.0, 0.9, 0.74];
      else c = [0.96, 0.82, 0.5];
      const br = 0.55 + rnd() * 0.45;
      col[i * 3] = c[0] * br; col[i * 3 + 1] = c[1] * br; col[i * 3 + 2] = c[2] * br;

      size[i] = rnd() < 0.04 ? 3.2 + rnd() * 2.0 : 0.9 + rnd() * 1.7;
      phase[i] = rnd();
    }
    const geo = new THREE_.BufferGeometry();
    geo.setAttribute('position', new THREE_.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE_.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE_.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE_.BufferAttribute(phase, 1));
    const pts = new THREE_.Points(geo, makePointMaterial({ attenuate: false, twinkle: 0.55, drift: 0, opacity: 1 }));
    pts.frustumCulled = false;
    pts.renderOrder = -9;
    return pts;
  }

  function buildDust(count) {
    const rnd = mulberry32(777);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 14 + Math.pow(rnd(), 0.65) * 110;
      const th = rnd() * Math.PI * 2;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = (rnd() - 0.5) * 60 * (0.4 + rnd());
      pos[i * 3 + 2] = Math.sin(th) * r;
      const gold = rnd() < 0.5;
      const br = 0.35 + rnd() * 0.5;
      col[i * 3] = (gold ? 1.0 : 0.68) * br;
      col[i * 3 + 1] = (gold ? 0.84 : 0.6) * br;
      col[i * 3 + 2] = (gold ? 0.55 : 1.0) * br;
      size[i] = 1.4 + rnd() * 3.6;
      phase[i] = rnd();
    }
    const geo = new THREE_.BufferGeometry();
    geo.setAttribute('position', new THREE_.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE_.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE_.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE_.BufferAttribute(phase, 1));
    const pts = new THREE_.Points(geo, makePointMaterial({ attenuate: true, twinkle: 0.35, drift: 1.6, opacity: 0.7 }));
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    return pts;
  }

  function buildNebula(count) {
    const grp = new THREE_.Group();
    const rnd = mulberry32(4242);
    const hues = [[270, 225], [285, 40], [215, 265], [260, 320]];
    const texSize = cfg.tex >= 2048 ? 512 : 256;
    for (let i = 0; i < count; i++) {
      const h = hues[i % hues.length];
      const tex = makeNebulaTexture(texSize, h[0], h[1], 100 + i * 17);
      const mat = new THREE_.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.32 + rnd() * 0.22,
        depthWrite: false,
        blending: THREE_.AdditiveBlending,
        rotation: rnd() * Math.PI * 2
      });
      const sp = new THREE_.Sprite(mat);
      const th = (i / count) * Math.PI * 2 + rnd() * 0.8;
      const r = 380 + rnd() * 160;
      sp.position.set(Math.cos(th) * r, (rnd() - 0.5) * 260, Math.sin(th) * r);
      const sc = 300 + rnd() * 380;
      sp.scale.set(sc, sc, 1);
      sp.renderOrder = -10;
      sp.userData.spin = (rnd() - 0.5) * 0.004;
      grp.add(sp);
    }
    return grp;
  }

  function addOrbitRing(radius) {
    const seg = 160;
    const pts = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(new THREE_.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius * ORBIT_SQUASH));
    }
    const geo = new THREE_.BufferGeometry().setFromPoints(pts);
    const mat = new THREE_.LineBasicMaterial({ color: 0xe6c27a, transparent: true, opacity: 0.14, depthWrite: false });
    orbitGroup.add(new THREE_.LineLoop(geo, mat));
  }

  /* ---------- Renderer / scene ---------- */
  function setRendererSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setPixelRatio(dprNow);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    starUniformSets.forEach(function (u) { u.uPR.value = Math.min(dprNow, 2); });
  }

  function initRenderer() {
    canvas = $('#universe-canvas');
    renderer = new THREE_.WebGLRenderer({
      canvas: canvas,
      antialias: cfg.aa,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false
    });
    renderer.setClearColor(0x05030d, 1);
    renderer.outputEncoding = THREE_.sRGBEncoding;
    renderer.toneMapping = THREE_.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    camera = new THREE_.PerspectiveCamera(42, width / height, 0.1, 2500);
    scene = new THREE_.Scene();

    canvas.style.transition = 'opacity 1.2s ease';

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      stopLoop();
      enableFallback();
    });
    canvas.addEventListener('webglcontextrestored', function () {
      const fb = $('#webgl-fallback');
      if (fb) fb.hidden = true;
      canvas.style.display = '';
      startLoop();
    });
  }

  function initLights() {
    sunLight = new THREE_.PointLight(0xfff0d8, 2.2, 0, 2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE_.AmbientLight(0x3a2f6b, 0.38));
    scene.add(new THREE_.HemisphereLight(0x6a5acd, 0x120a2a, 0.28));
  }

  /* ---------- Planets ---------- */
  function placePlanet(p) {
    p.group.position.set(
      Math.cos(p.angle) * p.orbit,
      0,
      Math.sin(p.angle) * p.orbit * ORBIT_SQUASH
    );
  }

  async function buildPlanets() {
    if (!window.PlanetsModule || typeof window.PlanetsModule.create !== 'function') {
      console.warn('PlanetsModule not found. Check js/planets.js');
      return;
    }
    const result = await window.PlanetsModule.create(THREE_, {
      quality: quality,
      textureSize: textureSize,
      maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), quality === 'low' ? 2 : 8),
      isMobile: isMobile,
      onProgress: function (p) { setProgress(0.15 + p * 0.78); }
    });
    planets = (result && result.planets) || [];
    planets.forEach(function (p, i) {
      p.orbit = p.orbit || 0;
      p.angle = typeof p.angle === 'number' ? p.angle : i * 2.39996;
      p.speed = p.speed || 0;
      p._hov = 0;
      p.group.userData.planetId = p.id;
      planetRoot.add(p.group);
      planetMap.set(p.id, p);
      placePlanet(p);
      if (p.orbit > 0) addOrbitRing(p.orbit);
    });
  }

  function initPicking() {
    rc = new THREE_.Raycaster();
    ndc = new THREE_.Vector2();
    const stage = $('#planet-stage');
    if (!stage) return;
    stage.style.touchAction = 'pan-y';

    let down = null;
    stage.addEventListener('pointerdown', function (e) {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    stage.addEventListener('pointercancel', function () { down = null; });
    stage.addEventListener('pointerup', function (e) {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dur = performance.now() - down.t;
      down = null;
      if (moved > 10 || dur > 700) return;
      const id = pickAt(e.clientX, e.clientY);
      if (id) selectPlanet(id);
      else if (state.selectedId) clearSelection();
    });

    let hoverQueued = false, hx = 0, hy = 0;
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      hx = e.clientX; hy = e.clientY;
      if (hoverQueued) return;
      hoverQueued = true;
      requestAnimationFrame(function () {
        hoverQueued = false;
        const id = pickAt(hx, hy);
        state.hoverId = id;
        stage.style.cursor = id ? 'pointer' : '';
      });
    });
    stage.addEventListener('pointerleave', function () {
      state.hoverId = null;
      stage.style.cursor = '';
    });
  }

  function pickAt(clientX, clientY) {
    if (!planets.length || !rc) return null;
    ndc.x = (clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(clientY / window.innerHeight) * 2 + 1;
    rc.setFromCamera(ndc, camera);
    const meshes = [];
    planets.forEach(function (p) { if (p.pickMesh) meshes.push(p.pickMesh); });
    const hits = rc.intersectObjects(meshes, false);
    return hits.length ? hits[0].object.userData.planetId : null;
  }

  function selectPlanet(id) {
    if (window.PlanetsModule && window.PlanetsModule.openPanel) window.PlanetsModule.openPanel(id);
    const p = planetMap.get(id);
    if (!p) return;
    if (state.focusT < 0.05) state.focusSnap = true;
    state.selectedId = id;
    state.focusId = id;
    state.focusDir = 1;
  }

  function clearSelection() {
    if (window.PlanetsModule && window.PlanetsModule.closePanel) window.PlanetsModule.closePanel();
    state.selectedId = null;
    state.focusDir = -1;
  }

  /* ---------- Scroll -> camera mode ---------- */
  let scrollQueued = false;
  function detectMode() {
    const mid = window.innerHeight * 0.5;
    for (let i = 0; i < SECTION_IDS.length; i++) {
      const id = SECTION_IDS[i];
      const el = sections[id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        return id === 'hero' || id === 'about' || id === 'planets' ? id : 'far';
      }
    }
    return 'far';
  }
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      state.mode = detectMode();
      if (canvas) canvas.style.opacity = CANVAS_OPACITY[state.mode];
      if (state.mode !== 'planets' && (state.selectedId || state.focusDir > 0)) clearSelection();
    });
  }

  /* ---------- Camera ---------- */
  function initCameraVectors() {
    v.P = new THREE_.Vector3();
    v.out = new THREE_.Vector3();
    v.side = new THREE_.Vector3();
    v.up = new THREE_.Vector3(0, 1, 0);
    v.secPos = new THREE_.Vector3();
    v.secLook = new THREE_.Vector3();
    v.tPos = new THREE_.Vector3();
    v.tLook = new THREE_.Vector3();
    v.fPos = new THREE_.Vector3();
    v.fLook = new THREE_.Vector3();
    v.camPos = new THREE_.Vector3();
    v.camLook = new THREE_.Vector3();
    Object.keys(POSES).forEach(function (k) {
      poseNow[k] = {
        pos: new THREE_.Vector3().fromArray(POSES[k].pos),
        look: new THREE_.Vector3().fromArray(POSES[k].look)
      };
    });
    poseNow.cur = {
      pos: new THREE_.Vector3().fromArray(POSES.hero.pos),
      look: new THREE_.Vector3().fromArray(POSES.hero.look)
    };
  }

  function focusTarget(p, outPos, outLook) {
    p.group.getWorldPosition(v.P);
    v.out.set(v.P.x, 0, v.P.z);
    if (v.out.lengthSq() < 1e-4) v.out.set(0, 0, 1);
    v.out.normalize();
    v.side.crossVectors(v.up, v.out).normalize();
    let d = Math.max((p.radius || 1) * 4.4, 3.4);
    if (camera.aspect < 1) d *= 1 + (1 - camera.aspect) * 0.9;
    outPos.copy(v.P)
      .addScaledVector(v.out, -d * 0.82)
      .addScaledVector(v.side, d * 0.5)
      .addScaledVector(v.up, d * 0.22);
    outLook.copy(v.P);
  }

  function updateCamera(dt) {
    if (state.focusDir !== 0) {
      state.focusT = clamp(state.focusT + state.focusDir * dt / 1.8, 0, 1);
      if (state.focusDir < 0 && state.focusT <= 0) {
        state.focusDir = 0;
        state.focusId = null;
      }
      if (state.focusDir > 0 && state.focusT >= 1) state.focusDir = 0;
    }
    const e = smooth(state.focusT);

    const tgt = poseNow[state.mode];
    dampV(poseNow.cur.pos, tgt.pos, 1.6, dt);
    dampV(poseNow.cur.look, tgt.look, 1.6, dt);

    const introK = smooth(clamp(elapsed / 3.2, 0, 1));
    const fit = camera.aspect < 1.3 ? 1 + (1.3 - camera.aspect) * 0.9 : 1;
    v.secLook.copy(poseNow.cur.look);
    v.secPos.copy(poseNow.cur.pos).sub(v.secLook)
      .multiplyScalar(fit * (1 + (1 - introK) * 0.8))
      .add(v.secLook);

    if (state.focusId) {
      const fp = planetMap.get(state.focusId);
      if (fp) {
        focusTarget(fp, v.tPos, v.tLook);
        if (state.focusSnap) {
          v.fPos.copy(v.tPos); v.fLook.copy(v.tLook);
          state.focusSnap = false;
        } else {
          dampV(v.fPos, v.tPos, 6, dt);
          dampV(v.fLook, v.tLook, 6, dt);
        }
      }
    }

    v.camPos.copy(v.secPos);
    v.camLook.copy(v.secLook);
    if (e > 0 && state.focusId) {
      v.camPos.lerp(v.fPos, e);
      v.camLook.lerp(v.fLook, e);
    }

    if (!reducedMotion) {
      pointer.sx = damp(pointer.sx, pointer.x, 2, dt);
      pointer.sy = damp(pointer.sy, pointer.y, 2, dt);
      const k = 1 - e;
      v.camPos.x += pointer.sx * 1.6 * k;
      v.camPos.y += (pointer.sy * 1.0 + Math.sin(elapsed * 0.2) * 0.25) * k;
    }

    camera.position.copy(v.camPos);
    camera.lookAt(v.camLook);

    if (e > 0.001) {
      const bottomSheet = window.matchMedia('(max-width: 900px)').matches;
      camera.setViewOffset(
        width, height,
        bottomSheet ? 0 : width * 0.13 * e,
        bottomSheet ? height * 0.17 * e : 0,
        width, height
      );
      viewOffsetOn = true;
    } else if (viewOffsetOn) {
      camera.clearViewOffset();
      viewOffsetOn = false;
    }
  }

  /* ---------- Main loop ---------- */
  function updateAdaptiveQuality(frameMs) {
    perf.frames++;
    perf.acc += frameMs;
    if (perf.frames < 90) return;
    const avg = perf.acc / perf.frames;
    perf.frames = 0; perf.acc = 0;
    if (avg > 26 && dprNow > dprMin) {
      dprNow = Math.max(dprMin, dprNow * 0.85);
      perf.goodWindows = 0;
      setRendererSize();
    } else if (avg < 15 && dprNow < dprCap) {
      perf.goodWindows++;
      if (perf.goodWindows >= 3) {
        dprNow = Math.min(dprCap, dprNow * 1.1);
        perf.goodWindows = 0;
        setRendererSize();
      }
    } else {
      perf.goodWindows = 0;
    }
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (state.mode === 'far' && !state.selectedId && now - lastRender < 33) return;
    const dt = Math.min((now - (lastRender || now)) / 1000, 0.05);
    const frameMs = now - (lastRender || now);
    lastRender = now;
    elapsed += dt;

    const e = smooth(state.focusT);
    const orbitScale = (reducedMotion ? 0.3 : 1) * lerp(1, 0.1, e);

    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      if (p.orbit > 0) {
        p.angle += p.speed * dt * orbitScale;
        placePlanet(p);
      }
      const isSel = state.selectedId === p.id;
      p._hov = damp(p._hov, state.hoverId === p.id && !isSel ? 1 : 0, 8, dt);
      if (typeof p.setHighlight === 'function') {
        p.setHighlight(Math.max(p._hov * 0.4, isSel ? state.hl : 0));
      }
      if (typeof p.update === 'function') p.update(dt, elapsed, camera);
    }

    state.hl = damp(state.hl, state.selectedId ? 1 : 0, 4, dt);
    const sel = state.selectedId && planetMap.get(state.selectedId);
    if (sel && state.hl > 0.01) {
      sel.group.getWorldPosition(glowSprite.position);
      const s = (sel.radius || 1) * (4.6 + Math.sin(elapsed * 2) * 0.18);
      glowSprite.scale.set(s, s, 1);
      glowSprite.material.opacity = state.hl * 0.65;
      glowSprite.visible = true;
    } else {
      glowSprite.visible = false;
    }

    for (let i = 0; i < starUniformSets.length; i++) starUniformSets[i].uTime.value = elapsed;
    if (!reducedMotion) {
      starsPoints.rotation.y += dt * 0.004;
      dustPoints.rotation.y += dt * 0.006;
    }
    nebulaGroup.children.forEach(function (sp) { sp.material.rotation += sp.userData.spin * dt; });

    updateCamera(dt);
    renderer.render(scene, camera);
    updateAdaptiveQuality(frameMs);
  }

  function startLoop() {
    if (state.running || !renderer) return;
    state.running = true;
    lastRender = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stopLoop() {
    state.running = false;
    cancelAnimationFrame(rafId);
  }

  /* ---------- Cleanup ---------- */
  function disposeObject(root) {
    root.traverse(function (n) {
      if (n.geometry) n.geometry.dispose();
      const m = n.material;
      if (!m) return;
      (Array.isArray(m) ? m : [m]).forEach(function (mat) {
        Object.keys(mat).forEach(function (k) {
          const val = mat[k];
          if (val && val.isTexture) val.dispose();
        });
        if (mat.uniforms) {
          Object.keys(mat.uniforms).forEach(function (k) {
            const val = mat.uniforms[k].value;
            if (val && val.isTexture) val.dispose();
          });
        }
        mat.dispose();
      });
    });
  }

  function destroy() {
    stopLoop();
    planets.forEach(function (p) { try { if (p.dispose) p.dispose(); } catch (e) {} });
    if (scene) disposeObject(scene);
    if (renderer) {
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    }
    planets = [];
    planetMap.clear();
  }

  /* ---------- Universe init ---------- */
  async function initUniverse() {
    if (typeof window.THREE === 'undefined' || !webglAvailable()) {
      enableFallback();
      hideLoader();
      return;
    }
    THREE_ = window.THREE;

    quality = detectTier();
    cfg = TIERS[quality];
    textureSize = cfg.tex;
    if (params.get('ultra') === '1' && !isMobile) {
      const tmp = document.createElement('canvas');
      const gl = tmp.getContext('webgl2') || tmp.getContext('webgl');
      if (gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 8192) textureSize = 8192;
    }
    dprCap = Math.min(window.devicePixelRatio || 1, cfg.dpr);
    dprNow = dprCap;
    dprMin = isMobile ? 0.8 : 1;

    initCameraVectors();
    initRenderer();
    setRendererSize();
    initLights();
    setProgress(0.08);

    starsPoints = buildStars(cfg.stars);
    dustPoints = buildDust(cfg.dust);
    nebulaGroup = buildNebula(cfg.nebula);
    orbitGroup = new THREE_.Group();
    planetRoot = new THREE_.Group();
    scene.add(nebulaGroup, starsPoints, dustPoints, orbitGroup, planetRoot);

    glowSprite = new THREE_.Sprite(new THREE_.SpriteMaterial({
      map: makeGlowTexture(),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE_.AdditiveBlending,
      opacity: 0
    }));
    glowSprite.visible = false;
    glowSprite.renderOrder = 20;
    scene.add(glowSprite);
    setProgress(0.15);

    initPicking();
    await buildPlanets();

    renderer.render(scene, camera);
    elapsed = 0;
    state.mode = detectMode();
    canvas.style.opacity = CANVAS_OPACITY[state.mode];
    startLoop();
    hideLoader();
  }

  /* ---------- Global listeners ---------- */
  function bindGlobalEvents() {
    SECTION_IDS.forEach(function (id) { sections[id] = document.getElementById(id); });
    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });

    let resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!renderer) return;
        const w = window.innerWidth, h = window.innerHeight;
        if (isMobile && w === width && Math.abs(h - height) < 160) return;
        setRendererSize();
        onScroll();
      }, 150);
    });

    document.addEventListener('visibilitychange', function () {
      if (!renderer) return;
      if (document.hidden) stopLoop(); else startLoop();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.selectedId) clearSelection();
    });

    window.addEventListener('pagehide', destroy);
  }

  /* ---------- Boot ---------- */
  function boot() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    bindGlobalEvents();
    state.mode = detectMode();

    safeCall('I18N', 'init');
    safeCall('Animations', 'init');
    safeCall('Booking', 'init');
    safeCall('PlanetsModule', 'initUI', { onSelect: selectPlanet, onClose: clearSelection });

    initUniverse().catch(function (err) {
      console.error('[Universe]', err);
      enableFallback();
      hideLoader();
    });

    setTimeout(hideLoader, 20000);
  }

  window.AstroUniverse = {
    selectPlanet: selectPlanet,
    clearSelection: clearSelection,
    getQuality: function () { return { tier: quality, textureSize: textureSize, dpr: dprNow }; },
    destroy: destroy
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();