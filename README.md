# Veeam Korea — M365 Data Resilience "Thank You" page

A self-contained static web page (thank-you recap + 1-minute resilience quiz with four cute
mascots). This is a **finished, production-ready static artifact** — deploy it as-is. There is
no build step and no framework to recreate.

Two jobs for this handoff:
1. **Host it on GitHub Pages.**
2. **Add a Formspree "gate"** — visitors enter their details before they can see the page.

---

## 1. What's in this bundle

```
design_handoff_veeam_korea/
├── index.html                 ← the whole page (HTML + inline CSS). Open this.
├── assets/
│   ├── veeam-tokens.css        ← Veeam brand tokens (colors, type) + @font-face rules
│   ├── korea-quiz.js           ← quiz scoring + buddy-match logic
│   ├── veeam-logo.png          ← logo used in hero + footer
│   └── fonts/                  ← ES Build brand font (woff2 + woff)
└── README.md                   ← this file
```

All asset paths are **relative** (`assets/...`), so the page works at a domain root
(`user.github.io`) **or** in a project subpath (`user.github.io/repo/`) with no changes.

### Quick local check
Serve the folder (don't just double-click — fonts/JS need http):
```bash
cd design_handoff_veeam_korea
python3 -m http.server 8000   # then open http://localhost:8000
```

---

## 2. Host on GitHub Pages

1. Create a repo and push the **contents** of this folder to the repo root (so `index.html`
   is at the top level).
2. Repo → **Settings → Pages** → Source = **Deploy from a branch**, Branch = `main`, folder = `/ (root)`.
3. Save. The site publishes at `https://<user>.github.io/<repo>/` within a minute or two.
4. (Optional) Add a custom domain in the same Pages settings panel.

No Jekyll processing is needed; a `.nojekyll` file is harmless to add but not required here.

---

## 3. Add the Formspree gate (the main dev task)

**Goal:** when a visitor lands on the page, show a small lead-capture form first. After they
submit (name + work email + company), reveal the page and remember them so they don't see the
gate again on return.

### 3a. Create the Formspree form
- Sign in at formspree.io → **New form** → copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
- You'll paste that ID into the snippet below (`FORMSPREE_ENDPOINT`).

### 3b. Drop-in gate (matches the page's design system)
Paste this block **immediately after `<body>`** in `index.html`, and the `<script>` at the
very end before `</body>`. It reuses the page's brand tokens (ES Build font, Veeam green
`#00D15F`, dark hero gradient), so it looks native.

```html
<!-- ===== FORMSPREE GATE ===== -->
<div id="gate" class="gate" aria-modal="true" role="dialog">
  <form id="gateForm" class="gate-card" novalidate>
    <img src="assets/veeam-logo.png" alt="Veeam" class="gate-logo" />
    <h2>Get your resilience recap</h2>
    <p>Enter your details to view the summary and take the 1-minute check.</p>

    <label>Name<input name="name" required autocomplete="name" /></label>
    <label>Work email<input name="email" type="email" required autocomplete="email" /></label>
    <label>Company<input name="company" required autocomplete="organization" /></label>

    <label class="gate-consent">
      <input name="consent" type="checkbox" required />
      <span>I agree to be contacted about Veeam data resilience (PIPA consent).</span>
    </label>

    <button type="submit">View the page →</button>
    <p class="gate-err" id="gateErr" hidden>Something went wrong — please try again.</p>
  </form>
</div>

<style>
  .gate {
    position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 24px;
    background:
      radial-gradient(circle at 12% 18%, rgba(0,209,95,.30) 0%, transparent 44%),
      radial-gradient(circle at 90% 84%, rgba(87,224,255,.24) 0%, transparent 46%),
      linear-gradient(135deg, #00012B 0%, #0E2A81 58%, #2172CA 100%);
    font-family: "ES Build", system-ui, sans-serif;
  }
  body.gated { overflow: hidden; }          /* lock scroll while gate is up */
  .gate-card {
    width: 100%; max-width: 420px; background: #fff; border-radius: 22px;
    padding: 34px 30px; display: flex; flex-direction: column; gap: 14px;
    box-shadow: 0 30px 80px rgba(0,40,105,.45);
  }
  .gate-logo { height: 26px; align-self: flex-start; margin-bottom: 4px; }
  .gate-card h2 { font: 700 26px/30px "ES Build", sans-serif; margin: 0; color: #232323; letter-spacing: -.02em; }
  .gate-card p { font: 400 15px/22px "ES Build", sans-serif; color: #505861; margin: 0; }
  .gate-card label { font: 600 13px/18px "ES Build", sans-serif; color: #232323; display: flex; flex-direction: column; gap: 6px; }
  .gate-card input[type=text], .gate-card input:not([type]), .gate-card input[type=email] {
    font: 400 16px/22px "ES Build", sans-serif; padding: 11px 14px;
    border: 1.5px solid #E0E0E0; border-radius: 9px; outline: none;
  }
  .gate-card input:focus { border-color: #00D15F; box-shadow: 0 0 0 3px rgba(0,209,95,.18); }
  .gate-consent { flex-direction: row !important; align-items: flex-start; gap: 9px; font-weight: 400; color: #505861; }
  .gate-consent input { margin-top: 2px; }
  .gate-card button {
    margin-top: 6px; background: #00D15F; color: #00231A; border: none; cursor: pointer;
    font: 700 16px/20px "ES Build", sans-serif; padding: 14px; border-radius: 9px;
    transition: background .15s, transform .12s;
  }
  .gate-card button:hover { background: #32F26F; transform: translateY(-1px); }
  .gate-err { color: #ED2B3D; font-weight: 600; }
</style>
```

```html
<!-- put this just before </body>, AFTER the existing korea-quiz.js script tag -->
<script>
(function () {
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_ID";
  var KEY = "veeam-kr-gate-passed";
  var gate = document.getElementById("gate");
  var form = document.getElementById("gateForm");
  var err  = document.getElementById("gateErr");

  // Returning visitor — skip the gate
  if (localStorage.getItem(KEY) === "1") { gate.remove(); return; }
  document.body.classList.add("gated");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    err.hidden = true;
    if (!form.reportValidity()) return;
    var btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = "Submitting…";
    try {
      var res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error("bad status");
      localStorage.setItem(KEY, "1");
      document.body.classList.remove("gated");
      gate.remove();
    } catch (_) {
      err.hidden = false;
      btn.disabled = false; btn.textContent = "View the page →";
    }
  });
})();
</script>
```

### Notes for the implementer
- Replace `REPLACE_WITH_YOUR_ID` with the real Formspree form ID.
- Submissions land in the Formspree dashboard (and email). No backend needed — works fine on
  static GitHub Pages.
- The `localStorage` flag means a visitor only fills the form once per browser. Remove that
  block if you want the gate every visit.
- Formspree free tier is rate-limited; upgrade if you expect volume. Enable reCAPTCHA in the
  Formspree form settings if you want spam protection (no code change required).
- Keep the consent checkbox — it's there for PIPA (Korea's data-protection law).

---

## 4. Page reference (for context)

- **Sections:** Hero ("감사합니다 / Thank you"), 3 takeaways (Microsoft governs agents → agents
  rewrite data fast → **Veeam recovers**), 12-question quiz with live score ring, 4 mascot
  cards, contact CTA.
- **Quiz logic** lives in `assets/korea-quiz.js`. 12 yes/no statements; score = % ticked.
  Buddy thresholds: **0–24%** Kongi (sprout), **25–54%** Bangul (dewdrop), **55–84%** Gureum
  (cloud), **85–100%** Horang (tiger). The matched card highlights + animates live.
- **Brand tokens** are in `assets/veeam-tokens.css` (Veeam green `#00D15F`, blue `#3700FF`,
  ink `#232323`, ES Build typeface). The hero/contact dark gradient is
  `linear-gradient(135deg,#00012B,#0E2A81,#2172CA)` with green/cyan radial glows.
- **Contact button** currently uses a `mailto:` to `korea@veeam.com` — swap for the real
  follow-up destination if needed.

That's everything — host `index.html`, wire the Formspree ID, and it's live.
