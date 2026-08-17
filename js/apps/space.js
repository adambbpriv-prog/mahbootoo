/* Space Tracker — live ISS telemetry from wheretheiss.at (no key, CORS-enabled) */
Apps.space = {
  title: "Orbital Tracker",
  width: 400,
  height: 380,
  _timer: null,

  mount(body) {
    body.innerHTML = `<div class="loading">LOCKING ONTO ORBITAL ASSETS...</div>`;
    const load = async () => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!res.ok) throw new Error("telemetry " + res.status);
        const d = await res.json();
        const daylight = d.visibility === "daylight";
        body.innerHTML = `
          <div class="section-label">International Space Station · NORAD 25544</div>
          <div class="big-num" style="font-size:24px;margin:6px 0">${d.latitude.toFixed(3)}°, ${d.longitude.toFixed(3)}°</div>
          <div class="stat-row"><span>Altitude</span><b>${d.altitude.toFixed(1)} km</b></div>
          <div class="stat-row"><span>Velocity</span><b>${Math.round(d.velocity).toLocaleString()} km/h</b></div>
          <div class="stat-row"><span>Visibility</span><b>${daylight ? "☀ daylight" : "🌑 eclipse"}</b></div>
          <div class="stat-row"><span>Footprint</span><b>${d.footprint.toFixed(0)} km</b></div>
          <div class="section-label">Ground Track</div>
          <div id="iss-map" style="position:relative;height:120px;border:1px solid var(--panel-border);border-radius:6px;
               background:linear-gradient(rgba(0,212,255,0.04),rgba(0,212,255,0.02));overflow:hidden">
            <div style="position:absolute;left:${((d.longitude + 180) / 360) * 100}%;top:${((90 - d.latitude) / 180) * 100}%;
                 width:8px;height:8px;margin:-4px;border-radius:50%;background:var(--cyan);
                 box-shadow:0 0 10px var(--cyan)"></div>
            <div style="position:absolute;inset:0;background-image:
                 linear-gradient(rgba(0,212,255,0.08) 1px,transparent 1px),
                 linear-gradient(90deg,rgba(0,212,255,0.08) 1px,transparent 1px);
                 background-size:25% 25%"></div>
          </div>
          <div style="margin-top:10px;font-size:9px;color:var(--text-dim)">SOURCE: WHERETHEISS.AT · REFRESH 5s</div>`;
      } catch (e) {
        body.innerHTML = `<div class="err">ORBITAL LINK LOST: ${e.message}</div>`;
      }
    };
    load();
    this._timer = setInterval(load, 5000);
  },

  onClose() {
    clearInterval(this._timer);
  },
};
