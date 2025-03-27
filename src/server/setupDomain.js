
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Domain configuration
const DOMAIN = 'facesheet360.com';
const SSL_DIR = path.join(path.resolve(__dirname, '../..'), 'ssl');

function checkCertificates() {
  const keyPath = path.join(SSL_DIR, 'localhost.key');
  const certPath = path.join(SSL_DIR, 'localhost.crt');
  
  // If certificates don't exist, generate them
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('SSL certificates not found. Generating new ones...');
    generateCertificates();
    return;
  }
  
  console.log('SSL certificates found.');
  console.log(`You can now access your application at https://${DOMAIN}:8080`);
  console.log('NOTE: You will need to accept the security warning in your browser.');
}

function generateCertificates() {
  try {
    // Run the generateCerts.js script with the domain as parameter
    execSync(`node ${path.join(__dirname, 'generateCerts.js')} ${DOMAIN}`, {
      stdio: 'inherit'
    });
    
    console.log(`\nYou can now access your application at https://${DOMAIN}:8080`);
  } catch (error) {
    console.error('Failed to generate certificates:', error);
    process.exit(1);
  }
}

// Run the check
checkCertificates();
