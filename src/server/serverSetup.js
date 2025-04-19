
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import path from 'path';

/**
 * Sets up and starts an HTTPS server for the health tracking application
 * @param port The port to run the server on
 */
export const startSecureServer = (port = 8080) => {
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors({
    origin: [
      'https://facesheet360.com',
      'https://facesheet360.com:8080',
      'https://localhost',
      'https://localhost:8080'
    ],
    credentials: true
  }));
  app.use(express.json());
  
  // Add basic route for testing
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', secure: true, domain: 'facesheet360.com' });
  });
  
  // Check if SSL certificates exist
  const certsExist = checkSslCertificates();
  
  if (!certsExist) {
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

/**
 * Sets up an HTTPS server with SSL certificates
 * @param app Express app instance
 * @returns HTTPS server instance
 */
export const setupHttps = (app) => {
  try {
    const keyPath = path.join(process.cwd(), 'localhost-key.pem');
    const certPath = path.join(process.cwd(), 'localhost.pem');
    
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    return https.createServer(httpsOptions, app);
  } catch (error) {
    console.error('Error setting up HTTPS server:', error);
    process.exit(1);
  }
};

/**
 * Checks if SSL certificates exist
 * @returns Boolean indicating if certificates exist
 */
export const checkSslCertificates = () => {
  try {
    const keyPath = path.join(process.cwd(), 'localhost-key.pem');
    const certPath = path.join(process.cwd(), 'localhost.pem');
    return fs.existsSync(keyPath) && fs.existsSync(certPath);
  } catch (error) {
    return false;
  }
};

/**
 * Returns instructions for setting up SSL certificates
 * @returns String with setup instructions
 */
export const getSslSetupInstructions = () => {
  return `
To set up SSL certificates for local development:

1. Install mkcert (https://github.com/FiloSottile/mkcert)
2. Run the following commands:
   - mkcert -install
   - mkcert localhost
3. Move the generated files to your project root:
   - localhost.pem
   - localhost-key.pem
  `;
};
