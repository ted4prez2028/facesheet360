
import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Configures HTTPS for the server using SSL certificates
 * 
 * @param app The Express app or HTTP server to secure
 * @returns An HTTPS server instance
 */
export const setupHttps = (app) => {
  try {
    // Check if running in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Use the localhost certificate files
    const keyPath = path.join(process.cwd(), 'localhost-key.pem');
    const certPath = path.join(process.cwd(), 'localhost.pem');
    
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      throw new Error('SSL certificates not found at the expected paths.');
    }
    
    const sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    
    // Create and return the HTTPS server
    console.log('HTTPS server configured successfully with localhost certificates');
    return https.createServer(sslOptions, app);
  } catch (error) {
    console.error('Failed to set up HTTPS server:', error);
    throw new Error('HTTPS configuration failed. Make sure localhost-key.pem and localhost.pem exist in the project root directory.');
  }
};

/**
 * Generates instructions for using the provided certificates
 * @returns Instructions string
 */
export const getSslSetupInstructions = () => {
  return `
To use the provided certificates:

1. Ensure that localhost-key.pem and localhost.pem files are in the project root directory.
2. Make sure the certificates are properly formatted and valid.
3. For local development, you might need to add these certificates to your trusted certificates.

For production, ensure these certificates are from a trusted certificate authority.
`;
};

/**
 * Checks if SSL certificates exist in the expected location
 * @returns boolean indicating if certificates exist
 */
export const checkSslCertificates = () => {
  const keyPath = path.join(process.cwd(), 'localhost-key.pem');
  const certPath = path.join(process.cwd(), 'localhost.pem');
  
  return fs.existsSync(keyPath) && fs.existsSync(certPath);
};
