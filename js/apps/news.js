/* News Feed — live top stories from the Hacker News public API */
Apps.news = {
  title: "Global Intel Feed",
  width: 460,
  height: 460,

  async mount(body) {
    body.innerHTML = `<div class="loading">SCANNING GLOBAL CHANNELS...</div>`;
    try {
      const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
      if (!idsRes.ok) throw new Error("feed " + idsRes.status);
      const ids = (await idsRes.json()).slice(0, 15);
      const items = await Promise.all(
        ids.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
        )
      );

      body.innerHTML = items
        .filter(Boolean)
        .map((it) => {
          const url = it.url || `https://news.ycombinator.com/item?id=${it.id}`;
          const host = it.url ? new URL(it.url).hostname.replace("www.", "") : "news.ycombinator.com";
          const age = Math.round((Date.now() / 1000 - it.time) / 3600);
          return `<div class="news-item">
            <a href="${url}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>
            <div class="news-meta">▲ ${it.score} · ${host} · ${age}h ago</div>
          </div>`;
        })
        .join("") +
        `<div style="margin-top:10px;font-size:9px;color:var(--text-dim)">SOURCE: HACKER NEWS API · LIVE</div>`;

      window.BilqisState = window.BilqisState || {};
      BilqisState.topStory = items[0] && items[0].title;
    } catch (e) {
      body.innerHTML = `<div class="err">INTEL FEED OFFLINE: ${e.message}</div>`;
    }
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
