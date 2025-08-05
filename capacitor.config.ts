import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.33c9bb3a541847b495989cd6b1504505',
  appName: 'facesheet360',
  webDir: 'dist',
  server: {
    url: 'https://33c9bb3a-5418-47b4-9598-9cd6b1504505.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;