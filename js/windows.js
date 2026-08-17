/* Minimal window manager: draggable, resizable, focusable windows */
const WM = (function () {
  const layer = () => document.getElementById("window-layer");
  const open = {}; // appId -> element
  let zTop = 100;
  let cascade = 0;

  function createWindow(appId, title, opts = {}) {
    if (open[appId]) {
      focus(open[appId]);
      return null; // already open
    }
    const win = document.createElement("div");
    win.className = "jwindow";
    win.dataset.app = appId;
    const w = opts.width || 420;
    const h = opts.height || 320;
    const x = opts.x != null ? opts.x : 120 + (cascade % 6) * 36;
    const y = opts.y != null ? opts.y : 80 + (cascade % 6) * 30;
    cascade++;
    win.style.width = w + "px";
    win.style.height = h + "px";
    win.style.left = Math.min(x, window.innerWidth - w - 20) + "px";
    win.style.top = Math.min(y, window.innerHeight - h - 20) + "px";
    win.style.zIndex = ++zTop;

    win.innerHTML = `
      <div class="jwindow-title">
        <span>${title}</span>
        <div class="jwindow-controls">
          <button class="win-close" title="Close">✕</button>
        </div>
      </div>
      <div class="jwindow-body"></div>
      <div class="resize-handle"></div>`;

    layer().appendChild(win);
    open[appId] = win;
    markDock(appId, true);

    // focus on click
    win.addEventListener("mousedown", () => focus(win));

    // close
    win.querySelector(".win-close").addEventListener("click", () => close(appId));

    // drag
    const titleBar = win.querySelector(".jwindow-title");
    titleBar.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      const sx = e.clientX - win.offsetLeft;
      const sy = e.clientY - win.offsetTop;
      function move(ev) {
        win.style.left = Math.max(0, Math.min(ev.clientX - sx, window.innerWidth - 60)) + "px";
        win.style.top = Math.max(44, Math.min(ev.clientY - sy, window.innerHeight - 40)) + "px";
      }
      function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    // resize
    win.querySelector(".resize-handle").addEventListener("mousedown", (e) => {
      e.preventDefault();
      const sw = win.offsetWidth - e.clientX;
      const sh = win.offsetHeight - e.clientY;
      function move(ev) {
        win.style.width = Math.max(300, sw + ev.clientX) + "px";
        win.style.height = Math.max(180, sh + ev.clientY) + "px";
      }
      function up() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    return win.querySelector(".jwindow-body");
  }

  function focus(win) {
    win.style.zIndex = ++zTop;
  }

  function close(appId) {
    const win = open[appId];
    if (!win) return;
    win.classList.add("closing");
    setTimeout(() => win.remove(), 180);
    delete open[appId];
    markDock(appId, false);
    if (window.Apps && Apps[appId] && Apps[appId].onClose) Apps[appId].onClose();
  }

  function isOpen(appId) {
    return !!open[appId];
  }

  function markDock(appId, active) {
    const btn = document.querySelector(`.dock-btn[data-app="${appId}"]`);
    if (btn) btn.classList.toggle("active", active);
  }

  return { createWindow, close, isOpen };
})();

/* App registry — each app: { title, width, height, mount(bodyEl), onClose? } */
window.Apps = {};

function launchApp(appId) {
  const app = Apps[appId];
  if (!app) return;
  const body = WM.createWindow(appId, app.title, app);
  if (body) app.mount(body);
}
