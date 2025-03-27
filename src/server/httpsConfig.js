
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
    
    // In development, we can use self-signed certificates
    // In production, you should use proper SSL certificates from a certificate authority
    const sslOptions = {
      key: fs.readFileSync(path.join(process.cwd(), isProduction ? 'ssl/private.key' : 'ssl/localhost.key')),
      cert: fs.readFileSync(path.join(process.cwd(), isProduction ? 'ssl/certificate.crt' : 'ssl/localhost.crt')),
    };
    
    // Create and return the HTTPS server
    console.log('HTTPS server configured successfully');
    return https.createServer(sslOptions, app);
  } catch (error) {
    console.error('Failed to set up HTTPS server:', error);
    throw new Error('HTTPS configuration failed. Make sure SSL certificates exist in the ssl directory.');
  }
};

/**
 * Generates instructions for creating self-signed certificates for development
 * @returns Instructions string
 */
export const getSslSetupInstructions = () => {
  return `
To generate self-signed certificates for local development:

1. Create an ssl directory in your project root:
   mkdir -p ssl

2. Generate a self-signed certificate using OpenSSL:
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/localhost.key -out ssl/localhost.crt

3. When prompted, use "localhost" for the Common Name field.

For production, replace these with certificates from a trusted certificate authority.
`;
};

/**
 * Checks if SSL certificates exist in the expected location
 * @returns boolean indicating if certificates exist
 */
export const checkSslCertificates = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const keyPath = path.join(process.cwd(), isProduction ? 'ssl/private.key' : 'ssl/localhost.key');
  const certPath = path.join(process.cwd(), isProduction ? 'ssl/certificate.crt' : 'ssl/localhost.crt');
  
  return fs.existsSync(keyPath) && fs.existsSync(certPath);
};
