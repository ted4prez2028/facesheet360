
import { startSecureServer } from './serverSetup.js';

// Start the secure HTTPS server on port 8080
const PORT = 8080;
startSecureServer(PORT);

console.log(`Starting secure HTTPS server on port ${PORT}...`);
