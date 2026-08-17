/* Outlook — mail & calendar quick access via Outlook web deep links.
   No credentials are stored; actions open Outlook on the web in a new tab. */
Apps.outlook = {
  title: "Outlook Comms",
  width: 400,
  height: 430,

  base() {
    // "work" = Microsoft 365 / custom-domain accounts, "personal" = outlook.com
    const kind = localStorage.getItem("bilqis-outlook-kind") || "work";
    return kind === "work"
      ? "https://outlook.office.com"
      : "https://outlook.live.com";
  },

  mount(body) {
    const kind = localStorage.getItem("bilqis-outlook-kind") || "work";
    body.innerHTML = `
      <div class="section-label">Account</div>
      <div class="outlook-kind">
        <label><input type="radio" name="ol-kind" value="work" ${kind === "work" ? "checked" : ""}> Work / School (Microsoft 365)</label>
        <label><input type="radio" name="ol-kind" value="personal" ${kind === "personal" ? "checked" : ""}> Personal (outlook.com)</label>
      </div>

      <div class="section-label">Quick Access</div>
      <div class="outlook-links">
        <button data-path="/mail/">📥 Inbox</button>
        <button data-path="/calendar/">📅 Calendar</button>
        <button data-path="/people/">👥 People</button>
      </div>

      <div class="section-label">Compose Message</div>
      <input class="ol-in" id="ol-to" placeholder="To (email address)">
      <input class="ol-in" id="ol-subject" placeholder="Subject">
      <textarea class="ol-in" id="ol-body" rows="4" placeholder="Message..."></textarea>
      <button id="ol-send" class="ol-send">✉ COMPOSE IN OUTLOOK</button>
      <div style="margin-top:10px;font-size:9px;color:var(--text-dim)">OPENS OUTLOOK WEB · NO CREDENTIALS STORED</div>`;

    body.querySelectorAll('input[name="ol-kind"]').forEach((r) =>
      r.addEventListener("change", () => localStorage.setItem("bilqis-outlook-kind", r.value))
    );

    body.querySelectorAll(".outlook-links button").forEach((btn) =>
      btn.addEventListener("click", () => window.open(this.base() + btn.dataset.path, "_blank"))
    );

    body.querySelector("#ol-send").addEventListener("click", () => {
      const to = body.querySelector("#ol-to").value.trim();
      const subject = body.querySelector("#ol-subject").value.trim();
      const msg = body.querySelector("#ol-body").value.trim();
      const url =
        `${this.base()}/mail/deeplink/compose?to=${encodeURIComponent(to)}` +
        `&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    });
  },
};
