/**
 * Unified Profile Page
 * 
 * This page demonstrates the enhanced data fetching approach that
 * gets all user profile data in a single API request.
 */

import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { UnifiedProfileView } from '@/components/profile/unified-profile-view';
import { ArrowLeft } from 'lucide-react';

export default function UnifiedProfilePage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Unified Profile</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Info Card */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">About This Page</h2>
          <p className="text-muted-foreground mb-4">
            This page demonstrates the new unified data fetching approach that retrieves all user profile 
            data (including work experiences, education, skills, projects, and services) in a single API request,
            improving performance and maintaining data consistency across the application.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md bg-muted p-4">
              <h3 className="text-sm font-medium mb-2">Benefits</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Reduced API calls (from 6+ to just 1)</li>
                <li>Consistent data across all views</li>
                <li>Better performance for users</li>
                <li>Simplified state management</li>
                <li>Reduced error handling complexity</li>
              </ul>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h3 className="text-sm font-medium mb-2">Implementation Details</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Uses new <code>/api/users/:userId/profile</code> endpoint</li>
                <li>Comprehensive data model with all related entities</li>
                <li>Parallel database queries for optimal performance</li>
                <li>TypeScript interfaces for type safety</li>
                <li>React Query for caching and synchronization</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* User ID Selection */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">View User Profile</h2>
          <p className="text-muted-foreground mb-4">
            The profile below shows data for User ID 1. You can also view profiles for other users.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/unified-profile/1">
              <Button variant={location.pathname === '/unified-profile' || location.pathname === '/unified-profile/1' ? 'default' : 'outline'}>
                User ID: 1
              </Button>
            </Link>
            <Link href="/unified-profile/2">
              <Button variant={location.pathname === '/unified-profile/2' ? 'default' : 'outline'}>
                User ID: 2
              </Button>
            </Link>
          </div>
        </div>
        
        {/* The Unified Profile Component */}
        <UnifiedProfileView />
      </div>
    </div>
  );
}