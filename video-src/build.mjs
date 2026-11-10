// Builds one intro video:   node build.mjs <name> [--stills 1,12.5,30] [--fps 30]
//  1. macOS `say` reads every narration chunk of <name>/script.json,
//  2. the chunk lengths become the timeline (scene starts, cue times),
//  3. Chrome seeks <name>/scenes.html to every frame and screenshots it into ffmpeg,
//  4. writes <out>.mp4 (H.264 + AAC), <out>.vtt (captions) and <out>.jpg (poster).
// --stills only renders those seconds to /tmp-like PNGs for checking, no video.
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const here = import.meta.dirname;
const name = process.argv[2];
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const FPS = +(arg('--fps') || 30);
const stills = arg('--stills');
if (!name) { console.error('usage: node build.mjs <name> [--stills 1,2] [--fps 30]'); process.exit(1); }

const dir = resolve(here, name);
const script = JSON.parse(await readFile(resolve(dir, 'script.json'), 'utf8'));
const work = resolve(process.env.VIDEO_TMP || tmpdir(), `intro-${name}`);
await rm(work, { recursive: true, force: true });
await mkdir(work, { recursive: true });
const voice = script.voice || 'Daniel';
const rate = String(script.rate || 172);
const GAP = script.gap ?? 0.3;

const probe = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

// 1–2. Narration and timeline.
const TL = { scenes: {}, total: 0 };
const clips = [];   // { file, at, text, dur }
let t = 0;
for (const [i, sc] of script.scenes.entries()) {
  const chunks = [].concat(sc.say || []);
  const lead = sc.lead ?? (i === 0 ? 1.0 : 0.55);
  const cues = [];
  let local = lead;
  for (const [k, chunk] of chunks.entries()) {
    // A chunk is caption text, or { "text": caption, "speak": what the voice says }.
    const text = chunk.text ?? chunk;
    const speak = chunk.speak ?? text;
    const file = resolve(work, `${sc.id}-${k}.aiff`);
    execFileSync('say', ['-v', voice, '-r', rate, '-o', file, speak.replace(/\bAIOS\b/g, 'A I O S')]);
    const dur = probe(file);
    cues.push(local);
    clips.push({ file, at: t + local, text, dur });
    local += dur + GAP;
  }
  const dur = Math.max(sc.min || 0, local - GAP + (sc.tail ?? 0.9));
  TL.scenes[sc.id] = { start: t, end: t + dur, cues };
  t += dur;
}
TL.total = +(t + (script.outro ?? 0.6)).toFixed(3);
console.log(`${name}: ${script.scenes.length} scenes, ${TL.total.toFixed(1)} s`);
for (const [id, s] of Object.entries(TL.scenes)) console.log(`  ${id.padEnd(12)} ${s.start.toFixed(1).padStart(6)} → ${s.end.toFixed(1).padStart(6)}  cues ${s.cues.map((c) => c.toFixed(1)).join(' ')}`);

// 3. Chrome, seeked frame by frame.
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files', '--force-device-scale-factor=1', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
page.on('pageerror', (e) => { console.error('page error:', e.message); process.exitCode = 1; });
await page.evaluateOnNewDocument(() => { window.__RENDER = true; });
await page.goto('file://' + resolve(dir, 'scenes.html'), { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
});
await page.evaluate((tl) => window.__build(tl), TL);
const cdp = await page.createCDPSession();
const grab = async (sec, format = 'jpeg') => {
  await page.evaluate((s) => window.__seek(s), sec);
  const { data } = await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 92 : undefined, optimizeForSpeed: true });
  return Buffer.from(data, 'base64');
};

const out = resolve(here, '..', script.out);
await mkdir(dirname(out), { recursive: true });

if (stills) {
  for (const s of stills.split(',').map(Number)) {
    const f = resolve(work, `still-${String(s).padStart(6, '0')}.png`);
    await writeFile(f, await grab(s, 'png'));
    console.log(f);
  }
  await browser.close();
  process.exit();
}

// Audio: every chunk placed at its time on one track, then loudness-normalised.
const audio = resolve(work, 'voice.wav');
{
  const ins = clips.flatMap((c) => ['-i', c.file]);
  const f = clips.map((c, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${Math.round(c.at * 1000)}:all=1[a${i}]`).join(';');
  const mix = clips.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${clips.length}:normalize=0,apad=whole_dur=${TL.total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', `${f};${mix}`, '-map', '[out]', '-ar', '48000', '-t', String(TL.total), audio]);
}

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(script.crf || 22),
  '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', out + '.mp4'],
  { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((ok, bad) => ff.on('close', (c) => (c ? bad(new Error('ffmpeg ' + c)) : ok())));
const frames = Math.round(TL.total * FPS);
const started = Date.now();
for (let f = 0; f < frames; f++) {
  const buf = await grab(f / FPS);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % (FPS * 10) === 0) process.stdout.write(`\r  frame ${f}/${frames} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
}
ff.stdin.end();
await done;
await browser.close();
console.log(`\r  ${frames} frames in ${((Date.now() - started) / 1000).toFixed(0)} s`);

// 4. Captions and poster.
const ts = (s) => new Date(s * 1000).toISOString().slice(11, 23);
const vtt = ['WEBVTT', ''];
for (const c of clips) {
  // Long chunks are split at sentence/comma breaks, timed by length.
  const parts = c.text.match(/[^.!?;:]+[.!?;:]?|[^.!?;:]+$/g).map((p) => p.trim()).filter(Boolean)
    .flatMap((p) => (p.length > 90 ? p.split(/(?<=,)\s+/) : [p]));
  const total = parts.reduce((n, p) => n + p.length, 0);
  let at = c.at;
  for (const p of parts) {
    const d = (c.dur * p.length) / total;
    vtt.push(`${ts(at)} --> ${ts(at + d)}`, p, '');
    at += d;
  }
}
await writeFile(out + '.vtt', vtt.join('\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(script.poster ?? 2), '-i', out + '.mp4', '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', out + '.jpg']);
const mb = (+execFileSync('stat', ['-f', '%z', out + '.mp4']).toString() / 1e6).toFixed(1);
console.log(`✓ ${script.out}.mp4 (${TL.total.toFixed(1)} s, ${mb} MB)  ✓ .vtt  ✓ .jpg`);
