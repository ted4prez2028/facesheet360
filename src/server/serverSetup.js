
import express from 'express';
import cors from 'cors';
import { setupHttps, checkSslCertificates, getSslSetupInstructions } from './httpsConfig.js';

/**
 * Sets up and starts an HTTPS server for the health tracking application
 * @param port The port to run the server on
 */
export const startSecureServer = (port = 443) => {
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors({
    origin: [
      'https://facesheet360.com',
      'https://facesheet360.com:443',
      'https://localhost',
      'https://localhost:443'
    ],
    credentials: true
  }));
  app.use(express.json());
  
  // Add basic route for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', secure: true, domain: 'facesheet360.com' });
  });
  
  // Check if SSL certificates exist - exit if not available
  if (!checkSslCertificates()) {
    console.error('SSL certificates not found!');
    console.log(getSslSetupInstructions());
    process.exit(1);
  }
  
  // Create HTTPS server
  const server = setupHttps(app);
  
  // Start the server
  server.listen(port, () => {
    console.log(`Secure HTTPS server running on port ${port}`);
    console.log(`You can access it at https://localhost${port === 443 ? '' : ':' + port}`);
    console.log(`Or at https://facesheet360.com${port === 443 ? '' : ':' + port}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down server');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};
