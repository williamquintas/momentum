import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const iconsDir = join(process.cwd(), 'public', 'icons');

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#1890ff"/>
  <path d="M256 128c-70.7 0-128 57.3-128 128v128h256V256c0-70.7-57.3-128-128-128z" fill="white"/>
  <circle cx="256" cy="256" r="48" fill="#1890ff"/>
  <path d="M128 256c0-70.7 57.3-128 128-128h128v128H256c-70.7 0-128-57.3-128-128z" fill="white" opacity="0.5"/>
</svg>`;

async function generateIcons() {
  console.log('Generating PNG icons...');

  await sharp(Buffer.from(svgContent)).resize(192, 192).png().toFile(join(iconsDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  await sharp(Buffer.from(svgContent)).resize(512, 512).png().toFile(join(iconsDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  await sharp(Buffer.from(svgContent)).resize(180, 180).png().toFile(join(iconsDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  await sharp(Buffer.from(svgContent)).resize(1024, 1024).png().toFile(join(iconsDir, 'icon-1024.png'));
  console.log('Created icon-1024.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
