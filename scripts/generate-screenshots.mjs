import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const screenshotsDir = join(process.cwd(), 'public', 'screenshots');

if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#f5f5f5"/>
  <rect x="100" y="80" width="1720" height="920" rx="8" fill="white" stroke="#e0e0e0"/>
  <rect x="100" y="80" width="300" height="920" fill="#f0f7ff"/>
  <text x="150" y="150" font-family="Arial" font-size="32" fill="#1890ff">Momentum</text>
  <rect x="120" y="200" width="260" height="80" rx="4" fill="white" stroke="#e0e0e0"/>
  <rect x="120" y="300" width="260" height="80" rx="4" fill="white" stroke="#e0e0e0"/>
  <rect x="120" y="400" width="260" height="80" rx="4" fill="white" stroke="#e0e0e0"/>
  <rect x="450" y="120" width="1300" height="400" rx="4" fill="#e6f7ff"/>
  <text x="470" y="200" font-family="Arial" font-size="48" fill="#1890ff">Goals Dashboard</text>
  <text x="470" y="280" font-family="Arial" font-size="24" fill="#666">Track your progress</text>
  <rect x="450" y="560" width="400" height="200" rx="4" fill="white" stroke="#e0e0e0"/>
  <rect x="880" y="560" width="400" height="200" rx="4" fill="white" stroke="#e0e0e0"/>
  <rect x="1310" y="560" width="400" height="200" rx="4" fill="white" stroke="#e0e0e0"/>
</svg>`;

const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280">
  <rect width="720" height="1280" fill="#f5f5f5"/>
  <rect x="60" y="40" width="600" height="1200" rx="40" fill="white" stroke="#e0e0e0"/>
  <rect x="60" y="40" width="600" height="80" rx="40" fill="#1890ff"/>
  <text x="280" y="95" font-family="Arial" font-size="32" fill="white">Momentum</text>
  <rect x="90" y="180" width="540" height="200" rx="8" fill="#e6f7ff"/>
  <text x="110" y="250" font-family="Arial" font-size="28" fill="#1890ff">Your Goals</text>
  <text x="110" y="290" font-family="Arial" font-size="20" fill="#666">5 active goals</text>
  <rect x="90" y="420" width="540" height="120" rx="8" fill="white" stroke="#e0e0e0"/>
  <rect x="90" y="560" width="540" height="120" rx="8" fill="white" stroke="#e0e0e0"/>
  <rect x="90" y="700" width="540" height="120" rx="8" fill="white" stroke="#e0e0e0"/>
  <rect x="90" y="840" width="540" height="120" rx="8" fill="white" stroke="#e0e0e0"/>
  <circle cx="360" cy="1100" r="60" fill="#1890ff"/>
  <text x="340" y="1115" font-family="Arial" font-size="32" fill="white">+</text>
</svg>`;

async function generateScreenshots() {
  console.log('Generating screenshots...');

  await sharp(Buffer.from(desktopSvg)).resize(1920, 1080).png().toFile(join(screenshotsDir, 'screenshot-desktop.png'));
  console.log('Created screenshot-desktop.png');

  await sharp(Buffer.from(mobileSvg)).resize(720, 1280).png().toFile(join(screenshotsDir, 'screenshot-mobile.png'));
  console.log('Created screenshot-mobile.png');

  console.log('All screenshots generated successfully!');
}

generateScreenshots().catch(console.error);
