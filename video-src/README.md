# Intro videos for leosuzu.com

Narrated intro videos shown in the Projects section. Made locally and free: the macOS
`say` voice (Daniel) reads the script, Chrome renders the animated scenes frame by
frame, and ffmpeg joins picture and sound. This folder is not deployed — `scripts/build.mjs`
only copies files that `index.html` links to.

| Video | Folder | Output (in `assets/project_samples/`) |
|---|---|---|
| AIOS — information video | `aios/` | `AIOS/AIOS_intro.*` |
| Marjo Seki website | `marjo/` | `MarjoSeki/MarjoSeki_intro.*` |
| WePic for Android | `wepic/` | `WePicAndroid/WePic_intro.*` |
| WePicHTML (web app) | `wepichtml/` | `WePicApp/WePicHTML_intro.*` |
| Art Maker Studio | `artmaker/` | `Art_Maker_Studio/ArtMakerStudio_intro.*` |

Each build writes `.mp4` (1080p H.264 + AAC), `.vtt` (English captions) and `.jpg` (poster).

## Change a video

- **Words:** edit `<name>/script.json`. Each scene's `say` list is the narration; every
  item is a *cue*, and scene timing follows the voice automatically. Use
  `{ "text": "caption", "speak": "what the voice says" }` when pronunciation differs.
- **Pictures:** edit `<name>/scenes.html` (one `<section class="scene">` per script scene).
  Animation attributes are documented at the top of `engine.js`; shared styles are in `base.css`.
- **Preview:** open `<name>/scenes.html` in Chrome (rough timing, plays in a loop).

## Build

```sh
cd /Users/LeMac/AIOS/LeProjects/Websites/LeoSuzukiSignal/video-src
npm install
node build.mjs aios
```

`node build.mjs aios --stills 10,42` renders only those seconds as PNGs, for a quick check.
A full render takes about 3 seconds per second of video. Needs Google Chrome and ffmpeg.
After rebuilding, deploy the site as usual (`node scripts/build.mjs`, then `npx wrangler deploy`).
