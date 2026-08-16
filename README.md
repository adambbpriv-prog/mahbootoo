# B.I.L.Q.I.S. OS

*Brilliantly Intelligent Lifelike Quantum Integrated System* — a Jarvis-style sci-fi HUD "operating system" that runs entirely in your browser. Bilqis (named after the legendary Queen of Sheba) speaks with a female voice and answers by voice or text.

![status](https://img.shields.io/badge/systems-nominal-00d4ff) ![deps](https://img.shields.io/badge/dependencies-zero-3dffa0)

## Features

- **Cinematic boot sequence** — arc-reactor animation, scrolling diagnostics, progress bar
- **Animated HUD desktop** — canvas radar sweep, rotating rings, particle field, grid overlay
- **Window manager** — draggable, resizable, focusable app windows with a launcher dock
- **Voice control** — click the orb (or `Ctrl+Space`) and speak; B.I.L.Q.I.S. answers out loud with a female voice via the Web Speech API
- **Assistant** — chat window with a rule-based brain that controls the OS and pulls live answers from the web

### Apps (live online data, no API keys required)

| App | Data source |
|---|---|
| 🌦 Weather | [Open-Meteo](https://open-meteo.com) forecast + IP geolocation ([ipapi.co](https://ipapi.co)) |
| 📰 News | [Hacker News API](https://github.com/HackerNews/API) top stories |
| 📈 Markets | [CoinGecko](https://www.coingecko.com/en/api) live crypto prices |
| 🛰 Space | [Where The ISS At](https://wheretheiss.at/w/developer) real-time ISS telemetry |
| 📊 System | Real browser telemetry: battery, JS heap, connection, cores |
| ⌨ Terminal | Command console (`help`, `open <app>`, `ip`, `joke`, `say <text>`, …) |
| 📝 Notes | Persistent scratchpad (localStorage) |
| 🧠 Assistant | Wikipedia summaries, jokes, weather, markets, ISS — by voice or text |

## Run it

No build step, no dependencies. Either:

```bash
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

…or just open `index.html` in a modern browser (Chrome/Edge recommended — voice recognition needs the Web Speech API; live data needs the page served over HTTP/HTTPS for some APIs).

## Try saying

- "What's the weather?"
- "Where is the ISS?"
- "What's the bitcoin price?"
- "Who is Nikola Tesla?"
- "Tell me a joke"
- "Open terminal" / "System status"

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `Ctrl+Space` | Toggle voice listening |
| `` Ctrl+` `` | Open terminal |

## Architecture

```
index.html          shell: boot screen, desktop, dock, orb
css/bilqis.css      full HUD theme
js/hud.js           canvas background animation
js/windows.js       window manager + app registry
js/voice.js         speech synthesis & recognition
js/core.js          boot, clock, dock, shortcuts
js/apps/*.js        one file per app (self-registering into Apps{})
```

All data comes from free, keyless, CORS-enabled public APIs fetched client-side. If an API is unreachable, each app degrades gracefully with an on-screen error.
