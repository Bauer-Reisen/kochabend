// Erzeugt docs/icons/qr.svg – QR-Code mit der Adresse der App (für „App teilen" unter Mehr).
// Nur neu ausführen, wenn sich die Adresse ändert: node scripts/make-qr.js
import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';

const URL = 'https://bauer-reisen.github.io/kochabend/';
const svg = await QRCode.toString(URL, { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#2b2118', light: '#ffffff' } });
await writeFile(new globalThis.URL('../docs/icons/qr.svg', import.meta.url), svg);
console.log('QR-Code geschrieben:', URL);
