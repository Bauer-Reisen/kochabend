// Feste Einstellungen der App. Hier steht nichts Geheimes.
export const VERSION = '0.1.1';

// Adresse des Workers (die Tür zu den geteilten Daten).
// Beim Testen am PC läuft er lokal, sonst bei Cloudflare.
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
export const API = LOCAL ? 'http://localhost:8787' : 'https://kochabend.film-app.workers.dev';

export const APP_NAME = 'In 80 Küchen um die Welt';
export const SHORT_NAME = '80 Küchen';
