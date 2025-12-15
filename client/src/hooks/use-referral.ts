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
      const data = await apiRequest('GET', '/api/referral/status', {}) as ReferralStatus;
      return data;
    },
    enabled: !!user,
  });
}

export function useReferralLink() {
  const { user } = useAuth();
  
  return useQuery<ReferralLink>({
    queryKey: ['/api/referral/generate-link'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/referral/generate-link', {}) as ReferralLink;
      return data;
    },
    enabled: !!user,
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
