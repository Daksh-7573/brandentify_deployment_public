import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";

interface ReferralStatus {
  quantumCards: Array<{
    id: string;
    name: string;
    locked: boolean;
  }>;
  portfolios: Array<{
    id: string;
    name: string;
    locked: boolean;
  }>;
  progress: {
    totalReferrals: number;
    unlockedCards: number;
    totalCards: number;
    unlockedPortfolios: number;
    totalPortfolios: number;
  };
}

interface ReferralLink {
  code: string;
  link: string;
}

export function useReferralStatus() {
  const { user } = useAuth();
  
  return useQuery<ReferralStatus>({
    queryKey: ['/api/referral/status'],
    queryFn: async () => {
      try {
        console.log('[useReferralStatus] Fetching referral status...');
        const response = await apiRequest('GET', '/api/referral/status', {});
        console.log('[useReferralStatus] Response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useReferralStatus] Error response:', errorText);
          throw new Error(`Failed to fetch referral status: ${response.status}`);
        }
        
        const data = await response.json() as ReferralStatus;
        console.log('[useReferralStatus] Received data:', data);
        return data;
      } catch (error) {
        console.error('[useReferralStatus] Error:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useReferralLink() {
  const { user } = useAuth();
  
  return useQuery<ReferralLink>({
    queryKey: ['/api/referral/generate-link'],
    queryFn: async () => {
      try {
        console.log('[useReferralLink] Fetching referral link...');
        const response = await apiRequest('GET', '/api/referral/generate-link', {});
        console.log('[useReferralLink] Response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useReferralLink] Error response:', errorText);
          throw new Error(`Failed to fetch referral link: ${response.status}`);
        }
        
        const data = await response.json() as ReferralLink;
        console.log('[useReferralLink] Received data:', data);
        return data;
      } catch (error) {
        console.error('[useReferralLink] Error:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useInitializeUnlocks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/referral/initialize-unlocks', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referral/status'] });
    },
  });
}

export function useReferralStats() {
  const { data, isLoading } = useReferralStatus();
  const queryClient = useQueryClient();
  
  const invalidateStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/referral/status'] });
  };
  
  // Always return current data if available, with proper fallback structure
  return {
    totalReferrals: data?.progress?.totalReferrals ?? 0,
    unlockedCards: data?.progress?.unlockedCards ?? 0,
    totalCards: data?.progress?.totalCards ?? 12,
    unlockedPortfolios: data?.progress?.unlockedPortfolios ?? 0,
    totalPortfolios: data?.progress?.totalPortfolios ?? 23,
    isLoading,
    invalidateStatus,
  };
}
