/* Ilustrații originale (SVG) desenate pentru Grădina Mea.
 * ILLU.task(type, plant)  → scenă ilustrativă pentru antetul sarcinii
 * ILLU.diagrams(type, plant) → listă de diagrame explicative { svg, caption }
 * ILLU.hero()              → ilustrația de bun venit
 */
(function () {
  const C = {
    sky1: '#dff0f7', sky2: '#f7f3e3', sun: '#f2b84b', soil: '#8a5a3b', soil2: '#6e452c', soilL: '#b5835c', grass: '#7fb36a', grassD: '#4f8a45',
    leaf: '#5d9e4f', leafL: '#8cc777', leafD: '#3c7a3a', stem: '#4f8a45', red: '#d9472b', orange: '#e88a2e', yellow: '#f2c94c', purple: '#7b4a9e',
    wood: '#a8774f', woodD: '#7a5235', metal: '#9aa7ad', metalD: '#6b787e', white: '#ffffff', ink: '#2d3a2a', blue: '#4f93c2', blueL: '#bfe0f2',
    pink: '#e98aa8', straw: '#d9b56a', fleece: 'rgba(255,255,255,.78)', note: '#2d3a2a', ok: '#3f8a4b', bad: '#c4462f'
  };
  const svg = (w, h, body, extra = '') => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" ${extra} style="width:100%;height:auto;display:block">${body}</svg>`;
  const g = (x, y, s, body, rot = 0) => `<g transform="translate(${x} ${y}) scale(${s})${rot ? ` rotate(${rot})` : ''}">${body}</g>`;
  let uid = 0;

  /* ---------- Fundal de scenă ---------- */
  function scene(body, opts = {}) {
    const id = 'sk' + (++uid);
    const night = opts.night, sky = night ? ['#2f4a6b', '#7d97b5'] : opts.storm ? ['#8fa3b3', '#cfd8de'] : [C.sky1, C.sky2];
    return svg(400, 220, `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#${id})"/>
      ${opts.noSun || night || opts.storm ? '' : `<circle cx="345" cy="42" r="20" fill="${C.sun}" opacity=".9"/>`}
      ${night ? `<circle cx="340" cy="40" r="14" fill="#f4f1d0"/><circle cx="347" cy="36" r="12" fill="#2f4a6b"/>${[[60, 30], [120, 50], [200, 22], [260, 45], [300, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}` : ''}
      <path d="M0 150 Q80 125 160 140 T320 135 T400 140 V220 H0Z" fill="${C.grass}" opacity=".55"/>
      <path d="M0 172 H400 V220 H0Z" fill="${C.soil}"/>
      <path d="M0 172 H400" stroke="${C.soil2}" stroke-width="3"/>
      ${[30, 90, 150, 210, 270, 330, 390].map(x => `<ellipse cx="${x}" cy="196" rx="14" ry="3" fill="${C.soil2}" opacity=".35"/>`).join('')}
      ${body}`);
  }

  /* ---------- Elemente: plante ---------- */
  const leafP = (x, y, s, r, col = C.leaf) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0 C6 -10 18 -10 24 0 C18 8 6 8 0 0Z" fill="${col}"/>`;
  function seedling(x, y, s = 1) { return g(x, y, s, `<path d="M0 0 V-22" stroke="${C.stem}" stroke-width="3" stroke-linecap="round"/>${leafP(0, -20, .8, -150, C.leafL)}${leafP(0, -22, .8, -30, C.leaf)}`); }
  function tomato(x, y, s = 1, fruit = true, staked = false) {
    let b = staked ? `<rect x="10" y="-112" width="4" height="114" fill="${C.wood}"/>` : '';
    b += `<path d="M0 0 C-2 -30 3 -60 0 -100" stroke="${C.stem}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    [[-20, 160], [-40, 20], [-55, 170], [-72, 15], [-88, 165]].forEach(([yy, r], i) => { b += leafP(0, yy, 1.2, r, i % 2 ? C.leafL : C.leaf); b += leafP(i % 2 ? 18 : -18, yy - 4, .7, r + (i % 2 ? 20 : -20), C.leafD); });
    if (fruit) [[-14, -34, C.red], [12, -48, C.red], [-10, -62, C.orange], [8, -24, C.red]].forEach(([fx, fy, c]) => { b += `<circle cx="${fx}" cy="${fy}" r="8" fill="${c}"/><path d="M${fx - 3} ${fy - 8} l3 2 l3 -2" stroke="${C.leafD}" stroke-width="2" fill="none"/>`; });
    if (staked) b += `<path d="M2 -40 q6 -4 10 0 M2 -75 q6 -4 10 0" stroke="${C.straw}" stroke-width="2" fill="none"/>`;
    return g(x, y, s, b);
  }
  function bush(x, y, s = 1, fruitCol) {
    let b = `<path d="M0 0 V-20" stroke="${C.woodD}" stroke-width="4"/><ellipse cx="0" cy="-36" rx="34" ry="24" fill="${C.leaf}"/><ellipse cx="-14" cy="-44" rx="18" ry="14" fill="${C.leafL}"/><ellipse cx="16" cy="-30" rx="16" ry="12" fill="${C.leafD}" opacity=".7"/>`;
    if (fruitCol) [[-18, -30], [6, -48], [20, -36], [-4, -26], [12, -24]].forEach(([fx, fy]) => b += `<circle cx="${fx}" cy="${fy}" r="4" fill="${fruitCol}"/>`);
    return g(x, y, s, b);
  }
  function tree(x, y, s = 1, fruitCol = C.red, opts = {}) {
    let b = `<path d="M-6 0 L-4 -60 L4 -60 L6 0Z" fill="${C.woodD}"/><path d="M0 -55 L-24 -88 M0 -60 L22 -92 M0 -70 L2 -100" stroke="${C.woodD}" stroke-width="5" stroke-linecap="round"/>`;
    if (!opts.bare) {
      b += `<circle cx="0" cy="-100" r="42" fill="${C.leaf}"/><circle cx="-28" cy="-86" r="26" fill="${C.leafL}"/><circle cx="28" cy="-90" r="28" fill="${C.leafD}" opacity=".85"/><circle cx="6" cy="-124" r="22" fill="${C.leafL}"/>`;
      if (opts.blossom) [[-30, -95], [-10, -125], [15, -110], [30, -80], [-15, -78], [5, -95], [35, -105], [-35, -70]].forEach(([fx, fy]) => b += `<circle cx="${fx}" cy="${fy}" r="5" fill="#fff"/><circle cx="${fx}" cy="${fy}" r="2" fill="${C.pink}"/>`);
      else if (fruitCol) [[-24, -90], [-6, -118], [18, -104], [30, -82], [-12, -78], [8, -88]].forEach(([fx, fy]) => b += `<circle cx="${fx}" cy="${fy}" r="6" fill="${fruitCol}"/><circle cx="${fx - 2}" cy="${fy - 2}" r="1.6" fill="#fff" opacity=".6"/>`);
    } else {
      b += `<path d="M-24 -88 L-36 -104 M-24 -88 L-20 -112 M22 -92 L36 -110 M22 -92 L16 -118 M2 -100 L-6 -130 M2 -100 L10 -128" stroke="${C.woodD}" stroke-width="3" stroke-linecap="round"/>`;
    }
    return g(x, y, s, b);
  }
  function vine(x, y, s = 1, grapes = true, bare = false) {
    let b = `<rect x="-60" y="-110" width="5" height="112" fill="${C.wood}"/><rect x="58" y="-110" width="5" height="112" fill="${C.wood}"/>
      <path d="M-60 -60 H62 M-60 -85 H62 M-60 -105 H62" stroke="${C.metalD}" stroke-width="1.5"/>
      <path d="M0 0 C-4 -20 4 -40 0 -58 C-20 -60 -40 -60 -55 -60 M0 -58 C20 -60 40 -60 58 -60" stroke="${C.woodD}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    if (!bare) {
      [-40, -18, 8, 32, 50].forEach((vx, i) => { b += `<path d="M${vx} -60 C${vx - 4} -75 ${vx + 4} -90 ${vx} -104" stroke="${C.stem}" stroke-width="2" fill="none"/>`; b += leafP(vx, -78, 1, i % 2 ? -40 : -140, i % 2 ? C.leaf : C.leafL); b += leafP(vx, -96, .9, i % 2 ? -150 : -30, C.leafD); });
      if (grapes) [-30, 20, 44].forEach(gx => { for (let r = 0; r < 4; r++) for (let c = 0; c <= 3 - r; c++) b += `<circle cx="${gx - (3 - r) * 3.5 + c * 7}" cy="${-52 + r * 6.5}" r="3.8" fill="${C.purple}"/>`; });
    }
    return g(x, y, s, b);
  }
  function flower(x, y, s = 1, col = C.pink) {
    let b = `<path d="M0 0 V-38" stroke="${C.stem}" stroke-width="3"/>${leafP(0, -14, .8, -150)}${leafP(0, -22, .7, -30, C.leafL)}`;
    for (let i = 0; i < 6; i++) b += `<ellipse cx="0" cy="-48" rx="5" ry="10" fill="${col}" transform="rotate(${i * 60} 0 -40)"/>`;
    b += `<circle cx="0" cy="-40" r="5" fill="${C.yellow}"/>`;
    return g(x, y, s, b);
  }
  function tulip(x, y, s = 1, col = C.red) { return g(x, y, s, `<path d="M0 0 V-40" stroke="${C.stem}" stroke-width="3"/><path d="M0 -6 C-14 -16 -14 -30 -4 -36" fill="${C.leaf}"/><path d="M-9 -54 L-9 -40 Q0 -32 9 -40 L9 -54 L4 -46 L0 -56 L-4 -46Z" fill="${col}"/>`); }
  function bulb(x, y, s = 1, col = '#e9d2b0') { return g(x, y, s, `<path d="M0 -26 C-14 -18 -14 -2 0 0 C14 -2 14 -18 0 -26Z" fill="${col}" stroke="#b9926a" stroke-width="1.5"/><path d="M-6 0 l-3 6 M0 0 v7 M6 0 l3 6" stroke="#b9926a" stroke-width="1.5"/><path d="M0 -26 v-6" stroke="${C.leafD}" stroke-width="2"/>`); }
  function carrotRow(x, y, n = 4) { let b = ''; for (let i = 0; i < n; i++) b += g(x + i * 26, y, 1, `<path d="M-5 0 L0 26 L5 0Z" fill="${C.orange}"/>${leafP(0, 0, .6, -120, C.leafL)}${leafP(0, 0, .6, -60, C.leaf)}${leafP(0, 0, .5, -90, C.leafD)}`); return b; }
  function cuke(x, y, s = 1) { return g(x, y, s, `<path d="M0 0 C-10 -30 10 -60 0 -100" stroke="${C.stem}" stroke-width="3" fill="none"/>${[-20, -45, -70, -90].map((yy, i) => leafP(0, yy, 1.1, i % 2 ? -20 : -160, i % 2 ? C.leaf : C.leafL)).join('')}<rect x="6" y="-58" width="8" height="26" rx="4" fill="${C.leafD}"/><rect x="-14" y="-36" width="8" height="24" rx="4" fill="${C.leafD}"/>`); }

  /* ---------- Elemente: unelte ---------- */
  const shovel = (x, y, s = 1, r = 0) => g(x, y, s, `<rect x="-3" y="-90" width="6" height="70" rx="3" fill="${C.wood}"/><rect x="-10" y="-96" width="20" height="8" rx="4" fill="${C.woodD}"/><path d="M-14 -22 H14 V0 Q0 14 -14 0Z" fill="${C.metal}" stroke="${C.metalD}" stroke-width="2"/>`, r);
  const can = (x, y, s = 1, pour = false) => g(x, y, s, `<path d="M-26 0 V-36 Q-26 -42 -20 -42 H18 Q24 -42 24 -36 V0Z" fill="${C.blue}"/><path d="M-20 -42 Q0 -66 18 -42" stroke="${C.blue}" stroke-width="5" fill="none"/><path d="M22 -30 L52 -48" stroke="${C.blue}" stroke-width="7" stroke-linecap="round"/><rect x="48" y="-56" width="12" height="14" rx="3" fill="${C.metalD}" transform="rotate(-30 54 -49)"/>${pour ? [0, 1, 2, 3, 4].map(i => `<path d="M${58 + i * 4} ${-40 + i * 2} l${6 + i * 2} 24" stroke="${C.blueL}" stroke-width="2" stroke-linecap="round"/>`).join('') : ''}`);
  const sprayer = (x, y, s = 1, mist = true) => g(x, y, s, `<rect x="-18" y="-50" width="36" height="50" rx="8" fill="#e7e2cf" stroke="${C.metalD}" stroke-width="2"/><rect x="-18" y="-38" width="36" height="8" fill="${C.ok}"/><rect x="-6" y="-60" width="12" height="10" rx="2" fill="${C.metalD}"/><path d="M14 -20 C40 -20 40 -60 60 -70" stroke="${C.ink}" stroke-width="3" fill="none"/><path d="M58 -72 L78 -82" stroke="${C.metalD}" stroke-width="4" stroke-linecap="round"/>${mist ? [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${86 + (i % 3) * 7}" cy="${-88 + Math.floor(i / 3) * 8 + (i % 2) * 3}" r="2.4" fill="${C.blueL}"/>`).join('') : ''}`);
  const shears = (x, y, s = 1, r = 0) => g(x, y, s, `<path d="M0 0 L-30 40" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/><path d="M0 0 L-8 46" stroke="${C.red}" stroke-width="7" stroke-linecap="round"/><path d="M0 0 L18 -26 L8 -2Z" fill="${C.metal}" stroke="${C.metalD}"/><path d="M0 0 L24 -18 L6 4Z" fill="${C.metalD}"/><circle cx="0" cy="0" r="3" fill="${C.ink}"/>`, r);
  const tray = (x, y, s = 1, sprouts = true) => { let b = `<path d="M-50 0 L-44 -18 H44 L50 0Z" fill="#3a3f45"/>`; for (let i = 0; i < 6; i++) { b += `<ellipse cx="${-37 + i * 15}" cy="-17" rx="6" ry="2.4" fill="${C.soil2}"/>`; if (sprouts) b += seedling(-37 + i * 15, -17, .55); } return g(x, y, s, b); };
  const basket = (x, y, s = 1, fruit = C.red) => g(x, y, s, `<path d="M-34 -36 Q0 -80 34 -36" stroke="${C.woodD}" stroke-width="4" fill="none"/>${[-22, -8, 6, 20, -14, 12, -2].map((fx, i) => `<circle cx="${fx}" cy="${i < 4 ? -36 : -44}" r="9" fill="${i % 3 === 2 ? C.orange : fruit}"/>`).join('')}<path d="M-36 -32 H36 L28 0 H-28Z" fill="${C.straw}"/><path d="M-32 -22 H32 M-30 -12 H30" stroke="${C.wood}" stroke-width="2"/>`);
  const rake = (x, y, s = 1, r = 0) => g(x, y, s, `<rect x="-2.5" y="-110" width="5" height="100" fill="${C.wood}"/><rect x="-26" y="-12" width="52" height="5" fill="${C.metalD}"/>${[-22, -13, -4, 5, 14, 23].map(tx => `<rect x="${tx - 1}" y="-7" width="3" height="10" fill="${C.metalD}"/>`).join('')}`, r);
  const hoe = (x, y, s = 1, r = 0) => g(x, y, s, `<rect x="-2.5" y="-110" width="5" height="104" fill="${C.wood}"/><path d="M-2 -8 L-24 -2 L-22 8 L2 2Z" fill="${C.metal}" stroke="${C.metalD}"/>`, r);
  const gloves = (x, y, s = 1) => g(x, y, s, `<path d="M-14 0 V-22 Q-14 -28 -10 -28 V-34 Q-8 -38 -6 -34 V-30 Q-4 -36 -1 -32 V-30 Q1 -36 4 -31 V-26 Q8 -30 10 -24 L8 -10 V0Z" fill="${C.orange}"/><rect x="-15" y="-4" width="24" height="6" rx="2" fill="${C.ok}"/>`);
  const sack = (x, y, s = 1, label = 'NPK', col = C.ok) => g(x, y, s, `<path d="M-22 0 L-26 -50 Q-20 -58 0 -56 Q20 -58 26 -50 L22 0Z" fill="#efe6cf" stroke="#b8a77f" stroke-width="2"/><rect x="-16" y="-38" width="32" height="18" rx="3" fill="${col}"/><text x="0" y="-25" font-size="10" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${label}</text>`);
  const jar = (x, y, s = 1) => g(x, y, s, `<rect x="-16" y="-40" width="32" height="40" rx="6" fill="rgba(220,240,250,.7)" stroke="${C.metalD}" stroke-width="2"/><rect x="-18" y="-46" width="36" height="8" rx="2" fill="${C.wood}"/>${[[-8, -10], [2, -14], [8, -6], [-4, -20], [6, -24], [-9, -28]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="3" ry="2" fill="#c9a26a"/>`).join('')}`);
  const envelope = (x, y, s = 1) => g(x, y, s, `<rect x="-22" y="-28" width="44" height="28" rx="2" fill="#f4ead2" stroke="#b8a77f"/><path d="M-22 -28 L0 -12 L22 -28" stroke="#b8a77f" fill="none"/><text x="0" y="-4" font-size="7" font-family="sans-serif" fill="${C.ink}" text-anchor="middle">2027</text>`);
  const stake = (x, y, s = 1) => g(x, y, s, `<rect x="-2.5" y="-120" width="5" height="124" fill="${C.wood}"/>`);
  const twine = (x, y, s = 1) => g(x, y, s, `<ellipse cx="0" cy="-10" rx="14" ry="10" fill="${C.straw}"/><path d="M-12 -14 Q0 -6 12 -14 M-13 -8 Q0 0 13 -8" stroke="${C.wood}" stroke-width="1.5" fill="none"/><path d="M12 -8 q14 4 20 16" stroke="${C.straw}" stroke-width="2" fill="none"/>`);
  const thermo = (x, y, s = 1, level = .3, col = C.blue) => g(x, y, s, `<rect x="-6" y="-60" width="12" height="54" rx="6" fill="#fff" stroke="${C.metalD}" stroke-width="2"/><circle cx="0" cy="-4" r="9" fill="${col}" stroke="${C.metalD}" stroke-width="2"/><rect x="-3" y="${-8 - 46 * level}" width="6" height="${46 * level}" fill="${col}"/>`);
  const cloud = (x, y, s = 1, col = '#fff') => g(x, y, s, `<ellipse cx="0" cy="0" rx="28" ry="14" fill="${col}"/><circle cx="-14" cy="-6" r="12" fill="${col}"/><circle cx="8" cy="-10" r="15" fill="${col}"/>`);
  const rain = (x, y, s = 1) => g(x, y, s, [0, 1, 2, 3, 4, 5].map(i => `<path d="M${-20 + i * 8} ${(i % 2) * 6} l-4 12" stroke="${C.blue}" stroke-width="2.5" stroke-linecap="round"/>`).join(''));
  const wind = (x, y, s = 1) => g(x, y, s, `<path d="M0 0 H50 Q62 0 60 -10 Q56 -18 48 -12 M0 14 H70 Q82 14 80 24 Q76 32 68 26 M10 -16 H36" stroke="#7d93a1" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  const bolt = (x, y, s = 1) => g(x, y, s, `<path d="M0 0 L-10 22 H0 L-6 42 L14 14 H4 L10 0Z" fill="${C.yellow}" stroke="#c89b2a"/>`);
  const hail = (x, y) => [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${x - 24 + i * 8}" cy="${y + (i % 3) * 7}" r="3" fill="#fff" stroke="#a9c3d3"/>`).join('');
  const fleece = (x, y, w, h) => `<path d="M${x} ${y} Q${x} ${y - h} ${x + w / 2} ${y - h} Q${x + w} ${y - h} ${x + w} ${y}" fill="${C.fleece}" stroke="#d7e3ea" stroke-width="2"/>`;
  const tunnel = (x, y, w, h, open = false) => `<path d="M${x} ${y} Q${x} ${y - h} ${x + w / 2} ${y - h} Q${x + w} ${y - h} ${x + w} ${y}Z" fill="rgba(225,240,248,.55)" stroke="#9fb8c6" stroke-width="2.5"/>${[.25, .5, .75].map(f => `<path d="M${x + w * f} ${y} Q${x + w * f} ${y - h * 1.0} ${x + w * f} ${y - h * .99}" stroke="#9fb8c6" stroke-width="1"/>`).join('')}${open ? `<path d="M${x + w - 8} ${y} V${y - h * .55} Q${x + w - 4} ${y - h * .7} ${x + w + 18} ${y - h * .6} V${y}" fill="rgba(255,255,255,.5)" stroke="#9fb8c6" stroke-width="2"/>` : ''}`;
  const mulch = (x, y, w) => { let b = ''; for (let i = 0; i < w / 6; i++) b += `<path d="M${x + i * 6} ${y - (i % 3) * 2} l8 ${(i % 2 ? -3 : 3)}" stroke="${C.straw}" stroke-width="2.5" stroke-linecap="round"/>`; return b; };
  const magnifier = (x, y, s = 1) => g(x, y, s, `<circle cx="0" cy="0" r="20" fill="rgba(220,240,250,.55)" stroke="${C.ink}" stroke-width="5"/><path d="M14 14 L32 32" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`);
  const bug = (x, y, s = 1, col = C.leafD) => g(x, y, s, `<ellipse cx="0" cy="0" rx="6" ry="8" fill="${col}"/><circle cx="0" cy="-9" r="3.5" fill="${C.ink}"/><path d="M-6 -2 l-5 -3 M-6 3 l-5 2 M6 -2 l5 -3 M6 3 l5 2" stroke="${C.ink}" stroke-width="1.2"/>`);
  const ladybug = (x, y, s = 1) => g(x, y, s, `<circle cx="0" cy="0" r="8" fill="${C.red}"/><path d="M0 -8 V8" stroke="${C.ink}"/><circle cx="-4" cy="-2" r="1.8" fill="${C.ink}"/><circle cx="4" cy="2" r="1.8" fill="${C.ink}"/><circle cx="0" cy="-10" r="3.5" fill="${C.ink}"/>`);
  const pot = (x, y, s = 1, inner = '') => g(x, y, s, `${inner}<path d="M-20 -28 H20 L15 0 H-15Z" fill="#c9693f"/><rect x="-23" y="-34" width="46" height="8" rx="2" fill="#b65a33"/>`);
  const house = (x, y, s = 1) => g(x, y, s, `<rect x="-40" y="-50" width="80" height="50" fill="#f3e6cc"/><path d="M-48 -48 L0 -86 L48 -48Z" fill="${C.red}"/><rect x="-10" y="-30" width="20" height="30" fill="${C.wood}"/><rect x="18" y="-38" width="14" height="14" fill="${C.blueL}"/><rect x="-32" y="-38" width="14" height="14" fill="${C.blueL}"/>`);
  const check = (x, y, ok = true) => ok ? `<circle cx="${x}" cy="${y}" r="13" fill="${C.ok}"/><path d="M${x - 6} ${y} l4 5 l8 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<circle cx="${x}" cy="${y}" r="13" fill="${C.bad}"/><path d="M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  const label = (x, y, t, anchor = 'middle', col = C.note, size = 12) => `<text x="${x}" y="${y}" font-size="${size}" font-family="Nunito, system-ui, sans-serif" font-weight="700" fill="${col}" text-anchor="${anchor}">${t}</text>`;
  const arrow = (x1, y1, x2, y2, col = C.note) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 7; return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="2"/><path d="M${x2} ${y2} L${x2 - h * Math.cos(a - .45)} ${y2 - h * Math.sin(a - .45)} L${x2 - h * Math.cos(a + .45)} ${y2 - h * Math.sin(a + .45)}Z" fill="${col}"/>`; };
  const dim = (x1, y1, x2, y2, t, col = C.note) => `${arrow((x1 + x2) / 2, (y1 + y2) / 2, x1, y1, col)}${arrow((x1 + x2) / 2, (y1 + y2) / 2, x2, y2, col)}${label((x1 + x2) / 2 + (x1 === x2 ? 6 : 0), (y1 + y2) / 2 - (y1 === y2 ? 6 : -4), t, x1 === x2 ? 'start' : 'middle', col, 11)}`;

  /* ---------- Plantă după categorie ---------- */
  function plantArt(p, x, y, s = 1) {
    if (!p) return seedling(x, y, 1.6 * s);
    const id = p.id || '';
    if (p.cat === 'pom') { const col = { cires: C.red, visin: '#9b1d2a', prun: C.purple, cais: C.orange, piersic: '#f0956b', par: '#c8c544', gutui: C.yellow, nuc: '#7e8f3c', smochin: '#6b4a5e', citrice: C.yellow }[id] || C.red; return tree(x, y, s, col); }
    if (p.cat === 'vita') return vine(x, y, s * .9);
    if (p.cat === 'arbust') return bush(x, y, s * 1.2, { zmeur: C.red, afin: '#4b5d9e', coacaz: '#2d2a3a', mur: '#2d2a3a' }[id] || C.red);
    if (p.cat === 'flori') return p.life === 'bulb' && id === 'lalele' ? tulip(x - 15, y, s * 1.2) + tulip(x + 10, y, s * 1.3, C.yellow) + tulip(x + 32, y, s * 1.1, C.pink) : flower(x - 14, y, s * 1.2, id === 'trandafir' ? C.red : id === 'craite' ? C.orange : id === 'muscate' ? '#e0475e' : C.pink) + flower(x + 18, y, s, id === 'craite' ? C.yellow : C.pink);
    if (['castraveti', 'dovlecei', 'dovleac', 'pepene', 'fasole', 'mazare'].includes(id)) return cuke(x, y, s);
    if (['morcovi', 'sfecla', 'ridichi', 'ceapa', 'usturoi', 'praz', 'patrunjel'].includes(id)) return carrotRow(x - 40, y, 4);
    if (['salata', 'spanac', 'varza', 'broccoli', 'busuioc', 'menta', 'marar', 'lavanda', 'cartofi', 'capsuni'].includes(id)) return bush(x, y, s * .8, id === 'capsuni' ? C.red : null);
    return tomato(x, y, s, true);
  }

  /* ---------- Scene pentru fiecare tip de sarcină ---------- */
  function task(type, p) {
    const P = (x, y, s) => plantArt(p, x, y, s);
    switch (type) {
      case 'pregatire_sol': return scene(`${shovel(120, 176, 1.2, 12)}${rake(260, 178, 1.1, -10)}<path d="M150 172 q20 -16 46 -4 q14 -12 30 0" fill="${C.soilL}"/>${sack(330, 176, 1, 'compost', C.soil2)}${gloves(60, 176, 1.3)}`);
      case 'semanat_interior': return scene(`${house(70, 172, .9)}${tray(220, 160, 1.4)}<rect x="140" y="160" width="160" height="12" fill="${C.wood}"/>${label(220, 48, '18–25 °C', 'middle', C.orange, 16)}${thermo(320, 166, 1, .7, C.red)}<path d="M220 60 L180 110 M220 60 L260 110 M220 60 V110" stroke="${C.yellow}" stroke-width="3" opacity=".6"/><rect x="190" y="52" width="60" height="10" rx="4" fill="${C.metalD}"/>`);
      case 'repicat': return scene(`${tray(120, 172, 1.1)}${pot(250, 172, 1.2, seedling(0, -28, 1.1))}${pot(320, 172, 1.2, seedling(0, -28, 1.1))}${arrow(178, 130, 222, 130)}${label(200, 120, '1–2 frunze')}`);
      case 'calire': return scene(`${house(60, 172, .9)}${tray(220, 172, 1.2)}${arrow(110, 120, 160, 140)}${label(300, 60, '1 h → 2 h → toată ziua', 'middle', C.note, 13)}${wind(300, 100, .6)}`);
      case 'transplant': return scene(`${P(200, 176, .9)}${pot(110, 172, 1.1, seedling(0, -28, 1.2))}${can(300, 176, .9, true)}<ellipse cx="200" cy="180" rx="30" ry="5" fill="${C.soil2}"/>`);
      case 'semanat_direct': return scene(`<path d="M30 176 H370" stroke="${C.soil2}" stroke-width="5" stroke-dasharray="2 0"/>${[60, 100, 140, 180].map(x => `<ellipse cx="${x}" cy="178" rx="3" ry="2" fill="#e5c28a"/>`).join('')}${[220, 260, 300, 340].map(x => seedling(x, 174, 1)).join('')}${rake(80, 150, .8, -30)}<path d="M30 140 H370" stroke="${C.straw}" stroke-width="1.5" stroke-dasharray="4 4"/>${stake(30, 176, .4)}${stake(370, 176, .4)}`);
      case 'rarit': return scene(`${[80, 100, 120, 140, 160].map((x, i) => seedling(x, 174, i % 2 ? .8 : 1.1)).join('')}${arrow(180, 130, 220, 130)}${[250, 300, 350].map(x => seedling(x, 174, 1.3)).join('')}${dim(250, 190, 300, 190, 'distanță')}`);
      case 'plantare_bulbi': return scene(`<path d="M90 172 v26 h40 v-26" fill="${C.soil2}"/>${bulb(110, 196, 1)}<path d="M200 172 v26 h40 v-26" fill="${C.soil2}"/>${bulb(220, 196, 1)}${tulip(320, 172, 1.3)}${tulip(345, 172, 1.2, C.yellow)}${shovel(40, 170, .8, 15)}`);
      case 'plantare_pom': return scene(`<path d="M150 172 v38 h100 v-38" fill="${C.soil2}"/>${tree(200, 200, .75, null)}${stake(232, 205, .9)}${can(320, 176, .9, true)}${shovel(70, 176, 1.1, 10)}`);
      case 'mulcire': return scene(`${P(200, 172, .9)}${mulch(120, 170, 60)}${mulch(220, 170, 60)}${basket(330, 176, .9, C.straw)}`);
      case 'plivit': return scene(`${P(150, 172, .8)}${[240, 270, 300].map(x => `<path d="M${x} 172 l-6 -14 M${x} 172 l0 -18 M${x} 172 l7 -13" stroke="${C.grassD}" stroke-width="2.5"/>`).join('')}${hoe(320, 176, 1, -20)}${gloves(60, 176, 1.2)}`);
      case 'udare': return scene(`${P(150, 172, .85)}${can(230, 150, 1.1, true)}${[150, 160, 170].map(x => `<path d="M${x - 30} 180 q30 18 60 0" stroke="${C.blueL}" stroke-width="2" fill="none" opacity=".8"/>`).join('')}${label(320, 70, 'la rădăcină', 'middle', C.blue, 14)}`);
      case 'fertilizare': return scene(`${P(180, 172, .85)}${sack(300, 176, 1.1, 'NPK', C.ok)}${can(80, 176, .8)}${[170, 185, 200, 215].map(x => `<circle cx="${x}" cy="176" r="2.5" fill="#f0e2b8"/>`).join('')}`);
      case 'palisare': return scene(`${tomato(170, 176, .95, true, true)}${twine(280, 176, 1.4)}${stake(320, 176, .8)}${stake(340, 176, .8)}`);
      case 'copilit': return scene(`${tomato(200, 176, 1, true, true)}<circle cx="190" cy="118" r="16" fill="none" stroke="${C.bad}" stroke-width="3" stroke-dasharray="4 3"/>${label(140, 70, 'copil', 'middle', C.bad, 14)}${arrow(150, 76, 180, 108, C.bad)}`);
      case 'carnit': return scene(`${tomato(200, 176, 1, true, true)}${shears(232, 66, .8, -20)}<path d="M180 76 H220" stroke="${C.bad}" stroke-width="3" stroke-dasharray="5 3"/>`);
      case 'musuroire': return scene(`<path d="M60 172 Q100 140 140 172 M170 172 Q210 140 250 172 M280 172 Q320 140 360 172" fill="${C.soilL}"/>${[100, 210, 320].map(x => bush(x, 154, .5)).join('')}${hoe(370, 176, .9, -25)}`);
      case 'tratament_fungic': case 'alerta_boli': return scene(`${P(260, 176, .9)}${sprayer(120, 176, 1)}${type === 'alerta_boli' ? `${cloud(80, 50, 1)}${rain(80, 66, .9)}` : ''}${gloves(40, 176, 1)}`);
      case 'monitorizare': return scene(`${P(180, 176, .9)}${magnifier(270, 100, 1.1)}${bug(268, 98, .9)}${ladybug(150, 110, 1)}${bug(205, 140, .7, C.leafL)}`);
      case 'recoltare': return scene(`${P(130, 176, .85)}${basket(280, 176, 1.3, p && p.cat === 'pom' ? C.red : C.red)}`);
      case 'recoltare_seminte': return scene(`${jar(140, 176, 1.4)}${envelope(240, 176, 1.4)}${P(330, 176, .6)}`);
      case 'curatare_toamna': return scene(`${rake(110, 176, 1.1, -12)}${[200, 230, 260, 290, 215, 275].map((x, i) => leafP(x, 168 - (i % 2) * 6, .9, i * 40, [C.orange, C.yellow, C.red][i % 3])).join('')}${basket(330, 176, .9, C.orange)}`);
      case 'taiere_iarna': return scene(`${p && p.cat === 'vita' ? vine(200, 176, 1, false, true) : tree(200, 176, .95, null, { bare: true })}${shears(300, 90, 1, -30)}${[150, 260].map(x => `<path d="M${x} 168 l10 -3" stroke="${C.woodD}" stroke-width="3"/>`).join('')}`, { noSun: true });
      case 'taiere_vara': return scene(`${p && p.cat === 'arbust' ? bush(190, 176, 1.4) : P(190, 176, .9)}${shears(300, 90, 1, -30)}`);
      case 'tratament_repaus': return scene(`${tree(170, 176, .95, null, { bare: true })}${sprayer(300, 176, .9)}${thermo(60, 170, 1, .35, C.orange)}${label(60, 190, '> 5 °C', 'middle', '#fff', 11)}`, { noSun: true });
      case 'tratament_dezmugurire': return scene(`${tree(170, 176, .95, null, { bare: true })}${[[-30, -100], [10, -125], [30, -105], [-20, -85]].map(([a, b]) => `<circle cx="${170 + a * .95}" cy="${176 + b * .95}" r="4" fill="${C.leafL}"/>`).join('')}${sprayer(300, 176, .9)}`);
      case 'tratament_inflorit': return scene(`${tree(170, 176, .95, null, { blossom: true })}${sprayer(300, 176, .9)}${g(60, 70, 1, `<ellipse cx="0" cy="0" rx="9" ry="6" fill="${C.yellow}"/><path d="M-4 -6 v12 M2 -6 v12" stroke="${C.ink}" stroke-width="2"/><ellipse cx="-2" cy="-9" rx="6" ry="4" fill="#fff" opacity=".8"/>`)}`);
      case 'rarire_fructe': return scene(`${tree(200, 176, 1, C.red)}${shears(300, 80, .8, -30)}`);
      case 'legat_coarde': return scene(`${vine(200, 176, 1.1, false, true)}${twine(330, 176, 1.2)}`, { noSun: true });
      case 'taiere_verde': return scene(`${vine(200, 176, 1.1, false)}${shears(320, 70, .8, -30)}`);
      case 'desfrunzit': return scene(`${vine(200, 176, 1.1, true)}${leafP(310, 150, 1.2, 20, C.leaf)}${leafP(330, 160, 1, 80, C.leafL)}`);
      case 'butasire': return scene(`${pot(150, 172, 1.4, g(0, -28, 1, `<rect x="-2" y="-40" width="4" height="40" fill="${C.woodD}"/><circle cx="0" cy="-30" r="3" fill="${C.leafL}"/><circle cx="0" cy="-40" r="3" fill="${C.leafL}"/>${leafP(0, -40, .7, -60)}`))}<path d="M126 172 q24 -60 48 0" fill="rgba(225,240,248,.5)" stroke="#9fb8c6" stroke-width="2"/>${shears(270, 120, .9, 20)}${P(330, 176, .5)}`);
      case 'flori_trecute': return scene(`${flower(160, 176, 1.6, p && p.id === 'trandafir' ? C.red : C.pink)}${g(240, 140, 1.3, `<path d="M0 30 V0" stroke="${C.woodD}" stroke-width="2"/><ellipse cx="0" cy="-2" rx="9" ry="6" fill="#9a6b57"/>`)}${shears(300, 100, .8, -40)}`);
      case 'scoatere_bulbi': return scene(`${[120, 160, 200].map(x => bulb(x, 168, 1.1, '#d9b48c')).join('')}<rect x="250" y="140" width="100" height="36" fill="${C.wood}"/><path d="M250 152 H350 M250 164 H350" stroke="${C.woodD}"/>${shovel(60, 176, 1, 10)}`);
      case 'protectie_iarna': return scene(`${fleece(130, 172, 140, 90)}${bush(200, 172, .9)}${[60, 100, 300, 340].map(x => `<path d="M${x} 50 l0 8 M${x - 4} 54 l8 0" stroke="#fff" stroke-width="2"/>`).join('')}${mulch(110, 172, 180)}`, { noSun: true });
      case 'iernare_interior': return scene(`${house(250, 172, 1.3)}${pot(110, 172, 1.2, flower(0, -28, .8, '#e0475e'))}${arrow(140, 120, 190, 120)}`);
      case 'scoatere_afara': return scene(`${house(90, 172, 1.1)}${pot(260, 172, 1.2, flower(0, -28, .8, '#e0475e'))}${arrow(150, 120, 220, 120)}`);
      case 'protectie_inghet': return scene(`${fleece(110, 172, 180, 110)}${P(200, 172, .8)}${thermo(340, 164, 1, .12, C.blue)}${label(340, 190, '0 °C', 'middle', '#fff', 11)}`, { night: true });
      case 'aerisire': return scene(`${tunnel(60, 172, 260, 110, true)}${tomato(150, 172, .7)}${tomato(220, 172, .7)}${wind(300, 120, .8)}${thermo(40, 164, 1, .85, C.red)}`);
      case 'umbrire': return scene(`<rect x="90" y="70" width="220" height="10" fill="#4b5a52" opacity=".75"/><path d="M90 80 V172 M310 80 V172" stroke="${C.wood}" stroke-width="4"/>${P(200, 172, .8)}${thermo(350, 164, 1, .95, C.red)}<circle cx="345" cy="42" r="26" fill="${C.orange}"/>`, { noSun: true });
      case 'vant': return scene(`${P(220, 176, .9)}${wind(60, 80, 1.3)}${wind(80, 130, .9)}${stake(250, 176, .8)}`, { storm: true });
      case 'grindina': return scene(`${cloud(150, 50, 1.4, '#8996a0')}${cloud(250, 46, 1.2, '#9aa7b0')}${bolt(210, 64, 1.1)}${hail(150, 90)}${hail(260, 100)}${P(200, 176, .8)}`, { storm: true });
      default: return scene(`${P(200, 176, 1)}`);
    }
  }

  /* ---------- Diagrame pas cu pas ---------- */
  const panel = (body, h = 200) => svg(400, h, `<rect width="400" height="${h}" rx="0" fill="#fbf8ef"/>${body}`);
  const soilBox = (y = 90, h = 110) => `<rect x="0" y="${y}" width="400" height="${h}" fill="${C.soilL}"/><rect x="0" y="${y}" width="400" height="5" fill="${C.soil}"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 53) % 400}" cy="${y + 15 + (i * 37) % (h - 20)}" r="${1 + (i % 3)}" fill="${C.soil}" opacity=".45"/>`).join('')}`;

  function diagrams(type, p) {
    const D = [];
    const add = (body, caption, h) => D.push({ svg: panel(body, h), caption });
    switch (type) {
      case 'semanat_direct':
      case 'semanat_interior':
        add(`${soilBox(80)}${[80, 200, 320].map((x, i) => `<path d="M${x - 30} 85 Q${x} 105 ${x + 30} 85" fill="${C.soil}" opacity=".5"/><ellipse cx="${x}" cy="${[96, 104, 112][i]}" rx="${[3, 5, 8][i]}" ry="${[2, 3.5, 5][i]}" fill="#e5c28a" stroke="#b9926a"/>${dim(x + 22, 85, x + 22, [96, 104, 112][i], '')}${label(x, 150, ['semințe mici', 'semințe medii', 'semințe mari'][i])}${label(x, 168, ['0,5–1 cm', '1–2 cm', '3–5 cm'][i], 'middle', C.ok)}`).join('')}${label(200, 40, 'Adâncimea = de 2–3 ori grosimea seminței', 'middle', C.note, 14)}`, 'Cât de adânc semănați: semințele mici aproape de suprafață, cele mari mai adânc.');
        add(`${soilBox(110, 90)}${seedling(110, 110, 1.6)}${seedling(290, 110, 1.6)}${dim(110, 140, 290, 140, 'distanța din fișa plantei')}${can(50, 60, .5, true)}${label(150, 40, '1. udați rigola', 'middle')}${label(290, 40, '2. semănați, acoperiți, tasați', 'middle')}`, 'Udați rigola înainte, apoi semănați și tasați ușor – sămânța trebuie să atingă pământul umed.');
        break;
      case 'transplant':
        add(`${soilBox(100)}<path d="M150 105 v55 h100 v-55" fill="${C.soil}" opacity=".6"/>${tomato(200, 160, .6, false)}<path d="M200 160 V120" stroke="${C.stem}" stroke-width="3"/>${[150, 162, 174].map(y => `<path d="M200 ${y - 20} l-10 6 M200 ${y - 20} l10 6" stroke="#e9d8b8" stroke-width="1.5"/>`).join('')}${dim(270, 100, 270, 160, 'mai adânc')}${label(80, 60, 'Roșii, ardei, varză:', 'middle')}${label(80, 76, 'îngropați tulpina', 'middle', C.ok)}${label(80, 92, 'până la primele frunze', 'middle', C.ok)}`, 'Roșiile fac rădăcini noi pe tulpina îngropată – planta devine mai puternică.');
        add(`${soilBox(110, 90)}<path d="M120 112 Q200 130 280 112" fill="${C.soil}"/>${seedling(200, 112, 2)}${can(80, 80, .7, true)}${label(300, 60, '1–2 L apă / plantă', 'middle', C.blue)}${label(300, 80, 'chiar dacă plouă', 'middle', C.note)}<path d="M150 116 q50 -10 100 0" stroke="${C.ok}" stroke-width="3" fill="none"/>${label(200, 160, 'tasați cu palmele', 'middle', '#fff')}`, 'Tasați pământul în jurul tulpinii și udați imediat, ca rădăcinile să intre în contact cu solul.');
        break;
      case 'copilit':
        add(`<path d="M160 190 C158 140 162 90 160 20" stroke="${C.stem}" stroke-width="7" fill="none"/>${leafP(160, 110, 2.2, -20, C.leaf)}<path d="M160 104 C170 92 182 82 186 64" stroke="${C.stem}" stroke-width="4" fill="none"/>${leafP(186, 66, .8, -80, C.leafL)}${leafP(186, 66, .8, -10, C.leafL)}<circle cx="176" cy="84" r="24" fill="none" stroke="${C.bad}" stroke-width="3" stroke-dasharray="5 4"/>${label(240, 50, 'COPIL – se rupe', 'start', C.bad, 13)}${arrow(238, 54, 200, 76, C.bad)}${label(240, 128, 'frunză – rămâne', 'start', C.ok, 13)}${arrow(238, 124, 205, 112, C.ok)}${g(100, 150, 1, `<path d="M0 0 C-10 -6 -14 -14 -12 -22" stroke="${C.stem}" stroke-width="3" fill="none"/>${[0, 1, 2].map(i => `<circle cx="${-12 - i * 6}" cy="${-24 + i * 2}" r="3" fill="${C.yellow}"/>`).join('')}`)}${label(70, 175, 'floare – rămâne', 'middle', C.ok, 12)}`, 'Copilul crește în unghiul dintre tulpină și frunză. Rupeți-l cât are 3–5 cm, aplecându-l lateral.', 200);
        break;
      case 'carnit':
        add(`<path d="M200 195 V30" stroke="${C.stem}" stroke-width="6"/>${[150, 110].map(y => g(200, y, 1, [0, 1, 2, 3].map(i => `<circle cx="${18 + i * 9}" cy="${i * 4}" r="6" fill="${C.red}"/>`).join('')))}${leafP(200, 90, 1.3, -160)}${leafP(200, 70, 1.3, -20)}<path d="M170 56 H230" stroke="${C.bad}" stroke-width="3" stroke-dasharray="6 4"/>${shears(250, 54, .7, -60)}${label(110, 152, 'ultimul etaj de flori', 'middle', C.note, 12)}${label(110, 80, '2 frunze deasupra', 'middle', C.ok, 12)}${label(300, 90, 'tăiați aici', 'start', C.bad, 13)}`, 'Ciupiți vârful la 2 frunze deasupra ultimului etaj de flori.');
        break;
      case 'palisare':
        add(`<rect x="230" y="20" width="10" height="170" fill="${C.wood}"/><path d="M190 190 C188 140 194 80 190 20" stroke="${C.stem}" stroke-width="8" fill="none"/><path d="M190 100 C205 88 225 112 235 100 C225 88 205 112 190 100" stroke="${C.straw}" stroke-width="3.5" fill="none"/>${label(110, 96, 'legați în „8”', 'middle', C.ok, 14)}${label(110, 116, 'bucla largă pe tulpină', 'middle', C.note, 12)}${check(300, 100)}<path d="M120 160 C150 155 175 165 190 160 C200 156 230 160 235 165" stroke="${C.bad}" stroke-width="3" fill="none"/>${label(110, 175, 'nu strângeți tulpina', 'middle', C.bad, 12)}`, 'Legătura în formă de 8 lasă loc tulpinii să se îngroașe fără să fie strangulată.');
        break;
      case 'taiere_iarna':
      case 'taiere_vara':
        add(`${[[80, true, 'corect'], [200, false, 'prea departe'], [320, false, 'prea aproape']].map(([x, ok, t], i) => `<path d="M${x} 168 V70" stroke="${C.woodD}" stroke-width="10" stroke-linecap="round"/><path d="M${x + 5} 120 q10 -6 12 -16 q-10 2 -12 6Z" fill="${C.leafL}" stroke="${C.leafD}"/>${i === 0 ? `<path d="M${x - 12} 100 L${x + 12} 92" stroke="${C.bad}" stroke-width="3"/>` : i === 1 ? `<path d="M${x - 12} 80 L${x + 12} 72" stroke="${C.bad}" stroke-width="3"/>` : `<path d="M${x - 12} 120 L${x + 12} 112" stroke="${C.bad}" stroke-width="3"/>`}${check(x, 40, ok)}${label(x, 22 + 0, '', 'middle')}${label(x + 0, 205 - 10, t, 'middle', ok ? C.ok : C.bad)}`).join('')}`, 'Tăiați oblic, la 0,5–1 cm deasupra unui mugur orientat spre exterior. Ciotul lung se usucă, iar tăietura prea apropiată usucă mugurul.', 210);
        if (p && p.vineOps && type === 'taiere_iarna') {
          add(`<rect x="0" y="170" width="400" height="30" fill="${C.soilL}"/><path d="M200 172 V110" stroke="${C.woodD}" stroke-width="12" stroke-linecap="round"/><path d="M200 112 C240 100 300 96 370 104" stroke="${C.wood}" stroke-width="6" fill="none"/>${[230, 255, 280, 305, 330, 355].map(x => `<circle cx="${x}" cy="${102 - (x - 230) * .02}" r="4" fill="${C.leafL}" stroke="${C.leafD}"/>`).join('')}<path d="M196 112 C186 100 176 98 168 96" stroke="${C.wood}" stroke-width="6" fill="none"/>${[176, 168].map(x => `<circle cx="${x}" cy="97" r="4" fill="${C.leafL}" stroke="${C.leafD}"/>`).join('')}<path d="M60 70 H380" stroke="${C.metalD}" stroke-width="2"/><path d="M60 104 H380" stroke="${C.metalD}" stroke-width="1.5" stroke-dasharray="3 3"/>${label(300, 80, 'coardă de rod: 8–12 ochi', 'middle', C.ok, 13)}${label(130, 130, 'cep: 2 ochi', 'middle', C.ok, 13)}${label(200, 190, 'restul lemnului de anul trecut se elimină', 'middle', '#fff', 11)}`, 'Sistemul Guyot: o coardă lungă pentru rod și un cep scurt de înlocuire pentru anul viitor.');
        } else {
          add(`<path d="M20 120 H380" stroke="${C.woodD}" stroke-width="22" stroke-linecap="round"/><path d="M60 120 H360" stroke="${C.wood}" stroke-width="12" opacity=".4"/>${[[120, '1', 'dedesubt'], [170, '2', 'deasupra'], [300, '3', 'la inel']].map(([x, n, t]) => `<path d="M${x} ${n === '1' ? 135 : 100} V${n === '1' ? 118 : 140}" stroke="${C.bad}" stroke-width="3"/><circle cx="${x}" cy="${n === '1' ? 165 : 75}" r="12" fill="${C.ok}"/>${label(x, n === '1' ? 169 : 79, n, 'middle', '#fff', 13)}${label(x, n === '1' ? 195 : 50, t, 'middle')}`).join('')}<path d="M330 90 V150" stroke="${C.woodD}" stroke-width="30"/>`, 'Ramurile groase se taie în 3 timpi, ca greutatea să nu rupă coaja.');
        }
        break;
      case 'plantare_pom':
        add(`${soilBox(70, 130)}<path d="M120 75 v100 h160 v-100" fill="${C.soil2}" opacity=".55"/><path d="M150 170 Q200 140 250 170" fill="${C.soil}"/>${g(200, 152, 1, `<path d="M-30 10 Q-14 -2 0 0 Q14 -2 30 10 M-20 18 Q-8 4 0 0 M20 18 Q8 4 0 0" stroke="#d9bf95" stroke-width="3" fill="none"/><rect x="-5" y="-110" width="10" height="110" fill="${C.woodD}"/><path d="M-7 -96 h14" stroke="${C.bad}" stroke-width="3"/>`)}<rect x="232" y="10" width="6" height="170" fill="${C.wood}"/>${label(80, 24, 'punct de altoire', 'middle', C.bad, 12)}${label(80, 40, '5–10 cm deasupra solului', 'middle', C.note, 11)}${arrow(120, 46, 192, 56, C.bad)}${dim(120, 190, 280, 190, '60 cm')}${dim(300, 75, 300, 175, '60 cm')}${label(330, 30, 'țăruș pe partea vântului', 'middle', C.note, 11)}`, 'Groapa de 60 × 60 × 60 cm, țărușul bătut înainte, iar punctul de altoire deasupra solului.', 210);
        break;
      case 'tratament_fungic':
      case 'alerta_boli':
      case 'tratament_dezmugurire':
      case 'tratament_inflorit':
      case 'tratament_repaus':
        add(`${leafP(90, 100, 4, -10, C.leaf)}${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${110 + (i % 4) * 16}" cy="${86 + Math.floor(i / 4) * 18}" r="3" fill="${C.blueL}" stroke="${C.blue}"/>`).join('')}${label(150, 150, 'fața frunzei', 'middle')}${leafP(240, 100, 4, -10, C.leafL)}${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${260 + (i % 4) * 16}" cy="${90 + Math.floor(i / 4) * 16}" r="3" fill="${C.blueL}" stroke="${C.blue}"/>`).join('')}${label(300, 150, 'dosul frunzei!', 'middle', C.ok)}${label(200, 40, 'Udați complet ambele fețe, până la început de picurare', 'middle', C.note, 13)}`, 'Ciupercile atacă adesea pe dosul frunzelor – acolo trebuie să ajungă și soluția.');
        add(`${[[70, 'fără ploaie', `${cloud(0, -14, .8, '#9aa7b0')}${rain(0, 0, .7)}`, 'min. 6–24 h'], [200, 'vânt slab', `${wind(-30, -10, .6)}`, 'sub 15 km/h'], [330, 'nu pe caniculă', `<circle cx="0" cy="-12" r="16" fill="${C.sun}"/>`, 'sub 25–28 °C']].map(([x, t, ic, sub]) => `${g(x, 80, 1, ic)}${label(x, 130, t, 'middle', C.note, 13)}${label(x, 150, sub, 'middle', C.ok, 12)}`).join('')}<path d="M45 60 l50 40 M95 60 l-50 40" stroke="${C.bad}" stroke-width="3" opacity=".75"/>`, 'Condițiile bune pentru stropit: aplicația verifică automat prognoza.', 170);
        break;
      case 'udare':
        add(`${soilBox(60, 140)}${[100, 300].map((x, i) => `${tomato(x, 62, .45, false)}<path d="M${x} 62 V${i ? 120 : 90}" stroke="#e9d8b8" stroke-width="2"/>${[0, 1, 2].map(k => `<path d="M${x} ${70 + k * (i ? 16 : 7)} l${-14 - k * 4} ${8 + k * 3} M${x} ${70 + k * (i ? 16 : 7)} l${14 + k * 4} ${8 + k * 3}" stroke="#e9d8b8" stroke-width="1.5"/>`).join('')}<rect x="${x - 50}" y="64" width="100" height="${i ? 90 : 24}" fill="${C.blue}" opacity=".18"/>${check(x, 30, !!i)}${label(x, 190, i ? 'rar și abundent' : 'des și puțin', 'middle', '#fff', 13)}`).join('')}`, 'Udarea rară și abundentă trimite rădăcinile în adâncime, unde solul rămâne umed mai mult timp.', 200);
        break;
      case 'mulcire':
        add(`${soilBox(120, 80)}${bush(200, 122, .9)}${mulch(70, 120, 100)}${mulch(230, 120, 100)}${label(200, 160, 'lăsați 3–5 cm liber lângă tulpină', 'middle', '#fff', 12)}${dim(350, 112, 350, 122, '')}${label(330, 90, 'strat 5–8 cm', 'middle', C.ok, 12)}`, 'Lăsați un inel liber în jurul tulpinii, ca să nu putrezească.', 180);
        break;
      case 'butasire':
        add(`<rect x="170" y="30" width="16" height="150" rx="6" fill="${C.wood}"/>${[50, 85, 120, 155].map(y => `<path d="M186 ${y} q8 -4 6 -12 q-6 3 -6 6Z" fill="${C.leafL}" stroke="${C.leafD}"/>`).join('')}<path d="M164 34 L192 26" stroke="${C.bad}" stroke-width="3"/><path d="M164 172 L192 184" stroke="${C.bad}" stroke-width="3"/>${label(212, 34, 'sus: drept, peste un mugur', 'start', C.note, 11)}${label(212, 186, 'jos: oblic, sub un nod', 'start', C.note, 11)}<rect x="0" y="110" width="140" height="90" fill="${C.soilL}"/>${label(70, 160, '2/3 în substrat', 'middle', '#fff', 12)}${dim(150, 30, 150, 180, '20–30 cm')}`, 'Butașul lemnos: 3–4 muguri; tăietura de jos oblic, cea de sus dreaptă (ca să știți care e capătul de sus).', 200);
        break;
      case 'rarire_fructe':
        add(`${[[100, 5, false, 'înainte'], [300, 2, true, 'după']].map(([x, n, ok, t]) => `<path d="M${x - 60} 60 Q${x} 40 ${x + 60} 60" stroke="${C.woodD}" stroke-width="6" fill="none"/>${Array.from({ length: n }, (_, i) => `<path d="M${x - 20 + i * (n > 2 ? 10 : 30)} 52 v20" stroke="${C.stem}" stroke-width="2"/><circle cx="${x - 20 + i * (n > 2 ? 10 : 30)}" cy="${n > 2 ? 80 : 88}" r="${n > 2 ? 8 : 15}" fill="${C.red}"/>`).join('')}${check(x, 140, ok)}${label(x, 180, t, 'middle', ok ? C.ok : C.bad)}`).join('')}`, 'Lăsați 1–2 fructe pe buchet: veți avea fructe mai mari, iar pomul va rodi constant de la un an la altul.', 195);
        break;
      case 'musuroire':
        add(`${soilBox(120, 80)}<path d="M120 122 Q200 60 280 122Z" fill="${C.soil}"/>${bush(200, 82, .6)}${[[170, 110], [200, 116], [230, 108]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="10" ry="7" fill="#e3c18a"/>`).join('')}${dim(300, 70, 300, 122, '15–20 cm')}${label(200, 160, 'tuberculii se formează în mușuroi', 'middle', '#fff', 12)}`, 'Trageți pământul spre plante: tuberculii nu se înverzesc și se formează mai mulți.', 190);
        break;
      case 'aerisire':
        add(`${tunnel(40, 180, 320, 150, true)}${arrow(80, 120, 160, 100, C.blue)}${arrow(220, 90, 340, 120, C.red)}${label(200, 60, 'deschideți la > 25 °C în interior', 'middle', C.note, 13)}${label(200, 160, 'închideți pe la 16–17', 'middle', C.ok, 12)}`, 'Aerisirea elimină căldura excesivă și umezeala care favorizează mana.', 190);
        break;
      case 'protectie_inghet':
        add(`${soilBox(150, 50)}${fleece(80, 150, 240, 110)}${tomato(200, 150, .7, false)}${[120, 280].map(x => `<rect x="${x - 6}" y="138" width="12" height="12" fill="#8c8c8c"/>`).join('')}${label(200, 26, 'agril peste plante, fixat la margini', 'middle', C.note, 13)}${label(200, 190, 'udați solul după-amiaza – cedează căldură noaptea', 'middle', '#fff', 11)}`, 'Acoperiți seara, înainte de apus, și descoperiți dimineața după ce trece de 5 °C.', 200);
        break;
      case 'recoltare_seminte':
        add(`${[[70, 'fructe coapte', `<circle cx="0" cy="0" r="22" fill="${C.red}"/>`], [200, 'fermentare 2–3 zile', jar(0, 25, 1.1)], [330, 'uscare la umbră', `<rect x="-36" y="-14" width="72" height="30" fill="#fff" stroke="#ddd"/>${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${-24 + i * 10}" cy="${(i % 2) * 6}" rx="3" ry="2" fill="#d9b67c"/>`).join('')}`]].map(([x, t, ic], i) => `${g(x, 80, 1, ic)}${label(x, 140, t, 'middle', C.note, 12)}${i < 2 ? arrow(x + 40, 80, x + 90, 80) : ''}`).join('')}`, 'De la fruct la plicul cu semințe (exemplu pentru roșii).', 170);
        break;
    }
    return D;
  }

  function hero() {
    return scene(`${tunnel(20, 172, 110, 70)}${tomato(50, 172, .45)}${tomato(95, 172, .45)}${tree(190, 176, .75, C.red)}${vine(300, 176, .7)}${flower(372, 176, .9, C.pink)}${basket(135, 182, .55)}${can(240, 182, .45)}`);
  }

  window.ILLU = { task, diagrams, hero };
})();
