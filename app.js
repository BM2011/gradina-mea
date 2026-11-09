/* Grădina Mea – interfața aplicației */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5);
  const E = window.Engine;
  const KEY = 'gradina.v1';
  const DOW = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
  const DOWL = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  const GROUPS = { all: 'Toate', semanat: '🌱 Semănat', ingrijire: '🧺 Îngrijire', tratament: '🛡️ Tratamente', taiere: '✂️ Tăieri', recoltare: '🍅 Recoltare', vreme: '🌦️ Vreme' };
  const DISCLAIMER = 'Recomandările din această aplicație sunt orientative și sunt generate automat pe baza datelor meteo publice și a informațiilor generale de horticultură. Rezultatele reale depind de soi, sol, microclimat, starea plantelor și modul de aplicare. Autorul / dezvoltatorul aplicației NU își asumă nicio răspundere pentru compromiterea parțială sau totală a culturilor, pentru pierderi materiale, pentru daune asupra sănătății, animalelor sau mediului, ori pentru efectele utilizării îngrășămintelor și produselor fitosanitare. Folosiți numai produse omologate în țara dumneavoastră, citiți și respectați întotdeauna eticheta (doza, echipamentul de protecție și pauza de siguranță până la recoltare). Prognozele meteo pot fi greșite.';

  /* ================= STARE ================= */
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.profiles) return s; } catch (e) { }
    return { ver: 1, profiles: [], current: null, shared: { plants: [] } };
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Nu am putut salva datele (memorie plină?)'); } genCache = {}; }
  const me = () => S.profiles.find(p => p.id === S.current) || null;
  const garden = () => { const m = me(); return m ? (m.gardens.find(g => g.id === m.gardenId) || m.gardens[0] || null) : null; };
  const entries = () => { const m = me(), g = garden(); return m && g ? m.entries.filter(e => e.gardenId === g.id) : []; };
  const extraPlants = () => [...(S.shared.plants || []), ...((me() && me().plants) || [])];
  const plantOf = id => E.plantById(id, extraPlants());
  const isDone = t => !!(t && t.doneAt);
  let unlocked = sessionStorage.getItem('gradina.unlocked');
  const ctx = { wx: null, clim: null, loading: false, err: null, key: null };
  const ui = { cal: null, calSel: null, filter: 'all', addCat: 'all', addQ: '', method: null, ob: { step: 0 } };
  let genCache = {}; let doneVer = 0;

  /* ================= UTILITARE ================= */
  function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms); }
  function today() { const g = garden(); return E.todayISO(g && g.loc && g.loc.tz); }
  function dayName(d) { const w = new Date(d + 'T12:00:00Z').getUTCDay(); return DOWL[w]; }
  function niceDate(d) {
    const t = today(), n = E.diff(d, t);
    if (n === 0) return 'Azi'; if (n === 1) return 'Mâine'; if (n === -1) return 'Ieri';
    return `${dayName(d)}, ${E.fmt(d)}${d.slice(0, 4) !== t.slice(0, 4) ? ' ' + d.slice(0, 4) : ''}`;
  }
  function wxDay(d) { return ctx.wx && ctx.wx.days.find(x => x.date === d); }
  function wmo(c) { return WMO[c] || ['—', '🌡️']; }

  function tasksFor(from, to) {
    const g = garden(); if (!g || !ctx.clim) return [];
    const k = [g.id, from, to, ctx.key, me().entries.length, doneVer].join('|');
    if (genCache[k]) return genCache[k];
    const t = E.generate({ entries: entries(), clim: ctx.clim, wx: ctx.wx, today: today(), from, to, extraPlants: extraPlants(), done: me().done });
    genCache[k] = t; return t;
  }
  function findTask(id) {
    const p = id.split('|'); const d = p[2]; if (!d) return null;
    const t0 = today(), hi = d > t0 ? d : t0;
    const list = tasksFor(E.add(d, -30), E.add(hi, 30));
    return list.find(t => t.id === id) || null;
  }
  function tTitle(t) { const K = TASKS[t.type] || {}; return t.label || K.title || t.type; }
  function tSub(t) {
    if (t.weather) {
      const n = (t.entries || []).map(id => { const e = me().entries.find(x => x.id === id); const p = e && plantOf(e.plantId); return p ? p.name : null; }).filter(Boolean);
      const u = [...new Set(n)];
      return (t.amount ? `~${t.amount} L/m² · ` : '') + (u.length ? u.slice(0, 4).join(', ') + (u.length > 4 ? ` +${u.length - 4}` : '') : '');
    }
    const e = me().entries.find(x => x.id === t.entryId); const p = plantOf(t.plantId);
    return `${p ? p.icon + ' ' + p.name : ''}${e && e.label ? ' „' + e.label + '”' : ''} · ${PLACES[e ? e.place : 'camp'].name}`;
  }
  function taskRow(t, opts = {}) {
    const K = TASKS[t.type] || {}, done = isDone(t);
    const badges = [];
    if (t.late && !done) badges.push(`<span class="pill red">⏰ întârziată ${t.late} ${t.late === 1 ? 'zi' : 'zile'} – restul calendarului s-a decalat</span>`);
    if (t.missed && !done) badges.push(`<span class="pill red">ratată de ${t.missed} ori</span>`);
    if (t.overdue && !done && !opts.showDate) badges.push(`<span class="pill red">restantă ${t.overdue} zile</span>`);
    if (t.shifted && !done) badges.push(`<span class="pill blue">↻ după ultima efectuare</span>`);
    if (t.expired && !done) badges.push('<span class="pill">expirată – nu mai are rost</span>');
    if (t.moved) badges.push(`<span class="pill sun">↪ mutată de pe ${E.fmt(t.moved.from)}: ${esc(t.moved.why)}</span>`);
    if (t.warn) badges.push('<span class="pill red">⚠ vreme nefavorabilă</span>');
    if (t.hint) badges.push('<span class="pill blue">☔ ploi în curând</span>');
    if (opts.showDate) badges.unshift(`<span class="pill">${esc(niceDate(t.date))}</span>`);
    return `<div class="task ${done ? 'done' : ''} ${t.prio || (t.late && !done) ? 'alert' : ''} ${t.expired || t.superseded ? 'expired' : ''} ${t.weather ? 'wx' : ''}" data-act="open" data-id="${esc(t.id)}" role="link" tabindex="0">
      <span class="ti">${K.icon || '•'}</span>
      <span class="tt"><b>${esc(tTitle(t))}</b><small>${esc(tSub(t))}</small>${badges.length ? `<span class="badges">${badges.join('')}</span>` : ''}</span>
      <button class="tick" data-act="tick" data-id="${esc(t.id)}" aria-label="Marchează ca făcut">✓</button></div>`;
  }

  /* ================= VREME ================= */
  async function loadWeather(force) {
    const g = garden(); if (!g || !g.loc) return;
    ctx.loading = true; ctx.err = null;
    try {
      const [clim, wx] = await Promise.all([
        Weather.climate(g.loc.lat, g.loc.lon, force),
        Weather.forecast(g.loc.lat, g.loc.lon, force).catch(e => { ctx.err = 'Nu am putut descărca prognoza meteo. Verificați conexiunea la internet.'; return null; })
      ]);
      ctx.clim = clim; ctx.wx = wx; ctx.key = Date.now(); genCache = {};
      if (wx && wx.stale) ctx.err = 'Sunteți offline – se folosește ultima prognoză salvată.';
    } catch (e) { ctx.err = 'Eroare la încărcarea datelor meteo.'; ctx.clim = Weather.fallbackClimate(g.loc.lat); ctx.key = Date.now(); }
    ctx.loading = false;
    render();
    notifyAlerts(); syncAlerts();
  }

  /* ================= RUTARE ================= */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('task=')) return { v: 'task', id: h.slice(5) };
    const [v, arg] = h.split('/');
    return { v: v || 'azi', arg };
  }
  function render() {
    const view = $('#view');
    const r = route();
    const m = me();
    const needLogin = S.profiles.length && (!m || (m.pin && unlocked !== m.id));
    const onb = !S.profiles.length || (m && !m.gardens.length) || r.v === 'nou' || ui.ob.step === 3;
    const chrome = !needLogin && !onb;
    $('#topbar').hidden = !chrome; $('#nav').hidden = !chrome;
    document.body.classList.toggle('chrome', chrome);
    if (needLogin && r.v !== 'nou') { view.innerHTML = vLogin(); return; }
    if (onb) { view.innerHTML = vOnboard(); bindOnboard(); return; }
    renderTop();
    $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.v === r.v || (r.v === 'adauga' && a.dataset.v === 'gradina')));
    if (!ctx.clim && !ctx.loading) loadWeather();
    let html;
    switch (r.v) {
      case 'calendar': html = vCalendar(r.arg); break;
      case 'gradina': html = vGarden(); break;
      case 'adauga': html = vAdd(); break;
      case 'setari': html = vSettings(); break;
      case 'task': html = vTask(r.id); break;
      default: html = vToday();
    }
    view.innerHTML = html;
    if (r.v === 'adauga') { const q = $('#addQ'); if (q && ui.addFocus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  }
  function renderTop() {
    const m = me(); const sel = $('#gardenSel');
    sel.innerHTML = m.gardens.map(g => `<option value="${g.id}" ${g.id === (garden() || {}).id ? 'selected' : ''}>${esc(g.name)}</option>`).join('');
    sel.hidden = m.gardens.length < 2;
    renderBell();
    $('#userBtn').textContent = (m.name || '?').trim().slice(0, 1).toUpperCase();
    $('#userBtn').title = m.name + (m.role === 'admin' ? ' (administrator)' : '');
  }

  /* ================= AUTENTIFICARE ================= */
  function vLogin() {
    return `<div class="onb"><div class="hero"><div class="big">🌱</div><h1>Grădina Mea</h1><p class="muted">Cine folosește aplicația?</p></div>
      <div class="card">${S.profiles.map(p => `<button class="entry" style="width:100%;cursor:pointer;text-align:left" data-act="pickuser" data-id="${p.id}">
        <span class="avatar" style="display:grid;place-items:center">${esc(p.name.slice(0, 1).toUpperCase())}</span>
        <span class="et"><b>${esc(p.name)}</b><small>${p.role === 'admin' ? 'Administrator' : 'Utilizator'}${p.pin ? ' · 🔒 PIN' : ''}</small></span></button>`).join('')}
        <div id="pinBox"></div>
        <button class="btn ghost block" data-act="newacct" style="margin-top:8px">➕ Cont nou</button></div></div>`;
  }

  /* ================= ONBOARDING ================= */
  function vOnboard() {
    const ob = ui.ob, m = me(), hasAcct = m && !ui.ob.newAcct && route().v !== 'nou';
    let step = ob.step; if (hasAcct && step < 2) step = ob.step = 2;
    if (hasAcct && m.gardens.length && step < 3) step = ob.step = 3;
    const dots = `<div class="steps-dots">${[0, 1, 2, 3].map(i => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>`;
    if (step === 0) return `<div class="onb">${window.ILLU ? `<div class="illu illu-hero">${ILLU.hero()}</div>` : ''}<div class="hero" style="padding-top:0"><h1>Bun venit în Grădina Mea</h1>
      <p class="muted">Spuneți-ne ce aveți în curte, iar aplicația vă face calendarul de lucru, adaptat locului și vremii.</p></div>${dots}
      <div class="features">
        <div><span>📍</span><div><b>Pentru orice loc de pe glob</b><br><span class="muted small">Datele de îngheț se calculează din istoricul meteo al locației dvs. – funcționează și în emisfera sudică.</span></div></div>
        <div><span>🌦️</span><div><b>Reacționează la vreme, zilnic</b><br><span class="muted small">Prognoza pe 16 zile mută stropitul înainte de ploaie, amână plantarea pe frig și vă anunță de îngheț sau caniculă.</span></div></div>
        <div><span>📋</span><div><b>Instrucțiuni pas cu pas</b><br><span class="muted small">Pentru fiecare sarcină: unelte, materiale și metodă – bio, convențional sau complet gratuit.</span></div></div>
        <div><span>🏕️</span><div><b>Câmp, solar, seră, tunel, ghiveci</b><br><span class="muted small">Recomandările țin cont unde este plantată fiecare cultură.</span></div></div>
      </div>
      <button class="btn block" data-act="ob-next">Să începem</button></div>`;
    if (step === 1) {
      const first = !S.profiles.length;
      return `<div class="onb"><h1>Creați contul</h1>${dots}
      <div class="card">
        <label class="fld"><span>Numele dvs.</span><input type="text" id="obName" value="${esc(ob.name || '')}" placeholder="ex. Maria" autocomplete="given-name"></label>
        <label class="fld"><span>PIN (opțional, 4 cifre)</span><input type="password" id="obPin" inputmode="numeric" maxlength="6" placeholder="lăsați gol dacă nu vreți PIN" value="${esc(ob.pin || '')}"></label>
        <p class="small muted">${first ? 'Primul cont creat este <b>administrator</b>: poate adăuga alți utilizatori și plante noi pentru toată familia.' : 'Contul nou va fi de tip <b>utilizator</b>. Administratorul îl poate face administrator din Setări.'} Datele se păstrează pe acest dispozitiv; le puteți muta pe telefon/PC cu Export/Import.</p>
        <h3>Termeni și responsabilitate</h3>
        <div class="disclaimer">${esc(DISCLAIMER)}</div>
        <label class="chk"><input type="checkbox" id="obAccept" ${ob.accept ? 'checked' : ''}> Am citit și accept că aplicația oferă doar recomandări și că dezvoltatorul nu răspunde de posibila compromitere a culturilor.</label>
      </div>
      <div class="row"><button class="btn ghost" data-act="ob-back">Înapoi</button><button class="btn" style="flex:1" data-act="ob-acct">Continuă</button></div></div>`;
    }
    if (step === 2) return `<div class="onb"><h1>Unde este grădina?</h1>${dots}
      <div class="card">
        <p class="muted">Locația stabilește clima, datele de îngheț și prognoza meteo.</p>
        <button class="btn block" data-act="geo">📍 Folosește locația mea actuală</button>
        <p class="small muted" style="text-align:center;margin:10px 0">sau căutați localitatea</p>
        <div class="row"><input type="search" id="locQ" placeholder="ex. Iași, Chișinău, Torino, Melbourne…" value="${esc(ob.q || '')}"><button class="btn sec" data-act="locsearch">Caută</button></div>
        <div class="results" id="locRes"></div>
        ${ob.loc ? `<div class="info green" style="margin-top:12px">✅ <b>${esc(ob.loc.name)}</b>${ob.loc.admin ? ', ' + esc(ob.loc.admin) : ''}${ob.loc.country ? ', ' + esc(ob.loc.country) : ''}<br><span class="small">${(+ob.loc.lat).toFixed(3)}, ${(+ob.loc.lon).toFixed(3)}</span></div>
        <label class="fld" style="margin-top:12px"><span>Numele grădinii</span><input type="text" id="gName" value="${esc(ob.gname || 'Grădina mea')}"></label>` : ''}
      </div>
      <div class="row"><button class="btn" style="flex:1" data-act="ob-loc" ${ob.loc ? '' : 'disabled'}>Continuă</button></div></div>`;
    if (step === 3) return `<div class="onb"><h1>Cum preferați să lucrați?</h1>${dots}
      <p class="muted">Este doar varianta afișată implicit. La fiecare sarcină puteți comuta între ele.</p>
      <div class="choices" style="grid-template-columns:1fr">${Object.entries(METHODS).map(([k, v]) => `<button class="choice ${ob.method === k ? 'on' : ''}" data-act="ob-method" data-k="${k}"><span class="ci">${v.icon}</span><b>${v.name}</b><small>${v.desc}${k === 'gratuit' ? ' Remedii din plante, compost, cenușă, macerate.' : ''}</small></button>`).join('')}</div>
      <div class="row" style="margin-top:16px"><button class="btn" style="flex:1" data-act="ob-finish" ${ob.method ? '' : 'disabled'}>Gata – adaug plantele</button></div></div>`;
    return '';
  }
  function bindOnboard() {
    const q = $('#locQ'); if (q) q.addEventListener('keydown', e => { if (e.key === 'Enter') doAct('locsearch'); });
  }

  /* ================= AZI ================= */
  function weatherCard() {
    const g = garden();
    if (ctx.loading && !ctx.wx) return `<div class="card"><div class="spinner"></div><p class="muted" style="text-align:center">Se încarcă vremea și clima pentru ${esc(g.loc.name)}…</p></div>`;
    const c = ctx.clim, w = ctx.wx;
    let h = '<div class="card">';
    if (w) {
      const td = wxDay(today()) || w.days[7];
      const cur = w.current || {};
      const [nm, ic] = wmo(cur.weather_code ?? td.code);
      h += `<div class="row spread"><div class="wx-now"><span class="wx-ico">${ic}</span><div><div class="wx-t">${Math.round(cur.temperature_2m ?? td.tmax)}°</div><div class="muted small">${esc(nm)} · ${esc(g.loc.name)}</div></div></div>
        <div class="small" style="text-align:right"><b>${Math.round(td.tmax)}° / ${Math.round(td.tmin)}°</b><br>💧 ${td.rain} mm${td.pop != null ? ` (${td.pop}%)` : ''}<br>💨 ${Math.round(td.wind)} km/h${td.soil != null ? `<br>🌡️ sol ${Math.round(td.soil)}°` : ''}</div></div>`;
      const fut = w.days.filter(d => d.date >= today()).slice(0, 14);
      h += `<div class="wx-strip">${fut.map(d => `<div class="wx-day ${d.tmin <= 0 ? 'frost' : d.tmax >= 32 ? 'hot' : ''}"><div class="tiny muted">${d.date === today() ? 'Azi' : DOW[(new Date(d.date + 'T12:00:00Z').getUTCDay() + 6) % 7] + ' ' + (+d.date.slice(8))}</div><div class="i">${wmo(d.code)[1]}</div><div class="mx">${Math.round(d.tmax)}°</div><div class="tiny">${Math.round(d.tmin)}°</div><div class="tiny" style="color:var(--blue)">${d.rain >= 0.5 ? d.rain.toFixed(0) + 'mm' : '&nbsp;'}</div></div>`).join('')}</div>`;
    }
    if (c) {
      const y = +today().slice(0, 4);
      let lf = E.fromDoy(y, c.lfDoy); if (E.diff(lf, today()) < -200) lf = E.fromDoy(y + 1, c.lfDoy);
      const ff = E.add(lf, c.season);
      h += `<div class="clim">${c.frostFree ? `<div>Climat<b>fără îngheț ☀️</b></div>` : `<div>Ultimul îngheț (medie)<b>${E.fmt(lf)}</b></div><div>Primul îngheț (medie)<b>${E.fmt(ff)}</b></div><div>Sezon fără îngheț<b>${c.season} zile</b></div>`}
        <div>Minima ultimilor 3 ani<b>${c.minAbs != null ? c.minAbs + ' °C' : '—'}</b></div></div>
        ${c.estimated ? '<p class="tiny muted">Clima este estimată din latitudine (fără conexiune). Se va recalcula automat.</p>' : ''}`;
    }
    if (ctx.err) h += `<div class="info sun small">${esc(ctx.err)} <button class="btn sm sec" data-act="refresh">Reîncearcă</button></div>`;
    h += `<p class="tiny muted" style="margin:8px 0 0">Date meteo: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0) · actualizat ${w ? new Date(w.fetched).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : '—'} <button class="btn sm ghost" data-act="refresh" style="min-height:28px;padding:2px 8px">↻</button></p></div>`;
    return h;
  }
  function vToday() {
    const t0 = today();
    const list = entries();
    let h = `<h1>Bună, ${esc(me().name)}! 👋</h1><p class="muted" style="margin-top:-6px">${esc(niceDate(t0))} · ${esc(garden().name)}</p>`;
    if (!list.length) {
      return h + weatherCard() + `<div class="card empty">${window.ILLU ? `<div class="illu illu-hero">${ILLU.hero()}</div>` : ''}<h2>Grădina este goală</h2><p>Adăugați legumele, pomii, via sau florile pe care le aveți și vă generăm calendarul.</p><a class="btn" href="#adauga">➕ Adaugă plante</a></div>`;
    }
    if (!ctx.clim) return h + weatherCard();
    const all = tasksFor(E.add(t0, -21), E.add(t0, 7));
    const alerts = all.filter(t => t.prio && t.date >= t0 && t.date <= E.add(t0, 2));
    const todays = all.filter(t => t.date === t0 && !t.prio);
    const created = {}; me().entries.forEach(e => created[e.id] = new Date(e.created || 0).toISOString().slice(0, 10));
    const overdue = all.filter(t => t.date < t0 && !t.weather && !isDone(t) && !t.superseded && !t.expired && t.date >= (created[t.entryId] || ''));
    const next = all.filter(t => t.date > t0 && !(t.prio && t.date <= E.add(t0, 2)));
    const left = todays.filter(t => !isDone(t)).length;
    h += `<div class="grid2"><div>`;
    if (alerts.length) h += `<div class="section-h"><h2>⚠️ Alerte meteo</h2></div><div class="tasks">${alerts.map(t => taskRow(t, { showDate: true })).join('')}</div>`;
    h += `<div class="section-h"><h2>De făcut azi</h2><span class="pill ${left ? 'green' : ''}">${left ? left + ' rămase' : 'totul e gata ✓'}</span></div>`;
    h += todays.length ? `<div class="tasks">${todays.map(t => taskRow(t)).join('')}</div>` : `<div class="card flat empty">☕ Nicio sarcină programată pentru azi.</div>`;
    if (overdue.length) h += `<div class="section-h"><h2>Restanțe</h2><span class="pill red">${overdue.length}</span></div><div class="tasks">${overdue.slice(0, 12).map(t => taskRow(t, { showDate: true })).join('')}</div>${overdue.length > 12 ? `<p class="small muted">… și încă ${overdue.length - 12}. Le găsiți în calendar.</p>` : ''}`;
    h += `<div class="section-h"><h2>Următoarele 7 zile</h2><a href="#calendar" class="small">Calendar →</a></div>`;
    let last = '';
    next.forEach(t => { if (t.date !== last) { h += `<div class="day-label">${esc(niceDate(t.date))}</div>`; last = t.date; } h += `<div class="tasks" style="margin-bottom:6px">${taskRow(t)}</div>`; });
    if (!next.length) h += `<div class="card flat empty">Nimic programat.</div>`;
    h += `</div><div>${weatherCard()}<div class="card"><h3>🌿 Grădina dvs.</h3><p class="muted small">${list.length} ${list.length === 1 ? 'plantă' : 'plante'} înregistrate.</p><a class="btn sec block" href="#adauga">➕ Adaugă plante</a></div></div></div>`;
    return h;
  }

  /* ================= CALENDAR ================= */
  function vCalendar(arg) {
    const t0 = today();
    if (arg && /^\d{4}-\d{2}$/.test(arg)) ui.cal = arg; if (!ui.cal) ui.cal = t0.slice(0, 7);
    const [y, m] = ui.cal.split('-').map(Number);
    const first = `${ui.cal}-01`;
    const wd = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7;
    const start = E.add(first, -wd);
    const nDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = Math.ceil((wd + nDays) / 7) * 7;
    const end = E.add(start, cells - 1);
    if (!ui.calSel || ui.calSel.slice(0, 7) !== ui.cal) ui.calSel = t0.slice(0, 7) === ui.cal ? t0 : first;
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    const nxt = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    let h = `<div class="cal-head"><button class="btn sm ghost" data-act="cal" data-m="${prev}" aria-label="Luna anterioară">‹</button><h2>${E.MONTHS[m - 1]} ${y}</h2><button class="btn sm ghost" data-act="cal" data-m="${nxt}" aria-label="Luna următoare">›</button></div>`;
    h += `<div class="tabs">${Object.entries(GROUPS).map(([k, v]) => `<button class="${ui.filter === k ? 'on' : ''}" data-act="filter" data-k="${k}">${v}</button>`).join('')}</div>`;
    if (!entries().length) return h + `<div class="card empty"><div class="big">📅</div><p>Adăugați plante ca să apară sarcinile în calendar.</p><a class="btn" href="#adauga">➕ Adaugă plante</a></div>`;
    if (!ctx.clim) return h + '<div class="spinner"></div>';
    const tasks = tasksFor(start, end).filter(t => ui.filter === 'all' || (TASKS[t.type] || {}).group === ui.filter);
    const by = {}; tasks.forEach(t => (by[t.date] = by[t.date] || []).push(t));
    const showMoon = me().pref.moon !== false;
    h += `<div class="grid2"><div><div class="cal">${DOW.map(d => `<div class="dow">${d}</div>`).join('')}`;
    for (let i = 0; i < cells; i++) {
      const d = E.add(start, i), L = by[d] || [], w = wxDay(d);
      const ics = [...new Set(L.map(t => (TASKS[t.type] || {}).icon))].slice(0, 4).join('');
      const pending = L.filter(t => !isDone(t) && !t.superseded && !t.expired).length;
      h += `<div class="d ${d.slice(0, 7) !== ui.cal ? 'out' : ''} ${d === t0 ? 'today' : ''} ${d === ui.calSel ? 'sel' : ''} ${L.some(t => t.prio) ? 'alert' : ''}" data-act="calday" data-d="${d}">
        <span class="n">${+d.slice(8)}</span>${showMoon ? `<span class="mo" title="${E.moon(d).name}">${E.moon(d).icon}</span>` : ''}
        ${w ? `<span class="w">${wmo(w.code)[1]} ${Math.round(w.tmax)}°</span>` : ''}
        <span class="ics">${ics}</span>${L.length ? `<span class="cnt ${pending ? '' : 'ok'}" title="${pending} de făcut">${pending || '✓'}</span>` : ''}</div>`;
    }
    h += `</div><p class="tiny muted">${showMoon ? 'Faza lunii este afișată orientativ (calendar lunar tradițional). ' : ''}Sarcinile pe care vremea le afectează sunt mutate automat în fereastra prognozei (16 zile).</p></div>`;
    const sel = ui.calSel, L = by[sel] || [], w = wxDay(sel), mo = E.moon(sel);
    h += `<div><div class="card"><h3 style="text-transform:capitalize">${esc(niceDate(sel))}</h3>`;
    if (w) h += `<div class="info blue small">${wmo(w.code)[1]} ${esc(wmo(w.code)[0])} · ${Math.round(w.tmin)}…${Math.round(w.tmax)} °C · 💧 ${w.rain} mm · 💨 ${Math.round(w.wind)} km/h${w.soil != null ? ` · sol ${Math.round(w.soil)} °C` : ''}</div>`;
    if (showMoon) h += `<p class="small muted">${mo.icon} ${mo.name}${mo.waxing ? ' – tradițional favorabilă semănatului legumelor de frunze și fructe' : ' – tradițional favorabilă rădăcinoaselor, tăierilor și plantării bulbilor'}</p>`;
    h += L.length ? `<div class="tasks">${L.map(t => taskRow(t)).join('')}</div>` : `<p class="muted">Nicio sarcină în această zi.</p>`;
    h += `</div></div></div>`;
    return h;
  }

  /* ================= DETALIU SARCINĂ ================= */
  function vTask(id) {
    if (!ctx.clim) return '<div class="spinner"></div>';
    const t = findTask(id);
    if (!t) return `<div class="card empty"><div class="big">🤔</div><p>Sarcina nu mai există (poate planta a fost ștearsă sau datele s-au recalculat).</p><a class="btn" href="#azi">Înapoi</a></div>`;
    const K = TASKS[t.type] || {};
    const e = t.entryId ? me().entries.find(x => x.id === t.entryId) : null;
    const p = t.plantId ? plantOf(t.plantId) : null;
    const place = e ? e.place : null;
    const affected = t.weather ? (t.entries || []).map(i => me().entries.find(x => x.id === i)).filter(Boolean) : [];
    const plantsAff = t.weather ? [...new Map(affected.map(x => [x.plantId, plantOf(x.plantId)])).values()].filter(Boolean) : (p ? [p] : []);
    const methodsSrc = K.methods === null ? TASKS.tratament_fungic.methods : K.methods;
    const meth = ui.method || me().pref.method || 'bio';
    const M = methodsSrc ? methodsSrc[meth] : null;
    const w = wxDay(t.date);
    const done = isDone(t);
    let h = `<div class="row spread" style="margin-bottom:10px"><button class="btn sm ghost" data-act="back">‹ Înapoi</button><a class="btn sm ghost" href="${esc(location.pathname + '#task=' + encodeURIComponent(t.id))}" target="_blank" rel="noopener">↗ Deschide în tab nou</a></div>`;
    h += `<div class="card">${window.ILLU ? `<div class="illu">${ILLU.task(t.type, p || plantsAff[0])}</div>` : ''}<div class="detail-hero"><span class="hi">${K.icon || '•'}</span><div><h1 style="margin:0">${esc(tTitle(t))}</h1>
      <div class="muted">${p ? esc(p.icon + ' ' + p.name) : ''}${e && e.label ? ' „' + esc(e.label) + '”' : ''}${place ? ' · ' + PLACES[place].icon + ' ' + esc(PLACES[place].name) : ''}</div>
      <div class="row wrap" style="margin-top:6px"><span class="pill green">📅 ${esc(niceDate(t.date))}</span>${K.dur ? `<span class="pill">⏱ ~${K.dur} min</span>` : ''}${done ? '<span class="pill green">✓ făcută</span>' : ''}</div></div></div>`;
    if (w) h += `<div class="info blue">${wmo(w.code)[1]} <b>Vremea în ziua respectivă:</b> ${esc(wmo(w.code)[0])}, ${Math.round(w.tmin)}…${Math.round(w.tmax)} °C, ploaie ${w.rain} mm${w.pop != null ? ` (${w.pop}%)` : ''}, vânt ${Math.round(w.wind)} km/h (rafale ${Math.round(w.gust)})${w.soil != null ? `, sol ${Math.round(w.soil)} °C` : ''}.</div>`;
    else if (t.date > today()) h += `<p class="small muted">Prognoza pentru această zi va fi disponibilă cu 16 zile înainte; atunci aplicația verifică dacă vremea permite lucrarea și o mută la nevoie.</p>`;
    if (t.late && !done) h += `<div class="info red">⏰ Această etapă trebuia făcută pe <b>${E.fmt(t.orig)}</b> (întârziere ${t.late} zile). Am mutat-o pe azi și am decalat restul calendarului plantei. Când o bifați ca făcută, următoarele sarcini se calculează de la data reală.</div>`;
    if (t.missed && !done) h += `<div class="info red">Această lucrare a fost ratată de ${t.missed} ori la rând. Faceți-o cât mai curând; următoarea se va programa de la data la care o bifați.</div>`;
    if (t.shifted && !done) h += `<div class="info blue">↻ ${esc(t.shifted)}</div>`;
    if (t.expired && !done) h += `<div class="info">Termenul a trecut de mult; lucrarea nu mai are efect în acest sezon. Puteți să o ignorați.</div>`;
    if (t.moved) h += `<div class="info sun">↪ Mutată automat de pe <b>${E.fmt(t.moved.from)}</b> din cauza vremii: ${esc(t.moved.why)}.</div>`;
    if (t.warn) h += `<div class="info red">⚠ ${esc(t.warn)}</div>`;
    if (t.hint) h += `<div class="info blue">☔ ${esc(t.hint)}</div>`;
    h += `<h3>De ce acum?</h3><p>${esc(K.why || '')}</p>${t.basis ? `<p class="small muted">📐 ${esc(t.basis)}</p>` : ''}`;
    if (t.weather && affected.length) h += `<p><b>Plante vizate:</b> ${affected.map(x => { const pp = plantOf(x.plantId); return pp ? `${pp.icon} ${esc(pp.name)} <span class="muted small">(${esc(PLACES[x.place].name)})</span>` : ''; }).join(', ')}</p>`;
    h += `</div>`;

    // Metoda
    if (methodsSrc) {
      h += `<div class="card"><h2>Alegeți metoda</h2><div class="mtabs">${Object.entries(METHODS).map(([k, v]) => `<button class="${meth === k ? 'on' : ''}" data-act="method" data-k="${k}">${v.icon} ${v.name}</button>`).join('')}</div>`;
      h += `<p class="small muted">${METHODS[meth].desc}</p>`;
      if (M && M.mat && M.mat.length) h += `<h3>Materiale necesare</h3><ul class="tools">${M.mat.map((x, i) => `<li><label><input type="checkbox"> ${esc(x)}</label></li>`).join('')}</ul>`;
      else if (!M) h += `<p class="muted">Pentru această lucrare nu există diferențe între metode – urmați pașii de mai jos.</p>`;
      // remedii specifice bolilor / dăunătorilor plantei
      const isDis = ['tratament_fungic', 'alerta_boli', 'tratament_dezmugurire', 'tratament_inflorit', 'tratament_repaus'].includes(t.type);
      const isPest = t.type === 'monitorizare';
      const fld = { bio: 'bio', chimic: 'chim', gratuit: 'free' }[meth];
      const dkeys = [...new Set(plantsAff.flatMap(pp => (isDis ? pp.dis : isPest ? pp.pest : null) || []))];
      if (dkeys.length) {
        const src = isPest ? PESTS : DISEASES;
        h += `<h3 style="margin-top:14px">${isPest ? 'Dăunători de urmărit' : 'Boli vizate'}${t.weather ? '' : ' la ' + esc(p ? p.name.toLowerCase() : '')}</h3>`;
        h += dkeys.map(k => src[k] ? `<div class="disease"><b>${esc(src[k].name)}</b><span class="small muted">Cum o recunoașteți: ${esc(src[k].sympt)}</span><div style="margin-top:6px">${METHODS[meth].icon} ${esc(src[k][fld])}</div></div>` : '').join('');
      }
      h += `</div>`;
    }

    // Unelte
    if (K.tools && K.tools.length) h += `<div class="card"><h2>🧰 Unelte și echipament</h2><ul class="tools">${K.tools.map(x => `<li><label><input type="checkbox"> ${esc(x)}</label></li>`).join('')}</ul></div>`;

    // Pași
    let steps = (K.steps || []).slice();
    if (t.type === 'taiere_iarna' && p && p.vineOps && K.vine) steps = steps.concat(K.vine);
    h += `<div class="card"><h2>📋 Cum se face, pas cu pas</h2><ol class="steps">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
    if (M && M.steps && M.steps.length) h += `<h3>${METHODS[meth].icon} Specific variantei „${METHODS[meth].name}”</h3><ul class="dot">${M.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
    if (t.type === 'butasire' && t.kind && K.kinds && K.kinds[t.kind]) h += `<div class="info green">${esc(K.kinds[t.kind])}</div>`;
    if (t.type === 'recoltare_seminte' && p && p.seed) h += `<div class="info green">🫙 ${esc(SEED_HOW[p.seed.how] || p.seed.how)}</div>`;
    if (t.type === 'udare' && t.amount) h += `<div class="info blue">💧 Cantitate estimată: <b>~${t.amount} litri pe m²</b> (o găleată = 10 L). Pentru o plantă mare (roșie, castravete) înseamnă cam ${Math.max(2, Math.round(t.amount / 2))}–${Math.round(t.amount / 1.5)} L.</div>`;
    if (t.type === 'udare' && !t.amount) h += `<p class="small muted">Verificați umiditatea solului la 5 cm adâncime.</p>`;
    if (p && p.tips && p.tips[t.type]) h += `<div class="info green">💡 <b>Pentru ${esc(p.name.toLowerCase())}:</b> ${esc(p.tips[t.type])}</div>`;
    if (p && (t.type === 'semanat_direct' || t.type === 'semanat_interior' || t.type === 'transplant')) {
      h += `<p class="small"><b>Distanțe:</b> ${esc(p.spacing || '—')}${p.germ ? ` · <b>Temperatura minimă de germinare:</b> ${p.germ} °C` : ''}${p.mature ? ` · <b>Până la recoltă:</b> ~${p.mature} zile` : ''}</p>`;
    }
    if (p && p.acid && t.type === 'fertilizare') h += `<div class="info sun">Afinul are nevoie de sol acid: folosiți îngrășăminte pentru plante acidofile, sulf sau ace de brad/rumeguș de conifere; evitați cenușa și varul.</div>`;
    if (K.tips && K.tips.length) h += `<h3>Sfaturi</h3><ul class="dot">${K.tips.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
    const pn = place && ((PLACE_NOTES[t.type] && PLACE_NOTES[t.type][place]) || PLACE_NOTES._default[place]);
    if (pn) h += `<div class="info blue">${PLACES[place].icon} <b>${esc(PLACES[place].name)}:</b> ${esc(pn)}</div>`;
    if (t.weather && affected.some(x => ['solar', 'sera', 'tunel', 'sera_inc'].includes(x.place)) && PLACE_NOTES._default.solar && t.type !== 'aerisire') h += `<div class="info blue small">🏕️ În spațiile protejate temperatura de noapte este de obicei cu 2–4 °C mai mare decât afară, iar ziua mult mai mare.</div>`;
    h += `</div>`;

    const dg = window.ILLU ? ILLU.diagrams(t.type, p || plantsAff[0]) : [];
    if (dg.length) h += `<div class="card"><h2>🖼️ Ilustrații pas cu pas</h2><div class="diagrams">${dg.map((d, i) => `<figure>${d.svg}<figcaption><span class="num">${i + 1}</span>${esc(d.caption)}</figcaption></figure>`).join('')}</div></div>`;
    const safety = (K.safety || []).slice();
    if (meth === 'chimic' && methodsSrc) safety.push('Purtați mănuși, ochelari și mască; nu mâncați, nu beți și nu fumați în timpul aplicării.', 'Respectați pauza de siguranță de pe etichetă înainte de a culege.', 'Păstrați produsele în ambalajul original, departe de copii și alimente.');
    if (safety.length) h += `<div class="card"><h2>🦺 Siguranță</h2><ul class="dot">${safety.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>`;
    h += `<p class="tiny muted">Recomandări orientative. Citiți întotdeauna eticheta produselor folosite. Dezvoltatorul nu răspunde de rezultatele culturilor.</p>`;
    h += `<div class="sticky-act"><button class="btn ${done ? 'sec' : ''}" style="flex:1" data-act="tick" data-id="${esc(t.id)}">${done ? '↺ Marchează ca nefăcută' : '✓ Marchează ca făcută'}</button></div>`;
    return h;
  }

  /* ================= GRĂDINA ================= */
  function vGarden() {
    const list = entries();
    let h = `<div class="section-h" style="margin-top:0"><h1 style="margin:0">Grădina mea</h1><a class="btn" href="#adauga">➕ Adaugă</a></div>`;
    if (!list.length) return h + `<div class="card empty"><div class="big">🌱</div><p>Încă nu ați adăugat nicio plantă.</p><a class="btn" href="#adauga">Adaugă prima plantă</a></div>`;
    const t0 = today();
    const upcoming = ctx.clim ? tasksFor(t0, E.add(t0, 120)) : [];
    const by = {}; list.forEach(e => (by[e.place] = by[e.place] || []).push(e));
    Object.keys(PLACES).filter(k => by[k]).forEach(k => {
      h += `<div class="day-label">${PLACES[k].icon} ${esc(PLACES[k].name)}</div>`;
      by[k].forEach(e => {
        const p = plantOf(e.plantId);
        const nx = upcoming.find(t => t.entryId === e.id && !isDone(t));
        h += `<div class="entry"><span class="ei">${p ? p.icon : '❓'}</span><span class="et"><b>${esc(p ? p.name : 'Plantă necunoscută')}${e.label ? ' – ' + esc(e.label) : ''}</b>
          <small>${e.status === 'plantat' ? (e.plantedOn ? 'Plantată pe ' + E.fmtY(e.plantedOn) : 'Existentă în grădină') : 'Planificată'}${e.qty ? ' · ' + esc(e.qty) : ''}${e.variety ? ' · maturare ' + esc(e.variety) : ''}</small>
          ${nx ? `<small>Următoarea: <a href="#task=${encodeURIComponent(nx.id)}">${TASKS[nx.type].icon} ${esc(tTitle(nx))}</a> – ${esc(niceDate(nx.date))}</small>` : ''}</span>
          <button class="btn sm ghost" data-act="editentry" data-id="${e.id}" aria-label="Modifică">✏️</button></div>`;
      });
    });
    return h;
  }

  function vAdd() {
    const q = (ui.addQ || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const all = [...PLANTS, ...extraPlants()];
    const list = all.filter(p => (ui.addCat === 'all' || p.cat === ui.addCat) && (!q || p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
    let h = `<div class="row" style="margin-bottom:10px"><a class="btn sm ghost" href="#gradina">‹ Grădina mea</a></div><h1>Ce aveți în grădină?</h1>
      <p class="muted" style="margin-top:-4px">Atingeți o plantă, apoi alegeți unde este plantată.</p>
      <input type="search" id="addQ" placeholder="🔍 Caută: roșii, cireș, viță, trandafir…" value="${esc(ui.addQ)}" style="margin-bottom:10px">
      <div class="tabs"><button class="${ui.addCat === 'all' ? 'on' : ''}" data-act="addcat" data-k="all">Toate</button>${Object.entries(CATEGORIES).map(([k, v]) => `<button class="${ui.addCat === k ? 'on' : ''}" data-act="addcat" data-k="${k}">${v.icon} ${v.name}</button>`).join('')}</div>
      <div class="plants">${list.map(p => { const n = entries().filter(e => e.plantId === p.id).length; return `<button class="plant-tile" data-act="pickplant" data-id="${p.id}"><span class="pi">${p.icon}</span>${esc(p.name)}${n ? `<br><span class="pill green" style="margin-top:4px">${n} în grădină</span>` : ''}${p.custom ? '<br><span class="tiny muted">personalizată</span>' : ''}</button>`; }).join('')}
        <button class="plant-tile" data-act="customplant" style="border-style:dashed"><span class="pi">➕</span>Altă plantă (nu e în listă)</button></div>`;
    return h;
  }

  function entryForm(p, e) {
    const isNew = !e; e = e || { place: p.cat === 'pom' || p.cat === 'vita' || p.cat === 'arbust' ? 'camp' : 'camp', status: 'plantat', method: p.indoor != null ? 'rasad' : 'direct', variety: 'mijlociu' };
    const annual = p.life !== 'perena';
    const both = p.indoor != null && p.direct != null;
    const places = Object.entries(PLACES).filter(([k]) => !(['pom', 'vita'].includes(p.cat) && ['tunel', 'interior'].includes(k)));
    return `<h2>${p.icon} ${esc(p.name)}</h2>
      <form id="entryForm" data-plant="${p.id}" data-entry="${isNew ? '' : e.id}">
      <label class="fld"><span>Unde este plantată?</span></label>
      <div class="choices" style="margin:-8px 0 14px">${places.map(([k, v]) => `<button type="button" class="choice ${e.place === k ? 'on' : ''}" data-act="fplace" data-k="${k}"><span class="ci">${v.icon}</span><b>${v.name}</b><small>${v.desc}</small></button>`).join('')}</div>
      <input type="hidden" name="place" value="${e.place}">
      <label class="fld"><span>Stadiu</span><select name="status">
        <option value="plantat" ${e.status === 'plantat' ? 'selected' : ''}>${annual ? 'Este deja semănată / plantată' : 'Există deja în grădină'}</option>
        <option value="planificat" ${e.status === 'planificat' ? 'selected' : ''}>${annual ? 'Urmează să o semăn / plantez' : 'Urmează să o plantez'}</option></select></label>
      ${annual ? `<label class="fld" id="plantedWrap"><span>Data semănatului / plantării (opțional)</span><input type="date" name="plantedOn" value="${esc(e.plantedOn || '')}"><small class="muted">Dacă o lăsați goală, aplicația folosește data optimă pentru zona dvs.</small></label>` : ''}
      ${both ? `<label class="fld"><span>Cum o porniți?</span><select name="method"><option value="rasad" ${e.method !== 'direct' ? 'selected' : ''}>Din răsad (semănat la adăpost)</option><option value="direct" ${e.method === 'direct' ? 'selected' : ''}>Semănat direct în grădină</option></select></label>` : ''}
      ${p.varieties ? `<label class="fld"><span>Soiul se coace</span><select name="variety"><option value="timpuriu" ${e.variety === 'timpuriu' ? 'selected' : ''}>Timpuriu (vara)</option><option value="mijlociu" ${e.variety === 'mijlociu' ? 'selected' : ''}>Mijlociu</option><option value="tarziu" ${e.variety === 'tarziu' ? 'selected' : ''}>Târziu (toamna)</option></select></label>` : ''}
      <div class="row" style="align-items:flex-start"><label class="fld" style="flex:2"><span>Soi / denumire (opțional)</span><input type="text" name="label" value="${esc(e.label || '')}" placeholder="ex. Inimă de bou"></label>
      <label class="fld" style="flex:1"><span>Cantitate</span><input type="text" name="qty" value="${esc(e.qty || '')}" placeholder="ex. 12 fire"></label></div>
      <label class="fld"><span>Notițe</span><textarea name="note" rows="2" placeholder="opțional">${esc(e.note || '')}</textarea></label>
      <button class="btn block" type="submit">${isNew ? '✓ Adaugă în grădină' : '✓ Salvează'}</button>
      ${isNew ? '' : `<button class="btn danger block" type="button" data-act="delentry" data-id="${e.id}" style="margin-top:8px">🗑 Șterge din grădină</button>`}
      </form>`;
  }

  function customForm() {
    const admin = me().role === 'admin';
    return `<h2>➕ Plantă nouă</h2><p class="small muted">Completați ce știți; restul are valori implicite. Calendarul se calculează față de data ultimului îngheț din zona dvs.</p>
      <form id="customForm">
      <div class="row"><label class="fld" style="flex:3"><span>Nume</span><input type="text" name="name" required placeholder="ex. Anghinare"></label>
      <label class="fld" style="flex:1"><span>Simbol</span><select name="icon">${['🌱', '🥬', '🥕', '🍅', '🌶️', '🫛', '🧅', '🍓', '🍇', '🍎', '🍐', '🍑', '🌳', '🌸', '🌻', '🌿', '🍄'].map(i => `<option>${i}</option>`).join('')}</select></label></div>
      <label class="fld"><span>Categorie</span><select name="cat">${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}</select></label>
      <label class="fld"><span>Tip</span><select name="life"><option value="anuala">Anuală (se seamănă/plantează în fiecare an)</option><option value="perena">Perenă (rămâne ani la rând: pom, arbust, tufă)</option></select></label>
      <fieldset id="annualF" style="border:0;padding:0;margin:0">
        <label class="fld"><span>Sensibilă la îngheț?</span><select name="warm"><option value="1">Da – plantă de căldură</option><option value="0">Nu – suportă răcoarea</option></select></label>
        <label class="fld"><span>Se pornește din</span><select name="start"><option value="rasad">Răsad</option><option value="direct">Semănat direct</option></select></label>
        <div class="row"><label class="fld"><span>Săpt. față de ultimul îngheț (semănat/plantare)</span><input type="number" name="weeks" value="2" min="-16" max="16"></label>
        <label class="fld"><span>Zile până la recoltă</span><input type="number" name="mature" value="70" min="10" max="365"></label></div>
      </fieldset>
      <fieldset id="perF" style="border:0;padding:0;margin:0" hidden>
        <div class="row"><label class="fld"><span>Recoltă: zile după ultimul îngheț</span><input type="number" name="hStart" value="100" min="0" max="300"></label>
        <label class="fld"><span>Durata recoltei (zile)</span><input type="number" name="hLen" value="30" min="1" max="200"></label></div>
        <label class="chk" style="margin-bottom:10px"><input type="checkbox" name="prune" checked> Necesită tăieri de iarnă</label>
        <label class="chk" style="margin-bottom:10px"><input type="checkbox" name="dormant"> Tratamente de iarnă / la dezmugurire</label>
      </fieldset>
      <label class="fld"><span>Durata recoltei (zile, anuale)</span><input type="number" name="span" value="30" min="1" max="200"></label>
      <label class="chk" style="margin-bottom:10px"><input type="checkbox" name="stake"> Are nevoie de araci / susținere</label>
      <label class="chk" style="margin-bottom:10px"><input type="checkbox" name="fungal"> Sensibilă la boli (mană, făinare)</label>
      <label class="chk" style="margin-bottom:10px"><input type="checkbox" name="feeder"> Mare consumatoare de îngrășăminte</label>
      ${admin ? '<label class="chk" style="margin-bottom:14px"><input type="checkbox" name="share" checked> Disponibilă pentru toți utilizatorii (administrator)</label>' : ''}
      <button class="btn block" type="submit">Salvează planta</button></form>`;
  }

  /* ================= SETĂRI ================= */
  function vSettings() {
    const m = me(), admin = m.role === 'admin';
    let h = `<h1>Setări</h1>`;
    h += `<div class="card"><h2>👤 Contul meu</h2><p><b>${esc(m.name)}</b> · ${admin ? 'Administrator' : 'Utilizator'}</p>
      <div class="row wrap"><button class="btn sm sec" data-act="renameme">Schimbă numele</button><button class="btn sm sec" data-act="setpin">${m.pin ? 'Schimbă / șterge PIN' : 'Setează PIN'}</button><button class="btn sm ghost" data-act="logout">Schimbă utilizatorul</button></div>
      <p class="tiny muted">Termeni acceptați pe ${new Date(m.acceptedAt).toLocaleDateString('ro-RO')}.</p></div>`;
    h += `<div class="card"><h2>🌱 Preferințe</h2><label class="fld"><span>Metoda implicită</span></label><div class="choices" style="margin-top:-8px">${Object.entries(METHODS).map(([k, v]) => `<button class="choice ${m.pref.method === k ? 'on' : ''}" data-act="setmethod" data-k="${k}"><span class="ci">${v.icon}</span><b>${v.name}</b></button>`).join('')}</div>
      <label class="fld" style="margin-top:14px"><span>Aspect</span></label><div class="choices" style="margin-top:-8px">${[['light', '☀️', 'Luminos'], ['dark', '🌙', 'Întunecat'], ['auto', '🖥️', 'Automat (ca sistemul)']].map(([k, i, n]) => `<button class="choice ${theme() === k ? 'on' : ''}" data-act="settheme" data-k="${k}"><span class="ci">${i}</span><b>${n}</b></button>`).join('')}</div>
      <label class="chk" style="margin-top:14px"><input type="checkbox" data-act="togglemoon" ${m.pref.moon !== false ? 'checked' : ''}> Afișează fazele lunii în calendar</label>
</div>`;
    const P = AP();
    h += `<div class="card"><h2>🔔 Alerte și notificări</h2>
      <label class="chk"><input type="checkbox" data-act="al-on" ${P.on ? 'checked' : ''}> Primesc notificări</label>
      <div ${P.on ? '' : 'hidden'} style="margin-top:12px">
        <label class="fld"><span>Rezumatul zilnic la ora</span><select data-act="al-hour">${Array.from({ length: 17 }, (_, i) => i + 5).map(hh => `<option value="${hh}" ${P.hour === hh ? 'selected' : ''}>${String(hh).padStart(2, '0')}:00</option>`).join('')}</select></label>
        <label class="chk" style="margin-bottom:8px"><input type="checkbox" data-act="al-zilnic" ${P.zilnic ? 'checked' : ''}> Rezumatul zilei (ce am de făcut)</label>
        <label class="chk" style="margin-bottom:8px"><input type="checkbox" data-act="al-meteo" ${P.meteo ? 'checked' : ''}> Alerte meteo: îngheț, caniculă, boli, vânt, grindină (seara dinainte și dimineața)</label>
        <label class="chk" style="margin-bottom:8px"><input type="checkbox" data-act="al-restante" ${P.restante ? 'checked' : ''}> Restanțe și etape întârziate</label>
        ${exe ? `<div class="info green small">🖥️ Rulați prin <b>GradinaMea.exe</b>: notificările apar în Windows chiar dacă browserul este închis, cât timp fereastra aplicației este pornită.</div>
          <label class="chk" style="margin-bottom:8px"><input type="checkbox" data-act="al-windows" ${P.windows ? 'checked' : ''}> Notificări Windows</label>
          <label class="chk" style="margin-bottom:8px"><input type="checkbox" data-act="al-autostart" ${exe.autostart ? 'checked' : ''}> Pornește Grădina Mea automat cu Windows (minimizat, doar pentru alerte)</label>
          <button class="btn sm sec" data-act="al-test">🔔 Trimite o notificare de test</button>`
          : `<p class="small muted">Notificările apar cât timp aplicația este deschisă (poate fi și minimizată). Pentru notificări cu browserul închis, porniți aplicația prin GradinaMea.exe.</p><button class="btn sm sec" data-act="al-test">🔔 Trimite o notificare de test</button>`}
      </div></div>`;
    h += `<div class="card"><h2>📍 Grădini și locații</h2>${m.gardens.map(g => `<div class="entry"><span class="ei">${g.id === garden().id ? '🏡' : '🌳'}</span><span class="et"><b>${esc(g.name)}</b><small>${esc(g.loc.name)}${g.loc.country ? ', ' + esc(g.loc.country) : ''} · ${(+g.loc.lat).toFixed(2)}, ${(+g.loc.lon).toFixed(2)}</small></span>
      <button class="btn sm ghost" data-act="editgarden" data-id="${g.id}">✏️</button></div>`).join('')}
      <button class="btn sm sec" data-act="addgarden">➕ Altă grădină (casă, țară, vie…)</button></div>`;
    if (admin) h += `<div class="card"><h2>👥 Utilizatori</h2>${S.profiles.map(p => `<div class="entry"><span class="avatar" style="display:grid;place-items:center">${esc(p.name.slice(0, 1).toUpperCase())}</span><span class="et"><b>${esc(p.name)}</b><small>${p.role === 'admin' ? 'Administrator' : 'Utilizator'} · ${p.entries.length} plante</small></span>
      ${p.id !== m.id ? `<button class="btn sm ghost" data-act="toggleadmin" data-id="${p.id}">${p.role === 'admin' ? '↓ utilizator' : '↑ admin'}</button><button class="btn sm danger" data-act="deluser" data-id="${p.id}">🗑</button>` : ''}</div>`).join('')}
      <a class="btn sm sec" href="#nou">➕ Adaugă utilizator</a>
      ${(S.shared.plants || []).length ? `<h3 style="margin-top:14px">Plante adăugate pentru toți</h3>${S.shared.plants.map(p => `<div class="entry"><span class="ei">${p.icon}</span><span class="et"><b>${esc(p.name)}</b></span><button class="btn sm danger" data-act="delplant" data-id="${p.id}" data-shared="1">🗑</button></div>`).join('')}` : ''}</div>`;
    if ((m.plants || []).length) h += `<div class="card"><h2>🌿 Plantele mele personalizate</h2>${m.plants.map(p => `<div class="entry"><span class="ei">${p.icon}</span><span class="et"><b>${esc(p.name)}</b></span><button class="btn sm danger" data-act="delplant" data-id="${p.id}">🗑</button></div>`).join('')}</div>`;
    h += `<div class="card"><h2>💾 Copie de siguranță / mutare pe alt dispozitiv</h2><p class="small muted">Datele stau pe acest dispozitiv. Ca să le aveți și pe telefon/PC, exportați fișierul și importați-l pe celălalt dispozitiv.</p>
      <div class="row wrap"><button class="btn sm sec" data-act="export">⬇️ Exportă datele</button><label class="btn sm sec" style="cursor:pointer">⬆️ Importă<input type="file" id="importF" accept=".json,application/json" hidden></label></div></div>`;
    h += `<div class="card"><h2>📲 Instalare</h2><p class="small"><b>Android / Chrome / Edge (PC):</b> butonul „Instalează” din bara de sus sau meniul browserului → „Instalați aplicația”.<br><b>iPhone / iPad:</b> în Safari apăsați Distribuie <span aria-hidden="true">⬆️</span> → „Adaugă pe ecranul principal”.</p>
      ${deferredInstall ? '<button class="btn sm" data-act="install">⬇️ Instalează acum</button>' : ''}</div>`;
    h += `<div class="card"><h2>ℹ️ Despre</h2><p class="small">Prognoza (16 zile), temperatura solului, evapotranspirația și istoricul pe 3 ani provin de la <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> – serviciu gratuit care combină modelele serviciilor meteo naționale (ECMWF, DWD, NOAA, Météo-France etc.). Licență CC BY 4.0, uz necomercial. Datele de îngheț sunt calculate din temperaturile minime reale ale ultimilor 3 ani pentru coordonatele grădinii.</p>
      <details><summary class="small"><b>Termeni și limitarea răspunderii</b></summary><p class="small">${esc(DISCLAIMER)}</p></details>
      <button class="btn sm danger" data-act="reset" style="margin-top:10px">Șterge toate datele de pe acest dispozitiv</button></div>`;
    return h;
  }

  /* ================= FEREASTRĂ ================= */
  function openSheet(html, onOpen) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; if (onOpen) onOpen($('#sheetBody')); }
  function closeSheet() { $('#sheet').hidden = true; $('#sheetBody').innerHTML = ''; }
  function ask(title, text, okTxt, cb, danger) {
    openSheet(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="row"><button class="btn ghost" data-close style="flex:1">Renunță</button><button class="btn ${danger ? 'danger' : ''}" id="askOk" style="flex:1">${esc(okTxt)}</button></div>`,
      b => $('#askOk', b).onclick = () => { closeSheet(); cb(); });
  }
  function prompt2(title, label, val, cb, type = 'text') {
    openSheet(`<h2>${esc(title)}</h2><form id="p2"><label class="fld"><span>${esc(label)}</span><input type="${type}" id="p2v" value="${esc(val || '')}" ${type === 'password' ? 'inputmode="numeric" maxlength="6"' : ''}></label><button class="btn block">Salvează</button></form>`,
      b => { const f = $('#p2', b); $('#p2v', b).focus(); f.onsubmit = ev => { ev.preventDefault(); closeSheet(); cb($('#p2v').value.trim()); }; });
  }
  function locationSheet(g) {
    const st = { loc: g ? g.loc : null };
    openSheet(`<h2>${g ? 'Modifică grădina' : 'Grădină nouă'}</h2>
      <label class="fld"><span>Nume</span><input type="text" id="gsName" value="${esc(g ? g.name : 'Grădina de la țară')}"></label>
      <button class="btn sec block" id="gsGeo">📍 Folosește locația actuală</button>
      <div class="row" style="margin-top:10px"><input type="search" id="gsQ" placeholder="Caută localitatea"><button class="btn sec" id="gsS">Caută</button></div>
      <div class="results" id="gsRes"></div><div id="gsSel" class="info green" ${st.loc ? '' : 'hidden'}>${st.loc ? esc(st.loc.name + (st.loc.country ? ', ' + st.loc.country : '')) : ''}</div>
      <button class="btn block" id="gsSave" style="margin-top:12px">Salvează</button>
      ${g && me().gardens.length > 1 ? `<button class="btn danger block" id="gsDel" style="margin-top:8px">Șterge grădina și plantele ei</button>` : ''}`, b => {
      const showSel = () => { const s = $('#gsSel', b); s.hidden = !st.loc; s.textContent = st.loc ? '✅ ' + st.loc.name + (st.loc.admin ? ', ' + st.loc.admin : '') + (st.loc.country ? ', ' + st.loc.country : '') : ''; };
      $('#gsGeo', b).onclick = () => geolocate(l => { st.loc = l; showSel(); });
      const search = () => doSearch($('#gsQ', b).value, $('#gsRes', b), l => { st.loc = l; showSel(); $('#gsRes', b).innerHTML = ''; });
      $('#gsS', b).onclick = search; $('#gsQ', b).onkeydown = e => { if (e.key === 'Enter') search(); };
      $('#gsSave', b).onclick = () => {
        if (!st.loc) return toast('Alegeți o locație');
        const m = me();
        if (g) { g.name = $('#gsName', b).value.trim() || g.name; g.loc = st.loc; }
        else { const ng = { id: uid(), name: $('#gsName', b).value.trim() || 'Grădina 2', loc: st.loc }; m.gardens.push(ng); m.gardenId = ng.id; }
        save(); closeSheet(); ctx.clim = null; ctx.wx = null; loadWeather(); render();
      };
      const d = $('#gsDel', b); if (d) d.onclick = () => { const m = me(); m.gardens = m.gardens.filter(x => x.id !== g.id); m.entries = m.entries.filter(e => e.gardenId !== g.id); m.gardenId = m.gardens[0].id; save(); closeSheet(); ctx.clim = null; loadWeather(); render(); };
    });
  }
  function geolocate(cb) {
    if (!navigator.geolocation) return toast('Dispozitivul nu permite localizarea. Căutați localitatea.');
    toast('Se caută locația…', 8000);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      const r = await Weather.reverse(lat, lon);
      toast('Locație găsită: ' + r.name);
      cb({ lat: +lat.toFixed(4), lon: +lon.toFixed(4), name: r.name, admin: r.admin, country: r.country, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
    }, err => toast(err.code === 1 ? 'Ați refuzat accesul la locație. Căutați localitatea manual.' : 'Nu am putut afla locația. Căutați localitatea.', 4000), { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  }
  async function doSearch(q, box, cb) {
    q = (q || '').trim(); if (q.length < 2) return toast('Scrieți cel puțin 2 litere');
    box.innerHTML = '<div class="spinner"></div>';
    try {
      const r = await Weather.geocode(q);
      if (!r.length) { box.innerHTML = '<p class="muted small">Nu am găsit nimic. Încercați fără diacritice sau cu numele în engleză.</p>'; return; }
      box.innerHTML = r.map((x, i) => `<button type="button" data-i="${i}"><b>${esc(x.name)}</b> <span class="muted small">${esc([x.admin, x.country].filter(Boolean).join(', '))}${x.elev != null ? ' · ' + Math.round(x.elev) + ' m' : ''}</span></button>`).join('');
      $$('button', box).forEach(b => b.onclick = () => { const x = r[+b.dataset.i]; cb({ lat: x.lat, lon: x.lon, name: x.name, admin: x.admin, country: x.country, tz: x.tz }); });
    } catch (e) { box.innerHTML = '<p class="muted small">Căutarea nu a funcționat (sunteți offline?).</p>'; }
  }

  /* ================= ACȚIUNI ================= */
  function doAct(act, el) {
    const ds = el ? el.dataset : {};
    const m = me();
    switch (act) {
      case 'open': location.hash = 'task=' + encodeURIComponent(ds.id); break;
      case 'tick': {
        const tk = findTask(ds.id);
        let nowDone;
        if (tk && tk.doneKey && m.done[tk.doneKey]) { delete m.done[tk.doneKey]; nowDone = false; }
        else if (!tk && m.done[ds.id]) { delete m.done[ds.id]; nowDone = false; }
        else { m.done[ds.id] = Date.now(); nowDone = true; }
        doneVer++; save();
        toast(nowDone ? (tk && (tk.late || tk.type === 'transplant' || tk.type.startsWith('semanat')) ? '✓ Făcut! Calendarul plantei s-a recalculat de la data de azi.' : '✓ Bravo! Sarcină făcută.') : 'Sarcină redeschisă');
        render(); syncAlerts(); if (!$('#sheet').hidden && $('#sheetBody h2') && $('#sheetBody h2').textContent.includes('Alerte')) alertsSheet(); break;
      }
      case 'back': if (history.length > 1) history.back(); else location.hash = 'azi'; break;
      case 'method': ui.method = ds.k; render(); break;
      case 'cal': ui.cal = ds.m; ui.calSel = null; render(); break;
      case 'calday': ui.calSel = ds.d; render(); if (innerWidth < 900) setTimeout(() => { const c = $$('.card').pop(); c && c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); break;
      case 'filter': ui.filter = ds.k; render(); break;
      case 'refresh': loadWeather(true); toast('Se actualizează vremea…'); break;
      case 'addcat': ui.addCat = ds.k; ui.addFocus = false; render(); break;
      case 'pickplant': { const p = plantOf(ds.id); openSheet(entryForm(p), bindEntryForm); break; }
      case 'editentry': { const e = m.entries.find(x => x.id === ds.id); const p = plantOf(e.plantId); if (!p) return; openSheet(entryForm(p, e), bindEntryForm); break; }
      case 'delentry': ask('Ștergeți planta?', 'Sarcinile ei vor dispărea din calendar.', 'Șterge', () => { m.entries = m.entries.filter(x => x.id !== ds.id); save(); render(); toast('Plantă ștearsă'); }, true); break;
      case 'fplace': { const f = $('#entryForm'); f.place.value = ds.k; $$('[data-act=fplace]', f).forEach(b => b.classList.toggle('on', b === el)); break; }
      case 'customplant': openSheet(customForm(), bindCustomForm); break;
      case 'delplant': ask('Ștergeți planta personalizată?', 'Plantele din grădină de acest tip nu vor mai avea sarcini.', 'Șterge', () => {
        if (ds.shared) S.shared.plants = S.shared.plants.filter(p => p.id !== ds.id); else m.plants = m.plants.filter(p => p.id !== ds.id); save(); render(); }, true); break;
      case 'settheme': try { localStorage.setItem('gradina.theme', ds.k); } catch (e) { } applyTheme(); render(); break;
      case 'setmethod': m.pref.method = ds.k; ui.method = null; save(); render(); break;
      case 'togglemoon': m.pref.moon = el.checked; save(); break;
      case 'al-on':
        if (el.checked && 'Notification' in window && Notification.permission !== 'granted' && !(exe)) {
          Notification.requestPermission().then(r => { m.pref.alerts = Object.assign(AP(), { on: r === 'granted' }); save(); if (r !== 'granted') toast('Browserul a refuzat notificările. Le puteți permite din setările site-ului.'); render(); syncAlerts(); });
        } else {
          if (el.checked && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
          m.pref.alerts = Object.assign(AP(), { on: el.checked }); save(); render(); syncAlerts();
        }
        break;
      case 'al-zilnic': case 'al-meteo': case 'al-restante': case 'al-windows':
        m.pref.alerts = Object.assign(AP(), { [act.slice(3)]: el.checked }); save(); syncAlerts(); break;
      case 'al-hour': m.pref.alerts = Object.assign(AP(), { hour: +el.value }); save(); syncAlerts(); toast('Rezumatul zilnic: ' + el.value + ':00'); break;
      case 'al-autostart':
        fetch('/__autostart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ on: el.checked }) })
          .then(r => r.json()).then(j => { exe.autostart = !!j.autostart; toast(j.autostart ? 'Va porni automat cu Windows' : 'Pornirea automată a fost oprită'); }).catch(() => toast('Nu am putut modifica pornirea automată'));
        break;
      case 'al-test':
        if (exe) fetch('/__notify-test', { method: 'POST' }).then(() => toast('Notificare trimisă – verificați colțul ecranului')).catch(() => toast('Nu am putut trimite notificarea'));
        else if ('Notification' in window) Notification.requestPermission().then(r => r === 'granted' ? showNote('🌱 Grădina Mea', 'Notificările funcționează!', 'test') : toast('Notificările sunt blocate în browser.'));
        break;
      case 'bell': alertsSheet(); break;
      case 'togglenotify':
        if (el.checked && 'Notification' in window) Notification.requestPermission().then(r => { m.pref.notify = r === 'granted'; save(); if (r !== 'granted') toast('Notificările au fost refuzate în browser.'); render(); });
        else { m.pref.notify = false; save(); }
        break;
      case 'renameme': prompt2('Numele dvs.', 'Nume', m.name, v => { if (v) { m.name = v; save(); render(); } }); break;
      case 'setpin': prompt2('PIN', 'PIN nou (lăsați gol pentru a-l șterge)', '', v => { if (v && !/^\d{4,6}$/.test(v)) return toast('PIN-ul trebuie să aibă 4–6 cifre'); m.pin = v ? hash(v) : null; save(); toast(v ? 'PIN setat' : 'PIN șters'); render(); }, 'password'); break;
      case 'logout': unlocked = null; sessionStorage.removeItem('gradina.unlocked'); S.current = null; save(); ctx.clim = null; ctx.wx = null; location.hash = 'azi'; render(); break;
      case 'pickuser': {
        const p = S.profiles.find(x => x.id === ds.id);
        if (!p.pin) return login(p);
        $('#pinBox').innerHTML = `<form id="pinF" class="row" style="margin:10px 0"><input type="password" id="pinV" inputmode="numeric" maxlength="6" placeholder="PIN pentru ${esc(p.name)}" autofocus><button class="btn">Intră</button></form>`;
        $('#pinV').focus();
        $('#pinF').onsubmit = ev => { ev.preventDefault(); if (hash($('#pinV').value) === p.pin) login(p); else toast('PIN greșit'); };
        break;
      }
      case 'newacct': ui.ob = { step: 1, newAcct: true }; location.hash = 'nou'; render(); break;
      case 'toggleadmin': { const p = S.profiles.find(x => x.id === ds.id); p.role = p.role === 'admin' ? 'user' : 'admin'; save(); render(); break; }
      case 'deluser': { const p = S.profiles.find(x => x.id === ds.id); ask(`Ștergeți contul ${p.name}?`, 'Toate grădinile și sarcinile acestui utilizator vor fi șterse de pe dispozitiv.', 'Șterge', () => { S.profiles = S.profiles.filter(x => x.id !== p.id); save(); render(); }, true); break; }
      case 'editgarden': locationSheet(m.gardens.find(g => g.id === ds.id)); break;
      case 'addgarden': locationSheet(null); break;
      case 'export': exportData(); break;
      case 'install': install(); break;
      case 'reset': ask('Ștergeți totul?', 'Toate conturile, grădinile și istoricul de pe acest dispozitiv vor fi șterse definitiv. Faceți întâi un export dacă vreți să le păstrați.', 'Șterge tot', () => { localStorage.removeItem(KEY); Object.keys(localStorage).filter(k => k.startsWith('gradina.')).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); location.hash = ''; location.reload(); }, true); break;
      // onboarding
      case 'ob-next': ui.ob.step = 1; render(); break;
      case 'ob-back': if (ui.ob.newAcct && S.profiles.length) { ui.ob = { step: 0 }; location.hash = 'azi'; } else ui.ob.step = 0; render(); break;
      case 'ob-acct': {
        const name = $('#obName').value.trim(), pin = $('#obPin').value.trim(), acc = $('#obAccept').checked;
        ui.ob.name = name; ui.ob.pin = pin; ui.ob.accept = acc;
        if (!name) return toast('Scrieți numele');
        if (pin && !/^\d{4,6}$/.test(pin)) return toast('PIN-ul trebuie să aibă 4–6 cifre');
        if (!acc) return toast('Trebuie să acceptați termenii pentru a continua');
        const p = { id: uid(), name, role: S.profiles.length ? 'user' : 'admin', pin: pin ? hash(pin) : null, acceptedAt: Date.now(), pref: { method: 'bio', moon: true, notify: false }, gardens: [], gardenId: null, entries: [], done: {}, plants: [] };
        S.profiles.push(p); S.current = p.id; unlocked = p.id; sessionStorage.setItem('gradina.unlocked', p.id); save();
        ui.ob = { step: 2 }; location.hash = 'azi'; render(); break;
      }
      case 'geo': geolocate(l => { ui.ob.loc = l; render(); }); break;
      case 'locsearch': ui.ob.q = $('#locQ').value; doSearch(ui.ob.q, $('#locRes'), l => { ui.ob.loc = l; render(); }); break;
      case 'ob-loc': {
        const g = { id: uid(), name: ($('#gName') && $('#gName').value.trim()) || 'Grădina mea', loc: ui.ob.loc };
        m.gardens.push(g); m.gardenId = g.id; save(); ui.ob.step = 3; ui.ob.method = m.pref.method || 'bio';
        ctx.clim = null; ctx.wx = null; loadWeather();
        render(); break;
      }
      case 'ob-method': ui.ob.method = ds.k; render(); break;
      case 'ob-finish': m.pref.method = ui.ob.method; save(); ui.ob = { step: 0 }; location.hash = 'adauga'; render(); break;
    }
  }
  function theme() { try { return localStorage.getItem('gradina.theme') || 'light'; } catch (e) { return 'light'; } }
  function applyTheme() {
    const t = theme(), dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#161b14' : '#2f6b3a';
  }
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (theme() === 'auto') applyTheme(); }); } catch (e) { }
  function login(p) { S.current = p.id; unlocked = p.id; sessionStorage.setItem('gradina.unlocked', p.id); save(); ctx.clim = null; ctx.wx = null; location.hash = 'azi'; render(); }
  function hash(s) { let h = 2166136261; for (const c of 'gm:' + s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

  function bindEntryForm(b) {
    const f = $('#entryForm', b);
    const st = f.status, pw = $('#plantedWrap', b);
    const upd = () => { if (pw) pw.hidden = st.value !== 'plantat'; };
    st.onchange = upd; upd();
    f.onsubmit = ev => {
      ev.preventDefault();
      const m = me(), fd = new FormData(f), id = f.dataset.entry;
      const data = { plantId: f.dataset.plant, place: fd.get('place'), status: fd.get('status'), plantedOn: fd.get('status') === 'plantat' ? (fd.get('plantedOn') || null) : null,
        method: fd.get('method') || null, variety: fd.get('variety') || null, label: (fd.get('label') || '').trim(), qty: (fd.get('qty') || '').trim(), note: (fd.get('note') || '').trim() };
      if (id) Object.assign(m.entries.find(x => x.id === id), data);
      else m.entries.push(Object.assign({ id: uid(), gardenId: garden().id, created: Date.now() }, data));
      save(); closeSheet();
      toast(id ? 'Salvat' : `${plantOf(data.plantId).icon} Adăugată! Calendarul a fost actualizat.`);
      render();
    };
  }
  function bindCustomForm(b) {
    const f = $('#customForm', b);
    const upd = () => { const per = f.life.value === 'perena'; $('#annualF', b).hidden = per; $('#perF', b).hidden = !per; f.span.closest('label').hidden = per; };
    f.life.onchange = upd; upd();
    f.onsubmit = ev => {
      ev.preventDefault();
      const v = n => f[n].value, c = n => f[n] && f[n].checked;
      const p = { id: 'c_' + uid(), custom: true, name: v('name').trim(), icon: v('icon'), cat: v('cat'), life: v('life'), feeder: c('feeder') ? 3 : 1, stake: c('stake'), dis: c('fungal') ? ['mana', 'fainare'] : [], pest: ['afide'], water: 2, spacing: '—' };
      if (!p.name) return toast('Scrieți numele');
      if (p.life === 'anuala') {
        p.warm = v('warm') === '1'; const wk = +v('weeks') * 7;
        if (v('start') === 'rasad') { p.transplant = wk; p.indoor = wk - 49; } else p.direct = wk;
        p.mature = +v('mature') || 70; p.span = +v('span') || 30; p.every = 7; p.germ = p.warm ? 14 : 6;
      } else {
        p.hStart = +v('hStart') || 100; p.hEnd = p.hStart + (+v('hLen') || 30); p.bloom = Math.max(-20, Math.min(60, p.hStart - 80)); p.every = 7;
        if (c('prune')) p.winterPrune = -40; if (c('dormant')) p.dormantSpray = true; p.coldHardy = -20;
      }
      const m = me();
      if (c('share') && m.role === 'admin') (S.shared.plants = S.shared.plants || []).push(p); else (m.plants = m.plants || []).push(p);
      save(); closeSheet(); toast('Plantă creată – acum alegeți unde este plantată');
      openSheet(entryForm(p), bindEntryForm);
    };
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'gradina-mea', exported: new Date().toISOString(), data: S }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `gradina-mea-${today()}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Fișier exportat');
  }
  function importData(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result); const d = j.data || j;
        if (!d.profiles || !Array.isArray(d.profiles)) throw new Error('format');
        ask('Importați datele?', `Fișierul conține ${d.profiles.length} cont(uri). Datele actuale de pe acest dispozitiv vor fi înlocuite.`, 'Importă', () => {
          S = d; S.shared = S.shared || { plants: [] }; save(); unlocked = null; sessionStorage.removeItem('gradina.unlocked'); ctx.clim = null; ctx.wx = null; location.hash = 'azi'; render(); toast('Date importate');
        });
      } catch (e) { toast('Fișierul nu este o copie validă Grădina Mea'); }
    };
    r.readAsText(file);
  }

  /* ================= ALERTE ================= */
  const ALERT_DEF = { on: false, hour: 8, meteo: true, restante: true, zilnic: true, windows: true };
  const AP = () => Object.assign({}, ALERT_DEF, (me() && me().pref.alerts) || {});
  let exe = null; // informații de la lansatorul Windows (dacă aplicația rulează prin GradinaMea.exe)
  async function detectExe() {
    try { const r = await fetch('/__ping', { cache: 'no-store' }); exe = r.ok ? await r.json() : null; } catch (e) { exe = null; }
    if (exe && !exe.exe) exe = null;
    return exe;
  }
  function computeAlerts() {
    const m = me(); if (!m || !ctx.clim || !garden()) return { weather: [], late: [], overdue: [], today: [], count: 0 };
    const t0 = today();
    const all = tasksFor(E.add(t0, -21), E.add(t0, 2));
    const created = {}; m.entries.forEach(e => created[e.id] = new Date(e.created || 0).toISOString().slice(0, 10));
    const weather = all.filter(t => t.prio && t.date >= t0 && !isDone(t));
    const late = all.filter(t => t.late && !isDone(t));
    const overdue = all.filter(t => t.date < t0 && !t.weather && !isDone(t) && !t.superseded && !t.expired && t.date >= (created[t.entryId] || ''));
    const todays = all.filter(t => t.date === t0 && !t.prio && !t.late && !isDone(t));
    return { weather, late, overdue, today: todays, count: weather.length + late.length + overdue.length };
  }
  function renderBell() {
    const b = $('#bellBtn'); if (!b) return;
    const a = computeAlerts();
    b.hidden = false;
    $('#bellCnt').textContent = a.count > 99 ? '99+' : a.count;
    $('#bellCnt').hidden = !a.count;
    b.classList.toggle('hot', a.weather.length > 0);
  }
  function alertsSheet() {
    const a = computeAlerts();
    const sec = (title, L, opt) => L.length ? `<h3 style="margin-top:14px">${title}</h3><div class="tasks">${L.map(t => taskRow(t, opt)).join('')}</div>` : '';
    openSheet(`<h2>🔔 Alerte</h2>
      ${a.count || a.today.length ? '' : '<p class="muted">Nicio alertă. Totul este la zi! 🌿</p>'}
      ${sec('🌦️ Vremea', a.weather, { showDate: true })}
      ${sec('⏰ Etape întârziate', a.late)}
      ${sec('📌 Restanțe', a.overdue, { showDate: true })}
      ${sec('📅 De făcut azi', a.today)}
      <p class="small muted" style="margin-top:14px">${AP().on ? `Notificările sunt pornite: rezumat zilnic la ${AP().hour}:00${exe ? ' + notificări Windows' : ''}.` : 'Puteți primi aceste alerte ca notificări – porniți-le din Setări → Alerte.'}</p>
      <a class="btn sec block" href="#setari" data-close>⚙️ Setări alerte</a>`);
  }
  async function showNote(title, body, tag, url) {
    try {
      const reg = 'serviceWorker' in navigator && await navigator.serviceWorker.getRegistration();
      if (reg) await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag, data: { url: url || '#azi' } });
      else new Notification(title, { body, tag });
    } catch (e) { }
  }
  function summaryText(a) {
    const parts = [];
    if (a.today.length) parts.push(`${a.today.length} ${a.today.length === 1 ? 'sarcină' : 'sarcini'} azi: ${[...new Set(a.today.map(tTitle))].slice(0, 3).join(', ')}${a.today.length > 3 ? '…' : ''}`);
    if (a.late.length) parts.push(`${a.late.length} etape întârziate`);
    if (a.overdue.length) parts.push(`${a.overdue.length} restanțe`);
    if (a.weather.length) parts.push(`⚠ ${[...new Set(a.weather.map(tTitle))].join(', ')}`);
    return parts.join(' · ') || 'Nicio sarcină azi. Zi liniștită în grădină! 🌿';
  }
  // Notificări în browser (cât timp aplicația este deschisă, chiar și în fundal)
  async function notifyAlerts() {
    const P = AP(); if (!P.on || !ctx.clim || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (exe && P.windows) return; // se ocupă lansatorul Windows, ca să nu apară dublu
    const a = computeAlerts(), t0 = today(), now = new Date();
    let sent = {}; try { sent = JSON.parse(localStorage.getItem('gradina.notified') || '{}'); } catch (e) { }
    if (P.meteo) for (const t of a.weather) { if (sent[t.id]) continue; sent[t.id] = t0; await showNote('⚠ ' + tTitle(t), `${niceDate(t.date)}: ${t.basis || ''}`, t.id, '#task=' + encodeURIComponent(t.id)); }
    if (P.restante) for (const t of a.late) { const k = 'late|' + t.id + '|' + t0; if (sent[k]) continue; sent[k] = t0; await showNote('⏰ Etapă întârziată: ' + tTitle(t), tSub(t) + ` – întârziere ${t.late} zile`, k, '#task=' + encodeURIComponent(t.id)); }
    if (P.zilnic && now.getHours() >= P.hour && sent['sum|' + me().id] !== t0) { sent['sum|' + me().id] = t0; await showNote('🌱 Grădina Mea – ' + garden().name, summaryText(a), 'sum', '#azi'); }
    Object.keys(sent).forEach(k => { if (sent[k] !== 1 && sent[k] < E.add(t0, -10)) delete sent[k]; });
    try { localStorage.setItem('gradina.notified', JSON.stringify(sent)); } catch (e) { }
  }
  // Programul de notificări pentru lansatorul Windows (merge și cu browserul închis)
  async function syncAlerts() {
    if (!exe) await detectExe();
    if (!exe) return;
    if (!me()) return;
    const P = AP(), out = [];
    if (P.on && P.windows && ctx.clim && garden()) {
      const t0 = today();
      const all = tasksFor(E.add(t0, -21), E.add(t0, 8));
      const at = (d, h) => new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), h, 0, 0).getTime();
      const a0 = computeAlerts();
      for (let i = 0; i < 8; i++) {
        const d = E.add(t0, i);
        const L = all.filter(t => t.date === d && !t.prio && !isDone(t) && !t.superseded && !t.expired);
        const W = all.filter(t => t.date === d && t.prio && !isDone(t));
        if (P.zilnic) {
          const parts = [];
          if (L.length) parts.push(`${L.length} ${L.length === 1 ? 'sarcină' : 'sarcini'}: ${[...new Set(L.map(tTitle))].slice(0, 3).join(', ')}`);
          if (i === 0 && P.restante && (a0.overdue.length + a0.late.length)) parts.push(`${a0.overdue.length + a0.late.length} restanțe`);
          if (W.length) parts.push('⚠ ' + [...new Set(W.map(tTitle))].join(', '));
          if (parts.length) out.push({ id: `sum|${me().id}|${d}`, at: at(d, P.hour), title: `🌱 ${garden().name} – ${niceDate(d)}`, body: parts.join(' · '), url: '#azi' });
        }
        if (P.meteo) W.forEach(t => {
          out.push({ id: `wxe|${t.id}`, at: at(E.add(d, -1), 19), title: `⚠ Mâine: ${tTitle(t)}`, body: t.basis || '', url: '#task=' + encodeURIComponent(t.id) });
          out.push({ id: `wxm|${t.id}`, at: at(d, 7), title: `⚠ Azi: ${tTitle(t)}`, body: t.basis || '', url: '#task=' + encodeURIComponent(t.id) });
        });
      }
      if (P.restante) a0.late.forEach(t => out.push({ id: `late|${t.id}|${t0}`, at: at(t0, Math.max(P.hour, 9)) + 3600e3 * 3, title: `⏰ Etapă întârziată: ${tTitle(t)}`, body: tSub(t) + ` – întârziere ${t.late} zile`, url: '#task=' + encodeURIComponent(t.id) }));
    }
    try { await fetch('/__alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: me() ? me().id : '', alerts: out }) }); } catch (e) { }
  }
  setInterval(() => { if (me() && ctx.clim) { notifyAlerts(); renderBell(); } }, 15 * 60e3);
  setInterval(() => { if (me() && ctx.clim) syncAlerts(); }, 60 * 60e3);

  /* ================= INSTALARE PWA ================= */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; $('#installBtn').hidden = false; });
  window.addEventListener('appinstalled', () => { deferredInstall = null; $('#installBtn').hidden = true; toast('Aplicația a fost instalată 🎉'); });
  async function install() { if (!deferredInstall) return toast('Folosiți meniul browserului → „Instalați aplicația” / „Adaugă pe ecranul principal”'); deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('#installBtn').hidden = true; }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });

  /* ================= EVENIMENTE ================= */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeSheet(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return; // tratate la change
    e.preventDefault(); e.stopPropagation();
    doAct(el.dataset.act, el);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('input[data-act], select[data-act]')) doAct(el.dataset.act, el);
    if (el.id === 'importF' && el.files[0]) importData(el.files[0]);
    if (el.id === 'gardenSel') { me().gardenId = el.value; save(); ctx.clim = null; ctx.wx = null; loadWeather(); render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.task[data-act]')) { e.preventDefault(); doAct('open', e.target); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'addQ') { ui.addQ = e.target.value; ui.addFocus = true; render(); }
  });
  $('#installBtn').onclick = install;
  $('#userBtn').onclick = () => location.hash = 'setari';
  window.addEventListener('hashchange', () => { if (!route().v.startsWith('task')) ui.method = null; render(); window.scrollTo(0, 0); });
  // reîmprospătează vremea când aplicația revine în prim-plan (după 2 ore)
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx.wx && Date.now() - ctx.wx.fetched > 2 * 3600e3) loadWeather(); });
  window.addEventListener('online', () => loadWeather(true));

  detectExe().then(() => { if (route().v === 'setari') render(); syncAlerts(); });
  render();
  window.__app = { S: () => S, ctx, render };
})();
