
import { startSecureServer } from './serverSetup';

// Start the secure server on the specified port
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 443;
startSecureServer(PORT);

console.log(`Starting secure server on port ${PORT}...`);
