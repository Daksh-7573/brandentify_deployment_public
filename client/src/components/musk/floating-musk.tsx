import React from 'react';
import MuskButton from '@/components/musk/musk-button';
import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';

export default function FloatingMusk() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  return (
    <MuskButton
      context={{
        page: location,
        userId: user?.id || 1, // Use authenticated user ID when available
      }}
    />
  );
}