/* Core — boot sequence, clock, dock wiring, global state */
(function () {
  const BOOT_LINES = [
    ["Initializing arc reactor interface", 120],
    ["Loading kernel modules: hud.sys, wm.sys, voice.sys", 200],
    ["Mounting holographic display drivers", 160],
    ["Establishing secure network uplink", 260],
    ["Calibrating voice recognition matrix", 180],
    ["Syncing satellite telemetry channels", 220],
    ["Loading personality core: WIT.dll, SARCASM.dll", 150],
    ["Running system diagnostics", 240],
    ["All checks passed", 100],
  ];

  const log = document.getElementById("boot-log");
  const bar = document.getElementById("boot-progress");
  const bootScreen = document.getElementById("boot-screen");
  const desktop = document.getElementById("desktop");

  async function boot() {
    for (let i = 0; i < BOOT_LINES.length; i++) {
      const [line, delay] = BOOT_LINES[i];
      const div = document.createElement("div");
      div.innerHTML = `[<span class="ok">OK</span>] ${line}`;
      log.appendChild(div);
      bar.style.width = ((i + 1) / BOOT_LINES.length) * 100 + "%";
      await new Promise((r) => setTimeout(r, delay));
    }
    await new Promise((r) => setTimeout(r, 400));
    bootScreen.classList.add("fade");
    desktop.classList.remove("hidden");
    setTimeout(() => bootScreen.remove(), 900);

    // greet
    const h = new Date().getHours();
    const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    const greeting = `Good ${part}, Grand Master Caan. B.I.L.Q.I.S. is online and at your service.`;
    setTimeout(() => {
      if (window.BilqisVoice) BilqisVoice.speak(greeting);
      const toast = document.getElementById("bilqis-toast");
      toast.textContent = greeting;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 6000);
    }, 600);

    // default workspace
    setTimeout(() => launchApp("sysmon"), 300);
    setTimeout(() => launchApp("weather"), 600);
    setTimeout(() => launchApp("news"), 900);
  }

  /* clock */
  function tick() {
    const now = new Date();
    document.getElementById("clock-time").textContent = now.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    document.getElementById("clock-date").textContent = now.toLocaleDateString(undefined, {
      weekday: "short", day: "numeric", month: "short",
    });
  }
  setInterval(tick, 1000);
  tick();

  /* network status */
  function net() {
    const el = document.getElementById("net-status");
    const on = navigator.onLine;
    el.textContent = on ? "◉ ONLINE" : "◌ OFFLINE";
    el.classList.toggle("off", !on);
    const status = document.getElementById("status-line");
    status.textContent = on ? "ALL SYSTEMS NOMINAL" : "NETWORK UPLINK LOST";
    status.classList.toggle("alert", !on);
  }
  window.addEventListener("online", net);
  window.addEventListener("offline", net);
  net();

  /* dock */
  document.querySelectorAll(".dock-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const app = btn.dataset.app;
      if (WM.isOpen(app)) WM.close(app);
      else launchApp(app);
    });
  });

  /* orb */
  document.getElementById("orb").addEventListener("click", () => BilqisVoice.listen());

  /* keyboard: Ctrl+Space toggles voice, Ctrl+` opens terminal */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "Space") { e.preventDefault(); BilqisVoice.listen(); }
    if (e.ctrlKey && e.key === "`") { e.preventDefault(); launchApp("terminal"); }
  });

  boot();
})();
