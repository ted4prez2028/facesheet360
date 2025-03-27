
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory for SSL certificates (relative to project root)
const SSL_DIR = path.join(path.resolve(__dirname, '../..'), 'ssl');

/**
 * Generates self-signed certificates for local HTTPS development
 * @param {string} domain - Optional domain name to use in the certificate
 */
function generateSelfSignedCerts(domain = 'localhost') {
  console.log(`Generating self-signed certificates for domain: ${domain}`);
  
  // Create ssl directory if it doesn't exist
  if (!fs.existsSync(SSL_DIR)) {
    fs.mkdirSync(SSL_DIR, { recursive: true });
    console.log('Created ssl directory');
  }
  
  try {
    // Generate key and certificate with Subject Alternative Name (SAN)
    // This allows the certificate to work with multiple domain names
    const command = 
      'openssl req -x509 -nodes -days 365 -newkey rsa:2048 ' +
      `-keyout ${path.join(SSL_DIR, 'localhost.key')} ` +
      `-out ${path.join(SSL_DIR, 'localhost.crt')} ` +
      `-subj "/C=US/ST=State/L=City/O=HealthTrack/CN=${domain}" ` +
      `-addext "subjectAltName=DNS:${domain},DNS:localhost,IP:127.0.0.1"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('\nSelf-signed certificates generated successfully!');
    console.log(`Certificates stored in: ${SSL_DIR}`);
    console.log('\nNOTE: Since these are self-signed certificates, browsers will show a security warning.');
    console.log('You will need to accept this warning to access your development server.');
  } catch (error) {
    console.error('Failed to generate certificates:', error);
    console.log('\nMake sure OpenSSL is installed on your system.');
    process.exit(1);
  }
}

// Get domain name from command line arguments or use default
const domainArg = process.argv[2];
generateSelfSignedCerts(domainArg || 'facesheet360.com');

