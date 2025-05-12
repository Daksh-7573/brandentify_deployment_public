/**
 * Helper component to display the current domain for Firebase setup
 */

import { useEffect } from 'react';

export function DomainHelper() {
  useEffect(() => {
    const currentDomain = window.location.hostname;
    
    console.log("%c ⚠️ FIREBASE DOMAIN SETUP INFORMATION ⚠️ ", "background: #ff0000; color: white; font-size: 16px; font-weight: bold; padding: 4px;");
    console.log("%c Add these domains to Firebase Auth > Settings > Authorized domains: ", "background: #333; color: white; font-size: 14px; padding: 4px;");
    console.log("%c 1. " + currentDomain + " ", "background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
    console.log("%c 2. " + currentDomain + ".replit.app ", "background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
    console.log("%c 3. *.replit.dev ", "background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
    console.log("%c 4. *.replit.app ", "background: #007bff; color: white; font-size: 14px; font-weight: bold; padding: 4px;");
  }, []);

  return null; // This component doesn't render anything
}