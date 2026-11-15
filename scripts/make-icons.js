// Erzeugt die App-Icons als PNG (ohne Zusatzpakete). Aufruf: node scripts/make-icons.js
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0xf6, 0xf0, 0xe4];
const FG = [0xb5, 0x53, 0x2f];

// Form im 512er-Raster: Teller mit Rand, links Gabel, rechts Messer
function isFg(x, y) {
  const d = Math.hypot(x - 256, y - 256);
  if (d >= 120 && d <= 140) return true;      // Tellerrand
  if (d >= 84 && d <= 92) return true;        // innerer Ring
  // Gabel links (x 70..106)
  if (y >= 120 && y <= 200 && [72, 88, 104].some((cx) => Math.abs(x - cx) <= 5)) return true;
  if (y >= 196 && y <= 214 && x >= 67 && x <= 109) return true;
  if (y >= 210 && y <= 396 && Math.abs(x - 88) <= 8) return true;
  // Messer rechts (x 410..440)
  if (y >= 120 && y <= 396) {
    if (Math.abs(x - 424) <= 8 && y >= 250) return true;
    if (y < 250 && x >= 416 && x <= 416 + 22 * Math.sin(Math.PI * (y - 120) / 260) + 10) return true;
  }
  return false;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, padding = 0) {
  const SS = 3; // Kantenglättung
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const scale = (512 + 2 * padding) / size;
  for (let py = 0; py < size; py++) {
    raw[py * (size * 3 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (px + (sx + 0.5) / SS) * scale - padding;
        const y = (py + (sy + 0.5) / SS) * scale - padding;
        if (isFg(x, y)) hits++;
      }
      const a = hits / (SS * SS);
      const o = py * (size * 3 + 1) + 1 + px * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(BG[i] * (1 - a) + FG[i] * a);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = new URL('../docs/icons/', import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(new URL('apple-touch-icon.png', dir), png(180));
writeFileSync(new URL('icon-192.png', dir), png(192));
writeFileSync(new URL('icon-512.png', dir), png(512));
writeFileSync(new URL('icon-maskable-512.png', dir), png(512, 80)); // mit Rand für Android-Formen
console.log('Icons erstellt in docs/icons/');
