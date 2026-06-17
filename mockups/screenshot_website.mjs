import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot  = path.join(__dirname, '..', 'website');

const sections = [
  { id: 'hero',       scroll: 0,    label: '01_hero' },
  { id: 'features',   scroll: 900,  label: '02_fonctionnalites' },
  { id: 'modules',    scroll: 1900, label: '03_modules' },
  { id: 'preview',    scroll: 2900, label: '04_apercu' },
  { id: 'tech',       scroll: 4000, label: '05_technologie' },
  { id: 'contact',    scroll: 5200, label: '06_contact' },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

const fileUrl = `file:///${siteRoot.replace(/\\/g, '/')}/index.html`;
await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Full-page screenshot
console.log('📸  Full page...');
await page.screenshot({
  path: path.join(__dirname, 'website_full.png'),
  fullPage: true,
  type: 'png',
});
console.log('✅  website_full.png');

// Per-section screenshots
for (const s of sections) {
  await page.evaluate((y) => window.scrollTo(0, y), s.scroll);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(__dirname, `website_${s.label}.png`),
    type: 'png',
  });
  console.log(`✅  website_${s.label}.png`);
}

await browser.close();
console.log('\n🎉  All done!');
