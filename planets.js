/* =========================================================
   ASTRO KHEWAN SHARMA JYOTISH KENDRA — js/planets.js
   Nine Navagrahas: data, procedural GPU planets, UI panel.

   Public API (used by main.js):
     PlanetsModule.create(THREE, opts) -> Promise<{planets}>
     PlanetsModule.initUI({onSelect, onClose})
     PlanetsModule.openPanel(id) / closePanel()
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     1. EDITABLE INFORMATION
     Traditional information. Please verify the mantras and
     deities with your own pandit / classical texts and edit
     here. Nothing else needs to change.
  ======================================================= */
  const PLANET_DATA = [
    {
      id: 'surya', order: 1,
      name: { hi: 'सूर्य', sa: 'Surya', en: 'Sun' },
      day: { hi: 'रविवार', en: 'Sunday' },
      deity: { hi: 'भगवान सूर्य नारायण', en: 'Lord Surya Narayan' },
      mantra: { dev: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', roman: 'Om Hrāṃ Hrīṃ Hrauṃ Saḥ Sūryāya Namaḥ' },
      significance: {
        hi: 'सूर्य आत्मा, जीवन-शक्ति, आत्मविश्वास, नेतृत्व और पिता का कारक माना जाता है।',
        en: 'Surya is the significator of the soul (atma), vitality, confidence, authority and the father.'
      }
    },
    {
      id: 'chandra', order: 2,
      name: { hi: 'चंद्र', sa: 'Chandra', en: 'Moon' },
      day: { hi: 'सोमवार', en: 'Monday' },
      deity: { hi: 'भगवान शिव (चंद्रशेखर) एवं माता पार्वती', en: 'Lord Shiva (Chandrashekhar) and Goddess Parvati' },
      mantra: { dev: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः', roman: 'Om Śrāṃ Śrīṃ Śrauṃ Saḥ Candramase Namaḥ' },
      significance: {
        hi: 'चंद्र मन, भावनाओं, माता, पोषण और मानसिक शांति का कारक माना जाता है।',
        en: 'Chandra governs the mind (manas), emotions, the mother, nurturing and mental peace.'
      }
    },
    {
      id: 'mangal', order: 3,
      name: { hi: 'मंगल', sa: 'Mangal', en: 'Mars' },
      day: { hi: 'मंगलवार', en: 'Tuesday' },
      deity: { hi: 'श्री हनुमान जी एवं भगवान कार्तिकेय', en: 'Shri Hanuman Ji and Lord Kartikeya' },
      mantra: { dev: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः', roman: 'Om Krāṃ Krīṃ Krauṃ Saḥ Bhaumāya Namaḥ' },
      significance: {
        hi: 'मंगल ऊर्जा, साहस, पराक्रम, भाई-बहन और भूमि का कारक माना जाता है।',
        en: 'Mangal signifies energy, courage, strength, siblings and land.'
      }
    },
    {
      id: 'budh', order: 4,
      name: { hi: 'बुध', sa: 'Budh', en: 'Mercury' },
      day: { hi: 'बुधवार', en: 'Wednesday' },
      deity: { hi: 'भगवान विष्णु (नारायण)', en: 'Lord Vishnu (Narayan)' },
      mantra: { dev: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', roman: 'Om Brāṃ Brīṃ Brauṃ Saḥ Budhāya Namaḥ' },
      significance: {
        hi: 'बुध बुद्धि, वाणी, संवाद, शिक्षा और व्यापार का कारक माना जाता है।',
        en: 'Budh signifies intellect, speech, communication, learning and trade.'
      }
    },
    {
      id: 'brihaspati', order: 5,
      name: { hi: 'बृहस्पति', sa: 'Brihaspati', en: 'Jupiter' },
      day: { hi: 'गुरुवार', en: 'Thursday' },
      deity: { hi: 'देवगुरु बृहस्पति एवं भगवान विष्णु', en: 'Devaguru Brihaspati and Lord Vishnu' },
      mantra: { dev: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', roman: 'Om Grāṃ Grīṃ Grauṃ Saḥ Gurave Namaḥ' },
      significance: {
        hi: 'बृहस्पति (गुरु) देवताओं के गुरु हैं और ज्ञान, विवेक, धर्म, संतान तथा सौभाग्य के कारक माने जाते हैं।',
        en: 'Brihaspati (Guru) is the teacher of the devas, signifying wisdom, knowledge, dharma, children and good fortune.'
      }
    },
    {
      id: 'shukra', order: 6,
      name: { hi: 'शुक्र', sa: 'Shukra', en: 'Venus' },
      day: { hi: 'शुक्रवार', en: 'Friday' },
      deity: { hi: 'माता महालक्ष्मी', en: 'Goddess Mahalakshmi' },
      mantra: { dev: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', roman: 'Om Drāṃ Drīṃ Drauṃ Saḥ Śukrāya Namaḥ' },
      significance: {
        hi: 'शुक्र प्रेम, सौंदर्य, कला, सुख-सुविधा और दांपत्य जीवन का कारक माना जाता है।',
        en: 'Shukra signifies love, beauty, art, comfort, luxury and married life.'
      }
    },
    {
      id: 'shani', order: 7,
      name: { hi: 'शनि', sa: 'Shani', en: 'Saturn' },
      day: { hi: 'शनिवार', en: 'Saturday' },
      deity: { hi: 'शनि देव, श्री हनुमान जी एवं भगवान शिव', en: 'Shani Dev, Shri Hanuman Ji and Lord Shiva' },
      mantra: { dev: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', roman: 'Om Prāṃ Prīṃ Prauṃ Saḥ Śanaiścarāya Namaḥ' },
      significance: {
        hi: 'शनि कर्म, अनुशासन, धैर्य, न्याय और परिश्रम का कारक माना जाता है; यह निरंतर प्रयास का फल देता है।',
        en: 'Shani is the planet of karma, discipline, patience, justice and perseverance, rewarding steady effort.'
      }
    },
    {
      id: 'rahu', order: 8, node: true,
      name: { hi: 'राहु', sa: 'Rahu', en: 'North Lunar Node' },
      day: null,
      deity: { hi: 'माता दुर्गा (परंपरागत उपासना)', en: 'Goddess Durga (traditional worship)' },
      mantra: { dev: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः', roman: 'Om Bhrāṃ Bhrīṃ Bhrauṃ Saḥ Rāhave Namaḥ' },
      significance: {
        hi: 'राहु एक छाया बिंदु (चंद्र का उत्तरी पात) है, कोई भौतिक ग्रह नहीं। यह सांसारिक इच्छा, महत्वाकांक्षा, अपरंपरागत मार्ग और माया का कारक माना जाता है।',
        en: 'Rahu is a shadow point (the north lunar node), not a physical planet. It signifies worldly desire, ambition, unconventional paths and illusion (maya).'
      }
    },
    {
      id: 'ketu', order: 9, node: true,
      name: { hi: 'केतु', sa: 'Ketu', en: 'South Lunar Node' },
      day: null,
      deity: { hi: 'भगवान गणेश (परंपरागत उपासना)', en: 'Lord Ganesha (traditional worship)' },
      mantra: { dev: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः', roman: 'Om Srāṃ Srīṃ Srauṃ Saḥ Ketave Namaḥ' },
      significance: {
        hi: 'केतु चंद्र का दक्षिणी पात है, एक छाया बिंदु। यह वैराग्य, आध्यात्मिक अंतर्दृष्टि, पूर्वजन्म के संस्कार और मोक्ष का कारक माना जाता है।',
        en: 'Ketu is the south lunar node, a shadow point. It signifies detachment, spiritual insight, past-life tendencies and liberation (moksha).'
      }
    }
  ];

  const NODE_NOTE = {
    hi: 'राहु और केतु वे गणितीय बिंदु हैं जहाँ चंद्रमा का पथ सूर्य के आभासी पथ (क्रांतिवृत्त) को काटता है। यह आकृति केवल प्रतीकात्मक और सम्मानपूर्वक बनाई गई है।',
    en: "Rahu and Ketu are the mathematical points where the Moon's path crosses the Sun's apparent path (ecliptic). This orb is a respectful symbolic depiction."
  };

  /* Optional real textures. If you own high-resolution images, put them in
     assets/textures/ and set enabled:true. File names below. Missing files
     silently fall back to the procedural planet. */
  const EXTERNAL_TEXTURES = {
    enabled: false,
    path: 'assets/textures/',
    files: {
      surya: 'sun.jpg', chandra: 'moon.jpg', mangal: 'mars.jpg', budh: 'mercury.jpg',
      brihaspati: 'jupiter.jpg', shukra: 'venus.jpg', shani: 'saturn.jpg',
      shaniRing: 'saturn-ring.png' /* RGBA strip: inner edge at left, outer at right */
    }
  };

  /* Visual configuration (type: 0 sun, 1 moon, 2 mars, 3 mercury,
     4 jupiter, 5 venus, 6 saturn, 7 rahu, 8 ketu) */
  const VISUAL = {
    surya:      { type: 0, size: 3.6, radius: 3.8, orbit: 0,    angle: 0,   speed: 0,      spin: 0.04,  tilt: 7,
                  atmo: { color: [1.0, 0.62, 0.20], thickness: 0.34, power: 2.0, intensity: 1.7, sunSide: 0 }, pick: 4.6, flare: true },
    chandra:    { type: 1, size: 0.9, radius: 0.9, orbit: 7.5,  angle: 0.5, speed: 0.075,  spin: 0.05,  tilt: 6.7, atmo: null, pick: 1.6 },
    mangal:     { type: 2, size: 1.0, radius: 1.0, orbit: 11,   angle: 2.9, speed: 0.055,  spin: 0.22,  tilt: 25,
                  atmo: { color: [0.95, 0.58, 0.38], thickness: 0.035, power: 3.0, intensity: 0.7, sunSide: 1 }, pick: 1.7 },
    budh:       { type: 3, size: 0.8, radius: 0.8, orbit: 14.5, angle: 5.2, speed: 0.047,  spin: 0.05,  tilt: 0.5, atmo: null, pick: 1.5 },
    brihaspati: { type: 4, size: 2.5, radius: 2.5, orbit: 19,   angle: 1.3, speed: 0.036,  spin: 0.30,  tilt: 3,
                  atmo: { color: [0.92, 0.78, 0.60], thickness: 0.035, power: 3.0, intensity: 0.6, sunSide: 1 }, pick: 3.0 },
    shukra:     { type: 5, size: 1.25, radius: 1.25, orbit: 23.5, angle: 3.9, speed: 0.030, spin: -0.03, tilt: 3,
                  atmo: { color: [1.0, 0.82, 0.45], thickness: 0.07, power: 2.4, intensity: 1.15, sunSide: 0.85 }, pick: 1.9 },
    shani:      { type: 6, size: 2.0, radius: 2.7, orbit: 28,   angle: 5.9, speed: 0.024,  spin: 0.28,  tilt: 26.7,
                  atmo: { color: [0.95, 0.85, 0.62], thickness: 0.035, power: 3.0, intensity: 0.5, sunSide: 1 },
                  ring: { inner: 1.35, outer: 2.4 }, pick: 3.6 },
    rahu:       { type: 7, size: 1.3, radius: 1.5, orbit: 32,   angle: 4.2, speed: -0.02,  spin: 0.10,  tilt: 5,
                  atmo: { color: [0.62, 0.35, 1.0], thickness: 0.22, power: 2.2, intensity: 1.0, sunSide: 0 },
                  nodeRing: { color: [255, 205, 110], scale: [1.45, 1.75], tilt: 0.32 }, pick: 2.2 },
    ketu:       { type: 8, size: 1.2, radius: 1.4, orbit: 32.6, angle: 4.2 + Math.PI, speed: -0.02, spin: -0.10, tilt: 5,
                  atmo: { color: [1.0, 0.50, 0.18], thickness: 0.22, power: 2.2, intensity: 1.0, sunSide: 0 },
                  nodeRing: { color: [255, 140, 70], scale: [1.4, 1.65], tilt: -0.32 }, pick: 2.1 }
  };

  /* =======================================================
     2. SHADERS
  ======================================================= */
  const NOISE_GLSL = `
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

  const BODY_VERT = `
varying vec3 vLocal;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vCenter;
varying vec3 vAxis;
void main(){
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vAxis = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

  const BODY_FRAG = `
uniform float uTime;
uniform float uHighlight;
uniform float uPR;
#ifdef HAS_RING
uniform sampler2D uRingTex;
uniform float uRingIn;
uniform float uRingOut;
#endif
varying vec3 vLocal;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec3 vCenter;
varying vec3 vAxis;

${NOISE_GLSL}

float fbm(vec3 p){
  float a = 0.5; float s = 0.0;
  for(int i = 0; i < OCT; i++){
    s += a * snoise(p);
    p = p * 2.02 + vec3(17.1, 3.7, 9.2);
    a *= 0.5;
  }
  return s;
}
float fbmLow(vec3 p){
  float a = 0.5; float s = 0.0;
  for(int i = 0; i < 3; i++){
    s += a * snoise(p);
    p = p * 2.02 + vec3(17.1, 3.7, 9.2);
    a *= 0.5;
  }
  return s;
}

#if PTYPE == 1 || PTYPE == 2 || PTYPE == 3
vec3 hash33(vec3 p){
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}
float craters(vec3 p, float density, float baseScale){
  float h = 0.0;
  float amp = 1.0;
  float scale = baseScale;
  for(int s = 0; s < CRATER_SCALES; s++){
    vec3 q = p * scale;
    vec3 ip = floor(q);
    vec3 fp = q - ip;
    for(int x = -1; x <= 1; x++){
      for(int y = -1; y <= 1; y++){
        for(int z = -1; z <= 1; z++){
          vec3 g = vec3(float(x), float(y), float(z));
          vec3 cell = ip + g + float(s) * 13.37;
          vec3 r = hash33(cell);
          if(r.x < density){
            vec3 c = g + hash33(cell + 5.1);
            float rad = 0.22 + 0.30 * r.y;
            float d = length(fp - c) / rad;
            float floorp = smoothstep(0.95, 0.55, d);
            float t = (d - 1.0) * 3.2;
            float rim = exp(-t * t);
            h += amp * (-0.85 * floorp + 0.42 * rim);
          }
        }
      }
    }
    scale *= 2.3;
    amp *= 0.55;
  }
  return h;
}
#endif

void main(){
  vec3 p = normalize(vLocal);
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(-vWorld);
  float mu = max(dot(N, V), 0.0);
  float rimF = pow(1.0 - mu, 2.6);

  vec3 albedo = vec3(0.5);
  vec3 emissive = vec3(0.0);
  float height = 0.0;
  float bump = 0.0;
  float specK = 0.0;
  float wrap = 0.0;
  float ringShadow = 1.0;

#if PTYPE == 0
  /* ---------- SUN ---------- */
  float t = uTime * 0.04;
  float g1 = fbm(p * 5.0 + vec3(0.0, t, 0.0));
  float g2 = fbm(p * 16.0 - vec3(t * 1.7, 0.0, t));
  float heat = clamp(0.5 + g1 * 0.9 + g2 * 0.45, 0.0, 1.0);
  vec3 c = mix(vec3(0.90, 0.28, 0.02), vec3(1.0, 0.78, 0.30), heat);
  c = mix(c, vec3(1.0, 0.97, 0.78), pow(heat, 4.0));
  float spots = smoothstep(0.52, 0.70, fbmLow(p * 2.6 + vec3(3.0, 1.0, t * 0.5)));
  c = mix(c, vec3(0.30, 0.07, 0.0), spots * 0.75);
  float veins = pow(1.0 - abs(snoise(p * 9.0 + vec3(0.0, t * 2.0, 0.0))), 7.0);
  c += vec3(1.0, 0.55, 0.15) * veins * 0.35;
  float limb = mix(0.40, 1.0, pow(mu, 0.45));
  emissive = pow(c * limb, vec3(2.2)) * 2.4;

#elif PTYPE == 1
  /* ---------- MOON ---------- */
  float cr = craters(p, 0.62, 5.0);
  float n1 = fbm(p * 2.2);
  float mare = smoothstep(0.02, 0.22, fbmLow(p * 1.15 + vec3(4.1, 2.0, 7.3)));
  albedo = mix(vec3(0.34, 0.34, 0.35), vec3(0.74, 0.72, 0.68), clamp(0.55 + n1 * 0.9, 0.0, 1.0));
  albedo = mix(albedo, vec3(0.21, 0.22, 0.25), mare * 0.7);
  albedo *= 1.0 + cr * 0.55;
  height = cr + n1 * 0.25;
  bump = 0.012;

#elif PTYPE == 2
  /* ---------- MARS ---------- */
  float cr = craters(p, 0.40, 4.0);
  float n1 = fbm(p * 2.6);
  float n2 = fbmLow(p * 1.4 + vec3(8.0, 1.0, 2.0));
  albedo = mix(vec3(0.58, 0.27, 0.13), vec3(0.80, 0.50, 0.28), clamp(0.5 + n1 * 0.9, 0.0, 1.0));
  albedo = mix(albedo, vec3(0.22, 0.13, 0.10), smoothstep(0.08, 0.35, n2) * 0.75);
  float canyon = smoothstep(0.035, 0.0, abs(p.y + 0.10 + 0.05 * snoise(vec3(p.x * 5.0, 0.0, p.z * 5.0))))
               * smoothstep(-0.2, 0.3, snoise(p * 1.7 + 3.0));
  albedo = mix(albedo, vec3(0.20, 0.10, 0.07), canyon * 0.8);
  float polar = smoothstep(0.86, 0.93, abs(p.y) + 0.04 * fbmLow(p * 6.0));
  albedo = mix(albedo, vec3(0.92, 0.92, 0.95), polar);
  albedo *= 1.0 + cr * 0.35;
  height = cr * 0.8 + n1 * 0.35 - canyon * 0.6;
  bump = 0.010;

#elif PTYPE == 3
  /* ---------- MERCURY ---------- */
  float cr = craters(p, 0.72, 6.0);
  float n1 = fbm(p * 3.0);
  albedo = mix(vec3(0.20, 0.18, 0.17), vec3(0.58, 0.53, 0.48), clamp(0.5 + n1 * 0.9, 0.0, 1.0));
  albedo *= 1.0 + cr * 0.5;
  float scarp = pow(1.0 - abs(snoise(p * 3.5)), 10.0);
  height = cr + n1 * 0.3 + scarp * 0.25;
  bump = 0.012;

#elif PTYPE == 4
  /* ---------- JUPITER ---------- */
  float t = uTime * 0.01;
  float lat = p.y;
  float lon = atan(p.z, p.x);
  float turb = fbmLow(vec3(p.x * 2.5, p.y * 7.0, p.z * 2.5) + vec3(t, 0.0, 0.0));
  float shear = fbm(vec3(p.x * 6.0, p.y * 22.0, p.z * 6.0) + vec3(t * 2.0, 0.0, 0.0));
  float y = lat + 0.035 * turb + 0.01 * shear;
  float b1 = sin(y * 26.0 + turb * 1.5) * 0.5 + 0.5;
  float b2 = sin(y * 61.0 + shear * 2.0) * 0.5 + 0.5;
  float bands = clamp(b1 * 0.7 + b2 * 0.3, 0.0, 1.0);
  vec3 creamc = vec3(0.92, 0.84, 0.70);
  vec3 tanc = vec3(0.80, 0.62, 0.42);
  vec3 brownc = vec3(0.50, 0.31, 0.20);
  albedo = mix(tanc, creamc, smoothstep(0.35, 0.75, bands));
  albedo = mix(albedo, brownc, smoothstep(0.62, 0.95, 1.0 - bands) * 0.55 * (0.5 + 0.5 * sin(y * 13.0 + 1.0)));
  albedo = mix(albedo, vec3(0.66, 0.36, 0.22), smoothstep(0.7, 1.0, sin(y * 13.0 + 2.0) * 0.5 + 0.5) * 0.35);
  float sto = smoothstep(0.62, 0.80, snoise(vec3(lon * 5.0, lat * 22.0, 0.7 + t)));
  albedo = mix(albedo, vec3(0.95, 0.90, 0.82), sto * 0.5);
  float dl = lon - 0.8;
  dl = atan(sin(dl), cos(dl));
  vec2 gd = vec2(dl / 0.30, (lat + 0.30) / 0.095);
  float gr = length(gd);
  float spiral = sin(atan(gd.y, gd.x) * 2.0 - gr * 5.0 + t * 20.0) * 0.5 + 0.5;
  float spot = 1.0 - smoothstep(0.75, 1.0, gr);
  vec3 spotCol = mix(vec3(0.62, 0.22, 0.12), vec3(0.85, 0.45, 0.28), spiral * 0.7);
  albedo = mix(albedo, spotCol, spot * 0.9);
  float halo = smoothstep(1.05, 1.25, gr) * (1.0 - smoothstep(1.25, 1.5, gr));
  albedo = mix(albedo, creamc, halo * 0.35);
  height = bands * 0.12 + turb * 0.1;
  bump = 0.0025;
  wrap = 0.25;
  specK = 0.02;

#elif PTYPE == 5
  /* ---------- VENUS ---------- */
  float t = uTime * 0.015;
  vec3 q = p * vec3(2.0, 3.2, 2.0);
  vec3 w = vec3(fbmLow(q + vec3(t, 0.0, 0.0)),
                fbmLow(q + vec3(5.2, 1.3, t)),
                fbmLow(q + vec3(1.7, 9.2, -t)));
  float cl = fbm(q * 1.2 + 2.1 * w + vec3(t * 2.0, 0.0, 0.0));
  float streak = sin(p.y * 14.0 + w.x * 5.0) * 0.5 + 0.5;
  float vv = clamp(0.5 + cl * 1.1, 0.0, 1.0);
  albedo = mix(vec3(0.66, 0.43, 0.16), vec3(0.98, 0.84, 0.52), vv);
  albedo = mix(albedo, vec3(1.0, 0.93, 0.72), streak * 0.18);
  albedo = mix(albedo, vec3(0.52, 0.32, 0.12), smoothstep(0.35, 0.7, -cl) * 0.35);
  height = cl * 0.4;
  bump = 0.003;
  wrap = 0.45;
  specK = 0.04;

#elif PTYPE == 6
  /* ---------- SATURN ---------- */
  float t = uTime * 0.008;
  float turb = fbmLow(vec3(p.x * 2.0, p.y * 6.0, p.z * 2.0) + vec3(t, 0.0, 0.0));
  float y = p.y + 0.02 * turb;
  float b = sin(y * 22.0 + turb) * 0.5 + 0.5;
  float b2 = sin(y * 55.0 + turb * 2.0) * 0.5 + 0.5;
  float bb = clamp(b * 0.65 + b2 * 0.35, 0.0, 1.0);
  albedo = mix(vec3(0.66, 0.56, 0.40), vec3(0.93, 0.85, 0.66), bb);
  albedo = mix(albedo, vec3(0.80, 0.68, 0.46), smoothstep(0.4, 1.0, sin(y * 9.0) * 0.5 + 0.5) * 0.3);
  float pol = smoothstep(0.78, 0.95, p.y);
  albedo = mix(albedo, vec3(0.50, 0.52, 0.50), pol * 0.45);
  height = bb * 0.1;
  bump = 0.002;
  wrap = 0.25;
  specK = 0.02;

#elif PTYPE == 7
  /* ---------- RAHU (symbolic shadow orb) ---------- */
  float t = uTime * 0.05;
  vec3 q = p * 2.4;
  vec3 w = vec3(fbmLow(q + vec3(t, 0.0, 0.0)),
                fbmLow(q + vec3(4.0, t, 0.0)),
                fbmLow(q + vec3(0.0, 2.0, -t)));
  float s = fbm(q * 1.5 + 2.2 * w);
  float sm = clamp(0.5 + s * 1.2, 0.0, 1.0);
  albedo = mix(vec3(0.015, 0.01, 0.04), vec3(0.17, 0.07, 0.33), sm);
  float veins = pow(1.0 - abs(snoise(q * 2.2 + w * 1.5 + vec3(0.0, t * 2.0, 0.0))), 9.0);
  emissive = vec3(0.55, 0.25, 0.95) * veins * 0.55 + vec3(0.95, 0.72, 0.30) * pow(1.0 - mu, 3.0) * 0.9;
  height = s * 0.2;
  bump = 0.003;

#else
  /* ---------- KETU (symbolic ember orb) ---------- */
  float t = uTime * 0.045;
  vec3 q = p * 2.8;
  vec3 w = vec3(fbmLow(q + vec3(-t, 0.0, 0.0)),
                fbmLow(q + vec3(3.0, -t, 1.0)),
                fbmLow(q + vec3(0.0, 6.0, t)));
  float s = fbm(q * 1.4 + 2.0 * w);
  float sm = clamp(0.5 + s * 1.2, 0.0, 1.0);
  albedo = mix(vec3(0.03, 0.015, 0.015), vec3(0.30, 0.10, 0.08), sm);
  float cracks = pow(1.0 - abs(snoise(q * 2.4 + w * 1.4 + vec3(t * 2.0, 0.0, 0.0))), 10.0);
  emissive = vec3(1.0, 0.45, 0.10) * cracks * 0.8 + vec3(1.0, 0.62, 0.25) * pow(1.0 - mu, 3.0) * 0.8;
  height = s * 0.2;
  bump = 0.003;
#endif

#ifdef HAS_RING
  {
    vec3 A = normalize(vAxis);
    float dlr = dot(L, A);
    if(abs(dlr) > 0.02){
      float tt = dot(vCenter - vWorld, A) / dlr;
      if(tt > 0.0){
        vec3 H = vWorld + L * tt;
        float rr = length(H - vCenter) / uPR;
        if(rr > uRingIn && rr < uRingOut){
          float u = (rr - uRingIn) / (uRingOut - uRingIn);
          float a = texture2D(uRingTex, vec2(u, 0.5)).a;
          ringShadow = 1.0 - a * 0.85;
        }
      }
    }
  }
#endif

#if PTYPE == 0
  vec3 col = emissive;
#else
  albedo = pow(albedo, vec3(2.2));

  vec3 dpdx = dFdx(vWorld);
  vec3 dpdy = dFdy(vWorld);
  float dhx = dFdx(height);
  float dhy = dFdy(height);
  vec3 r1 = cross(dpdy, N);
  vec3 r2 = cross(N, dpdx);
  float det = dot(dpdx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  vec3 Nb = normalize(abs(det) * N - bump * uPR * grad);

  float ndl = dot(Nb, L);
  float gNdl = dot(N, L);
  float dRock = max(ndl, 0.0) * smoothstep(-0.02, 0.10, gNdl);
  float dAtm = smoothstep(-0.30, 0.85, gNdl) * (0.65 + 0.35 * max(ndl, 0.0));
  float diff = mix(dRock, dAtm, clamp(wrap * 2.2, 0.0, 1.0)) * ringShadow;
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(Nb, H), 0.0), 48.0) * specK * step(0.0, gNdl);
  vec3 col = albedo * (diff * 1.35 + 0.012) + vec3(spec) + emissive;
  col += albedo * vec3(0.012, 0.010, 0.022) * 0.8;
#endif

  col += uHighlight * rimF * vec3(0.95, 0.75, 0.35) * 0.9;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

  const ATMO_VERT = `
varying vec3 vNormalW;
varying vec3 vWorld;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
  const ATMO_FRAG = `
uniform vec3 uColor;
uniform float uPower;
uniform float uIntensity;
uniform float uHighlight;
uniform float uSunSide;
varying vec3 vNormalW;
varying vec3 vWorld;
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(-vWorld);
  float f = pow(1.0 - max(dot(N, V), 0.0), uPower);
  float sun = mix(1.0, smoothstep(-0.35, 0.55, dot(N, L)), uSunSide);
  float a = clamp(f * uIntensity * sun * (1.0 + uHighlight * 1.2), 0.0, 1.0);
  gl_FragColor = vec4(uColor, a);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

  const RING_VERT = `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vCenter;
varying vec3 vAxis;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vAxis = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
  const RING_FRAG = `
uniform sampler2D uRingTex;
uniform float uPR;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vCenter;
varying vec3 vAxis;
void main(){
  vec4 tex = texture2D(uRingTex, vec2(vUv.x, 0.5));
  vec3 L = normalize(-vWorld);
  vec3 d = vWorld - vCenter;
  float b = dot(d, L);
  float c = dot(d, d) - uPR * uPR;
  float disc = b * b - c;
  float sh = (b < 0.0) ? smoothstep(0.0, 0.6, disc / (uPR * uPR)) : 0.0;
  float shadow = 1.0 - sh * 0.9;
  float lit = 0.35 + 0.65 * abs(dot(normalize(vAxis), L));
  vec3 rgb = pow(tex.rgb, vec3(2.2)) * lit * shadow * 1.25;
  gl_FragColor = vec4(rgb, tex.a);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

  /* =======================================================
     3. PROCEDURAL HELPERS
  ======================================================= */
  function hash1(n) {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  }
  function sm(a, b, x) {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function makeSaturnRingTexture(THREE, width) {
    const c = document.createElement('canvas');
    c.width = width; c.height = 4;
    const g = c.getContext('2d');
    const img = g.createImageData(width, 4);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const box = function (a, b, e) { return sm(a - e, a + e, u) * (1 - sm(b - e, b + e, u)); };
      let dens = 0.16 * box(0.0, 0.13, 0.01) + 0.95 * box(0.13, 0.52, 0.012) +
                 0.64 * box(0.58, 0.93, 0.012) + 0.25 * box(0.94, 0.95, 0.004);
      dens *= 1 - 0.9 * box(0.795, 0.81, 0.003);
      const n1 = hash1(Math.floor(u * 300));
      const n2 = hash1(Math.floor(u * 90) + 31);
      const n = 0.6 * n1 + 0.4 * n2;
      dens *= 0.65 + 0.35 * n;
      const inB = box(0.13, 0.52, 0.01), inA = box(0.58, 0.93, 0.01);
      const r = 150 + inB * 85 + inA * 55, gg = 135 + inB * 79 + inA * 50, bl = 115 + inB * 60 + inA * 35;
      const br = 0.88 + 0.22 * n;
      for (let y = 0; y < 4; y++) {
        const i = (y * width + x) * 4;
        img.data[i] = Math.min(255, r * br);
        img.data[i + 1] = Math.min(255, gg * br);
        img.data[i + 2] = Math.min(255, bl * br);
        img.data[i + 3] = Math.min(255, dens * 255 * 1.05);
      }
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function makeGlowStrip(THREE, rgb) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 4;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 256, 0);
    const col = rgb.join(',');
    grad.addColorStop(0, 'rgba(' + col + ',0)');
    grad.addColorStop(0.5, 'rgba(' + col + ',0.9)');
    grad.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 4);
    const tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  function makeSunFlareTexture(THREE) {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0.0, 'rgba(255,214,140,0.55)');
    grad.addColorStop(0.22, 'rgba(255,170,70,0.28)');
    grad.addColorStop(0.55, 'rgba(255,120,40,0.08)');
    grad.addColorStop(1.0, 'rgba(255,100,30,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    g.translate(s / 2, s / 2);
    for (let i = 0; i < 16; i++) {
      g.rotate((Math.PI * 2) / 16 + hash1(i) * 0.08);
      const len = s * (0.28 + 0.2 * hash1(i + 9));
      const rg = g.createLinearGradient(0, 0, len, 0);
      rg.addColorStop(0, 'rgba(255,215,150,0.20)');
      rg.addColorStop(1, 'rgba(255,215,150,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.moveTo(0, -3); g.lineTo(len, -0.4); g.lineTo(len, 0.4); g.lineTo(0, 3);
      g.closePath();
      g.fill();
    }
    return new THREE.CanvasTexture(c);
  }

  function setRadialUV(geo, inner, outer) {
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;
  }

  function loadTexture(THREE, url, anis) {
    return new Promise(function (resolve) {
      new THREE.TextureLoader().load(url, function (t) {
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = anis;
        resolve(t);
      }, undefined, function () { resolve(null); });
    });
  }
  const tick = function () { return new Promise(function (r) { setTimeout(r, 0); }); };

  /* =======================================================
     4. BUILD ONE PLANET
  ======================================================= */
  function buildPlanet(ctx, data) {
    const THREE = ctx.THREE;
    const v = VISUAL[data.id];
    const group = new THREE.Group();
    group.name = data.id;
    const pivot = new THREE.Group();
    pivot.rotation.z = THREE.MathUtils.degToRad(v.tilt);
    group.add(pivot);

    const bodyUniforms = {
      uTime: { value: 0 },
      uHighlight: { value: 0 },
      uPR: { value: v.size }
    };
    const defines = { PTYPE: v.type, OCT: ctx.oct, CRATER_SCALES: ctx.craterScales };
    let ringTex = null;
    if (v.ring) {
      defines.HAS_RING = 1;
      ringTex = makeSaturnRingTexture(THREE, ctx.tex >= 4096 ? 4096 : 2048);
      bodyUniforms.uRingTex = { value: ringTex };
      bodyUniforms.uRingIn = { value: v.ring.inner };
      bodyUniforms.uRingOut = { value: v.ring.outer };
    }

    const bodyMat = new THREE.ShaderMaterial({
      defines: defines,
      uniforms: bodyUniforms,
      vertexShader: BODY_VERT,
      fragmentShader: BODY_FRAG,
      extensions: { derivatives: true }
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(v.size, ctx.seg[0], ctx.seg[1]), bodyMat);
    pivot.add(body);

    const highlightTargets = [bodyUniforms];
    const timeTargets = [bodyUniforms];
    const extras = [];
    let ringMat = null;

    if (v.atmo) {
      const au = {
        uColor: { value: new THREE.Color(v.atmo.color[0], v.atmo.color[1], v.atmo.color[2]) },
        uPower: { value: v.atmo.power },
        uIntensity: { value: v.atmo.intensity },
        uHighlight: { value: 0 },
        uSunSide: { value: v.atmo.sunSide }
      };
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(v.size * (1 + v.atmo.thickness), ctx.seg[0], ctx.seg[1]),
        new THREE.ShaderMaterial({
          uniforms: au, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        })
      );
      shell.renderOrder = 3;
      pivot.add(shell);
      highlightTargets.push(au);
    }

    if (v.flare) {
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeSunFlareTexture(THREE), transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, opacity: 0.9
      }));
      flare.scale.set(v.size * 9, v.size * 9, 1);
      flare.renderOrder = 4;
      group.add(flare);
    }

    if (v.ring) {
      const rg = new THREE.RingGeometry(v.size * v.ring.inner, v.size * v.ring.outer, 192, 1);
      setRadialUV(rg, v.size * v.ring.inner, v.size * v.ring.outer);
      ringMat = new THREE.ShaderMaterial({
        uniforms: { uRingTex: { value: ringTex }, uPR: { value: v.size } },
        vertexShader: RING_VERT, fragmentShader: RING_FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(rg, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.renderOrder = 2;
      pivot.add(ring);
    }

    if (v.nodeRing) {
      const inner = v.size * v.nodeRing.scale[0], outer = v.size * v.nodeRing.scale[1];
      const rg = new THREE.RingGeometry(inner, outer, 128, 1);
      setRadialUV(rg, inner, outer);
      const strip = makeGlowStrip(THREE, v.nodeRing.color);
      const holder = new THREE.Group();
      holder.rotation.x = v.nodeRing.tilt;
      const mesh = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({
        map: strip, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0.85
      }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 2;
      holder.add(mesh);
      pivot.add(holder);
      extras.push(holder);
    }

    const pickMesh = new THREE.Mesh(new THREE.SphereGeometry(v.pick, 12, 8), new THREE.MeshBasicMaterial());
    pickMesh.visible = false;
    pickMesh.userData.planetId = data.id;
    group.add(pickMesh);

    const planet = {
      id: data.id,
      group: group,
      pickMesh: pickMesh,
      radius: v.radius,
      orbit: v.orbit,
      angle: v.angle,
      speed: v.speed,
      _body: body, _bodyMat: bodyMat, _ringMat: ringMat, _bodyUniforms: bodyUniforms, _ringTex: ringTex,
      update: function (dt, elapsed) {
        body.rotation.y += v.spin * dt;
        for (let i = 0; i < timeTargets.length; i++) timeTargets[i].uTime.value = elapsed;
        for (let i = 0; i < extras.length; i++) extras[i].rotation.y += dt * 0.08;
      },
      setHighlight: function (a) {
        for (let i = 0; i < highlightTargets.length; i++) highlightTargets[i].uHighlight.value = a;
      },
      dispose: function () {
        group.traverse(function (n) {
          if (n.geometry) n.geometry.dispose();
          const m = n.material;
          if (!m) return;
          (Array.isArray(m) ? m : [m]).forEach(function (mat) {
            if (mat.map) mat.map.dispose();
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
    };
    return planet;
  }

  async function applyExternalTextures(ctx, planets) {
    const ex = EXTERNAL_TEXTURES;
    if (!ex.enabled) return;
    const THREE = ctx.THREE;
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const file = ex.files[p.id];
      if (!file) continue;
      const tex = await loadTexture(THREE, ex.path + file, ctx.anis);
      if (!tex) { console.warn('[Planets] texture not found, using procedural:', file); continue; }
      const old = p._bodyMat;
      p._body.material = p.id === 'surya'
        ? new THREE.MeshBasicMaterial({ map: tex })
        : new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
      old.dispose();
      if (p.id === 'shani' && ex.files.shaniRing) {
        const rt = await loadTexture(THREE, ex.path + ex.files.shaniRing, 1);
        if (rt && p._ringMat) { p._ringMat.uniforms.uRingTex.value = rt; }
      }
    }
  }

  async function create(THREE, opts) {
    opts = opts || {};
    const tex = opts.textureSize || 2048;
    const quality = opts.quality || 'medium';
    const ctx = {
      THREE: THREE,
      tex: tex,
      oct: tex >= 8192 ? 7 : tex >= 4096 ? 6 : tex >= 2048 ? 5 : 4,
      craterScales: quality === 'low' ? 2 : 3,
      seg: quality === 'high' ? [96, 64] : quality === 'medium' ? [72, 48] : [48, 32],
      anis: opts.maxAnisotropy || 1
    };
    const out = [];
    for (let i = 0; i < PLANET_DATA.length; i++) {
      out.push(buildPlanet(ctx, PLANET_DATA[i]));
      if (opts.onProgress) opts.onProgress((i + 1) / PLANET_DATA.length);
      await tick();
    }
    await applyExternalTextures(ctx, out);
    return { planets: out };
  }

  /* =======================================================
     5. UI: selector chips + info panel
  ======================================================= */
  const ui = { handlers: {}, activeId: null, lastFocus: null, inited: false };
  const $id = function (id) { return document.getElementById(id); };
  const lang = function () {
    return (window.I18N && window.I18N.lang) || document.documentElement.getAttribute('data-lang') || 'en';
  };
  const tr = function (key, fb) {
    if (window.I18N && typeof window.I18N.t === 'function') {
      const val = window.I18N.t(key);
      if (val && val !== key) return val;
    }
    return fb;
  };
  const findData = function (id) {
    for (let i = 0; i < PLANET_DATA.length; i++) if (PLANET_DATA[i].id === id) return PLANET_DATA[i];
    return null;
  };

  function renderChips() {
    const box = $id('planet-selector');
    if (!box) return;
    const l = lang();
    box.textContent = '';
    PLANET_DATA.forEach(function (d) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'planet-chip' + (ui.activeId === d.id ? ' is-active' : '');
      b.setAttribute('role', 'listitem');
      b.dataset.planet = d.id;
      const main = document.createElement('span');
      main.textContent = l === 'hi' ? d.name.hi : d.name.sa;
      const sub = document.createElement('small');
      sub.textContent = l === 'hi' ? d.name.sa : d.name.en;
      b.appendChild(main);
      b.appendChild(sub);
      b.addEventListener('click', function () {
        if (ui.handlers.onSelect) ui.handlers.onSelect(d.id);
        else openPanel(d.id);
      });
      box.appendChild(b);
    });
  }

  function fillPanel(id) {
    const d = findData(id);
    if (!d) return;
    const l = lang();
    const set = function (el, txt) { if (el) el.textContent = txt; };
    set($id('pp-kicker'), tr('panel.kicker', 'Navagraha') + ' · ' + d.order + ' / ' + PLANET_DATA.length);
    set($id('pp-name'), l === 'hi' ? d.name.hi : d.name.sa);
    set($id('pp-names'), d.name.hi + ' · ' + d.name.sa + ' · ' + d.name.en);
    set($id('pp-deity'), d.deity[l] || d.deity.en);
    set($id('pp-significance'), d.significance[l] || d.significance.en);

    const mantra = $id('pp-mantra');
    if (mantra) {
      mantra.textContent = '';
      mantra.appendChild(document.createTextNode(d.mantra.dev));
      const br = document.createElement('br');
      const rom = document.createElement('span');
      rom.textContent = d.mantra.roman;
      rom.style.cssText = 'font-family:var(--font-serif);font-size:.95rem;font-style:italic;color:var(--muted);letter-spacing:.02em;';
      mantra.appendChild(br);
      mantra.appendChild(rom);
    }

    let note = '';
    if (d.day) note += tr('panel.day', 'Day') + ': ' + (d.day[l] || d.day.en) + '. ';
    if (d.node) note += NODE_NOTE[l] || NODE_NOTE.en;
    set($id('pp-note'), note.trim());

    const copy = $id('pp-copy');
    if (copy) copy.textContent = tr('panel.copy', 'Copy Mantra');
  }

  function openPanel(id) {
    const panel = $id('planet-panel');
    if (!panel || !findData(id)) return;
    ui.activeId = id;
    fillPanel(id);
    if (!panel.classList.contains('is-open')) ui.lastFocus = document.activeElement;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('.planet-chip').forEach(function (c) {
      c.classList.toggle('is-active', c.dataset.planet === id);
    });
    try { panel.focus({ preventScroll: true }); } catch (e) {}
  }

  function closePanel() {
    const panel = $id('planet-panel');
    ui.activeId = null;
    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.planet-chip.is-active').forEach(function (c) { c.classList.remove('is-active'); });
    if (ui.lastFocus && ui.lastFocus.focus) {
      try { ui.lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }
    ui.lastFocus = null;
  }

  function copyMantra() {
    const d = findData(ui.activeId);
    if (!d) return;
    const btn = $id('pp-copy');
    const done = function () {
      if (!btn) return;
      btn.textContent = tr('panel.copied', 'Copied!');
      setTimeout(function () { btn.textContent = tr('panel.copy', 'Copy Mantra'); }, 1600);
    };
    const fallback = function () {
      const ta = document.createElement('textarea');
      ta.value = d.mantra.dev;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(d.mantra.dev).then(done, fallback);
    } else {
      fallback();
    }
  }

  function initUI(handlers) {
    ui.handlers = handlers || {};
    renderChips();
    if (ui.inited) return;
    ui.inited = true;
    const close = $id('pp-close');
    if (close) {
      close.addEventListener('click', function () {
        if (ui.handlers.onClose) ui.handlers.onClose();
        else closePanel();
      });
    }
    const copy = $id('pp-copy');
    if (copy) copy.addEventListener('click', copyMantra);
    if (window.I18N && typeof window.I18N.onChange === 'function') {
      window.I18N.onChange(function () {
        renderChips();
        if (ui.activeId) fillPanel(ui.activeId);
      });
    }
  }

  window.PLANET_DATA = PLANET_DATA;
  window.PlanetsModule = {
    create: create,
    initUI: initUI,
    openPanel: openPanel,
    closePanel: closePanel,
    data: PLANET_DATA
  };
})();