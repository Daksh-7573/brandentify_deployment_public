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
      const data = await apiRequest('GET', '/api/referral/status', {});
      return {
        quantumCards: data.quantumCards,
        portfolios: data.portfolios,
        progress: data.progress,
      };
    },
    enabled: !!user,
  });
}

export function useReferralLink() {
  const { user } = useAuth();
  
  return useQuery<ReferralLink>({
    queryKey: ['/api/referral/generate-link'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/referral/generate-link', {});
      return {
        code: data.code,
        link: data.link,
      };
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
  
  if (isLoading || !data) {
    return {
      totalReferrals: 0,
      unlockedCards: 0,
      totalCards: 7,
      unlockedPortfolios: 0,
      totalPortfolios: 13,
      isLoading,
    };
  }
  
  return {
    totalReferrals: data.progress.totalReferrals,
    unlockedCards: data.progress.unlockedCards,
    totalCards: data.progress.totalCards,
    unlockedPortfolios: data.progress.unlockedPortfolios,
    totalPortfolios: data.progress.totalPortfolios,
    isLoading,
  };
}
