
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { Server } from 'http';

/**
 * Sets up and starts an HTTPS server for the health tracking application
 * @param port The port to run the server on
 */
export const startSecureServer = (port: number = 443): void => {
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
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', secure: true });
  });
  
  // Check if SSL certificates exist - exit if not available
  const keyPath = path.join(process.cwd(), 'localhost-key.pem');
  const certPath = path.join(process.cwd(), 'localhost.pem');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('SSL certificates not found!');
    console.log(`Please ensure ${keyPath} and ${certPath} exist`);
    process.exit(1);
  }
  
  // Create HTTPS server with SSL certificates
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  
  const server = https.createServer(httpsOptions, app);
  
  // Start the server
  server.listen(port, () => {
    console.log(`Secure HTTPS server running on port ${port}`);
    console.log(`Access at https://localhost${port === 443 ? '' : ':' + port}`);
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
