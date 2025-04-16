
import { startSecureServer } from './serverSetup';

// Start the secure HTTPS server on port 8080
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
startSecureServer(PORT);

console.log(`Starting secure HTTPS server on port ${PORT}...`);
