// Game 1 - Mole Maker (ABCDE)
// Cute, stylized SVG blob controlled by sliders.
// Educational demo only - not diagnostic.

(() => {
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Elements (prefixed mm-)
  const a = $("#mm-a");
  const b = $("#mm-b");
  const c = $("#mm-c");
  const d = $("#mm-d");
  const e = $("#mm-e");

  const aVal = $("#mm-aVal");
  const bVal = $("#mm-bVal");
  const cVal = $("#mm-cVal");
  const dVal = $("#mm-dVal");
  const eVal = $("#mm-eVal");

  const path = $("#mm-path");
  const stroke = $("#mm-stroke");
  const speckles = $("#mm-speckles");

  const gradA = $("#mm-gradA");
  const gradB = $("#mm-gradB");
  const gradC = $("#mm-gradC");

  const riskFill = $("#mm-riskFill");
  const riskText = $("#mm-riskText");
  const hint = $("#mm-hint");
  const status = $("#mm-status");

  const goal = $("#mm-goal");
  const btnRandom = $("#mm-randomize");
  const btnCheck = $("#mm-check");
  const btnContinue = $("#to-game2");

  let completed = false;

  // Blob path from polar points
  function blobPath({ points = 24, baseR = 58, jagged = 0.2, asym = 0.2, wobble = 0.0, t = 0 }) {
    const pts = [];
    for (let i = 0; i < points; i++) {
      const ang = (Math.PI * 2 * i) / points;

      // small pseudo-noise
      const noise = (Math.sin(ang * 3 + t * 1.2) + Math.sin(ang * 7 - t * 0.9)) * 0.5;
      const evo = wobble * noise;

      const jitter = (Math.sin(ang * 5 + 1.7) + Math.sin(ang * 11 - 0.4)) * 0.5;
      const r = baseR * (1 + jagged * 0.35 * jitter + evo * 0.12);

      // asymmetry: stretch right side slightly
      const xScale = (Math.cos(ang) > 0) ? (1 + asym * 0.25) : (1 - asym * 0.10);

      const x = Math.cos(ang) * r * xScale;
      const y = Math.sin(ang) * r;

      pts.push([x, y]);
    }

    // Quadratic smoothing
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      if (i === 0) d += `M ${cx.toFixed(2)} ${cy.toFixed(2)} `;
      d += `Q ${x1.toFixed(2)} ${y1.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)} `;
    }
    return d + "Z";
  }

  function generateSpeckles(level) {
    speckles.innerHTML = "";
    const n = Math.round(5 + level * 0.35); // 5..40ish
    for (let i = 0; i < n; i++) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      const r = Math.random() ** 0.7 * 45;
      const ang = Math.random() * Math.PI * 2;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;

      const radius = 0.8 + Math.random() * (1.4 + level * 0.012);
      dot.setAttribute("cx", x.toFixed(2));
      dot.setAttribute("cy", y.toFixed(2));
      dot.setAttribute("r", radius.toFixed(2));

      // gentle shade variation
      const shade = 40 + Math.floor(Math.random() * (90 + level));
      dot.setAttribute("fill", `rgba(${shade}, ${Math.floor(shade * 0.6)}, ${Math.floor(shade * 0.45)}, 0.55)`);

      speckles.appendChild(dot);
    }
  }

  // Not medical - simple, explainable mapping
  function riskScore(A, B, C, D, E) {
    const a = A / 100, b = B / 100, c = C / 100, d = D / 100, e = E / 100;
    const score = (a * 0.26 + b * 0.26 + c * 0.22 + d * 0.12 + e * 0.14);
    return clamp(score, 0, 1);
  }

  function riskLabel(r) {
    if (r < 0.33) return "Low";
    if (r < 0.66) return "Medium";
    return "High";
  }

  function hintFromInputs(A, B, C, D, E) {
    const parts = [
      { k: "A (Asymmetry)", v: A, msg: "Asymmetry: one half differs from the other." },
      { k: "B (Border)", v: B, msg: "Border: jagged/uneven edges increase suspicion." },
      { k: "C (Color)", v: C, msg: "Color: multiple tones or speckles can matter." },
      { k: "D (Diameter)", v: D, msg: "Diameter: larger size increases attention." },
      { k: "E (Evolution)", v: E, msg: "Evolution: change over time is a red flag." },
    ];
    parts.sort((p, q) => q.v - p.v);
    return `Focus: ${parts[0].k}. ${parts[0].msg}`;
  }

  // Animation loop for Evolution
  let t = 0;
  function tick() {
    t += 0.016;
    if (+e.value > 3) render(true);
    requestAnimationFrame(tick);
  }

  function setBadge(text, kind = "neutral") {
    status.textContent = text;
    status.classList.remove("badge-ok", "badge-warn");
    if (kind === "ok") status.classList.add("badge-ok");
    if (kind === "warn") status.classList.add("badge-warn");
  }

  function render(fromAnim = false) {
    const A = +a.value;
    const B = +b.value;
    const C = +c.value;
    const D = +d.value;
    const E = +e.value;

    aVal.textContent = `${A}%`;
    bVal.textContent = `${B}%`;
    cVal.textContent = `${C}%`;
    dVal.textContent = `${D}%`;
    eVal.textContent = `${E}%`;

    const baseR = 40 + D * 0.35;     // size
    const jagged = B / 100;          // border
    const asym = A / 100;            // asymmetry
    const wobble = (E / 100) * 1.0;  // evolution

    const dPath = blobPath({
      points: 24,
      baseR,
      jagged,
      asym,
      wobble,
      t: fromAnim ? t : 0
    });

    path.setAttribute("d", dPath);
    stroke.setAttribute("d", dPath);

    // Color gradient shifts with Color Variation
    const cc = C / 100;
    gradA.setAttribute("stop-color", `rgb(${Math.floor(120 - 30 * cc)}, ${Math.floor(70 - 20 * cc)}, ${Math.floor(52 - 18 * cc)})`);
    gradB.setAttribute("stop-color", `rgb(${Math.floor(70 - 25 * cc)}, ${Math.floor(40 - 15 * cc)}, ${Math.floor(32 - 12 * cc)})`);
    gradC.setAttribute("stop-color", `rgb(${Math.floor(35 - 10 * cc)}, ${Math.floor(20 - 8 * cc)}, ${Math.floor(16 - 6 * cc)})`);

    generateSpeckles(C);

    // risk
    const r = riskScore(A, B, C, D, E);
    const pct = Math.round(r * 100);
    riskFill.style.width = `${pct}%`;

    // gentle color shift via CSS variables not required; use simple gradients
    riskFill.style.background =
      pct < 33 ? "linear-gradient(90deg, var(--accent), var(--good))" :
      pct < 66 ? "linear-gradient(90deg, var(--warn), #f97316)" :
                 "linear-gradient(90deg, var(--bad), #b91c1c)";

    riskText.textContent = `${riskLabel(r)} (${pct}%)`;
    hint.textContent = hintFromInputs(A, B, C, D, E);

    if (!completed) setBadge("Live");
  }

  function checkWin() {
    const A = +a.value, B = +b.value, C = +c.value, D = +d.value, E = +e.value;
    const pct = Math.round(riskScore(A, B, C, D, E) * 100);

    const mode = goal.value;
    const win = (mode === "benign") ? (pct <= 30) : (pct >= 70);

    if (win) {
      completed = true;
      btnContinue.disabled = false;
      setBadge("✅ Goal reached!", "ok");
      hint.textContent = "Nice. Now explain which ABCDE sliders pushed the risk up or down - that’s the learning moment.";
    } else {
      setBadge("Try again", "warn");
      hint.textContent = (mode === "benign")
        ? "To make it more benign, lower A/B/C/E first (asymmetry, border, color, evolution)."
        : "To make it more suspicious, increase A/B/C/E first - they have stronger weight than size.";
    }
  }

  function randomize() {
    const rnd = () => Math.floor(Math.random() * 101);
    a.value = rnd();
    b.value = rnd();
    c.value = rnd();
    d.value = rnd();
    e.value = rnd();
    completed = false;
    btnContinue.disabled = true;
    setBadge("Randomized");
    render();
  }

  // Wire up
  [a, b, c, d, e, goal].forEach(el => {
    el.addEventListener("input", () => { if (!completed) setBadge("Live"); render(false); });
    el.addEventListener("change", () => { if (!completed) setBadge("Live"); render(false); });
  });

  btnRandom.addEventListener("click", randomize);
  btnCheck.addEventListener("click", checkWin);

  // If user navigates away and comes back, keep state (no reset).
  // But if they change goal after completion, require re-check.
  goal.addEventListener("change", () => {
    if (completed) {
      completed = false;
      btnContinue.disabled = true;
      setBadge("Goal changed");
    }
    render(false);
  });

  // Init
  render(false);
  requestAnimationFrame(tick);

  // Optional: react to section changes (keeps UX tidy)
  document.addEventListener("mm:sectionchange", (ev) => {
    if (ev?.detail?.id === "game1") {
      // Re-render once on entry for crispness
      render(false);
    }
  });
})();
