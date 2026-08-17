/* Terminal — command console wired into the OS */
Apps.terminal = {
  title: "Command Console",
  width: 520,
  height: 340,

  mount(body) {
    body.innerHTML = `
      <div class="term">
        <div class="term-out" id="term-out">B.I.L.Q.I.S. command console. Type <span class="t-cmd">help</span> for available commands.\n</div>
        <div class="term-in">
          <span class="prompt">bilqis&gt;</span>
          <input id="term-input" autocomplete="off" spellcheck="false">
        </div>
      </div>`;

    const out = body.querySelector("#term-out");
    const input = body.querySelector("#term-input");
    const history = [];
    let hIdx = -1;

    const print = (text, cls = "") => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text + "\n";
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    };

    const commands = {
      help: () => print(
        "help          this list\n" +
        "open <app>    launch app (assistant, sysmon, weather, news, markets, space, outlook, notes)\n" +
        "close <app>   close app\n" +
        "time          current time\n" +
        "date          current date\n" +
        "status        system status\n" +
        "say <text>    speak text aloud\n" +
        "ip            your public IP (ipify.org)\n" +
        "joke          fetch a joke (official-joke-api)\n" +
        "clear         clear console"
      ),
      clear: () => (out.textContent = ""),
      time: () => print(new Date().toLocaleTimeString(), "t-ok"),
      date: () => print(new Date().toDateString(), "t-ok"),
      status: () => print(
        `online: ${navigator.onLine}\ncores: ${navigator.hardwareConcurrency || "?"}\nlang: ${navigator.language}\nplatform: ${navigator.platform}`,
        "t-ok"
      ),
      open: (arg) => {
        if (Apps[arg]) { launchApp(arg); print(`launching ${arg}...`, "t-ok"); }
        else print(`unknown app: ${arg}`, "t-err");
      },
      close: (arg) => {
        if (Apps[arg]) { WM.close(arg); print(`closed ${arg}`, "t-ok"); }
        else print(`unknown app: ${arg}`, "t-err");
      },
      say: (arg) => {
        if (window.BilqisVoice) BilqisVoice.speak(arg || "Yes, Grand Master Caan?");
        print("(speaking)", "t-ok");
      },
      ip: async () => {
        try {
          const r = await fetch("https://api.ipify.org?format=json");
          print("public ip: " + (await r.json()).ip, "t-ok");
        } catch (e) { print("lookup failed: " + e.message, "t-err"); }
      },
      joke: async () => {
        try {
          const r = await fetch("https://official-joke-api.appspot.com/random_joke");
          const j = await r.json();
          print(j.setup + "\n... " + j.punchline, "t-ok");
        } catch (e) { print("humor module offline: " + e.message, "t-err"); }
      },
    };

    input.addEventListener("keydown", async (e) => {
      if (e.key === "ArrowUp") {
        if (history.length) { hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx]; }
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown") {
        if (history.length) {
          hIdx = Math.min(history.length, hIdx + 1);
          input.value = history[hIdx] || "";
        }
        e.preventDefault();
        return;
      }
      if (e.key !== "Enter") return;

      const line = input.value.trim();
      input.value = "";
      if (!line) return;
      history.push(line);
      hIdx = history.length;
      print("bilqis> " + line, "t-cmd");

      const [cmd, ...rest] = line.split(/\s+/);
      const fn = commands[cmd.toLowerCase()];
      if (fn) await fn(rest.join(" "));
      else print(`command not recognized: ${cmd} (try 'help')`, "t-err");
    });

    setTimeout(() => input.focus(), 100);
  },
};
