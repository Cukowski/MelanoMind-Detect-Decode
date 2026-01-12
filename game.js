// MelanoMind - intro carousel + DNA game.
// Educational demo only - not diagnostic.
//
// Game 1 (Mole Maker) lives in mole-maker.js to keep this file clean.

(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // Sections
  const intro = $("#intro");
  const game1 = $("#game1");
  const game2 = $("#game2");
  const sections = [intro, game1, game2];

  // Nav
  $("#nav-intro").onclick = () => showSection(intro);
  $("#nav-game1").onclick = () => showSection(game1);
  $("#nav-game2").onclick = () => showSection(game2);
  $("#to-game1").onclick = () => showSection(game1);

  function showSection(s) {
    sections.forEach(x => x.classList.remove("active"));
    s.classList.add("active");

    // Lazy init DNA game when user reaches it
    if (s === game2 && !g2.inited) initGame2();

    // Optional: announce section change for other scripts
    document.dispatchEvent(new CustomEvent("mm:sectionchange", { detail: { id: s.id } }));
  }

  /* ===========================
     INTRO: Sliding carousel
  ============================ */
  const INTRO_SLIDES = [
    {
      img: "images/intro_skin_cancer.jpg",
      title: "Skin Cancer: A Broad Family",
      text: "Skin cancer includes basal cell carcinoma, squamous cell carcinoma, and melanoma. Most are treatable when found early."
    },
    {
      img: "images/intro_melanoma.jpg",
      title: "What Is Melanoma?",
      text: "Melanoma begins in pigment cells called melanocytes. Early detection is crucial."
    },
    {
      img: "images/intro_ABCD.jpg",
      title: "ABCDE Recognition",
      text: "Asymmetry, Border irregularity, Color variation, Diameter, and Evolution help identify suspicious moles."
    },
    {
      img: "images/young-vs-old-skin.jpg",
      title: "Different Skin, Different Look",
      text: "Skin changes with age. In MelanoMind we keep it simple and focus on ABCDE + mutation basics."
    },
    {
      img: "images/dna_explainer.png",
      title: "DNA and Mutation",
      text: "DNA pairs A-T (two bonds) and G-C (three bonds). Small pairing errors are one simple way to visualize mutation."
    }
  ];

  function buildIntroCarousel() {
    const track = $("#intro-track");
    const dots = $("#intro-dots");
    track.innerHTML = "";
    dots.innerHTML = "";
    INTRO_SLIDES.forEach((s, i) => {
      const slide = document.createElement("article");
      slide.className = "slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${i + 1} of ${INTRO_SLIDES.length}`);
      slide.innerHTML = `
        <div class="imgwrap">
          <img src="${s.img}" alt="${s.title}">
        </div>
        <div class="caption">
          <h3>${s.title}</h3>
          <p class="muted">${s.text}</p>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement("span");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.dataset.index = i;
      dot.onclick = () => goTo(i, true);
      dots.appendChild(dot);
    });
  }

  let idx = 0;
  let timer = null;
  const intervalMs = 6000;

  function goTo(n, user = false) {
    const track = $("#intro-track");
    const total = INTRO_SLIDES.length;
    idx = (n + total) % total;
    track.style.transform = `translateX(${idx * -100}%)`;
    $$(".dot").forEach((d, i) => d.classList.toggle("active", i === idx));
    if (user) restartAuto();
  }
  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1, true); }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, intervalMs);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restartAuto() {
    stopAuto(); startAuto();
  }

  $("#intro-next").onclick = () => { next(); restartAuto(); };
  $("#intro-prev").onclick = () => { prev(); };

  buildIntroCarousel();
  startAuto();

  /* ===========================
     GAME 2 - DNA mismatch
  ============================ */
  const g2 = { inited: false, score: 0, pairs: [], selections: new Set() };

  function initGame2() {
    g2.inited = true;
    $("#g2-hint").onclick = hintG2;
    $("#g2-submit").onclick = submitG2;
    buildDNA();
  }

  const comp = { A: "T", T: "A", G: "C", C: "G" };
  function bonds(a, b) {
    const p = a + b;
    if (p === "AT" || p === "TA") return 2;
    if (p === "GC" || p === "CG") return 3;
    return 0;
  }

  function randDNA(n = 14) {
    const A = ["A", "T", "G", "C"];
    let s = "";
    for (let i = 0; i < n; i++) s += A[(Math.random() * 4) | 0];
    return s;
  }

  function buildDNA() {
    const board = $("#dna-board");
    board.innerHTML = "";
    g2.selections.clear();
    g2.pairs = [];

    const left = randDNA(14);
    const right = [...left].map(b => comp[b]).join("");

    const base = [...left].map((L, i) => {
      const R = right[i];
      return { idx: i, left: L, right: R, bondsShown: bonds(L, R), isAnomaly: false };
    });

    // Inject 2–4 anomalies (wrong partner or wrong bond count shown)
    const anomalies = 2 + ((Math.random() * 3) | 0);
    const pool = base.map(p => p.idx);
    for (let k = 0; k < anomalies; k++) {
      if (!pool.length) break;
      const at = (Math.random() * pool.length) | 0;
      const i = pool.splice(at, 1)[0];
      const p = base[i];

      if (Math.random() < 0.6) {
        // wrong partner
        const options = ["A", "T", "G", "C"].filter(x => x !== p.right && comp[p.left] !== x);
        p.right = options[(Math.random() * options.length) | 0];
        p.bondsShown = Math.random() < 0.5 ? 2 : 3;
      } else {
        // right partner, wrong bond count shown
        p.right = comp[p.left];
        p.bondsShown = (bonds(p.left, p.right) === 2) ? 3 : 2;
      }
      p.isAnomaly = (bonds(p.left, p.right) === 0) || (p.bondsShown !== bonds(p.left, p.right));
    }

    g2.pairs = base;

    base.forEach(p => {
      const tile = document.createElement("div");
      tile.className = "pair";
      tile.dataset.idx = p.idx;
      tile.innerHTML = `
        <div class="bases"><span>${p.left}</span><span>${p.right}</span></div>
        <div class="bonds">${"."
          .repeat(p.bondsShown)
          .split("")
          .map(() => `<div class="dot"></div>`)
          .join("")}</div>
      `;
      tile.onclick = () => toggleG2(tile);
      board.appendChild(tile);
    });

    $("#g2-summary").innerHTML = "";
    $("#g2-score").textContent = g2.score;
  }

  function toggleG2(tile) {
    const idx = +tile.dataset.idx;
    if (g2.selections.has(idx)) { g2.selections.delete(idx); tile.classList.remove("mark"); }
    else { g2.selections.add(idx); tile.classList.add("mark"); }
  }

  function hintG2() {
    g2.score = Math.max(0, g2.score - 3);
    $("#g2-score").textContent = g2.score;
    const remain = g2.pairs.filter(p => p.isAnomaly && !g2.selections.has(p.idx));
    if (!remain.length) return;
    const pick = remain[(Math.random() * remain.length) | 0];
    g2.selections.add(pick.idx);
    const tile = document.querySelector(`.pair[data-idx="${pick.idx}"]`);
    if (tile) tile.classList.add("mark");
  }

  function submitG2() {
    const truth = new Set(g2.pairs.filter(p => p.isAnomaly).map(p => p.idx));
    const guess = g2.selections;

    let TP = 0, FP = 0, FN = 0;
    truth.forEach(i => { if (guess.has(i)) TP++; else FN++; });
    guess.forEach(i => { if (!truth.has(i)) FP++; });

    g2.score = Math.max(0, g2.score + TP * 10 - FP * 5 - FN * 7);
    $("#g2-score").textContent = g2.score;

    // Colorize tiles
    g2.pairs.forEach(p => {
      const tile = document.querySelector(`.pair[data-idx="${p.idx}"]`);
      if (!tile) return;
      tile.classList.remove("ok", "bad");
      tile.classList.add(p.isAnomaly ? "bad" : "ok");
    });

    // Summary
    const lines = [];
    lines.push(`<p><b>Correct anomalies:</b> ${TP}</p>`);
    if (FP) lines.push(`<p>False positives: ${FP}</p>`);
    if (FN) lines.push(`<p>Missed anomalies: ${FN}</p>`);
    lines.push("<hr>");
    lines.push("<p><b>Pairs overview</b></p><ul>");
    g2.pairs.forEach(p => {
      const exp = bonds(p.left, p.right);
      const why = exp === 0
        ? "wrong partner"
        : (exp !== p.bondsShown ? `wrong bond count (shown ${p.bondsShown}, expected ${exp})` : "OK");
      lines.push(`<li>${p.left}–${p.right}: ${why}${p.isAnomaly ? " (anomaly)" : ""}</li>`);
    });
    lines.push("</ul>");
    $("#g2-summary").innerHTML = lines.join("");
  }

  // "Continue to DNA Game" button exists in Game 1 section
  $("#to-game2").onclick = () => showSection(game2);

  // Start on Intro
  showSection(intro);
})();
