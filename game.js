// MelanoMind — intro carousel + two simple games with clear context.
// Educational demo only — not diagnostic.

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
    if (s === game1 && !g1.inited) initGame1();
    if (s === game2 && !g2.inited) initGame2();
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
      text: "Young and older skin can look different. Practice recognizing patterns across ages."
    },
    {
      img: "images/dna_explainer.png",
      title: "DNA and Mutation",
      text: "DNA pairs A–T (two bonds) and G–C (three bonds). Mutations can alter how cells grow and divide."
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
      slide.setAttribute("aria-label", `${i+1} of ${INTRO_SLIDES.length}`);
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
      dot.className = "dot" + (i===0 ? " active" : "");
      dot.dataset.index = i;
      dot.onclick = () => goTo(i, true);
      dots.appendChild(dot);
    });
  }

  let idx = 0;
  let timer = null;
  const intervalMs = 6000;

  function goTo(n, user=false) {
    const track = $("#intro-track");
    const total = INTRO_SLIDES.length;
    idx = (n + total) % total;
    track.style.transform = `translateX(${idx * -100}%)`;
    $$(".dot").forEach((d, i) => d.classList.toggle("active", i===idx));
    if (user) restartAuto();
  }
  function next(){ goTo(idx+1); }
  function prev(){ goTo(idx-1, true); }

  function startAuto(){
    stopAuto();
    timer = setInterval(next, intervalMs);
  }
  function stopAuto(){
    if (timer){ clearInterval(timer); timer=null; }
  }
  function restartAuto(){
    stopAuto(); startAuto();
  }

  $("#intro-next").onclick = () => { next(); restartAuto(); };
  $("#intro-prev").onclick = () => { prev(); };

  buildIntroCarousel();
  startAuto();

  /* ===========================
     GAME 1 — ABCDE spotting
  ============================ */

  // Image pool (from your folder listing)
  const MOLE_POOL = [
    // YOUNG healthy
    {src:"images/young_healthy_1.jpg", label:"healthy", age:"young", caption:"Young skin: uniform color and smooth border."},
    {src:"images/young_healthy_2.jpg", label:"healthy", age:"young", caption:"Young skin: symmetric and even tone."},
    {src:"images/young_healthy_3.jpg", label:"healthy", age:"young", caption:"Young skin: round shape, neat edge."},
    {src:"images/young_healthy_4.jpg", label:"healthy", age:"young", caption:"Young skin: stable appearance."},
    {src:"images/young_healthy_5.jpg", label:"healthy", age:"young", caption:"Young skin: single color, regular outline."},

    // YOUNG suspicious
    {src:"images/young_suspicious_1.jpg", label:"suspicious", age:"young", caption:"Asymmetry and irregular border suggest suspicion."},
    {src:"images/young_suspicious_2.jpeg", label:"suspicious", age:"young", caption:"Variegated colors and jagged edges."},
    {src:"images/young_suspicious_3.jpg", label:"suspicious", age:"young", caption:"Uneven shades and changing outline."},
    {src:"images/young_suspicious_4.jpg", label:"suspicious", age:"young", caption:"Asymmetric with multiple tones."},

    // OLD healthy
    {src:"images/old_healthy_1.jpg", label:"healthy", age:"old", caption:"Older skin: round, even border."},
    {src:"images/old_healthy_2.jpg", label:"healthy", age:"old", caption:"Older skin: uniform color, smooth edge."},
    {src:"images/old_healthy_3.jpg", label:"healthy", age:"old", caption:"Older skin: stable appearance."},

    // OLD suspicious
    {src:"images/old_suspicious_1.jpg", label:"suspicious", age:"old", caption:"Multiple colors and irregular edges."},
    {src:"images/old_suspicious_2.jpg", label:"suspicious", age:"old", caption:"Asymmetry and variegated color."},
    {src:"images/old_suspicious_3.jpg", label:"suspicious", age:"old", caption:"Uneven border; looks evolving."},
    {src:"images/old_suspicious_4.jpg", label:"suspicious", age:"old", caption:"Jagged edges and mixed tones."},
    {src:"images/old_suspicious_5.jpg", label:"suspicious", age:"old", caption:"Asymmetric with irregular border."},
  ];

  const g1 = { inited:false, round:1, total:5, score:0, current:null };

  function initGame1(){
    g1.inited = true;
    $("#g1-total").textContent = g1.total;
    $("#g1-round").textContent = g1.round;
    $("#g1-score").textContent = g1.score;

    $("#g1-guess-healthy").onclick = () => guess("healthy");
    $("#g1-guess-suspicious").onclick = () => guess("suspicious");
    $("#g1-next").onclick = nextRound;
    $("#skinAge").onchange = () => { g1.round = 1; g1.score = 0; updateG1Hud(); nextRound(true); };

    nextRound(true);
  }

  function pickImage() {
    const age = $("#skinAge").value; // any | young | old
    const pool = MOLE_POOL.filter(m => age === "any" ? true : m.age === age);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function nextRound(reset=false){
    if (reset){
      $("#g1-feedback").textContent = "";
      $("#g1-feedback").className = "feedback";
      $("#to-game2").disabled = true;
    }
    g1.current = pickImage();
    if (!g1.current) return;

    const img = $("#g1-img");
    img.src = g1.current.src;
    img.alt = g1.current.caption || "Dermatoscopy example";
    $("#g1-caption").textContent = g1.current.caption || "";
    $("#g1-round").textContent = g1.round;
  }

  function guess(choice){
    const fb = $("#g1-feedback");
    if (!g1.current) return;

    if (choice === g1.current.label){
      g1.score += 10;
      fb.textContent = "Correct — this matches the ABCDE cues you’re looking for.";
      fb.className = "feedback ok";
    } else {
      g1.score = Math.max(0, g1.score - 5);
      fb.textContent = "Not quite. Re-check asymmetry, borders, color, and size.";
      fb.className = "feedback bad";
    }
    updateG1Hud();

    if (g1.round < g1.total){
      g1.round++;
      setTimeout(nextRound, 800);
    } else {
      $("#to-game2").disabled = false;
    }
  }

  function updateG1Hud(){
    $("#g1-round").textContent = g1.round;
    $("#g1-score").textContent = g1.score;
  }

  $("#to-game2").onclick = () => showSection(game2);

  /* ===========================
     GAME 2 — DNA mismatch
  ============================ */
  const g2 = { inited:false, score:0, pairs:[], selections:new Set() };

  function initGame2(){
    g2.inited = true;
    $("#g2-hint").onclick = hintG2;
    $("#g2-submit").onclick = submitG2;
    buildDNA();
  }

  const comp = { A:"T", T:"A", G:"C", C:"G" };
  function bonds(a,b){
    const p = a+b;
    if (p==="AT"||p==="TA") return 2;
    if (p==="GC"||p==="CG") return 3;
    return 0;
    }

  function randDNA(n=14){
    const A = ["A","T","G","C"]; let s="";
    for (let i=0;i<n;i++) s += A[(Math.random()*4)|0];
    return s;
  }

  function buildDNA(){
    const board = $("#dna-board");
    board.innerHTML = "";
    g2.selections.clear();
    g2.pairs = [];

    const left = randDNA(14);
    const right = [...left].map(b=>comp[b]).join("");

    const base = [...left].map((L,i)=>{
      const R = right[i];
      return {idx:i, left:L, right:R, bondsShown:bonds(L,R), isAnomaly:false};
    });

    // inject 2–4 anomalies
    const anomalies = 2 + ((Math.random()*3)|0);
    const pool = base.map(p=>p.idx);
    for (let k=0;k<anomalies;k++){
      if (!pool.length) break;
      const at = (Math.random()*pool.length)|0;
      const i = pool.splice(at,1)[0];
      const p = base[i];

      if (Math.random() < 0.6){
        // wrong partner
        const options = ["A","T","G","C"].filter(x => x!==p.right && comp[p.left]!==x);
        p.right = options[(Math.random()*options.length)|0];
        p.bondsShown = Math.random()<0.5 ? 2 : 3;
      }else{
        // right partner, wrong bond count shown
        p.right = comp[p.left];
        p.bondsShown = (bonds(p.left,p.right)===2) ? 3 : 2;
      }
      p.isAnomaly = (bonds(p.left,p.right)===0) || (p.bondsShown !== bonds(p.left,p.right));
    }

    g2.pairs = base;

    base.forEach(p=>{
      const tile = document.createElement("div");
      tile.className = "pair";
      tile.dataset.idx = p.idx;
      tile.innerHTML = `
        <div class="bases"><span>${p.left}</span><span>${p.right}</span></div>
        <div class="bonds">${"."
          .repeat(p.bondsShown)
          .split("")
          .map(()=>`<div class="dot"></div>`).join("")}</div>
      `;
      tile.onclick = () => toggleG2(tile);
      board.appendChild(tile);
    });

    $("#g2-summary").innerHTML = "";
    $("#g2-score").textContent = g2.score;
  }

  function toggleG2(tile){
    const idx = +tile.dataset.idx;
    if (g2.selections.has(idx)){ g2.selections.delete(idx); tile.classList.remove("mark"); }
    else { g2.selections.add(idx); tile.classList.add("mark"); }
  }

  function hintG2(){
    g2.score = Math.max(0, g2.score - 3);
    $("#g2-score").textContent = g2.score;
    const remain = g2.pairs.filter(p=>p.isAnomaly && !g2.selections.has(p.idx));
    if (!remain.length) return;
    const pick = remain[(Math.random()*remain.length)|0];
    g2.selections.add(pick.idx);
    const tile = document.querySelector(`.pair[data-idx="${pick.idx}"]`);
    if (tile) tile.classList.add("mark");
  }

  function submitG2(){
    const truth = new Set(g2.pairs.filter(p=>p.isAnomaly).map(p=>p.idx));
    const guess = g2.selections;

    let TP=0, FP=0, FN=0;
    truth.forEach(i=>{ if(guess.has(i)) TP++; else FN++; });
    guess.forEach(i=>{ if(!truth.has(i)) FP++; });

    g2.score = Math.max(0, g2.score + TP*10 - FP*5 - FN*7);
    $("#g2-score").textContent = g2.score;

    // colorize
    g2.pairs.forEach(p=>{
      const tile = document.querySelector(`.pair[data-idx="${p.idx}"]`);
      if (!tile) return;
      tile.classList.remove("ok","bad");
      tile.classList.add(p.isAnomaly ? "bad":"ok");
    });

    // summary
    const lines = [];
    lines.push(`<p><b>Correct anomalies:</b> ${TP}</p>`);
    if (FP) lines.push(`<p>False positives: ${FP}</p>`);
    if (FN) lines.push(`<p>Missed anomalies: ${FN}</p>`);
    lines.push("<hr>");
    lines.push("<p><b>Pairs overview</b></p><ul>");
    g2.pairs.forEach(p=>{
      const exp = bonds(p.left,p.right);
      const why = exp===0 ? "wrong partner" : (exp!==p.bondsShown ? `wrong bond count (shown ${p.bondsShown}, expected ${exp})` : "OK");
      lines.push(`<li>${p.left}–${p.right}: ${why}${p.isAnomaly?" (anomaly)":""}</li>`);
    });
    lines.push("</ul>");
    $("#g2-summary").innerHTML = lines.join("");
  }

  // Start on Intro
  showSection(intro);
})();
