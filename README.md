# Christmas surprise for Nate 🎁

An interactive Christmas gift: a snowy night, a giant present that opens with a
burst of light, a handwritten letter, and a portal that carries Nate to his
professional portfolio.

This site is **separate from the portfolio**. The portfolio never links here, so
recruiters only ever see the professional site.

## What happens

1. **Loading** — "Wrapping your present…", then a button to step inside. That
   first click is what lets the browser play music.
2. **Christmas night** — stars, moon, falling snow that dodges the cursor,
   lit pine trees, shooting stars, and Santa flying by every half minute.
   Hidden extras: click the ornament for a jingle, and find the star that
   twinkles brighter than the rest.
3. **The present** — it floats, jiggles, and gets excited on hover. Clicking it
   shakes it, unties the bow, lifts the lid, and pours out golden light.
4. **The letter** — a parchment letter unfolds and writes itself out.
5. **Your Future Starts Here ❤️🎮** — the letter folds away, a portal shifts the
   colors from Christmas gold to neon blue and purple, "I BELIEVE IN YOU, HUNNY ❤️"
   lights up, and the page redirects to the portfolio. A
   "Go to your portfolio now" link appears too, in case the redirect is blocked.

Buttons in the top corner turn music on/off, reduce animations, and replay the
surprise.

## The things you're most likely to change

| What | Where |
| --- | --- |
| The portfolio link Nate is sent to | `src/config.js` → `PORTFOLIO_URL` |
| The letter's words | `src/content/letter.js` → `LETTER` |
| Button and message wording | `src/content/letter.js` → `COPY` |
| How long each moment lasts | `src/config.js` → `TIMINGS` |

After changing the letter, update the expected text in
`src/content/letter.test.js` too — that test exists so an accidental edit to
the letter can't slip through unnoticed.

## Run it on your computer

Requires [Node.js](https://nodejs.org/) 26 (see `.nvmrc`).

```powershell
npm install
npm run dev        # opens at http://localhost:5173
npm test           # runs the automated tests
npm run build      # production build into dist/
```

To preview the production build exactly as GitHub Pages will serve it (under
`/christmas/`):

```powershell
$env:BASE_PATH = '/christmas/'; npm run build; Remove-Item Env:BASE_PATH
npx vite preview --base /christmas/
```

Then open http://localhost:4173/christmas/.

## Deploy to GitHub Pages

The repository is `https://github.com/enobot/christmas`. Deploys happen
automatically on every push to `main` through `.github/workflows/deploy.yml`,
which installs dependencies, runs the tests (a failing test stops the deploy),
builds, and publishes.

**One-time setup** (before or right after the first push):

1. On GitHub, open the repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow from the **Actions** tab).

The site appears at **https://enobot.github.io/christmas/** after the workflow
finishes (about a minute). The workflow reads the repository name, so renaming
the repo keeps working without code changes.

**Troubleshooting**

- *Workflow fails at "configure-pages"*: Pages isn't enabled yet — do step 2
  above, then re-run the workflow.
- *Blank page after deploying*: open the browser console; a 404 on a `.js` file
  means the base path is wrong. The workflow sets it automatically — check that
  the build step still has the `BASE_PATH` line.
- *The redirect goes to a 404*: the portfolio isn't deployed yet, or
  `PORTFOLIO_URL` is wrong.

## Privacy

- GitHub Pages sites on a free account are **public**: anyone with the link can
  open the surprise and read the letter. The page asks search engines not to
  index it (`noindex`), and its link preview doesn't spoil the surprise, but it
  is not password-protected.
- No analytics, cookies, or tracking. The page makes no requests to other
  sites; fonts are bundled with it.
- Two settings (music on/off, reduced animations) are saved in the browser's
  local storage on Nate's device. Nothing is sent anywhere.

## How it's built

- **React 19 + Vite 8** for the app and build.
- **Tailwind CSS 4** for the theme tokens and base styles; the scene styling
  lives in `src/index.css`.
- **Motion** (formerly Framer Motion) for the present, letter, and portal
  animations.
- **Canvas 2D** for the particle effects (snow, stars, burst, portal, cursor
  trail): one lightweight loop per effect that pauses when the tab is hidden
  and draws a single still frame when animations are reduced.
- **Web Audio API** for all sound — the music box, bells, and portal hum are
  synthesized live in the browser, so there are no audio files.
- A **scene state machine** (`src/state/sceneMachine.js`) controls the story,
  so double-clicks can't skip or repeat a scene, and **timers** (not
  animation callbacks) move the story forward, so it can't get stuck.
- An **error boundary** shows the letter and the portfolio link if anything
  unexpected breaks.

```
src/
  App.jsx              scene orchestration
  config.js            PORTFOLIO_URL and timings
  content/letter.js    the letter and all on-screen wording
  state/sceneMachine.js
  audio/               synthesized music and sound effects
  effects/             canvas particle effects
  components/          the present, letter, portal, sky, trees, controls
  hooks/               motion preference, timelines, canvas loop
```

## Accessibility

- Every interactive element is a real button or link with a label; the whole
  story can be played with the keyboard (Tab, Enter, Space).
- Screen readers hear the letter as plain text and get short announcements as
  scenes change.
- "Reduce animations" follows the operating-system setting by default and can be
  toggled on screen; with it on, shaking, zooming, snowfall, and the
  handwriting animation are replaced by simple fades.
- Music only starts after a click, and can be turned off at any time.

## Credits and licenses

- Music: arrangements of **"Silent Night"** (Franz Xaver Gruber, 1818) and
  **"Jingle Bells"** (James Lord Pierpont, 1857). Both compositions are in the
  public domain; the sounds are synthesized in code for this site.
- Fonts (bundled via Fontsource, SIL Open Font License 1.1):
  **IM Fell English**, **Dancing Script**, **Orbitron**.
- Icons: **Lucide** (ISC License).
- All illustrations (present, trees, Santa, cabin, moon) are drawn in code for
  this site.
