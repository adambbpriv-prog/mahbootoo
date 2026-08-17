/* Animated HUD background: radar sweep, rotating rings, particles */
(function () {
  const canvas = document.getElementById("hud-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, cx, cy;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }
  window.addEventListener("resize", resize);
  resize();

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.4,
    s: Math.random() * 0.0005 + 0.0001,
  }));

  let t = 0;
  function frame() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    const CY = "0,212,255";

    // rotating dashed rings around center
    const rings = [
      { r: Math.min(W, H) * 0.30, seg: 40, speed: 0.35, alpha: 0.10 },
      { r: Math.min(W, H) * 0.38, seg: 60, speed: -0.22, alpha: 0.08 },
      { r: Math.min(W, H) * 0.46, seg: 90, speed: 0.12, alpha: 0.06 },
    ];
    rings.forEach((ring) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * ring.speed);
      ctx.strokeStyle = `rgba(${CY},${ring.alpha})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < ring.seg; i++) {
        if (i % 3 === 0) continue; // gaps
        const a0 = (i / ring.seg) * Math.PI * 2;
        const a1 = ((i + 0.7) / ring.seg) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    });

    // tick marks ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-t * 0.05);
    const rt = Math.min(W, H) * 0.34;
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const len = i % 10 === 0 ? 10 : 4;
      ctx.strokeStyle = `rgba(${CY},${i % 10 === 0 ? 0.22 : 0.10})`;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rt, Math.sin(a) * rt);
      ctx.lineTo(Math.cos(a) * (rt + len), Math.sin(a) * (rt + len));
      ctx.stroke();
    }
    ctx.restore();

    // radar sweep
    const sweepA = t * 0.7;
    const sweepR = Math.min(W, H) * 0.30;
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(sweepA, cx, cy)
      : null;
    if (grad) {
      grad.addColorStop(0, `rgba(${CY},0.14)`);
      grad.addColorStop(0.08, `rgba(${CY},0)`);
      grad.addColorStop(1, `rgba(${CY},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sweepR, 0, Math.PI * 2);
      ctx.fill();
    }

    // drifting particles
    ctx.fillStyle = `rgba(${CY},0.35)`;
    particles.forEach((p) => {
      p.y -= p.s;
      if (p.y < 0) { p.y = 1; p.x = Math.random(); }
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }
  frame();
})();
