/**
 * Generates the placeholder SVG artwork for the Floral Pastel template
 * and the sample "photos". Run with:  node scripts/generate-floral-assets.mjs
 *
 * Each file in public/templates/floral-pastel/ is ONE visual layer. To use
 * real artwork later, just replace a file (or point the manifest at a .webp).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const out = (rel, svg) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg.replace(/\n\s*/g, "\n").trim() + "\n");
};

// deterministic pseudo-random so the art is stable between runs
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const f = (n) => Math.round(n * 10) / 10;

// ─── shared gradient defs ───────────────────────────────────────
const defs = `
<defs>
  <radialGradient id="pBlush" cx="0.5" cy="1" r="1.05">
    <stop offset="0" stop-color="#cf7f8b"/><stop offset="0.5" stop-color="#eaa9ab"/><stop offset="1" stop-color="#fbe4df"/>
  </radialGradient>
  <radialGradient id="pPeach" cx="0.5" cy="1" r="1.05">
    <stop offset="0" stop-color="#e09a7c"/><stop offset="0.5" stop-color="#f3c3a8"/><stop offset="1" stop-color="#fde9dc"/>
  </radialGradient>
  <radialGradient id="pIvory" cx="0.5" cy="1" r="1.05">
    <stop offset="0" stop-color="#e2c2ad"/><stop offset="0.5" stop-color="#f6e4d6"/><stop offset="1" stop-color="#fffaf4"/>
  </radialGradient>
  <radialGradient id="pRose" cx="0.5" cy="1" r="1.05">
    <stop offset="0" stop-color="#a94d63"/><stop offset="0.55" stop-color="#d27f8e"/><stop offset="1" stop-color="#f2c1c3"/>
  </radialGradient>
  <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6f8a69"/><stop offset="0.6" stop-color="#9bb393"/><stop offset="1" stop-color="#c3d3b8"/>
  </linearGradient>
  <linearGradient id="leafDark" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#55704f"/><stop offset="1" stop-color="#8ea886"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e3c78a"/><stop offset="0.5" stop-color="#c49b4f"/><stop offset="1" stop-color="#a87f37"/>
  </linearGradient>
</defs>`;

const petalPath = (R) =>
  `M0,0 C${f(-0.62 * R)},${f(-0.12 * R)} ${f(-0.66 * R)},${f(-0.92 * R)} 0,${f(-R)} C${f(0.66 * R)},${f(-0.92 * R)} ${f(0.62 * R)},${f(-0.12 * R)} 0,0Z`;

/** A layered peony/rose made of rotated petals. */
function flower(cx, cy, r, grad, seed, rot = 0) {
  const rand = rng(seed);
  const layers = [
    { n: 9, s: 1, o: 0.92 },
    { n: 7, s: 0.74, o: 0.95 },
    { n: 6, s: 0.5, o: 1 },
    { n: 5, s: 0.3, o: 1 },
  ];
  let g = `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})">`;
  g += `<circle r="${f(r * 0.95)}" fill="url(#${grad})" opacity="0.35"/>`;
  layers.forEach((l, li) => {
    const off = rand() * 360;
    for (let i = 0; i < l.n; i++) {
      const a = off + (360 / l.n) * i + (rand() - 0.5) * 14;
      const R = r * l.s * (0.9 + rand() * 0.18);
      g += `<path d="${petalPath(R)}" transform="rotate(${f(a)})" fill="url(#${grad})" opacity="${l.o}" stroke="#ffffff" stroke-opacity="${0.25 + li * 0.05}" stroke-width="0.6"/>`;
    }
  });
  g += `<circle r="${f(r * 0.12)}" fill="#e9b98f"/>`;
  for (let i = 0; i < 7; i++) {
    const a = (Math.PI * 2 * i) / 7;
    g += `<circle cx="${f(Math.cos(a) * r * 0.1)}" cy="${f(Math.sin(a) * r * 0.1)}" r="${f(r * 0.03)}" fill="#c49b4f"/>`;
  }
  return g + "</g>";
}

/** A simple 5-petal blossom (filler flower). */
function blossom(cx, cy, r, color = "#fffaf5", center = "#e3c78a") {
  let g = `<g transform="translate(${f(cx)} ${f(cy)})">`;
  for (let i = 0; i < 5; i++) {
    g += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.38)}" ry="${f(r * 0.55)}" transform="rotate(${i * 72})" fill="${color}" stroke="#e7c9c0" stroke-width="0.6"/>`;
  }
  return g + `<circle r="${f(r * 0.22)}" fill="${center}"/></g>`;
}

function leaf(x, y, len, angle, dark = false) {
  const L = len;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">
    <path d="M0,0 C${f(0.25 * L)},${f(-0.3 * L)} ${f(0.72 * L)},${f(-0.3 * L)} ${f(L)},0 C${f(0.72 * L)},${f(0.26 * L)} ${f(0.25 * L)},${f(0.26 * L)} 0,0Z" fill="url(#${dark ? "leafDark" : "leaf"})" opacity="0.95"/>
    <path d="M${f(L * 0.04)},0 Q${f(0.5 * L)},${f(-0.03 * L)} ${f(0.94 * L)},0" stroke="#e8efe2" stroke-opacity="0.6" stroke-width="0.9" fill="none"/>
  </g>`;
}

function bud(x, y, s, angle, grad = "pBlush") {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">
    <path d="M0,${f(s * 0.9)} L0,${f(s * 2.2)}" stroke="#7f9a78" stroke-width="1.4"/>
    <path d="M0,${f(-s)} C${f(s * 0.7)},${f(-s * 0.4)} ${f(s * 0.6)},${f(s * 0.7)} 0,${f(s)} C${f(-s * 0.6)},${f(s * 0.7)} ${f(-s * 0.7)},${f(-s * 0.4)} 0,${f(-s)}Z" fill="url(#${grad})"/>
    <path d="M${f(-s * 0.55)},${f(s * 0.3)} Q0,${f(s * 1.4)} ${f(s * 0.55)},${f(s * 0.3)} Q0,${f(s * 0.9)} ${f(-s * 0.55)},${f(s * 0.3)}Z" fill="#8ea886"/>
  </g>`;
}

/** Eucalyptus-like stem with round leaves. */
function stem(x, y, len, angle, seed) {
  const rand = rng(seed);
  let g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"><path d="M0,0 Q${f(len * 0.5)},${f(-len * 0.08)} ${f(len)},0" stroke="#8a9f82" stroke-width="1.2" fill="none"/>`;
  for (let i = 1; i < 7; i++) {
    const t = i / 7;
    const side = i % 2 ? -1 : 1;
    g += `<ellipse cx="${f(len * t)}" cy="${f(side * (5 + rand() * 3) - len * 0.03)}" rx="${f(6 + rand() * 3)}" ry="${f(4.5 + rand() * 2)}" fill="#b7c8ae" opacity="0.9" stroke="#93a98b" stroke-width="0.5"/>`;
  }
  return g + "</g>";
}

function goldDots(seed, n, w, h, x0 = 0, y0 = 0) {
  const rand = rng(seed);
  let g = "";
  for (let i = 0; i < n; i++)
    g += `<circle cx="${f(x0 + rand() * w)}" cy="${f(y0 + rand() * h)}" r="${f(0.8 + rand() * 1.8)}" fill="url(#gold)" opacity="${f(0.5 + rand() * 0.5)}"/>`;
  return g;
}

// ─── Corner arrangement ─────────────────────────────────────────
function cornerArrangement() {
  let g = "";
  g += stem(30, 20, 170, 28, 3) + stem(10, 40, 150, 62, 4) + stem(60, 10, 140, 8, 5);
  [
    [20, 30, 150, 18, false],
    [30, 20, 135, 42, true],
    [10, 40, 160, 66, false],
    [40, 30, 120, 82, true],
    [30, 10, 120, 2, true],
    [130, 30, 70, 30, false],
    [40, 140, 70, 70, false],
  ].forEach(([x, y, l, a, d]) => (g += leaf(x, y, l, a, d)));
  g += bud(205, 62, 9, 60, "pBlush") + bud(68, 210, 8, -20, "pPeach") + bud(165, 120, 7, 40, "pRose");
  g += blossom(125, 95, 12) + blossom(95, 140, 10) + blossom(190, 30, 9);
  g += flower(150, 34, 40, "pPeach", 11, 20);
  g += flower(34, 150, 38, "pIvory", 12, 0);
  g += flower(58, 56, 62, "pBlush", 10, 10);
  g += flower(118, 120, 22, "pRose", 13, 30);
  g += goldDots(7, 24, 230, 230, 10, 10);
  return g;
}

const svg = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${extra}>${defs}${body}</svg>`;

const T = "templates/floral-pastel";

out(`${T}/floral-top-left.svg`, svg(320, 320, cornerArrangement()));
out(`${T}/floral-top-right.svg`, svg(320, 320, `<g transform="translate(320 0) scale(-1 1)">${cornerArrangement()}</g>`));

// ─── Bottom garland ─────────────────────────────────────────────
{
  let g = "";
  g += stem(200, 150, 190, 192, 21) + stem(200, 150, 190, -12, 22);
  [
    [200, 150, 150, 195, false],
    [200, 150, 130, 210, true],
    [200, 150, 150, -15, false],
    [200, 150, 130, -30, true],
    [200, 150, 90, 240, false],
    [200, 150, 90, -60, false],
  ].forEach(([x, y, l, a, d]) => (g += leaf(x, y, l, a, d)));
  g += bud(70, 112, 8, -70) + bud(330, 112, 8, 70, "pPeach");
  g += blossom(150, 105, 11) + blossom(255, 100, 11) + blossom(105, 140, 9) + blossom(300, 138, 9);
  g += flower(128, 140, 34, "pPeach", 31, 0);
  g += flower(272, 140, 34, "pIvory", 32, 0);
  g += flower(200, 128, 50, "pBlush", 30, 0);
  g += flower(232, 98, 18, "pRose", 33, 0) + flower(170, 100, 16, "pRose", 34, 0);
  g += goldDots(41, 26, 360, 110, 20, 50);
  out(`${T}/floral-bottom.svg`, svg(400, 170, g));
}

// ─── Soft back leaves (parallax background layer) ───────────────
{
  let g = `<g opacity="0.22">`;
  const rand = rng(51);
  for (let i = 0; i < 12; i++) {
    const y = 20 + i * 54;
    g += leaf(-14, y, 60 + rand() * 34, -25 + rand() * 30, i % 2 === 0);
    g += `<g transform="translate(400 0) scale(-1 1)">${leaf(-14, y + 26, 60 + rand() * 34, -25 + rand() * 30, i % 2 === 1)}</g>`;
  }
  g += "</g>";
  out(`${T}/leaves-back.svg`, svg(400, 680, g, 'preserveAspectRatio="none"'));
}

// ─── Arch frame (gold line art) ─────────────────────────────────
out(
  `${T}/arch-frame.svg`,
  svg(
    300,
    440,
    `<g fill="none" stroke="url(#gold)">
      <path d="M14 436 V156 A136 136 0 0 1 286 156 V436" stroke-width="2"/>
      <path d="M24 436 V158 A126 126 0 0 1 276 158 V436" stroke-width="0.8" stroke-dasharray="1 4" stroke-linecap="round"/>
      <path d="M150 6 l8 10 l-8 10 l-8 -10z" fill="url(#gold)" stroke="none"/>
      <path d="M118 22 q16 -2 24 -10 M182 22 q-16 -2 -24 -10" stroke-width="1.2"/>
      <circle cx="104" cy="24" r="2" fill="url(#gold)" stroke="none"/><circle cx="196" cy="24" r="2" fill="url(#gold)" stroke="none"/>
    </g>`,
  ),
);

// ─── Divider ────────────────────────────────────────────────────
out(
  `${T}/divider.svg`,
  svg(
    240,
    24,
    `<path d="M10 12 H96 M144 12 H230" stroke="url(#gold)" stroke-width="1"/>
     <circle cx="10" cy="12" r="1.6" fill="url(#gold)"/><circle cx="230" cy="12" r="1.6" fill="url(#gold)"/>
     ${blossom(120, 12, 10, "#fbe4df", "#c49b4f")}
     ${leaf(104, 12, 14, 180)}${leaf(136, 12, 14, 0)}`,
  ),
);

// ─── Sprig (event card ornament) ────────────────────────────────
out(
  `${T}/sprig.svg`,
  svg(
    160,
    60,
    `${leaf(80, 36, 60, 195)}${leaf(80, 36, 60, -15)}${leaf(80, 36, 36, 225, true)}${leaf(80, 36, 36, -45, true)}
     ${blossom(52, 34, 8)}${blossom(108, 34, 8)}${flower(80, 32, 18, "pBlush", 61)}`,
  ),
);

// ─── Petals for the falling-petal effect ────────────────────────
out(
  `${T}/petal-a.svg`,
  svg(40, 40, `<path d="M20 2 C31 8 36 22 20 38 C4 22 9 8 20 2Z" fill="url(#pBlush)" opacity="0.9"/><path d="M20 6 Q21 20 20 34" stroke="#fff" stroke-opacity=".4" fill="none"/>`),
);
out(`${T}/petal-b.svg`, svg(40, 40, `<path d="M6 30 C4 14 18 4 34 6 C36 22 24 34 6 30Z" fill="url(#pPeach)" opacity="0.9"/>`));

// ─── Paper texture tile ─────────────────────────────────────────
out(
  `${T}/paper-texture.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0.07 0"/></filter>
    <rect width="180" height="180" filter="url(#n)"/>
  </svg>`,
);

// ─── Envelope (4 layers, all 400×280 so they stack perfectly) ───
out(
  `${T}/envelope-back.svg`,
  svg(
    400,
    280,
    `<linearGradient id="inside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98f92"/><stop offset="1" stop-color="#e5b9b4"/></linearGradient>
     <rect width="400" height="280" rx="14" fill="url(#inside)"/>
     <g opacity="0.35">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 9 }, (_, c) => blossom(22 + c * 45 + (r % 2) * 22, 20 + r * 34, 6, "#fbe4df", "#e3c78a")).join("")).join("")}</g>`,
  ),
);
out(
  `${T}/envelope-front.svg`,
  svg(
    400,
    280,
    `<linearGradient id="front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e3dd"/><stop offset="1" stop-color="#eecbc3"/></linearGradient>
     <linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3d6cf"/><stop offset="1" stop-color="#f9e6e1"/></linearGradient>
     <path d="M0 24 L192 150 Q200 156 208 150 L400 24 V266 Q400 280 386 280 H14 Q0 280 0 266Z" fill="url(#side)"/>
     <path d="M0 280 L190 160 Q200 154 210 160 L400 280Z" fill="url(#front)"/>
     <path d="M2 278 L190 160 Q200 154 210 160 L398 278" fill="none" stroke="#b9787c" stroke-opacity="0.18" stroke-width="1.5"/>
     <g transform="translate(-6 190) scale(0.55)">${stem(20, 120, 120, -30, 71)}${leaf(20, 120, 90, -55)}${leaf(20, 120, 80, -10, true)}${flower(40, 110, 30, "pBlush", 72)}${blossom(90, 80, 10)}</g>
     <g transform="translate(406 190) scale(-0.55 0.55)">${stem(20, 120, 120, -30, 73)}${leaf(20, 120, 90, -55)}${leaf(20, 120, 80, -10, true)}${flower(40, 110, 30, "pPeach", 74)}${blossom(90, 80, 10)}</g>`,
  ),
);
out(
  `${T}/envelope-flap.svg`,
  svg(
    400,
    280,
    `<linearGradient id="flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ddd6"/><stop offset="1" stop-color="#ecc3bb"/></linearGradient>
     <path d="M0 14 Q0 0 14 0 H386 Q400 0 400 14 L214 166 Q200 177 186 166Z" fill="url(#flap)"/>
     <path d="M4 10 L194 164 Q200 169 206 164 L396 10" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.2"/>
     <path d="M2 16 L188 168 Q200 178 212 168 L398 16" fill="none" stroke="#a8686e" stroke-opacity="0.2" stroke-width="2"/>`,
  ),
);
out(
  `${T}/wax-seal.svg`,
  svg(
    120,
    120,
    `<radialGradient id="wax" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="#d8707f"/><stop offset="0.55" stop-color="#a83b52"/><stop offset="1" stop-color="#76203a"/></radialGradient>
     <path d="M60 6 C72 4 80 12 90 14 C102 18 104 30 110 40 C118 52 112 62 114 74 C116 88 104 94 98 104 C90 114 78 112 66 116 C54 118 44 112 34 108 C22 104 18 92 12 82 C6 70 10 60 8 48 C8 34 18 28 26 20 C36 10 48 8 60 6Z" fill="url(#wax)"/>
     <circle cx="60" cy="60" r="36" fill="none" stroke="#f3c1c6" stroke-opacity="0.5" stroke-width="1.5"/>
     <circle cx="60" cy="60" r="31" fill="none" stroke="#5a1528" stroke-opacity="0.35" stroke-width="1"/>
     <g opacity="0.5" fill="#f6cfd3">${Array.from({ length: 12 }, (_, i) => `<circle cx="${f(60 + Math.cos((i * Math.PI) / 6) * 42)}" cy="${f(60 + Math.sin((i * Math.PI) / 6) * 42)}" r="1.4"/>`).join("")}</g>
     <ellipse cx="44" cy="36" rx="14" ry="7" fill="#fff" opacity="0.18" transform="rotate(-30 44 36)"/>`,
  ),
);

// ─── Template thumbnail (gallery card) — text is fine here, it's only a preview image ──
out(
  `${T}/thumbnail.svg`,
  svg(
    600,
    800,
    `<rect width="600" height="800" fill="#fbf1ee"/>
     <g transform="translate(-30 -30) scale(1.2)">${cornerArrangement()}</g>
     <g transform="translate(630 -30) scale(-1.2 1.2)">${cornerArrangement()}</g>
     <g transform="translate(150 230) scale(1)"><path d="M14 436 V156 A136 136 0 0 1 286 156 V436" fill="#fffaf8" stroke="url(#gold)" stroke-width="2"/></g>
     <text x="300" y="420" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="64" fill="#9c4a5a">Priya</text>
     <text x="300" y="478" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#b89363">&amp;</text>
     <text x="300" y="540" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="64" fill="#9c4a5a">Rahul</text>
     <text x="300" y="600" text-anchor="middle" font-family="Georgia, serif" font-size="20" letter-spacing="4" fill="#8c7378">14 . 02 . 2027</text>
     <g transform="translate(0 560) scale(1.5)">${(() => {
       let g = "";
       g += flower(128, 140, 34, "pPeach", 31) + flower(272, 140, 34, "pIvory", 32) + flower(200, 128, 50, "pBlush", 30);
       return g;
     })()}</g>`,
  ),
);

// ─── Sample "photos" (placeholders until real photos are uploaded) ──
const scenes = [
  ["couple-cover", ["#f6d5cf", "#e7a9a5", "#b86b77"], "couple"],
  ["moment-1", ["#fde7c8", "#f3b680", "#c86f4a"], "couple"],
  ["moment-2", ["#e7efe2", "#b7cbb0", "#6f8a69"], "flowers"],
  ["moment-3", ["#f3e3f0", "#d7b1cf", "#8a5d85"], "rings"],
  ["moment-4", ["#fff0d9", "#f2c879", "#b8862f"], "diya"],
  ["moment-5", ["#e5eef6", "#a9c2da", "#4f6f91"], "palace"],
  ["moment-6", ["#fbe3df", "#eaa9ab", "#a94d63"], "flowers"],
];
for (const [name, [a, b, c], motif] of scenes) {
  let m = "";
  if (motif === "couple")
    m = `<g fill="${c}" opacity="0.85"><circle cx="255" cy="330" r="34"/><path d="M200 640 C205 470 225 390 255 380 C290 390 310 470 312 640Z"/><circle cx="350" cy="318" r="36"/><path d="M296 640 C300 460 320 380 350 368 C385 380 405 470 410 640Z"/></g><path d="M300 470 q4 -14 14 -6 q10 -8 14 6 q-4 12 -14 18 q-10 -6 -14 -18z" fill="#fff" opacity="0.7"/>`;
  if (motif === "flowers") m = `${flower(300, 400, 120, "pBlush", 81)}${flower(160, 520, 70, "pPeach", 82)}${flower(450, 520, 70, "pIvory", 83)}`;
  if (motif === "rings")
    m = `<g fill="none" stroke="url(#gold)" stroke-width="16"><circle cx="255" cy="420" r="80"/><circle cx="355" cy="420" r="80"/></g><path d="M355 330 l14 -22 h-28z" fill="#fff"/>`;
  if (motif === "diya")
    m = `<path d="M210 470 Q300 560 390 470 Z" fill="${c}"/><path d="M300 470 C270 430 290 380 300 350 C310 380 330 430 300 470Z" fill="#ffd27a"/><circle cx="300" cy="420" r="120" fill="#ffd27a" opacity="0.18"/>`;
  if (motif === "palace")
    m = `<g fill="${c}" opacity="0.85"><path d="M120 640 V430 H480 V640Z"/><path d="M220 430 C220 340 300 320 300 270 C300 320 380 340 380 430Z"/><rect x="140" y="360" width="30" height="70"/><rect x="430" y="360" width="30" height="70"/></g><circle cx="460" cy="180" r="40" fill="#fff" opacity="0.7"/>`;
  out(
    `samples/${name}.svg`,
    svg(
      600,
      750,
      `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.7" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
       <rect width="600" height="750" fill="url(#bg)"/>${goldDots(name.length * 7, 40, 600, 400)}${m}`,
    ),
  );
}

console.log("✓ Floral Pastel assets and sample photos generated");
