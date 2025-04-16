
import { startSecureServer } from './serverSetup';

// Start the secure HTTPS server on port 443
// Note: Running on port 443 typically requires root/admin privileges
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 443;
startSecureServer(PORT);

console.log(`Starting secure HTTPS server on port ${PORT}...`);
