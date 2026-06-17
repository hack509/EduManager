import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  {
    file: 'flyer.html',
    output: 'flyer.png',
    width: 1340,
    height: 1954,   // A4 + margins
    fullPage: true,
  },
  {
    file: 'dashboard_mockup.html',
    output: 'dashboard.png',
    width: 1540,
    height: 1000,   // viewport to fit browser frame + label
    fullPage: true,
  },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const p of pages) {
  console.log(`📸  Capturing ${p.file}...`);
  const page = await browser.newPage();
  await page.setViewport({ width: p.width, height: p.height, deviceScaleFactor: 2 });

  const filePath = path.join(__dirname, p.file);
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for fonts & icons to load
  await new Promise(r => setTimeout(r, 2500));

  const outputPath = path.join(__dirname, p.output);
  await page.screenshot({ path: outputPath, fullPage: p.fullPage, type: 'png' });
  console.log(`✅  Saved → ${outputPath}`);
  await page.close();
}

await browser.close();
console.log('\n🎉  All screenshots done!');
