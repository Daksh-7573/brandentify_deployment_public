import { useQuery } from "@tanstack/react-query";
import PublicProfile from "./public-profile";
import BrandProfile from "./brand-profile";
import { SearchPageSkeleton } from "@/components/ui/page-skeletons/search-skeleton";

interface UserData {
  id: number;
  username: string;
  brandName: string | null;
  [key: string]: any;
}

interface ProfileResolverProps {
  identifier: string;
}

export default function ProfileResolver({ identifier }: ProfileResolverProps) {
  console.log(`[ProfileResolver] Resolving profile for identifier: ${identifier}`);

  // Fetch user data using the combined brand/username lookup endpoint
  // Use the default queryFn which properly parses JSON (don't use apiRequest here as it returns Response, not JSON)
  const { data: userData, isLoading, error } = useQuery<UserData | null>({
    queryKey: [`/api/users/brand/${identifier}`],
    enabled: !!identifier
  });

  if (isLoading) {
    return <SearchPageSkeleton />;
  }

  if (error || !userData) {
    console.log(`[ProfileResolver] User not found for identifier: ${identifier}`);
    // Return PublicProfile with the identifier - it will show a 404 page
    return <PublicProfile username={identifier} />;
  }

  // Normalize both values for comparison (lowercase, trim whitespace, replace spaces with hyphens)
  const normalizedIdentifier = identifier.toLowerCase().trim().replace(/\s+/g, '-');
  const normalizedBrandName = userData.brandName?.toLowerCase().trim().replace(/\s+/g, '-');

  console.log(`[ProfileResolver] Comparing identifier: "${normalizedIdentifier}" with brandName: "${normalizedBrandName}"`);

  // If the identifier matches the user's brand name, show BrandProfile
  // Otherwise show PublicProfile
  if (normalizedBrandName && normalizedIdentifier === normalizedBrandName) {
    console.log(`[ProfileResolver] Identifier matches brand name - rendering BrandProfile with full userData`);
    // Pass the full userData to avoid refetch and ensure branding fields are available immediately
    return <BrandProfile brandName={identifier} initialUserData={userData as any} />;
  }

  console.log(`[ProfileResolver] Identifier matches username - rendering PublicProfile`);
  return <PublicProfile username={identifier} />;
}
