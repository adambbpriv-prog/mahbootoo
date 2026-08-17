/* Markets — live crypto prices from the CoinGecko public API (no key) */
Apps.markets = {
  title: "Market Watch",
  width: 380,
  height: 360,
  _timer: null,

  COINS: [
    ["bitcoin", "BTC"],
    ["ethereum", "ETH"],
    ["solana", "SOL"],
    ["dogecoin", "DOGE"],
    ["cardano", "ADA"],
  ],

  mount(body) {
    body.innerHTML = `<div class="loading">CONNECTING TO EXCHANGE GRID...</div>`;
    const load = async () => {
      try {
        const ids = this.COINS.map((c) => c[0]).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        if (!res.ok) throw new Error("exchange " + res.status);
        const d = await res.json();
        body.innerHTML =
          `<div class="section-label">Crypto · USD · 24h</div>` +
          this.COINS.map(([id, sym]) => {
            const p = d[id];
            if (!p) return "";
            const chg = p.usd_24h_change || 0;
            const cls = chg >= 0 ? "up" : "down";
            const arrow = chg >= 0 ? "▲" : "▼";
            return `<div class="ticker-row">
              <span class="ticker-sym">${sym}</span>
              <span class="ticker-price">$${p.usd.toLocaleString(undefined, { maximumFractionDigits: p.usd < 1 ? 4 : 2 })}</span>
              <span class="ticker-chg ${cls}">${arrow} ${Math.abs(chg).toFixed(2)}%</span>
            </div>`;
          }).join("") +
          `<div style="margin-top:10px;font-size:9px;color:var(--text-dim)">SOURCE: COINGECKO API · REFRESH 60s</div>`;

        window.BilqisState = window.BilqisState || {};
        BilqisState.btc = d.bitcoin && d.bitcoin.usd;
      } catch (e) {
        body.innerHTML = `<div class="err">EXCHANGE LINK DOWN: ${e.message}</div>`;
      }
    };
    load();
    this._timer = setInterval(load, 60000);
  },

  onClose() {
    clearInterval(this._timer);
  },
};
