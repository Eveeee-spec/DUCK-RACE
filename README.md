# DUCK RACE — The Classroom Grand Prix

**Ready, Set, QUACK!** A self-contained, asset-light classroom duck racing PWA made with HTML, CSS, and vanilla JavaScript.

## What's included

- Individual races: one duck for every student.
- Group races: groups distributed evenly by number of groups or members per group.
- Procedurally drawn glossy rubber ducks using inline SVG (no duck image files or external animation libraries).
- Animated water-style track, lanes, bubbles, event banners, finish effects, and winner reveal.
- Randomized movement variation and temporary race events.
- Countdown, pause/resume, restart, manual “Skip to finish”, fullscreen, and sound controls.
- Participant roster editor, bulk paste, duplicate-name support, saved rosters, and local data backup.
- Group naming, member movement, saved arrangements, and group lock.
- Race history, results rankings, CSV export, and JSON backup/import.
- PWA manifest and service worker for offline use after a successful first visit.
- Responsive layout designed for Android phones, tablets, and desktop browsers.

## Files — upload these directly to the repository root

All app files belong at the top level of your GitHub repository. Do not upload the ZIP's contents inside an extra `duck-race-project` folder.

```text
/
├── index.html
├── style.css
├── script.js
├── manifest.webmanifest
├── sw.js
├── README.md
├── icon-192.png
└── icon-512.png
```

## Publish with GitHub Pages using an Android phone

1. Open [GitHub](https://github.com/) in Chrome and sign in.
2. Tap **+** and create a new repository. A public repository is the simplest option for GitHub Pages on a free account. Name it something like `duck-race`.
3. Open the repository. Choose **Add file → Upload files**.
4. Download and extract `duck-race.zip` on your phone. Select the eight files listed above from the extracted ZIP. Make sure the files themselves are selected, not the enclosing extracted folder.
5. Commit the upload to the `main` branch.
6. In the repository, open **Settings → Pages**.
7. Under **Build and deployment**, choose **Deploy from a branch**.
8. Select branch **main** and folder **/(root)**, then tap **Save**.
9. Wait for the Pages deployment to finish. Your URL will usually look like `https://YOUR-USERNAME.github.io/duck-race/`. Open the URL shown by GitHub Pages, rather than guessing it.
10. The first visit requires an internet connection so the browser can download and cache the app shell.

## Install on Android

1. Open the published HTTPS GitHub Pages URL in **Chrome**.
2. Wait for the page to finish loading once.
3. If an **Install** button appears in the app, tap it. Alternatively, open Chrome's three-dot menu and choose **Install app** or **Add to Home screen** (wording varies by Chrome version).
4. Confirm the prompt. Duck Race will appear as an app icon and open in its own window when supported.

The PWA service worker only works on HTTPS (GitHub Pages supplies HTTPS) or localhost. It uses relative URLs and `scope: "./"` so it works from project URLs such as `/duck-race/`, not only from a domain root.

## Updating the app

1. Replace the changed files in the repository root and commit them to `main`.
2. Change `CACHE_NAME` in `sw.js` when publishing an update (for example, `duck-race-cache-v2`). This tells installed copies to refresh the app shell.
3. Reopen the site while online. If an old version remains, close the app, open Chrome and revisit the website. As a last resort, use Chrome site settings to clear cached data for the site, then open it again.

## Data storage and backup

Participants, rosters, group arrangements, settings, and race history are stored in the browser's `localStorage` on that device/browser. The data is not synchronized between devices and can be removed if browser/site data is cleared. In **Settings**, use **Download data backup** regularly. The backup is JSON and can be imported on another device using **Import data backup**. Race results can also be exported to CSV for spreadsheets.

## Troubleshooting

- **Pages shows a 404:** confirm `index.html` is directly in the repository root and Pages is configured to use `main` and `/(root)`.
- **App is blank or files do not load:** verify the filenames and capitalization exactly match this README. Avoid opening the HTML file from the ZIP preview; use the published HTTPS URL.
- **Offline mode is not available yet:** visit the published URL online at least once and allow the service worker to install. Some browsers need a reload before the offline cache is ready.
- **Install option is missing:** use Chrome on Android, visit the HTTPS URL, and try **⋮ → Add to Home screen**. Install eligibility and menu wording depend on browser version.
- **App updates do not appear:** bump the cache name in `sw.js`, commit, wait for deployment, then reopen the site online.
- **Sound is silent:** browser audio begins only after user interaction. Check the in-app sound setting and device volume.
- **Data is missing:** local storage is browser- and device-specific. Import a previously downloaded JSON backup if available.
- **Very large classes:** the track supports 40 or more lanes, but on small screens each lane becomes compact. Use compact mode and fullscreen for a clearer view.

## Fairness and race mechanics

Each race begins with newly initialized movement and random event chances. Ducks advance according to elapsed time and individual movement variation; events can apply temporary boosts or slowdowns. A winner is determined by the first simulated duck to cross the finish line. “Skip to finish” is explicitly recorded as a **manual override** and should not be treated as a natural race result.

## Limitations to know

- This is a standalone classroom activity, not a networked multiplayer game.
- Local data is stored only in the current browser profile; use backups to transfer it.
- Fullscreen and PWA installation depend on browser support.
- The app uses generated tones rather than prerecorded music or sound files.
- The racing ducks are original SVG illustrations designed to create a glossy 3D-style effect; they are not real-time 3D models.

## License

You may modify and use this project for classroom and personal educational activities. The included duck illustrations and code are original for this project.
