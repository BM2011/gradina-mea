/* Vreme și climă – Open-Meteo (gratuit, fără cheie, acoperire globală, modele ECMWF/DWD/NOAA etc.) */
(function () {
  const FORECAST = 'https://api.open-meteo.com/v1/forecast';
  const ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
  const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
  const REVERSE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* plin sau indisponibil */ } }
  };
  const key = (p, lat, lon) => `gradina.${p}.${(+lat).toFixed(2)},${(+lon).toFixed(2)}`;

  async function getJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  async function geocode(q) {
    const url = `${GEO}?name=${encodeURIComponent(q)}&count=8&language=ro&format=json`;
    const j = await getJSON(url);
    return (j.results || []).map(r => ({
      name: r.name, admin: r.admin1 || '', country: r.country || '', cc: r.country_code || '',
      lat: r.latitude, lon: r.longitude, elev: r.elevation, tz: r.timezone
    }));
  }

  async function reverse(lat, lon) {
    try {
      const j = await getJSON(`${REVERSE}?latitude=${lat}&longitude=${lon}&localityLanguage=ro`);
      return { name: j.city || j.locality || j.principalSubdivision || 'Locația mea', admin: j.principalSubdivision || '', country: j.countryName || '', cc: j.countryCode || '' };
    } catch (e) {
      return { name: `Locația mea (${(+lat).toFixed(2)}, ${(+lon).toFixed(2)})`, admin: '', country: '' };
    }
  }

  function dailyMeans(hourlyTimes, values) {
    const out = {};
    hourlyTimes.forEach((t, i) => {
      const d = t.slice(0, 10); const v = values[i];
      if (v == null) return;
      (out[d] = out[d] || []).push(v);
    });
    const m = {};
    for (const d in out) m[d] = out[d].reduce((a, b) => a + b, 0) / out[d].length;
    return m;
  }

  /* Prognoză 16 zile + 7 zile în urmă (pentru bilanțul de apă). Cache 2 ore. */
  async function forecast(lat, lon, force) {
    const k = key('wx', lat, lon);
    const c = ls.get(k);
    if (!force && c && Date.now() - c.at < 2 * 3600e3) return c.data;
    const daily = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,et0_fao_evapotranspiration';
    const url = `${FORECAST}?latitude=${lat}&longitude=${lon}&daily=${daily}&hourly=soil_temperature_6cm,relative_humidity_2m&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&past_days=7&forecast_days=16&timezone=auto`;
    try {
      const j = await getJSON(url);
      const D = j.daily;
      const soil = dailyMeans(j.hourly.time, j.hourly.soil_temperature_6cm);
      const rh = dailyMeans(j.hourly.time, j.hourly.relative_humidity_2m);
      const days = D.time.map((d, i) => ({
        date: d, code: D.weather_code[i], tmax: D.temperature_2m_max[i], tmin: D.temperature_2m_min[i],
        rain: D.precipitation_sum[i] || 0, pop: D.precipitation_probability_max[i] ?? null,
        wind: D.wind_speed_10m_max[i], gust: D.wind_gusts_10m_max[i], et0: D.et0_fao_evapotranspiration[i] || 0,
        soil: soil[d] != null ? Math.round(soil[d] * 10) / 10 : null, rh: rh[d] != null ? Math.round(rh[d]) : null
      }));
      const data = { days, current: j.current, tz: j.timezone, fetched: Date.now() };
      ls.set(k, { at: Date.now(), data });
      return data;
    } catch (e) {
      if (c) { c.data.stale = true; return c.data; }
      throw e;
    }
  }

  /* Climatologie din ultimii 3 ani: date de îngheț, temperaturi medii, minima absolută. Cache 60 de zile. */
  const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const CUM = MD.reduce((a, m, i) => (a.push(i ? a[i - 1] + MD[i - 1] : 0), a), []);
  function doyOf(iso) { const m = +iso.slice(5, 7) - 1, d = +iso.slice(8, 10) - 1; return Math.min(364, CUM[m] + Math.min(d, MD[m] - 1)); }

  function analyse(days) {
    const frost = new Array(365).fill(0), sum = new Array(365).fill(0), cnt = new Array(365).fill(0);
    let minAbs = 99, maxAbs = -99;
    days.forEach(x => {
      if (x.date.slice(5) === '02-29' || x.tmin == null) return;
      const k = doyOf(x.date);
      if (x.tmin <= 0) frost[k]++;
      const mean = x.tmean != null ? x.tmean : (x.tmin + x.tmax) / 2;
      sum[k] += mean; cnt[k]++;
      minAbs = Math.min(minAbs, x.tmin); maxAbs = Math.max(maxAbs, x.tmax);
    });
    const raw = sum.map((s, i) => cnt[i] ? s / cnt[i] : null);
    const mean = raw.map((_, i) => { let s = 0, n = 0; for (let j = -7; j <= 7; j++) { const v = raw[(i + j + 365) % 365]; if (v != null) { s += v; n++; } } return n ? s / n : null; });
    const risk = frost.map(f => f > 0);
    const nFrost = risk.filter(Boolean).length;
    let res = { minAbs: Math.round(minAbs), maxAbs: Math.round(maxAbs), mean: mean.map(v => v == null ? null : Math.round(v * 10) / 10) };
    const coolest = mean.reduce((b, v, i) => (v != null && v < mean[b] ? i : b), 0);
    const warmest = mean.reduce((b, v, i) => (v != null && v > mean[b] ? i : b), 0);
    res.coolest = coolest; res.warmest = warmest;
    if (nFrost === 0) {
      res.frostFree = true; res.lfDoy = (coolest + 15) % 365; res.season = 330;
    } else if (nFrost >= 360) {
      res.polar = true; res.lfDoy = (warmest - 30 + 365) % 365; res.season = 60;
    } else {
      // cel mai lung interval circular fără risc de îngheț
      let best = 0, bestStart = 0, run = 0, start = 0;
      for (let i = 0; i < 730; i++) {
        const r = risk[i % 365];
        if (!r) { if (run === 0) start = i; run++; if (run > best && run <= 365) { best = run; bestStart = start % 365; } }
        else run = 0;
      }
      res.lfDoy = bestStart; res.season = best;
    }
    res.ffDoy = (res.lfDoy + res.season) % 365;
    res.southern = null;
    return res;
  }

  async function climate(lat, lon, force) {
    const k = key('clim', lat, lon);
    const c = ls.get(k);
    if (!force && c && Date.now() - c.at < 60 * 864e5) return c.data;
    const end = new Date(Date.now() - 6 * 864e5);
    const start = new Date(end.getTime() - 3 * 365 * 864e5);
    const f = d => d.toISOString().slice(0, 10);
    const url = `${ARCHIVE}?latitude=${lat}&longitude=${lon}&start_date=${f(start)}&end_date=${f(end)}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&timezone=auto`;
    try {
      const j = await getJSON(url);
      const D = j.daily;
      const days = D.time.map((d, i) => ({ date: d, tmax: D.temperature_2m_max[i], tmin: D.temperature_2m_min[i], tmean: D.temperature_2m_mean[i] }));
      const data = analyse(days);
      data.southern = lat < 0;
      ls.set(k, { at: Date.now(), data });
      return data;
    } catch (e) {
      if (c) return c.data;
      // Rezervă: estimare din latitudine (dacă nu există conexiune)
      return fallbackClimate(lat);
    }
  }

  function fallbackClimate(lat) {
    const a = Math.abs(lat);
    const southern = lat < 0;
    if (a < 23) return { frostFree: true, lfDoy: southern ? 170 : 15, season: 330, ffDoy: 0, minAbs: 12, mean: null, estimated: true, southern };
    // ultim îngheț aproximativ: 45°N → ~10 aprilie (doy 100)
    const lfN = Math.max(30, Math.min(160, Math.round(100 + (a - 45) * 4.5)));
    const season = Math.max(60, Math.round(195 - (a - 45) * 9));
    const lf = southern ? (lfN + 182) % 365 : lfN;
    return { lfDoy: lf, season, ffDoy: (lf + season) % 365, minAbs: Math.round(-15 - (a - 45) * 1.2), mean: null, estimated: true, southern };
  }

  window.Weather = { geocode, reverse, forecast, climate, analyse, fallbackClimate, doyOf };
})();
