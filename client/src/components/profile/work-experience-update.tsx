import { INDUSTRIES, INDUSTRY_DOMAINS } from "@/pages/profile-neo";
import { popularLocations } from "@/data/locations";

// Create a small update file with just the necessary functions that need to be added
// Create options with unique keys
const locationOptions = popularLocations.map((location, index) => ({
  value: location,
  label: location,
  key: `location-${index}`,
}));

const industryOptions = INDUSTRIES.map((industry, index) => ({
  value: industry,
  label: industry,
  key: `industry-${index}`,
}));

// Function to create domain options with unique keys
const getDomainOptionsForIndustry = (industry) => {
  if (!industry || !INDUSTRY_DOMAINS[industry]) return [];
  return INDUSTRY_DOMAINS[industry].map((domain, index) => ({
    value: domain,
    label: domain,
    key: `${industry}-domain-${index}`,
  }));
};
