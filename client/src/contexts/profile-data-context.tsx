import { createContext, useContext, ReactNode } from "react";
import { useProfileComplete, ProfileCompleteData } from "@/hooks/use-profile-complete";

interface ProfileDataContextValue {
  data: ProfileCompleteData | undefined;
  isLoading: boolean;
  isError: boolean;
  userId: string | number | undefined;
}

const ProfileDataContext = createContext<ProfileDataContextValue | null>(null);

interface ProfileDataProviderProps {
  userId: string | number | undefined;
  children: ReactNode;
}

export function ProfileDataProvider({ userId, children }: ProfileDataProviderProps) {
  const { data, isLoading, isError } = useProfileComplete(userId);
  
  return (
    <ProfileDataContext.Provider value={{ data, isLoading, isError, userId }}>
      {children}
    </ProfileDataContext.Provider>
  );
}

export function useProfileDataContext() {
  return useContext(ProfileDataContext);
}

export function useProfileSkills() {
  const context = useProfileDataContext();
  if (context !== null) {
    return {
      data: context.data?.skills,
      isLoading: context.isLoading,
      isFromBatch: true,
      isError: context.isError
    };
  }
  return { data: undefined, isLoading: false, isFromBatch: false, isError: false };
}

export function useProfileExperiences() {
  const context = useProfileDataContext();
  if (context !== null) {
    return {
      data: context.data?.experiences,
      isLoading: context.isLoading,
      isFromBatch: true,
      isError: context.isError
    };
  }
  return { data: undefined, isLoading: false, isFromBatch: false, isError: false };
}

export function useProfileEducations() {
  const context = useProfileDataContext();
  if (context !== null) {
    return {
      data: context.data?.educations,
      isLoading: context.isLoading,
      isFromBatch: true,
      isError: context.isError
    };
  }
  return { data: undefined, isLoading: false, isFromBatch: false, isError: false };
}

export function useProfileProjects() {
  const context = useProfileDataContext();
  if (context !== null) {
    return {
      data: context.data?.projects,
      isLoading: context.isLoading,
      isFromBatch: true,
      isError: context.isError
    };
  }
  return { data: undefined, isLoading: false, isFromBatch: false, isError: false };
}

export function useProfileServices() {
  const context = useProfileDataContext();
  if (context !== null) {
    return {
      data: context.data?.services,
      isLoading: context.isLoading,
      isFromBatch: true,
      isError: context.isError
    };
  }
  return { data: undefined, isLoading: false, isFromBatch: false, isError: false };
}
