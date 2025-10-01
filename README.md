# MelanoMind-Detect&Decode

- Try on the browser (https://cukowski.github.io/MelanoMind-Detect-Decode/)

A tiny, educational, browser game. **Stage 1:** spot the most suspicious skin lesion (think **ABCDE**). **Stage 2:** find DNA base-pair anomalies (A–T = 2 bonds, G–C = 3).
*For learning only — not a medical device.*

## Play

1. **Dermatoscopy:** click the lesion that looks most suspicious (asymmetry, irregular border, varied color, larger diameter).
2. **DNA:** click every anomalous pair (wrong partner or wrong bond count) and **Submit**.
3. Score = right finds − mistakes. Restart anytime.

## Files

* `index.html` – markup & scenes
* `styles.css` – light, simple UI (Khan-Academy-ish)
* `game.js` – full game logic (no libraries)

## Run Locally

Just open `index.html` in a browser.
(Optional) with a local server:

```bash
# any of these
python3 -m http.server 8080
npx serve .
```

## Deploy on GitHub Pages

1. Create a repo, add the 3 files.
2. Push to `main`.
3. Settings → Pages → Deploy from `main` (root).
   Your game is live.

## Customize

* Tweak lesion count/size in `buildDerma()` (game.js).
* Change DNA length/anomaly rate in `buildDNA()`.

---

> Learn with rigor, play with care. This is a teaching toy, **not** diagnostic advice.
