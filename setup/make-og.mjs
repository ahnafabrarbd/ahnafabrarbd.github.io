// Build the 1200x630 Open Graph share card from a brand SVG (off-white ground,
// forest-green accent). Build-time only; literals allowed (not shipped CSS).
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#F8F6F2"/>
  <rect x="0" y="0" width="1200" height="10" fill="#1A3828"/>
  <text x="100" y="305" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700" letter-spacing="4" fill="#111111">RIZVI FASHIONS</text>
  <line x1="104" y1="350" x2="380" y2="350" stroke="#1A3828" stroke-width="3"/>
  <text x="104" y="408" font-family="Arial, Helvetica, sans-serif" font-size="30" letter-spacing="3" fill="#646B5E">100% EXPORT-ORIENTED APPAREL MANUFACTURING</text>
  <text x="104" y="560" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="4" fill="#1A3828">RIZVI FASHIONS LIMITED</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('og.png written (1200x630)');
