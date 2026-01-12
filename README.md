# MelanoMind - Learn & Detect

**MelanoMind** is a lightweight, browser-based educational web app that connects **biology** and **software engineering**.  
It introduces the basics of **skin cancer awareness** and **DNA mutation concepts** through short, interactive learning stages.

Live version:  
https://cukowski.github.io/MelanoMind-Detect-Decode/

---

## Overview

### Stage 0 - Introduction
A **scrollable / sliding intro** explains:
- The main **types of skin cancer**  
- What **melanoma** is and why early detection matters  
- The **ABCDE rule** for recognizing suspicious moles  
- How **young and old skin** may look different  
- How **DNA mispairing** and mutations can lead to cancer  

Slides move automatically, but users can also **click “Next” / “Prev”** or use the dots to navigate.

---

### Stage 1 - Mole Maker (ABCDE)
**Goal:** Learn the ABCDE rule by *creating* a stylized mole (no real photos).

- Adjust sliders for:
  - **A**symmetry
  - **B**order irregularity
  - **C**olor variation
  - **D**iameter
  - **E**volution (subtle animated change)
- A simple, explainable “risk meter” updates live (educational demo only).
- Choose a goal (“Make it benign” / “Make it suspicious”) and try to reach it.

---

### Stage 2 - DNA Mismatch Finder
**Goal:** Detect incorrect DNA base pairing.

- Shows simple base pairs (**A–T = 2 bonds**, **G–C = 3 bonds**).  
- Includes an explanatory slide with large diagrams on **how DNA mutations can cause cancer**.  
- Users click all **mismatched or wrong-bond pairs** to simulate spotting DNA errors.  
- Focuses only on *mispairing* as one simplified example of mutation.

---

## Files

| File | Description |
|------|--------------|
| `index.html` | Page structure, intro carousel, and scenes |
| `styles.css` | Responsive, clean layout inspired by Khan Academy |
| `game.js` | Logic for the intro carousel + DNA game |
| `mole-maker.js` | Mole Maker (ABCDE) game logic |
| `images/` | Real skin lesion photos and DNA diagrams |

---

## Run Locally

Open `index.html` directly in your browser,  
or start a lightweight local server for better path support:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080)

---

## Deploy on GitHub Pages

1. Push all files to a public GitHub repository.
2. In **Settings → Pages**, choose branch `main` and folder `/ (root)`.
3. Wait a few minutes - your app will be live.

---

## Customize

* **Intro slides:** edit the `INTRO_SLIDES` array in `game.js`.
* **Image pool:** replace or expand entries in `MOLE_POOL`.
* **Difficulty:** adjust total rounds or scoring in `game.js`.
* **Design:** tweak colors or sizes in `styles.css`.

---

## Educational Purpose

This project is meant purely for **learning and awareness**.
It is **not a diagnostic tool** and should never replace professional medical evaluation.
The app demonstrates how **programming** can visualize complex **biological concepts** simply and interactively.
