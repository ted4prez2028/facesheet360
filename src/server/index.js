
import { startSecureServer } from './serverSetup.js';

// Start the secure HTTPS server on port 443
const PORT = 443;
startSecureServer(PORT);

console.log(`Starting secure HTTPS server on port ${PORT}...`);
