/* Weather — live data from Open-Meteo (no API key), location via IP geolocation */
Apps.weather = {
  title: "Atmospheric Conditions",
  width: 400,
  height: 420,

  WMO: {
    0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤"], 2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"], 45: ["Fog", "🌫"], 48: ["Rime fog", "🌫"],
    51: ["Light drizzle", "🌦"], 53: ["Drizzle", "🌦"], 55: ["Heavy drizzle", "🌧"],
    61: ["Light rain", "🌧"], 63: ["Rain", "🌧"], 65: ["Heavy rain", "🌧"],
    71: ["Light snow", "🌨"], 73: ["Snow", "🌨"], 75: ["Heavy snow", "❄️"],
    80: ["Showers", "🌦"], 81: ["Showers", "🌧"], 82: ["Violent showers", "⛈"],
    95: ["Thunderstorm", "⛈"], 96: ["Storm + hail", "⛈"], 99: ["Storm + hail", "⛈"],
  },

  async mount(body) {
    body.innerHTML = `<div class="loading">ACQUIRING SATELLITE UPLINK...</div>`;
    try {
      const loc = await this.locate();
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("open-meteo " + res.status);
      const d = await res.json();
      const c = d.current;
      const [desc, icon] = this.WMO[c.weather_code] || ["Unknown", "❔"];

      const days = d.daily.time.map((t, i) => {
        const [dDesc, dIcon] = this.WMO[d.daily.weather_code[i]] || ["", "❔"];
        const day = new Date(t + "T00:00").toLocaleDateString(undefined, { weekday: "short" });
        return `<div class="stat-row" title="${dDesc}">
          <span>${day} ${dIcon}</span>
          <b>${Math.round(d.daily.temperature_2m_min[i])}° / ${Math.round(d.daily.temperature_2m_max[i])}°</b>
        </div>`;
      }).join("");

      body.innerHTML = `
        <div class="section-label">${loc.name}</div>
        <div style="display:flex;align-items:center;gap:16px;margin:6px 0 4px">
          <span style="font-size:44px">${icon}</span>
          <div>
            <div class="big-num">${Math.round(c.temperature_2m)}°C</div>
            <div style="color:var(--text-dim);font-size:12px">${desc} · feels like ${Math.round(c.apparent_temperature)}°C</div>
          </div>
        </div>
        <div class="stat-row"><span>Humidity</span><b>${c.relative_humidity_2m} %</b></div>
        <div class="stat-row"><span>Wind</span><b>${c.wind_speed_10m} km/h @ ${c.wind_direction_10m}°</b></div>
        <div class="stat-row"><span>Pressure</span><b>${Math.round(c.surface_pressure)} hPa</b></div>
        <div class="section-label">5-Day Forecast</div>
        ${days}
        <div style="margin-top:10px;font-size:9px;color:var(--text-dim)">DATA: OPEN-METEO.COM · LIVE</div>`;

      window.BilqisState = window.BilqisState || {};
      BilqisState.weather = { temp: Math.round(c.temperature_2m), desc, city: loc.name };
    } catch (e) {
      body.innerHTML = `<div class="err">UPLINK FAILED: ${e.message}</div>
        <div style="margin-top:8px;font-size:12px;color:var(--text-dim)">Check network access and retry.</div>`;
    }
  },

  async locate() {
    // 1) try IP-based geolocation (no permission prompt)
    try {
      const r = await fetch("https://ipapi.co/json/");
      if (r.ok) {
        const j = await r.json();
        if (j.latitude) return { lat: j.latitude, lon: j.longitude, name: `${j.city}, ${j.country_name}` };
      }
    } catch (e) { /* fall through */ }
    // 2) try browser geolocation
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      return { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Current Position" };
    } catch (e) { /* fall through */ }
    // 3) fallback: London
    return { lat: 51.5074, lon: -0.1278, name: "London, UK (fallback)" };
  },
};
