
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directory for SSL certificates
const SSL_DIR = path.join(process.cwd(), 'ssl');

/**
 * Generates self-signed certificates for local HTTPS development
 */
function generateSelfSignedCerts() {
  console.log('Generating self-signed certificates for local development...');
  
  // Create ssl directory if it doesn't exist
  if (!fs.existsSync(SSL_DIR)) {
    fs.mkdirSync(SSL_DIR, { recursive: true });
    console.log('Created ssl directory');
  }
  
  try {
    // Generate key and certificate
    execSync(
      'openssl req -x509 -nodes -days 365 -newkey rsa:2048 ' +
      `-keyout ${path.join(SSL_DIR, 'localhost.key')} ` +
      `-out ${path.join(SSL_DIR, 'localhost.crt')} ` +
      '-subj "/C=US/ST=State/L=City/O=HealthTrack/CN=localhost"',
      { stdio: 'inherit' }
    );
    
    console.log('\nSelf-signed certificates generated successfully!');
    console.log(`Certificates stored in: ${SSL_DIR}`);
    console.log('\nNOTE: Since these are self-signed certificates, browsers will show a security warning.');
    console.log('You will need to accept this warning to access your local development server.');
  } catch (error) {
    console.error('Failed to generate certificates:', error);
    console.log('\nMake sure OpenSSL is installed on your system.');
    process.exit(1);
  }
}

// Run the certificate generation
generateSelfSignedCerts();
