import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Component that previously showed a special alert on the problematic domain
 * This component has been disabled as per user request and will not display any alert
 */
export function DomainAuthAlert() {
  // Always return null - component has been disabled per user request
  return null;
}