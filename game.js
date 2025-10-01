// MelanoMind — educational mini-game (no libraries).
// Not for diagnosis. Built for GitHub Pages.

(() => {
  const $ = (s, r = document) => r.querySelector(s);

  // Scenes
  const scenes = {
    start: $("#scene-start"),
    derma: $("#scene-derma"),
    dna: $("#scene-dna"),
    result: $("#scene-result"),
  };

  const scoreEl = $("#score");
  const dermaField = $("#derma-playfield");
  const dermaStatus = $("#derma-status");
  const dnaBoard = $("#dna-board");
  const dnaStatus = $("#dna-status");
  const resultSummary = $("#result-summary");

  // Buttons
  $("#btn-start").addEventListener("click", startGame);
  $("#btn-restart").addEventListener("click", restart);
  $("#btn-derma-skip").addEventListener("click", () => { addScore(-5); goDNA(); });
  $("#btn-dna-submit").addEventListener("click", submitDNA);
  $("#btn-dna-hint").addEventListener("click", hintDNA);
  $("#btn-play-again").addEventListener("click", restart);

  // Game State
  const state = {
    score: 0,
    derma: { malignantId: null, clicked: false },
    dna: { pairs: [], selections: new Set() }
  };

  /* ---------- Utilities ---------- */
  function setScene(name) {
    Object.values(scenes).forEach(s => s.classList.remove("active"));
    scenes[name].classList.add("active");
  }
  function setStatus(el, msg) { el.textContent = msg; }
  function setScore(v) { state.score = v; scoreEl.textContent = `Score: 0`.replace("0", v); }
  function addScore(dv) { setScore(Math.max(0, state.score + dv)); }

  /* ---------- Lifecycle ---------- */
  function startGame() {
    setScore(0);
    setScene("derma");
    requestAnimationFrame(buildDerma);
    }
  function restart() {
    setScore(0);
    dermaField.innerHTML = "";
    dnaBoard.innerHTML = "";
    state.derma = { malignantId: null, clicked: false };
    state.dna = { pairs: [], selections: new Set() };
    setScene("start");
  }

  /* -----------------------
     Stage 1: Dermatoscopy
  ------------------------*/
  function buildDerma() {
    dermaField.innerHTML = "";
    setStatus(dermaStatus, "Find the suspicious lesion.");

    // force layout measurement
    const rect = dermaField.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const total = 14;
    const malignantIndex = Math.floor(Math.random() * total);
    state.derma.malignantId = `lesion-${malignantIndex}`;

    const lesions = [];
    const minR = 18, maxR = 32;   // benign radius
    const minGap = 20;            // px between centers

    function farEnough(x, y, r){
        return lesions.every(p => Math.hypot(x - p.x, y - p.y) >= (r + p.r + minGap));
    }

    for (let i = 0; i < total; i++) {
        let r = (i === malignantIndex) ? (maxR + 14) : (minR + Math.random() * (maxR - minR));
        let x, y, tries = 0;

        do {
        x = r + 6 + Math.random() * (W - 2*r - 12);
        y = r + 6 + Math.random() * (H - 2*r - 12);
        tries++;
        if (tries > 300) break;
        } while(!farEnough(x, y, r));

        lesions.push({ x, y, r, malignant: i === malignantIndex });
    }

    lesions.forEach((L, i) => {
        const el = document.createElement("div");
        el.className = "lesion";
        el.id = `lesion-${i}`;
        el.dataset.malignant = L.malignant ? "1" : "0";
        el.style.width = `${L.r*2}px`;
        el.style.height = `${L.r*2}px`;
        el.style.left = `${L.x - L.r}px`;
        el.style.top  = `${L.y - L.r}px`;

        if (L.malignant) {
        el.classList.add("bad");
        el.style.transform = `rotate(${(Math.random()*20-10).toFixed(1)}deg)`;
        } else {
        el.classList.add("good");
        el.style.transform = `rotate(${(Math.random()*8-4).toFixed(1)}deg)`;
        }

        el.addEventListener("click", onLesionClick);
        dermaField.appendChild(el);
    });
  }   


  function onLesionClick(e) {
    const el = e.currentTarget;
    const isBad = el.dataset.malignant === "1";
    if (state.derma.clicked) return;

    if (isBad) {
        el.classList.add("marked");
        addScore(15);
        setStatus(dermaStatus, "Nice catch! Suspicious lesion identified.");
        addABCDELabels(el);                 // <-- new: show micro-labels
        state.derma.clicked = true;
        setTimeout(goDNA, 900);
    } else {
        el.classList.add("marked", "miss");
        addScore(-3);
        setStatus(
        dermaStatus,
        "Maybe not this one. Think ABCDE: asymmetry, ragged border, variegated color, larger diameter."
        );
        setTimeout(() => el.classList.remove("miss"), 250);
    }
    }

  function addABCDELabels(targetEl){
    const rect = targetEl.getBoundingClientRect();
    const host = dermaField.getBoundingClientRect();
    const centerX = rect.left - host.left + rect.width/2;
    const centerY = rect.top  - host.top  + rect.height/2;

    const labels = [
        { txt:"A: Asymmetry",  dx: -rect.width*0.6, dy: -rect.height*0.8 },
        { txt:"B: Border",     dx:  rect.width*0.55, dy: -rect.height*0.6 },
        { txt:"C: Color",      dx: -rect.width*0.75, dy:  rect.height*0.2 },
        { txt:"D: Diameter",   dx:  rect.width*0.55, dy:  rect.height*0.3 },
    ];

    labels.forEach((L)=>{
        const tag = document.createElement("div");
        tag.className = "abcde-label";
        tag.textContent = L.txt;
        tag.style.left = `${centerX + L.dx}px`;
        tag.style.top  = `${centerY + L.dy}px`;
        dermaField.appendChild(tag);
        // fade out gently after a moment
        setTimeout(()=>{ tag.style.opacity='0'; tag.style.transition='opacity .6s'; }, 1400);
        setTimeout(()=> tag.remove(), 2100);
    });
  }

  function goDNA() {
    setScene("dna");
    buildDNA();
  }

  /* -----------------------
     Stage 2: DNA
  ------------------------*/
  const comp = { A: "T", T: "A", G: "C", C: "G" };
  const correctBonds = (a, b) => {
    const pair = a + b;
    return pair === "AT" || pair === "TA" ? 2
         : pair === "GC" || pair === "CG" ? 3
         : 0;
  };
  const isCorrectPair = (a, b) => correctBonds(a, b) > 0;

  function randDNA(length = 14) {
    const alphabet = ["A", "T", "G", "C"];
    let s = "";
    for (let i = 0; i < length; i++) s += alphabet[(Math.random()*4)|0];
    return s;
  }

  function buildDNA() {
    dnaBoard.innerHTML = "";
    state.dna.selections.clear();
    setStatus(dnaStatus, "Mark all anomalous pairs, then submit.");

    const leftStrand = randDNA(14);
    const rightStrand = [...leftStrand].map(b => comp[b]).join("");

    // Start correct
    const pairs = [...leftStrand].map((L, i) => {
      const R = rightStrand[i];
      const bonds = correctBonds(L, R);
      return { idx: i, left: L, right: R, bondsShown: bonds, isAnomaly: false };
    });

    // Inject anomalies (2–4)
    const anomalies = 2 + (Math.random() * 3 | 0);
    const idxPool = pairs.map(p => p.idx);
    for (let k = 0; k < anomalies; k++) {
      if (!idxPool.length) break;
      const pickAt = (Math.random() * idxPool.length) | 0;
      const i = idxPool.splice(pickAt, 1)[0];
      const p = pairs[i];

      if (Math.random() < 0.6) {
        // 60%: wrong partner
        const options = ["A", "T", "G", "C"].filter(b => b !== p.right && comp[p.left] !== b);
        p.right = options[(Math.random() * options.length) | 0];
        p.bondsShown = Math.random() < 0.5 ? 2 : 3; // may or may not match
      } else {
        // 40%: correct partner, wrong bond count shown
        p.right = comp[p.left];
        p.bondsShown = correctBonds(p.left, p.right) === 2 ? 3 : 2;
      }
      p.isAnomaly = !isCorrectPair(p.left, p.right) || (p.bondsShown !== correctBonds(p.left, p.right));
    }

    state.dna.pairs = pairs;

    // Render tiles
    pairs.forEach(p => {
      const tile = document.createElement("div");
      tile.className = "pair";
      tile.dataset.idx = p.idx;

      const bases = document.createElement("div");
      bases.className = "bases";
      bases.innerHTML = `<span>${p.left}</span><span>${p.right}</span>`;

      const bonds = document.createElement("div");
      bonds.className = "bonds";
      for (let i = 0; i < p.bondsShown; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        bonds.appendChild(dot);
      }

      tile.appendChild(bases);
      tile.appendChild(bonds);
      tile.addEventListener("click", () => togglePair(tile));
      dnaBoard.appendChild(tile);
    });
  }

  function togglePair(tile) {
    const idx = +tile.dataset.idx;
    const set = state.dna.selections;
    if (set.has(idx)) { set.delete(idx); tile.classList.remove("mark"); }
    else { set.add(idx); tile.classList.add("mark"); }
  }

  function hintDNA() {
    addScore(-3);
    const remaining = state.dna.pairs.filter(p => p.isAnomaly && !state.dna.selections.has(p.idx));
    if (!remaining.length) { setStatus(dnaStatus, "All anomalies already marked. Submit when ready."); return; }
    const p = remaining[(Math.random() * remaining.length) | 0];
    state.dna.selections.add(p.idx);
    const tile = document.querySelector(`.pair[data-idx="${p.idx}"]`);
    if (tile) tile.classList.add("mark");
    setStatus(dnaStatus, "Hint used: one anomaly highlighted.");
  }

  function submitDNA() {
    const truth = new Set(state.dna.pairs.filter(p => p.isAnomaly).map(p => p.idx));
    const guess = state.dna.selections;

    let TP = 0, FP = 0, FN = 0;
    truth.forEach(i => { if (guess.has(i)) TP++; else FN++; });
    guess.forEach(i => { if (!truth.has(i)) FP++; });

    addScore(TP * 10 - FP * 5 - FN * 7);

    // Visual feedback
    state.dna.pairs.forEach(p => {
      const tile = document.querySelector(`.pair[data-idx="${p.idx}"]`);
      if (!tile) return;
      tile.classList.remove("ok", "bad");
      tile.classList.add(p.isAnomaly ? "bad" : "ok");
    });

    // Summary
    const lines = [];
    lines.push(`You found <strong>${TP}</strong> anomalies.`);
    if (FP) lines.push(`False positives: ${FP}.`);
    if (FN) lines.push(`Missed anomalies: ${FN}.`);
    lines.push("<hr/>");
    lines.push("<strong>Pairs overview:</strong>");
    lines.push("<ul>");
    state.dna.pairs.forEach(p => {
      const expBonds = correctBonds(p.left, p.right);
      const reason = !isCorrectPair(p.left, p.right)
        ? "wrong partner"
        : (p.bondsShown !== expBonds ? `wrong bond count (shown ${p.bondsShown}, expected ${expBonds})` : "OK");
      lines.push(`<li>${p.left}–${p.right} — ${reason}${p.isAnomaly ? " <em>(anomaly)</em>" : ""}</li>`);
    });
    lines.push("</ul>");

    resultSummary.innerHTML = `<p>Score: <strong>${state.score}</strong></p>${lines.join("")}`;
    setScene("result");
  }
})();
