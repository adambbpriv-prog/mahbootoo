/* Assistant — the B.I.L.Q.I.S. brain. Rule-based intents + live online lookups.
   Shared by the chat window and the voice interface. */

const BilqisBrain = {
  async respond(raw) {
    const q = raw.trim();
    const low = q.toLowerCase();

    // --- app control ---
    const openMatch = low.match(/\b(?:open|launch|start|show)\s+(?:the\s+)?(\w+)/);
    if (openMatch) {
      const map = { system: "sysmon", monitor: "sysmon", intel: "news", console: "terminal",
                    market: "markets", crypto: "markets", orbit: "space", iss: "space",
                    note: "notes", chat: "assistant" };
      const name = map[openMatch[1]] || openMatch[1];
      if (Apps[name]) { launchApp(name); return `Launching ${Apps[name].title}, sir.`; }
    }
    const closeMatch = low.match(/\bclose\s+(?:the\s+)?(\w+)/);
    if (closeMatch && Apps[closeMatch[1]]) {
      WM.close(closeMatch[1]);
      return `${Apps[closeMatch[1]].title} closed.`;
    }

    // --- time & date ---
    if (/\b(time|clock)\b/.test(low) && /what|current|tell/.test(low) || low === "time")
      return `The time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, sir.`;
    if (/\bdate|today\b/.test(low) && /what|which|tell/.test(low))
      return `Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;

    // --- weather ---
    if (/\bweather|temperature|forecast|rain|cold|hot outside\b/.test(low)) {
      launchApp("weather");
      const w = window.BilqisState && BilqisState.weather;
      if (w) return `Currently ${w.temp}°C with ${w.desc.toLowerCase()} in ${w.city}. Full report on screen.`;
      return "Pulling up the atmospheric report now, sir.";
    }

    // --- markets ---
    if (/\bbitcoin|btc|crypto|market/.test(low)) {
      launchApp("markets");
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        const d = await r.json();
        return `Bitcoin is trading at $${d.bitcoin.usd.toLocaleString()}. Market watch on screen.`;
      } catch (e) { return "Exchange link is down; market panel opened for retry."; }
    }

    // --- news ---
    if (/\bnews|headlines|stories|intel\b/.test(low)) {
      launchApp("news");
      return "Bringing up the global intel feed, sir.";
    }

    // --- ISS / space ---
    if (/\biss|space station|orbit|satellite\b/.test(low)) {
      launchApp("space");
      try {
        const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const d = await r.json();
        return `The ISS is at ${d.latitude.toFixed(1)}°, ${d.longitude.toFixed(1)}°, altitude ${Math.round(d.altitude)} kilometers, moving at ${Math.round(d.velocity).toLocaleString()} km/h.`;
      } catch (e) { return "Orbital tracker opened; live telemetry momentarily."; }
    }

    // --- jokes ---
    if (/\bjoke|funny|humor\b/.test(low)) {
      try {
        const r = await fetch("https://official-joke-api.appspot.com/random_joke");
        const j = await r.json();
        return `${j.setup} ... ${j.punchline}`;
      } catch (e) { return "My humor subroutines appear to be offline, sir."; }
    }

    // --- knowledge: "who is X" / "what is X" via Wikipedia summary API ---
    const wikiMatch = low.match(/^(?:who|what)\s+(?:is|are|was|were)\s+(.+?)\??$/);
    if (wikiMatch) {
      const topic = wikiMatch[1].replace(/\bthe\b/g, "").trim();
      try {
        const r = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
        );
        if (r.ok) {
          const d = await r.json();
          if (d.extract) return d.extract.split(". ").slice(0, 2).join(". ") + ".";
        }
        return `I couldn't find reliable intel on "${topic}", sir.`;
      } catch (e) { return "Knowledge uplink unavailable at the moment."; }
    }

    // --- greetings & smalltalk ---
    if (/\b(hello|hi|hey|good (morning|afternoon|evening))\b/.test(low)) {
      const h = new Date().getHours();
      const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
      return `Good ${part}, sir. All systems are operational. How may I assist?`;
    }
    if (/\bwho are you|your name\b/.test(low))
      return "I am B.I.L.Q.I.S. — Brilliantly Intelligent Lifelike Quantum Integrated System. At your service, sir.";
    if (/\bthank/.test(low)) return "Always a pleasure, sir.";
    if (/\bstatus|report|systems\b/.test(low)) {
      launchApp("sysmon");
      return `All systems nominal. ${navigator.onLine ? "Network uplink active." : "Warning: network offline."} ${navigator.hardwareConcurrency || "several"} processing threads available.`;
    }
    if (/\bhelp|can you do\b/.test(low))
      return "Try: 'open weather', 'what's the news', 'bitcoin price', 'where is the ISS', 'who is Nikola Tesla', 'tell me a joke', 'system status', or 'what time is it'.";

    return "I'm not certain I follow, sir. Say 'help' for a list of things I can do.";
  },
};

/* Chat window UI */
Apps.assistant = {
  title: "Assistant Interface",
  width: 440,
  height: 420,

  mount(body) {
    body.innerHTML = `
      <div class="chat">
        <div class="chat-log" id="chat-log">
          <div class="msg bilqis">Systems online. How may I be of service, sir?</div>
        </div>
        <div class="chat-in">
          <input id="chat-input" placeholder="Ask B.I.L.Q.I.S. anything..." autocomplete="off">
          <button id="chat-send">SEND</button>
        </div>
      </div>`;

    const log = body.querySelector("#chat-log");
    const input = body.querySelector("#chat-input");

    const add = (text, who) => {
      const div = document.createElement("div");
      div.className = "msg " + who;
      div.textContent = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    };

    const send = async () => {
      const q = input.value.trim();
      if (!q) return;
      input.value = "";
      add(q, "user");
      const reply = await BilqisBrain.respond(q);
      add(reply, "bilqis");
      if (window.BilqisVoice) BilqisVoice.speak(reply);
    };

    input.addEventListener("keydown", (e) => e.key === "Enter" && send());
    body.querySelector("#chat-send").addEventListener("click", send);
    setTimeout(() => input.focus(), 100);
  },
};
