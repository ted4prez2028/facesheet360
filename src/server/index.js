
import { startSecureServer } from './serverSetup.js';

// Start the secure server on port 443
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 443;
startSecureServer(PORT);

console.log(`Starting secure server on port ${PORT}...`);
