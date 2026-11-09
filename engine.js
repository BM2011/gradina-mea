/* Motorul de programare: transformă plantele din grădină + clima locației + prognoza
 * într-o listă de sarcini datate, apoi le ajustează după vremea din zilele următoare. */
(function () {
  const DAY = 864e5;
  const iso = t => new Date(t).toISOString().slice(0, 10);
  const ts = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const add = (s, n) => iso(ts(s) + n * DAY);
  const diff = (a, b) => Math.round((ts(a) - ts(b)) / DAY);
  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function fromDoy(year, doy) { let m = 0; while (doy >= MD[m]) { doy -= MD[m]; m++; } return iso(Date.UTC(year, m, doy + 1)); }
  const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  const fmt = s => `${+s.slice(8, 10)} ${MONTHS[+s.slice(5, 7) - 1]}`;
  const fmtY = s => `${fmt(s)} ${s.slice(0, 4)}`;

  function todayISO(tz) {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz || undefined, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { return iso(Date.now() - new Date().getTimezoneOffset() * 60000); }
  }

  function plantById(id, extra) {
    return (extra || []).find(p => p.id === id) || PLANTS.find(p => p.id === id) || null;
  }

  /* Sezoane (LF→FF) pentru anii din jurul intervalului cerut */
  function seasons(clim, from, to) {
    const y0 = +from.slice(0, 4) - 1, y1 = +to.slice(0, 4) + 1, out = [];
    for (let y = y0; y <= y1; y++) {
      const lf = fromDoy(y, clim.lfDoy);
      out.push({ lf, ff: add(lf, clim.season), year: y });
    }
    return out;
  }

  const VAR_SHIFT = { timpuriu: -35, mijlociu: 0, tarziu: 30 };
  const OUTDOOR = p => p === 'camp' || p === 'ghiveci';

  /* ---------- Generarea sarcinilor pentru o plantă ---------- */
  function forEntry(entry, plant, clim, range) {
    const out = [];
    const place = PLACES[entry.place] || PLACES.camp;
    const shift = clim.frostFree ? 0 : place.shift;
    const active = []; // intervale în care planta e „în grădină” (pentru alerte meteo)
    const T = (date, type, extra) => {
      if (!date) return;
      const o = (extra && extra.origDate) || date;
      out.push(Object.assign({ id: `${entry.id}|${type}|${o}`, date, orig: o, type, entryId: entry.id, plantId: plant.id }, extra || {}));
    };
    const every = (from, to, step, type, extra) => { if (!from || !to) return; for (let d = from; d <= to; d = add(d, step)) T(d, type, Object.assign({ rep: step }, extra || {})); };
    /* Etapă cheie (semănat, plantare): dacă a fost făcută → data reală; dacă e întârziată → azi,
       iar restul ciclului se decalează în consecință. */
    const today = range.today;
    const stage = (type, sched) => {
      const d = doneDate(range.doneIdx, entry.id, type, sched, 25);
      if (d) return { date: d, done: true, sched };
      const late = diff(today, sched);
      if (late > 0 && late <= 150 && entry.status === 'planificat') return { date: today, late, sched };
      return { date: sched, sched };
    };
    const stageExtra = st => st.late ? { origDate: st.sched, late: st.late } : (st.done ? { origDate: st.sched } : {});
    const seas = seasons(clim, range.from, range.to);
    const planted = entry.status === 'plantat' && entry.plantedOn ? entry.plantedOn : null;
    const lfTxt = s => `ultimul îngheț estimat (${fmt(s.lf)})`;
    const ffTxt = s => `primul îngheț estimat (${fmt(s.ff)})`;
    const rel = (n, what) => n === 0 ? `la ${what}` : `la ${Math.abs(n) >= 14 ? Math.round(Math.abs(n) / 7) + ' săptămâni' : Math.abs(n) + ' zile'} ${n < 0 ? 'înainte de' : 'după'} ${what}`;
    const placeTxt = shift ? ` (decalat cu ${shift} zile pentru ${place.name.toLowerCase()})` : '';

    if (plant.life === 'anuala' && !plant.overwinter) {
      seas.forEach((s, si) => {
        const LF = add(s.lf, -shift), FF = add(s.ff, shift);
        const usePlanted = planted && planted >= add(LF, -120) && planted <= FF;
        if (planted && !usePlanted && FF < planted) return; // sezoane anterioare plantării
        const mode = (entry.method === 'direct' && plant.direct != null) || plant.indoor == null ? 'direct' : 'rasad';
        let P, lastStage = null;
        const future = d => d >= today; // pașii intermediari ratați nu se mai afișează când etapa e întârziată
        if (mode === 'rasad') {
          let S = { date: add(LF, plant.indoor), sched: add(LF, plant.indoor) }, Tt;
          if (!usePlanted) {
            S = stage('semanat_interior', add(LF, plant.indoor));
            const grow = plant.transplant - plant.indoor;
            let T0 = add(LF, plant.transplant);
            if (add(S.date, grow) > T0) T0 = add(S.date, grow);
            Tt = stage('transplant', T0);
            P = Tt.date; lastStage = Tt.late ? Tt : (S.late ? S : null);
            T(S.date, 'semanat_interior', Object.assign({ basis: `Semănat ${rel(plant.indoor, lfTxt(s))}${placeTxt}, ca răsadul să fie gata la plantare.` }, stageExtra(S)));
            if (plant.indoor <= -35 && (!S.late || true)) T(add(S.date, 18), 'repicat', { basis: 'La circa 2–3 săptămâni după semănat, când apar 1–2 frunze adevărate.' });
            if (entry.place !== 'interior' && entry.place !== 'sera_inc' && (!Tt.late || future(add(P, -8)))) T(add(P, -8), 'calire', { basis: 'Cu o săptămână înainte de plantare.' });
            if (!Tt.late || future(add(P, -14))) T(add(P, -14), 'pregatire_sol', { basis: 'Cu 2 săptămâni înainte de plantare, ca solul să se așeze.' });
            T(P, 'transplant', Object.assign({ basis: S.late || S.done && S.date !== S.sched ? `Calculat de la data reală a semănatului (${fmt(S.date)}) + ${grow} zile de creștere a răsadului.` : `Plantare ${rel(plant.transplant, lfTxt(s))}${placeTxt}.`, warm: !!plant.warm }, stageExtra(Tt)));
          } else P = planted;
        } else {
          if (!usePlanted) {
            const D = stage('semanat_direct', add(LF, plant.direct));
            P = D.date; lastStage = D.late ? D : null;
            if (!D.late || future(add(P, -14))) T(add(P, -14), 'pregatire_sol', { basis: 'Cu 2 săptămâni înainte de semănat.' });
            T(P, 'semanat_direct', Object.assign({ basis: `Semănat ${rel(plant.direct, lfTxt(s))}${placeTxt}. Temperatura minimă a solului: ${plant.germ || 8} °C.`, germ: plant.germ, warm: !!plant.warm }, stageExtra(D)));
          } else P = planted;
          if (plant.thin) T(add(P, 21), 'rarit', { basis: 'La 3 săptămâni după semănat.' });
        }
        const H = add(P, plant.mature || 60);
        const cap = plant.warm ? add(FF, -1) : add(FF, 21);
        let Hend = add(H, plant.span || 30); if (Hend > cap) Hend = cap;
        if (H > cap) {
          if (lastStage) out.filter(t => t.date === today && t.late).forEach(t => t.warn = `Etapa este întârziată cu ${t.late} zile: plantele nu mai apucă să rodească înainte de primul îngheț (${fmt(s.ff)}). Puteți încerca într-un spațiu protejat sau amânați pentru sezonul următor.`);
          return;
        }
        active.push({ from: mode === 'rasad' && !OUTDOOR(entry.place) ? P : P, to: Hend, tender: !!plant.warm });
        cycleCare(P, H, Hend, s, FF);
        // a doua cultură de toamnă (salată, spanac, ridichi…)
        if (plant.autumn != null && !usePlanted) {
          const A = add(FF, plant.autumn), AH = add(A, plant.mature || 40), AE = add(AH, Math.min(plant.span || 20, 25));
          if (A > Hend) {
            T(A, 'semanat_direct', { basis: `Cultură de toamnă: ${rel(plant.autumn, ffTxt(s))}.`, germ: plant.germ, autumn: true });
            every(AH, AE, plant.every || 5, 'recoltare', { basis: `La circa ${plant.mature} de zile după semănat.` });
            active.push({ from: A, to: AE, tender: false });
          }
        }
      });
    } else if (plant.overwinter) { // usturoi
      seas.forEach((s, si) => {
        const FF = add(s.ff, shift), next = seas[si + 1]; if (!next) return;
        const nLF = add(next.lf, -shift);
        let P = planted && planted <= add(nLF, plant.hStart) && planted >= add(FF, -90) ? planted : add(FF, plant.autumn);
        if (planted && add(nLF, plant.hStart + plant.span) < planted) return;
        if (!(planted && P === planted)) {
          const st = stage('plantare_bulbi', P);
          if (st.late && st.late > 60) return; // prea târziu pentru sezonul acesta
          P = st.date;
          T(P, 'plantare_bulbi', Object.assign({ basis: `Plantare toamna, ${rel(plant.autumn, ffTxt(s))}, ca să înrădăcineze înainte de ger.` }, stageExtra(st)));
        }
        T(add(nLF, -14), 'fertilizare', { basis: 'Primăvara devreme, la pornirea în vegetație.' });
        every(add(nLF, -7), add(nLF, plant.hStart - 10), 21, 'plivit');
        if (plant.dis) T(add(nLF, 30), 'monitorizare', { basis: 'Verificare de primăvară.' });
        const H = add(nLF, plant.hStart);
        every(H, add(H, plant.span), plant.every, 'recoltare', { basis: `Recoltare ${rel(plant.hStart, lfTxt(next))}, când frunzele încep să se îngălbenească.` });
        active.push({ from: P, to: add(H, plant.span), tender: false });
      });
    } else if (plant.life === 'bulb') {
      seas.forEach((s, si) => {
        const LF = add(s.lf, -shift), FF = add(s.ff, shift);
        if (planted && FF < planted) return;
        if (plant.tuberSpring != null) { // dalii
          const P = planted && planted >= add(LF, -60) && planted <= FF ? planted : add(LF, plant.tuberSpring);
          if (P !== planted) T(P, 'plantare_bulbi', { basis: `Plantare tuberculi ${rel(plant.tuberSpring, lfTxt(s))}.`, warm: true });
          if (plant.stake) T(add(P, 21), 'palisare');
          every(add(P, 30), add(FF, -30), 30, 'fertilizare');
          every(add(P, 14), add(FF, -14), 21, 'plivit');
          every(add(P, plant.hStart), add(FF, -1), plant.every, 'flori_trecute', { basis: 'Pe toată perioada înfloririi.' });
          if (plant.pest || plant.dis) every(add(P, 20), add(FF, -10), 14, 'monitorizare');
          if (plant.liftAfterFrost) T(add(FF, 4), 'scoatere_bulbi', { basis: `Imediat după ${ffTxt(s)}, când frunzele s-au înnegrit.` });
          active.push({ from: P, to: FF, tender: true });
        } else { // lalele
          const next = seas[si + 1];
          T(add(FF, plant.autumn), 'plantare_bulbi', { basis: `Toamna, ${rel(plant.autumn, ffTxt(s))}.` });
          if (next) {
            const nLF = add(next.lf, -shift);
            T(add(nLF, -21), 'fertilizare', { basis: 'La răsărirea frunzelor.' });
            T(add(nLF, plant.hEnd), 'flori_trecute', { basis: 'După înflorire: tăiați doar floarea, lăsați frunzele să se usuce singure (hrănesc bulbul).' });
            if (plant.lift) T(add(nLF, plant.lift), 'scoatere_bulbi', { basis: 'Opțional, când frunzele s-au uscat complet (pentru rărire sau mutare).' });
          }
        }
      });
    } else { // perene: pomi, viță, arbuști, flori perene, căpșuni
      const vs = VAR_SHIFT[entry.variety] || 0;
      let plantDate = null;
      if (entry.status === 'planificat' && plant.plant) {
        const cands = seas.map(s => add(plant.plant.anchor === 'ff' ? add(s.ff, shift) : add(s.lf, -shift), plant.plant.at)).filter(d => d >= range.today);
        plantDate = cands[0];
        if (plantDate) T(plantDate, 'plantare_pom', { basis: plant.plant.anchor === 'ff' ? `Plantare în repaus, toamna (${rel(plant.plant.at, 'primul îngheț estimat')}).` : `Plantare primăvara devreme (${rel(plant.plant.at, 'ultimul îngheț estimat')}).` });
      }
      seas.forEach(s => {
        const LF = add(s.lf, -shift), FF = add(s.ff, shift);
        const ok = d => !plantDate || d > plantDate;
        const P = (d, type, extra) => { if (ok(d)) T(d, type, extra); };
        const bloom = add(LF, plant.bloom || 0);
        const hS = add(LF, (plant.hStart || 100) + vs), hE = add(LF, (plant.hEnd || (plant.hStart || 100) + 30) + vs);
        if (plant.winterPrune != null) P(add(LF, plant.winterPrune), 'taiere_iarna', { basis: `În repaus, ${rel(plant.winterPrune, lfTxt(s))} – după gerurile mari, înainte de pornirea mugurilor.` });
        if (plant.springPrune != null) P(add(LF, plant.springPrune), 'taiere_iarna', { basis: `Primăvara, ${rel(plant.springPrune, lfTxt(s))}.`, label: 'Tăieri de primăvară' });
        if (plant.vineOps) P(add(LF, plant.winterPrune + 21), 'legat_coarde', { basis: 'După tăiere, înainte de umflarea mugurilor.' });
        if (plant.dormantSpray) P(add(LF, -28), 'tratament_repaus', { basis: `În repaus, la circa 4 săptămâni înainte de ${lfTxt(s)}, la peste 5 °C.` });
        if (plant.autumnCopper) P(add(FF, 10), 'tratament_repaus', { basis: 'Toamna, la căderea frunzelor (esențial contra bășicării).', label: 'Tratament de toamnă cu cupru' });
        if (plant.dormantSpray) {
          const dz = plant.vineOps ? add(LF, 15) : add(bloom, -21);
          P(dz, 'tratament_dezmugurire', { basis: plant.vineOps ? 'Când lăstarii au 10–15 cm (primul tratament contra manei).' : 'La umflarea mugurilor, cu circa 3 săptămâni înainte de înflorit.' });
          if (!plant.vineOps && plant.dis && plant.dis.some(d => ['monilioza', 'rapan'].includes(d))) P(add(bloom, -4), 'tratament_inflorit', { basis: 'Faza de buton floral, chiar înainte de înflorit.' });
        }
        const sprayEnd = add(hS, plant.vineOps ? -21 : -14);
        if (plant.dis && plant.dis.length) {
          const st = add(bloom, plant.vineOps ? -10 : 10);
          for (let d = st; d <= sprayEnd; d = add(d, 14)) P(d, 'tratament_fungic', { basis: 'Program preventiv la 14 zile; se devansează automat dacă vin ploi.' });
        }
        if (plant.pest && plant.pest.length) every(add(bloom, 7), hE, 14, 'monitorizare_p');
        P(add(LF, -14), 'fertilizare', { basis: 'Fertilizare de primăvară, la pornirea în vegetație.', label: 'Fertilizare de primăvară' });
        if ((plant.feeder || 1) >= 2) P(add(bloom, 20), 'fertilizare', { basis: 'După înflorit, la creșterea fructelor.' });
        if (plant.cat !== 'flori' || plant.life === 'perena') P(add(FF, -25), 'fertilizare', { basis: 'Toamna: fosfor și potasiu pentru maturarea lemnului (fără azot).', label: 'Fertilizare de toamnă (P, K)' });
        if (plant.thinFruit) P(add(bloom, 40), 'rarire_fructe', { basis: 'După căderea naturală a fructelor (circa 6 săptămâni după înflorit).' });
        if (plant.vineOps) {
          P(add(bloom, -25), 'taiere_verde', { basis: 'Plivitul lăstarilor (lăstari de 10–20 cm).', label: 'Plivitul lăstarilor' });
          P(add(bloom, 5), 'taiere_verde', { basis: 'După înflorit: copilit și legat.', label: 'Copilit și legat lăstarii' });
          P(add(bloom, 30), 'taiere_verde', { basis: 'Cârnitul lăstarilor deasupra ultimei sârme.', label: 'Cârnit' });
          P(add(hS, -25), 'desfrunzit', { basis: 'Cu 3–4 săptămâni înainte de recoltare.' });
        }
        if (plant.stake) P(add(bloom, -20), 'palisare', { basis: 'Înainte ca bobocii grei să încline tulpinile.' });
        if (plant.flower) {
          for (let d = hS; d <= hE; d = add(d, plant.every || 14)) P(d, 'flori_trecute');
        } else if (plant.hStart != null) {
          for (let d = hS; d <= hE; d = add(d, plant.every || 7)) P(d, 'recoltare', { basis: vs ? `Perioadă ajustată pentru un soi cu maturare ${entry.variety}.` : 'Perioada medie de coacere pentru zona dvs.' });
        }
        if (plant.summerPrune) P(add(hE, 7), 'taiere_vara', { basis: 'Imediat după recoltare.' });
        if (plant.pruneAfterHarvest) P(add(hE, 5), 'taiere_vara', { basis: 'Imediat după terminarea recoltei / înfloririi.' });
        if (plant.cut) {
          const c = add(plant.cut.anchor === 'ff' ? FF : LF, plant.cut.at);
          P(c, 'butasire', { basis: 'Momentul optim pentru acest tip de înmulțire.', kind: plant.cut.kind });
        }
        if (plant.overwinterIndoor || plant.tender) {
          if (!clim.frostFree && entry.place !== 'interior' && entry.place !== 'sera_inc') {
            P(add(FF, -10), 'iernare_interior', { basis: `Înainte de ${ffTxt(s)}.` });
            P(add(LF, 14), 'scoatere_afara', { basis: `După ${lfTxt(s)}.` });
          }
        } else if (clim.minAbs != null && plant.coldHardy != null && clim.minAbs <= plant.coldHardy + 3 && OUTDOOR(entry.place)) {
          P(add(FF, 10), 'protectie_iarna', { basis: `În ultimii ani minima a coborât la ${clim.minAbs} °C, aproape de limita de rezistență a plantei (${plant.coldHardy} °C).` });
        }
        if (plant.cutBackAutumn) P(add(FF, 7), 'curatare_toamna', { basis: 'Tăiați tulpinile la nivelul solului după primul îngheț.' });
        if (plant.cat === 'arbust' || plant.id === 'capsuni') { P(add(LF, 20), 'mulcire'); every(add(LF, 0), add(FF, -20), 30, 'plivit'); }
        active.push({ from: add(LF, -30), to: FF, tender: false, bloom: [add(bloom, -7), add(bloom, 14)], perennial: true });
      });
    }

    function cycleCare(P, H, Hend, s, FF) {
      if ((plant.mature || 60) >= 40) T(add(P, plant.warm ? 21 : 14), 'mulcire', { basis: plant.warm ? 'După ce solul s-a încălzit (3 săptămâni după plantare).' : 'La 2 săptămâni după plantare.' });
      every(add(P, 14), Hend, 14, 'plivit');
      const f = plant.feeder || 1;
      if (f === 3) every(add(P, 21), add(Hend, -14), 21, 'fertilizare', { basis: 'Plantă mare consumatoare: hrană la 3 săptămâni.' });
      else if (f === 2) every(add(P, 30), add(Hend, -14), 30, 'fertilizare', { basis: 'Fertilizare lunară.' });
      else if ((plant.mature || 0) > 50) T(add(P, 30), 'fertilizare', { basis: 'O singură fertilizare ușoară.' });
      if (plant.stake) every(add(P, 7), add(H, 30) < Hend ? add(H, 30) : Hend, 21, 'palisare', { basis: 'Legați pe măsură ce crește.' });
      if (plant.sucker) every(add(P, 20), add(Hend, -30), 8, 'copilit', { basis: 'La 7–10 zile, cât copiii sunt mici.' });
      if (plant.top) { const c = add(FF, -45); if (c > add(P, 50) && c < Hend) T(c, 'carnit', { basis: `Cu 45 de zile înainte de ${ffTxt(s)}.` }); }
      if (plant.hill) { T(add(P, 25), 'musuroire', { basis: 'Primul mușuroit.' }); T(add(P, 45), 'musuroire', { basis: 'Al doilea mușuroit.' }); }
      if (plant.dis && plant.dis.length) every(add(P, 21), add(Hend, -10), 14, 'tratament_fungic', { basis: 'Program preventiv la 14 zile; se devansează automat dacă vin ploi.' });
      if (plant.pest && plant.pest.length) every(add(P, 14), Hend, 14, 'monitorizare_p');
      const ht = plant.flower ? 'flori_trecute' : 'recoltare';
      every(H, Hend, plant.every || 5, ht, { basis: `Prima recoltă la circa ${plant.mature} de zile de la ${plant.indoor != null && entry.method !== 'direct' ? 'plantare' : 'semănat'}.` });
      if (plant.seed && !plant.seed.bien) { const sd = add(H, plant.seed.d); if (sd <= Hend) T(sd, 'recoltare_seminte', { basis: 'Din fructele coapte de la mijlocul recoltei (cele mai bune semințe).' }); }
      T(add(Hend, 5), 'curatare_toamna', { basis: 'După ultima recoltă.' });
    }

    out.forEach(t => { if (t.type === 'monitorizare_p') t.type = 'monitorizare'; });
    return { tasks: out.filter(t => t.date >= range.from && t.date <= range.to), active };
  }

  /* ---------- Reguli meteo ---------- */
  const INSIDE = { tunel: 2, solar: 3, sera: 4 };
  function eff(day, place) { // temperaturi/ploaie „resimțite” de plantă în funcție de loc
    if (!day) return null;
    const p = PLACES[place] || PLACES.camp;
    let tmin = day.tmin, tmax = day.tmax;
    if (INSIDE[place]) { tmin += INSIDE[place]; tmax += INSIDE[place] * 3; }
    if (place === 'sera_inc') { tmin = Math.max(tmin, 12); tmax = Math.max(tmax + 8, 18); }
    if (place === 'interior') { tmin = 18; tmax = 24; }
    return { tmin, tmax, rain: p.rain ? day.rain : 0, wind: p.rain ? day.wind : 0, gust: p.rain ? day.gust : 0, pop: p.rain ? day.pop : 0, soil: INSIDE[place] ? (day.soil ?? 0) + INSIDE[place] + 2 : (place === 'sera_inc' || place === 'interior') ? 18 : day.soil };
  }
  function checkRule(rule, t, dayIdx, days, place) {
    const d = eff(days[dayIdx], place), n = eff(days[dayIdx + 1], place), p = eff(days[dayIdx - 1], place);
    if (!d) return { ok: true };
    const warm = !!t.warm;
    switch (rule) {
      case 'stropit':
        if (d.rain >= 1 || (d.pop != null && d.pop >= 60)) return { ok: false, why: `ploaie (${d.rain} mm)` };
        if (n && n.rain >= 4) return { ok: false, why: `ploaie a doua zi (${n.rain} mm) – ar spăla tratamentul` };
        if (d.wind >= 20) return { ok: false, why: `vânt ${Math.round(d.wind)} km/h` };
        { const hot = INSIDE[place] || place === 'sera_inc' ? days[dayIdx].tmax + 4 : d.tmax; // în solar se stropește dimineața devreme
          if (hot > 30) return { ok: false, why: `prea cald (${Math.round(hot)} °C)` }; }
        if (d.tmax < 6) return { ok: false, why: `prea frig (${Math.round(d.tmax)} °C)` };
        return { ok: true };
      case 'stropit_repaus':
        if (d.tmax < 5) return { ok: false, why: `sub 5 °C (${Math.round(d.tmax)} °C)` };
        if (d.rain >= 1) return { ok: false, why: 'ploaie' };
        if (d.wind >= 20) return { ok: false, why: 'vânt' };
        return { ok: true };
      case 'taiere':
        if (d.tmin < -5) return { ok: false, why: `ger (${Math.round(d.tmin)} °C) – lemnul se rupe și rănile îngheață` };
        if (d.rain >= 3) return { ok: false, why: 'ploaie' };
        return { ok: true };
      case 'transplant': {
        const lim = warm ? 9 : 2;
        for (let i = 0; i < 5; i++) { const x = eff(days[dayIdx + i], place); if (x && x.tmin < lim) return { ok: false, why: `nopți reci în prognoză (${Math.round(x.tmin)} °C pe ${fmt(days[dayIdx + i].date)})` }; }
        if (d.rain >= 12) return { ok: false, why: 'ploaie torențială' };
        if (d.tmax >= 33) return { ok: false, why: 'caniculă' };
        return { ok: true };
      }
      case 'semanat':
        if (d.soil != null && t.germ && d.soil < t.germ) return { ok: false, why: `solul are ${d.soil.toFixed(0)} °C (minim ${t.germ} °C pentru germinare)` };
        if (warm && d.tmin < 7) return { ok: false, why: `nopți reci (${Math.round(d.tmin)} °C)` };
        if (d.rain >= 12) return { ok: false, why: 'ploaie puternică' };
        return { ok: true };
      case 'calire':
        if (d.tmin < (warm ? 6 : 2)) return { ok: false, why: `noapte rece (${Math.round(d.tmin)} °C) – țineți răsadurile înăuntru` };
        return { ok: true };
      case 'sapat':
        if (d.rain >= 4 || (p && p.rain >= 10)) return { ok: false, why: 'sol ud după ploaie' };
        if (d.tmax < 0) return { ok: false, why: 'sol înghețat' };
        return { ok: true };
      case 'uscat':
        if (d.rain >= 2) return { ok: false, why: 'ploaie' };
        return { ok: true };
      case 'recoltare':
        if (d.rain >= 8) return { ok: false, why: 'ploaie puternică' };
        return { ok: true };
      case 'fertilizare':
        if (d.rain >= 15) return { ok: false, why: 'ploaie puternică (spală îngrășământul)' };
        if (d.tmax >= 33) return { ok: false, why: 'caniculă' };
        return { ok: true };
    }
    return { ok: true };
  }

  function adjust(tasks, entries, wx, today) {
    if (!wx || !wx.days) return tasks;
    const days = wx.days, idx = {}; days.forEach((d, i) => idx[d.date] = i);
    const last = days[days.length - 1].date;
    const byId = {}; entries.forEach(e => byId[e.id] = e);
    tasks.forEach(t => {
      const rule = (TASKS[t.type] || {}).wx;
      if (!rule || t.date < today || t.date > last) return;
      const e = byId[t.entryId]; const place = e ? e.place : 'camp';
      const i = idx[t.date]; if (i == null) return;
      const r = checkRule(rule, t, i, days, place);
      if (r.ok) { t.wxOk = true; return; }
      // caută următoarea zi potrivită (max 10 zile)
      for (let k = 1; k <= 10 && i + k < days.length; k++) {
        const r2 = checkRule(rule, t, i + k, days, place);
        if (r2.ok) { t.moved = { from: t.date, why: r.why }; t.date = days[i + k].date; t.wxOk = true; return; }
      }
      t.warn = `Vremea nu e favorabilă în următoarele zile: ${r.why}. Urmăriți prognoza.`;
    });
    return tasks;
  }

  function isActive(actives, d) { return actives.filter(a => d >= a.from && d <= a.to); }

  /* Sarcini generate direct de prognoză: îngheț, caniculă, aerisire, boli, vânt, grindină, udare */
  function weatherTasks(entries, plantsOf, activeMap, wx, today) {
    if (!wx || !wx.days) return [];
    const out = [], days = wx.days;
    const W = (date, type, extra) => out.push(Object.assign({ id: `wx|${type}|${date}`, date, orig: date, type, weather: true }, extra));
    let lastDis = '0000';
    // Bilanț de apă (model simplu „găleată”) pe grupuri de loc
    const groups = { camp: { cap: 25, kc: 1, rain: true }, ghiveci: { cap: 8, kc: 1.1, rain: true }, protejat: { cap: 25, kc: 0.75, rain: false } };
    const store = { camp: 25, ghiveci: 8, protejat: 25 };
    const grp = p => p === 'camp' ? 'camp' : p === 'ghiveci' ? 'ghiveci' : (p === 'interior' ? null : 'protejat');
    days.forEach((day, i) => {
      const d = day.date;
      const act = entries.map(e => ({ e, p: plantsOf(e), a: isActive(activeMap[e.id] || [], d) })).filter(x => x.p && x.a.length);
      // --- udare
      Object.keys(groups).forEach(g => {
        const G = groups[g];
        const list = act.filter(x => grp(x.e.place) === g && (x.p.water || 2) >= 2 && !(x.p.cat === 'pom' && x.a.every(a => a.perennial)));
        const need = list.length ? Math.max(...list.map(x => ({ 1: 0.6, 2: 0.85, 3: 1.05 })[x.p.water || 2])) : 0.6;
        const et = day.et0 * G.kc * need;
        store[g] = Math.min(G.cap, store[g] + (G.rain ? day.rain : 0)) - et;
        if (store[g] < G.cap * 0.45) {
          const amount = Math.round(G.cap - store[g]);
          store[g] = G.cap;
          if (d >= today && list.length) W(d, 'udare', { id: `wx|udare-${g}|${d}`, group: g, amount, entries: list.map(x => x.e.id),
            basis: `Bilanț de apă: evapotranspirație ${day.et0.toFixed(1)} mm/zi${G.rain ? `, ploaie ${day.rain} mm` : ' (ploaia nu ajunge la plante)'}. Necesar estimat: ~${amount} L/m²${g === 'ghiveci' ? ' (verificați zilnic ghivecele)' : ''}.` });
        }
        if (store[g] < 0) store[g] = 0;
      });
      if (d < today) return;
      const outdoor = act.filter(x => OUTDOOR(x.e.place));
      // --- îngheț
      const frostHit = act.filter(x => {
        const t = eff(day, x.e.place).tmin;
        const tender = x.a.some(a => a.tender);
        const bloom = x.a.some(a => a.bloom && d >= a.bloom[0] && d <= a.bloom[1]);
        return (tender && t <= 3) || (bloom && t <= 0) || (!x.a.some(a => a.perennial) && t <= -3);
      });
      if (frostHit.length) W(d, 'protectie_inghet', { entries: frostHit.map(x => x.e.id), basis: `Minima prognozată: ${Math.round(day.tmin)} °C afară${frostHit.some(x => INSIDE[x.e.place]) ? ' (în spații protejate cu câteva grade mai mult)' : ''}.`, prio: 1 });
      // --- caniculă
      if (day.tmax >= 33 && act.length) W(d, 'umbrire', { entries: act.map(x => x.e.id), basis: `Maxima prognozată: ${Math.round(day.tmax)} °C.`, prio: 1 });
      // --- aerisire spații protejate
      const prot = act.filter(x => INSIDE[x.e.place] || x.e.place === 'sera_inc');
      if (prot.length && (day.tmax >= 20 || (day.tmax >= 13 && day.code <= 2))) W(d, 'aerisire', { entries: prot.map(x => x.e.id), basis: `Afară ${Math.round(day.tmax)} °C${day.code <= 2 ? ' și soare' : ''} – în interior temperatura poate depăși ${Math.round(day.tmax + 12)} °C.` });
      // --- risc de boli (2 zile ude, temperatură medie 10–27 °C)
      const prev = days[i - 1];
      const tm = (day.tmax + day.tmin) / 2;
      const wet = day.rain >= 2 && prev && prev.rain >= 2 || (day.rain >= 10);
      if (wet && tm >= 10 && tm <= 27 && diff(d, lastDis) >= 6) {
        const sus = outdoor.filter(x => (x.p.dis || []).some(k => ['mana', 'putregai', 'rapan', 'monilioza', 'patarea_neagra', 'alternarioza'].includes(k)));
        if (sus.length) { lastDis = d; W(d, 'alerta_boli', { entries: sus.map(x => x.e.id), basis: `Ploi repetate (${prev ? prev.rain : 0} + ${day.rain} mm) și ${tm.toFixed(0)} °C în medie – condiții ideale pentru ciuperci.`, prio: 1 }); }
      }
      // --- vânt / grindină
      if (day.code >= 96) W(d, 'grindina', { entries: act.map(x => x.e.id), basis: 'Prognoza indică furtună cu grindină.', prio: 1 });
      else if (day.gust >= 55 && act.length) W(d, 'vant', { entries: act.map(x => x.e.id), basis: `Rafale de până la ${Math.round(day.gust)} km/h.`, prio: 1 });
    });
    return out;
  }

  /* Devansarea tratamentelor preventive înaintea unei perioade ploioase */
  function rainAhead(tasks, wx, today) {
    if (!wx) return;
    const days = wx.days, idx = {}; days.forEach((d, i) => idx[d.date] = i);
    tasks.forEach(t => {
      if (t.type !== 'tratament_fungic' || t.date < today || t.moved) return;
      const i = idx[t.date]; if (i == null) return;
      // dacă peste 1–3 zile vin ploi de > 10 mm și azi e uscat, păstrăm; dacă tratamentul cade după ploaie, totul e ok
      const soon = days.slice(i + 1, i + 4).reduce((s, d) => s + d.rain, 0);
      if (soon >= 10) t.hint = `Urmează ploi (${Math.round(soon)} mm în 3 zile): aplicați tratamentul înainte de ploaie.`;
    });
  }

  /* ---------- Sarcini făcute / nefăcute ---------- */
  const isoLocal = ms => { const d = new Date(ms); return iso(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); };
  function buildDoneIdx(done) {
    const idx = {};
    Object.keys(done || {}).forEach(k => {
      const p = k.split('|'); if (p.length < 3) return;
      const key = p[0] + '|' + p[1];
      (idx[key] = idx[key] || []).push({ k, orig: p[2], at: done[k] });
    });
    return idx;
  }
  function doneMatch(idx, entryId, type, orig, tol, used) {
    const L = idx && idx[entryId + '|' + type]; if (!L) return null;
    let best = null;
    L.forEach(x => { if (used && used[x.k]) return; const dd = Math.abs(diff(x.orig, orig)); if (dd <= tol && (!best || dd < best.dd)) best = { dd, x }; });
    return best ? best.x : null;
  }
  function doneDate(idx, entryId, type, orig, tol) { const m = doneMatch(idx, entryId, type, orig, tol); return m ? isoLocal(m.at) : null; }
  const EXPIRE = { calire: 7, repicat: 10, tratament_repaus: 14, tratament_dezmugurire: 7, tratament_inflorit: 5, rarire_fructe: 14, carnit: 14, recoltare: 6, flori_trecute: 7, aerisire: 0, udare: 0, butasire: 21, taiere_iarna: 30, legat_coarde: 21, desfrunzit: 14 };

  function postProcess(tasks, done, idx, today) {
    const used = {};
    // 1) marcăm ce e făcut (cu toleranță, ca datele recalculate să nu piardă bifele)
    tasks.forEach(t => {
      if (done[t.id]) { t.doneAt = done[t.id]; t.doneKey = t.id; used[t.id] = 1; }
    });
    tasks.forEach(t => {
      if (t.doneAt || t.weather) return;
      const tol = t.rep ? Math.max(1, Math.floor(t.rep / 2) - 1) : 10;
      const m = doneMatch(idx, t.entryId, t.type, t.orig, tol, used);
      if (m) { t.doneAt = m.at; t.doneKey = m.k; used[m.k] = 1; }
    });
    // 2) serii recurente: următoarea se calculează de la data reală; restanțele repetate se comasează
    const series = {};
    tasks.forEach(t => { if (t.rep && !t.weather) (series[t.entryId + '|' + t.type] = series[t.entryId + '|' + t.type] || []).push(t); });
    Object.values(series).forEach(L => {
      L.sort((a, b) => a.orig < b.orig ? -1 : 1);
      let lastDone = null, ref = null, overdue = [];
      L.forEach(t => {
        if (t.doneAt) { lastDone = ref = isoLocal(t.doneAt); overdue.forEach(o => o.superseded = true); overdue = []; return; }
        if (ref && diff(t.date, ref) < t.rep * 0.6) { t.date = add(ref, t.rep); t.shifted = `Recalculată de la ultima efectuare (${fmt(lastDone)}).`; ref = t.date; }
        if (t.date < today) overdue.push(t);
      });
      if (overdue.length) {
        overdue.slice(0, -1).forEach(t => t.superseded = true);
        const last = overdue[overdue.length - 1];
        if (overdue.length > 1) last.missed = overdue.length;
        if (diff(today, last.date) > Math.max(last.rep, EXPIRE[last.type] ?? last.rep)) last.expired = true;
      }
    });
    // 3) sarcini unice depășite: expiră după o perioadă (nu mai au sens)
    tasks.forEach(t => {
      if (t.doneAt || t.rep || t.weather || t.late || t.date >= today) return;
      const ex = EXPIRE[t.type] ?? 21;
      t.overdue = diff(today, t.date);
      if (t.overdue > ex) t.expired = true;
    });
  }

  function generate(opts) {
    const { entries, clim, wx, today, from, to, extraPlants } = opts;
    const done = opts.done || {};
    const doneIdx = buildDoneIdx(done);
    const range = { from, to, today, doneIdx };
    let tasks = [];
    const activeMap = {};
    const plantsOf = e => plantById(e.plantId, extraPlants);
    entries.forEach(e => {
      const p = plantsOf(e); if (!p) return;
      // ca să știm ce e activ în fereastra prognozei, generăm pe un interval mai larg
      const r = forEntry(e, p, clim, { from: from < add(today, -400) ? from : add(today, -400), to: to > add(today, 30) ? to : add(today, 30), today, doneIdx });
      activeMap[e.id] = r.active;
      tasks = tasks.concat(r.tasks.filter(t => t.date >= from && t.date <= to));
    });
    postProcess(tasks, done, doneIdx, today);
    tasks.forEach(t => { if (t.doneAt) t.noAdjust = true; });
    adjust(tasks.filter(t => !t.noAdjust && !t.superseded && !t.expired), entries, wx, today);
    rainAhead(tasks, wx, today);
    const wt = weatherTasks(entries, plantsOf, activeMap, wx, today).filter(t => t.date >= from && t.date <= to);
    wt.forEach(t => { if (done[t.id]) { t.doneAt = done[t.id]; t.doneKey = t.id; } });
    tasks = tasks.concat(wt);
    tasks.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (b.prio || 0) - (a.prio || 0));
    return tasks;
  }

  /* Faza lunii (aprox. ±1 zi), pentru cei care urmează calendarul lunar tradițional */
  function moon(dateISO) {
    const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
    const age = (((ts(dateISO) + 12 * 3600e3 - ref) / DAY) % syn + syn) % syn;
    const ph = age / syn;
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const names = ['Lună nouă', 'Lună în creștere', 'Primul pătrar', 'Lună în creștere', 'Lună plină', 'Lună în descreștere', 'Ultimul pătrar', 'Lună în descreștere'];
    const k = Math.round(ph * 8) % 8;
    return { age, icon: icons[k], name: names[k], waxing: ph < 0.5 };
  }

  window.Engine = { isoLocal, generate, forEntry, adjust, weatherTasks, seasons, moon, plantById, todayISO, add, diff, fmt, fmtY, fromDoy, MONTHS, eff };
})();
