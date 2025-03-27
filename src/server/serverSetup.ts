
import express from 'express';
import cors from 'cors';
import { setupHttps, checkSslCertificates, getSslSetupInstructions } from './httpsConfig';

/**
 * Sets up and starts an HTTPS server for the health tracking application
 * @param port The port to run the server on
 */
export const startSecureServer = (port: number = 8443): void => {
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors());
  app.use(express.json());
  
  // Add basic route for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', secure: true });
  });
  
  // Check if SSL certificates exist
  if (!checkSslCertificates()) {
    console.error('SSL certificates not found!');
    console.log(getSslSetupInstructions());
    process.exit(1);
  }
  
  // Create HTTPS server
  const server = setupHttps(app);
  
  // Start the server
  server.listen(port, () => {
    console.log(`Secure server running on https://localhost:${port}`);
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
