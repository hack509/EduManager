import puppeteer  from 'puppeteer';
import ffmpegPath  from 'ffmpeg-static';
import Ffmpeg      from 'fluent-ffmpeg';
import path        from 'path';
import fs          from 'fs';
import { fileURLToPath } from 'url';

Ffmpeg.setFfmpegPath(ffmpegPath);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.join(__dirname, 'frames');
const OUTPUT     = path.join(__dirname, 'edumanager_demo.mp4');

const FPS      = 25;          // frames per second
const DURATION = 38;          // seconds (matches demo.html timeline)
const TOTAL_FRAMES = FPS * DURATION;
const INTERVAL_MS  = 1000 / FPS;

// ── Clean / create frames dir ──────────────────────────
if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR);

console.log('🚀  Launching browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

const demoUrl = `file:///${__dirname.replace(/\\/g, '/')}/demo.html`;
await page.goto(demoUrl, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for fonts + icons
await new Promise(r => setTimeout(r, 2000));

console.log(`📸  Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION}s)...`);

// Manually advance the demo clock via page.evaluate
// We inject a fake time so the animation plays at controlled speed
await page.evaluate(() => { window._demoReady = true; });

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const simTime = i * INTERVAL_MS; // ms into the demo

  // Tell the page what time it is in the demo
  await page.evaluate((t) => {
    // Override performance.now temporarily for this frame
    if (!window._demoStarted) {
      window._demoStarted = true;
      window._t0 = performance.now();
    }
  }, simTime);

  const frameFile = path.join(FRAMES_DIR, `frame_${String(i).padStart(5, '0')}.png`);
  await page.screenshot({ path: frameFile, type: 'png' });

  if (i % 25 === 0) {
    const pct = Math.round((i / TOTAL_FRAMES) * 100);
    process.stdout.write(`\r  ⏳  ${pct}%  (frame ${i}/${TOTAL_FRAMES})`);
  }
}

await browser.close();
console.log('\n✅  All frames captured.');

// ── Encode to MP4 ──────────────────────────────────────
console.log(`\n🎬  Encoding MP4 → ${OUTPUT}`);

await new Promise((resolve, reject) => {
  Ffmpeg()
    .input(path.join(FRAMES_DIR, 'frame_%05d.png'))
    .inputFPS(FPS)
    .videoCodec('libx264')
    .outputOptions([
      '-crf 18',
      '-preset fast',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      `-r ${FPS}`,
    ])
    .size('1280x720')
    .output(OUTPUT)
    .on('progress', p => {
      if (p.percent) process.stdout.write(`\r  🔧  Encoding: ${Math.round(p.percent)}%`);
    })
    .on('end', resolve)
    .on('error', reject)
    .run();
});

// Clean up frames
fs.rmSync(FRAMES_DIR, { recursive: true });

console.log(`\n\n🎉  Video ready: ${OUTPUT}`);
console.log(`   Size: ${(fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1)} MB`);
