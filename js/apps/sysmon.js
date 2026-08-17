/* System Monitor — real browser telemetry where available, simulated cores */
Apps.sysmon = {
  title: "System Monitor",
  width: 380,
  height: 430,
  _timer: null,

  mount(body) {
    body.innerHTML = `
      <div class="section-label">Power Core</div>
      <div class="stat-row"><span>Arc Reactor Output</span><b id="sm-reactor">--</b></div>
      <div class="meter"><i id="sm-reactor-bar" style="width:0%"></i></div>

      <div class="section-label">Processing</div>
      <div class="stat-row"><span>CPU Threads</span><b id="sm-cores">--</b></div>
      <div class="stat-row"><span>Compute Load</span><b id="sm-cpu">--</b></div>
      <div class="meter"><i id="sm-cpu-bar" style="width:0%"></i></div>

      <div class="section-label">Memory</div>
      <div class="stat-row"><span>JS Heap</span><b id="sm-mem">--</b></div>
      <div class="meter"><i id="sm-mem-bar" style="width:0%"></i></div>

      <div class="section-label">Power Cell</div>
      <div class="stat-row"><span>Battery</span><b id="sm-batt">--</b></div>
      <div class="meter"><i id="sm-batt-bar" style="width:0%"></i></div>

      <div class="section-label">Link</div>
      <div class="stat-row"><span>Connection</span><b id="sm-net">--</b></div>
      <div class="stat-row"><span>Uptime</span><b id="sm-up">--</b></div>`;

    const t0 = Date.now();
    let load = 30;

    const update = async () => {
      // simulated smooth CPU load
      load = Math.max(4, Math.min(97, load + (Math.random() - 0.5) * 14));
      setVal("sm-cpu", load.toFixed(1) + " %");
      setBar("sm-cpu-bar", load);

      const reactor = 88 + Math.sin(Date.now() / 3000) * 6 + Math.random() * 2;
      setVal("sm-reactor", reactor.toFixed(1) + " %");
      setBar("sm-reactor-bar", reactor);

      setVal("sm-cores", (navigator.hardwareConcurrency || "?") + " logical");

      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize / 1048576;
        const total = performance.memory.jsHeapSizeLimit / 1048576;
        setVal("sm-mem", used.toFixed(0) + " / " + total.toFixed(0) + " MB");
        setBar("sm-mem-bar", (used / total) * 100);
      } else {
        setVal("sm-mem", "n/a (browser)");
        setBar("sm-mem-bar", 0);
      }

      if (navigator.getBattery) {
        try {
          const b = await navigator.getBattery();
          setVal("sm-batt", Math.round(b.level * 100) + " %" + (b.charging ? " ⚡" : ""));
          setBar("sm-batt-bar", b.level * 100);
        } catch (e) { setVal("sm-batt", "n/a"); }
      } else {
        setVal("sm-batt", "n/a");
      }

      const conn = navigator.connection;
      setVal("sm-net", navigator.onLine
        ? (conn ? `${conn.effectiveType || "online"} · ${conn.downlink || "?"} Mbps` : "online")
        : "OFFLINE");

      const up = Math.floor((Date.now() - t0) / 1000);
      setVal("sm-up", `${Math.floor(up / 60)}m ${up % 60}s`);
    };

    function setVal(id, v) {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    }
    function setBar(id, pct) {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.width = Math.min(100, pct) + "%";
      el.className = pct > 85 ? "crit" : pct > 65 ? "warn" : "";
    }

    update();
    this._timer = setInterval(update, 1500);
  },

  onClose() {
    clearInterval(this._timer);
  },
};
