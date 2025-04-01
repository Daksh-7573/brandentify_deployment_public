import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, UserPlus, Users, Star, MapPin, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";

// Define industries for dropdown
const INDUSTRIES = [
  "IT & Software",
  "Marketing & Advertising",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Real Estate",
  "Hospitality",
  "Transportation & Logistics",
  "Agriculture",
  "Energy & Utilities",
  "Construction",
  "Legal Services"
];

// Define domain expertise for each industry
const DOMAIN_EXPERTISE = {
  "IT & Software": [
    "UI/UX Design",
    "Software Development",
    "AI/ML Development",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "Data Science",
    "Blockchain",
    "Mobile App Development",
    "Quality Assurance"
  ],
  "Marketing & Advertising": [
    "Digital Marketing",
    "Content & Copywriting",
    "Brand Management",
    "Market Research",
    "SEO/SEM",
    "Social Media Marketing",
    "Email Marketing",
    "Creative Services",
    "Public Relations",
    "Event Marketing"
  ],
  "Finance & Banking": [
    "Investment Banking",
    "Financial Analysis",
    "Risk Management",
    "Accounting",
    "Wealth Management",
    "Corporate Finance",
    "Insurance",
    "Fintech",
    "Cryptocurrency",
    "Regulatory Compliance"
  ],
  "Healthcare": [
    "Medical Practice",
    "Healthcare Administration",
    "Pharmaceuticals",
    "Medical Research",
    "Mental Health",
    "Public Health",
    "Health Informatics",
    "Biotechnology",
    "Nursing",
    "Healthcare Policy"
  ],
  "Education": [
    "K-12 Education",
    "Higher Education",
    "Educational Technology",
    "Curriculum Development",
    "Special Education",
    "Educational Administration",
    "Adult Education",
    "Early Childhood Education",
    "STEM Education",
    "Language Education"
  ]
};

// Define experience levels
const EXPERIENCE_LEVELS = [
  "Fresher",
  "Student",
  "Junior",
  "Mid-Level",
  "Senior",
  "Director",
  "Executive",
  "Consultant"
];

// Define "I am looking for" categories
const LOOKING_FOR_OPTIONS = [
  // Career & Job Seeking category
  { value: "job_opportunities", label: "💼 Job Opportunities" },
  { value: "job_seekers", label: "💼 Job Seekers / Candidates" },
  { value: "internships", label: "💼 Internships" },
  { value: "interns", label: "💼 Interns" },
  { value: "mentors", label: "💼 Career Mentors" },
  { value: "mentees", label: "💼 Career Mentees" },
  
  // Business & Investment category  
  { value: "investors", label: "🚀 Investors" },
  { value: "startups", label: "🚀 Startups" },
  { value: "co_founders", label: "🚀 Co-Founders" },
  { value: "business_partners", label: "🚀 Business Partners" },
  { value: "advisors", label: "🚀 Legal/Financial Advisors" },
  { value: "tech_partners", label: "🚀 Technical Partners" },
  
  // Learning & Upskilling category
  { value: "skill_trainers", label: "🎓 Skill Trainers" },
  { value: "learners", label: "🎓 Students/Learners" },
  { value: "study_groups", label: "🎓 Study Groups" },
  
  // Networking & Collaborations category
  { value: "industry_experts", label: "🤝 Industry Experts" },
  { value: "share_expertise", label: "🤝 Sharing My Expertise" },
  
  // Freelance & Side Hustle category
  { value: "freelance_gigs", label: "💰 Freelance Gigs" },
  { value: "hiring_freelancers", label: "💰 Hiring Freelancers" },
];

// Popular locations for suggestions
const popularLocations = [
    // North America - USA
    "New York, NY, USA",
    "San Francisco, CA, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Seattle, WA, USA",
    "Austin, TX, USA",
    "Boston, MA, USA",
    "Denver, CO, USA",
    "Atlanta, GA, USA",
    "Portland, OR, USA",
    "Washington, DC, USA",
    "San Diego, CA, USA",
    "Miami, FL, USA",
    "Dallas, TX, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "Philadelphia, PA, USA",
    "Las Vegas, NV, USA",
    "Detroit, MI, USA",
    "Minneapolis, MN, USA",
    "Nashville, TN, USA",
    "Charlotte, NC, USA",
    "Raleigh, NC, USA",
    "Indianapolis, IN, USA",
    "Columbus, OH, USA",
    "Cleveland, OH, USA",
    "Pittsburgh, PA, USA",
    "Kansas City, MO, USA",
    "St. Louis, MO, USA",
    "Salt Lake City, UT, USA",
    "Orlando, FL, USA",
    "Tampa, FL, USA",
    "New Orleans, LA, USA",
    "Honolulu, HI, USA",
    "Anchorage, AK, USA",
    "San Jose, CA, USA",
    "Sacramento, CA, USA",
    "Oakland, CA, USA",
    "Cincinnati, OH, USA",
    "Buffalo, NY, USA",
    "Baltimore, MD, USA",
    "San Antonio, TX, USA",
    "Milwaukee, WI, USA",
    "Albuquerque, NM, USA",
    "Tucson, AZ, USA",
    "Fresno, CA, USA",
    "Long Beach, CA, USA",
    "Omaha, NE, USA",
    "Oklahoma City, OK, USA",
    "Louisville, KY, USA",
    "Memphis, TN, USA",
    "Tulsa, OK, USA",
    "Fort Worth, TX, USA",
    "El Paso, TX, USA",
    "Wichita, KS, USA",
    "Boise, ID, USA",
    "Richmond, VA, USA",
    "Spokane, WA, USA",
    "Des Moines, IA, USA",
    "Birmingham, AL, USA",
    "Baton Rouge, LA, USA",
    "Little Rock, AR, USA",
    "Charleston, SC, USA",
    "Savannah, GA, USA",
    "Madison, WI, USA",
    "Providence, RI, USA",
    "Hartford, CT, USA",
    "Wilmington, DE, USA",
    "Fargo, ND, USA",
    "Eugene, OR, USA",
    "Santa Fe, NM, USA",
    "Jackson, MS, USA",
    "Boulder, CO, USA",
    "Asheville, NC, USA",
    
    // North America - Canada
    "Toronto, ON, Canada",
    "Montreal, QC, Canada",
    "Vancouver, BC, Canada",
    "Calgary, AB, Canada",
    "Ottawa, ON, Canada",
    "Edmonton, AB, Canada",
    "Quebec City, QC, Canada",
    "Winnipeg, MB, Canada",
    "Halifax, NS, Canada",
    "Victoria, BC, Canada",
    "Mississauga, Canada",
    "Hamilton, Canada",
    "Kitchener, Canada",
    "London, ON, Canada",
    "Markham, Canada",
    "Vaughan, Canada",
    "Burlington, Canada",
    "Oakville, Canada",
    "Richmond Hill, Canada",
    "Mexico City, Mexico",
    "Guadalajara, Mexico",
    "Monterrey, Mexico",
    "Cancun, Mexico",
    "Tijuana, Mexico",
    
    // Europe
    "London, UK",
    "Manchester, UK",
    "Edinburgh, UK",
    "Glasgow, UK",
    "Birmingham, UK",
    "Liverpool, UK",
    "Bristol, UK",
    "Leeds, UK",
    "Cardiff, UK",
    "Dublin, Ireland",
    "Cork, Ireland",
    "Galway, Ireland",
    "Paris, France",
    "Lyon, France",
    "Nice, France",
    "Marseille, France",
    "Bordeaux, France",
    "Toulouse, France",
    "Strasbourg, France",
    "Berlin, Germany",
    "Munich, Germany",
    "Hamburg, Germany",
    "Cologne, Germany",
    "Frankfurt, Germany",
    "Stuttgart, Germany",
    "Düsseldorf, Germany",
    "Dresden, Germany",
    "Leipzig, Germany",
    "Amsterdam, Netherlands",
    "Rotterdam, Netherlands",
    "Utrecht, Netherlands",
    "The Hague, Netherlands",
    "Eindhoven, Netherlands",
    "Madrid, Spain",
    "Barcelona, Spain",
    "Valencia, Spain",
    "Seville, Spain",
    "Malaga, Spain",
    "Bilbao, Spain",
    "Alicante, Spain",
    "Palma de Mallorca, Spain",
    "Rome, Italy",
    "Milan, Italy",
    "Naples, Italy",
    "Turin, Italy",
    "Florence, Italy",
    "Bologna, Italy",
    "Venice, Italy",
    "Genoa, Italy",
    "Palermo, Italy",
    "Verona, Italy",
    "Brussels, Belgium",
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Bruges, Belgium",
    "Liège, Belgium",
    "Zurich, Switzerland",
    "Geneva, Switzerland",
    "Basel, Switzerland",
    "Bern, Switzerland",
    "Lausanne, Switzerland",
    "Vienna, Austria",
    "Salzburg, Austria",
    "Innsbruck, Austria",
    "Graz, Austria",
    "Linz, Austria",
    "Stockholm, Sweden",
    "Gothenburg, Sweden",
    "Malmö, Sweden",
    "Uppsala, Sweden",
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    "Odense, Denmark",
    "Oslo, Norway",
    "Bergen, Norway",
    "Trondheim, Norway",
    "Helsinki, Finland",
    "Tampere, Finland",
    "Turku, Finland",
    "Reykjavik, Iceland",
    "Lisbon, Portugal",
    "Porto, Portugal",
    "Faro, Portugal",
    "Athens, Greece",
    "Thessaloniki, Greece",
    "Heraklion, Greece",
    "Prague, Czech Republic",
    "Brno, Czech Republic",
    "Budapest, Hungary",
    "Warsaw, Poland",
    "Krakow, Poland",
    "Wroclaw, Poland",
    "Gdansk, Poland",
    "Moscow, Russia",
    "St. Petersburg, Russia",
    "Kazan, Russia",
    "Istanbul, Turkey",
    "Ankara, Turkey",
    "Antalya, Turkey",
    "Izmir, Turkey",
    "Tallinn, Estonia",
    "Riga, Latvia",
    "Vilnius, Lithuania",
    "Bratislava, Slovakia",
    "Ljubljana, Slovenia",
    "Zagreb, Croatia",
    "Dubrovnik, Croatia",
    "Split, Croatia",
    "Bucharest, Romania",
    "Sofia, Bulgaria",
    "Belgrade, Serbia",
    "Kyiv, Ukraine",
    "Minsk, Belarus",
    
    // Asia - East & Southeast
    "Tokyo, Japan",
    "Osaka, Japan",
    "Kyoto, Japan",
    "Yokohama, Japan",
    "Nagoya, Japan",
    "Sapporo, Japan",
    "Fukuoka, Japan",
    "Kobe, Japan",
    "Seoul, South Korea",
    "Busan, South Korea",
    "Incheon, South Korea",
    "Daegu, South Korea",
    "Beijing, China",
    "Shanghai, China",
    "Guangzhou, China",
    "Shenzhen, China",
    "Hong Kong",
    "Macau",
    "Taipei, Taiwan",
    "Kaohsiung, Taiwan",
    "Taichung, Taiwan",
    "Singapore",
    "Bangkok, Thailand",
    "Chiang Mai, Thailand",
    "Phuket, Thailand",
    "Manila, Philippines",
    "Cebu, Philippines",
    "Davao, Philippines",
    "Kuala Lumpur, Malaysia",
    "Penang, Malaysia",
    "Johor Bahru, Malaysia",
    "Jakarta, Indonesia",
    "Bali, Indonesia",
    "Surabaya, Indonesia",
    "Bandung, Indonesia",
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam",
    "Da Nang, Vietnam",
    "Phnom Penh, Cambodia",
    "Siem Reap, Cambodia",
    "Vientiane, Laos",
    "Yangon, Myanmar",
    
    // Asia - South & Central
    "Mumbai, India",
    "New Delhi, India",
    "Bangalore, India",
    "Hyderabad, India",
    "Chennai, India",
    "Kolkata, India",
    "Pune, India",
    "Ahmedabad, India",
    "Jaipur, India",
    "Goa, India",
    "Kochi, India",
    "Kathmandu, Nepal",
    "Pokhara, Nepal",
    "Colombo, Sri Lanka",
    "Dhaka, Bangladesh",
    "Islamabad, Pakistan",
    "Lahore, Pakistan",
    "Karachi, Pakistan",
    "Tashkent, Uzbekistan",
    "Almaty, Kazakhstan",
    "Astana, Kazakhstan",
    "Bishkek, Kyrgyzstan",
    
    // Asia - Middle East
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Sharjah, UAE",
    "Doha, Qatar",
    "Muscat, Oman",
    "Manama, Bahrain",
    "Kuwait City, Kuwait",
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Tel Aviv, Israel",
    "Jerusalem, Israel",
    "Haifa, Israel",
    "Beirut, Lebanon",
    "Amman, Jordan",
    "Baghdad, Iraq",
    "Tehran, Iran",
    
    // Australia & Oceania
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Adelaide, Australia",
    "Gold Coast, Australia",
    "Canberra, Australia",
    "Hobart, Australia",
    "Darwin, Australia",
    "Newcastle, Australia",
    "Cairns, Australia",
    "Wollongong, Australia",
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    "Christchurch, New Zealand",
    "Queenstown, New Zealand",
    "Hamilton, New Zealand",
    "Dunedin, New Zealand",
    "Suva, Fiji",
    "Port Moresby, Papua New Guinea",
    "Honolulu, Hawaii, USA",
    
    // Africa - North
    "Cairo, Egypt",
    "Alexandria, Egypt",
    "Casablanca, Morocco",
    "Marrakech, Morocco",
    "Rabat, Morocco",
    "Fez, Morocco",
    "Tangier, Morocco",
    "Tunis, Tunisia",
    "Algiers, Algeria",
    "Tripoli, Libya",
    "Khartoum, Sudan",
    
    // Africa - West
    "Lagos, Nigeria",
    "Abuja, Nigeria",
    "Accra, Ghana",
    "Dakar, Senegal",
    "Abidjan, Ivory Coast",
    "Bamako, Mali",
    "Ouagadougou, Burkina Faso",
    "Conakry, Guinea",
    "Lomé, Togo",
    "Cotonou, Benin",
    
    // Africa - East
    "Nairobi, Kenya",
    "Mombasa, Kenya",
    "Addis Ababa, Ethiopia",
    "Dar es Salaam, Tanzania",
    "Zanzibar, Tanzania",
    "Kampala, Uganda",
    "Kigali, Rwanda",
    "Mogadishu, Somalia",
    "Djibouti City, Djibouti",
    "Asmara, Eritrea",
    
    // Africa - Central & Southern
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Durban, South Africa",
    "Pretoria, South Africa",
    "Port Elizabeth, South Africa",
    "Gaborone, Botswana",
    "Windhoek, Namibia",
    "Luanda, Angola",
    "Kinshasa, DR Congo",
    "Lusaka, Zambia",
    "Harare, Zimbabwe",
    "Maputo, Mozambique",
    "Antananarivo, Madagascar",
    "Port Louis, Mauritius",
    "Victoria, Seychelles",
    
    // South America
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Brasília, Brazil",
    "Salvador, Brazil",
    "Fortaleza, Brazil",
    "Belo Horizonte, Brazil",
    "Recife, Brazil",
    "Porto Alegre, Brazil",
    "Curitiba, Brazil",
    "Manaus, Brazil",
    "Buenos Aires, Argentina",
    "Córdoba, Argentina",
    "Rosario, Argentina",
    "Mendoza, Argentina",
    "Santiago, Chile",
    "Valparaíso, Chile",
    "Concepción, Chile",
    "Lima, Peru",
    "Cusco, Peru",
    "Arequipa, Peru",
    "Bogotá, Colombia",
    "Medellín, Colombia",
    "Cali, Colombia",
    "Cartagena, Colombia",
    "Quito, Ecuador",
    "Guayaquil, Ecuador",
    "Caracas, Venezuela",
    "Maracaibo, Venezuela",
    "Montevideo, Uruguay",
    "Punta del Este, Uruguay",
    "Asunción, Paraguay",
    "La Paz, Bolivia",
    "Santa Cruz, Bolivia",
    "Georgetown, Guyana",
    "Paramaribo, Suriname",
    "Cayenne, French Guiana"
];

// Mock function to simulate AI matchmaking process
// In a real implementation, this would be a backend API call
const findMatches = async (formData: MatchmakingFormData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For now, we'll return mock profiles as matches
  // In the actual implementation, this would be replaced with real API calls
  return [
    {
      id: 101,
      name: "Alex Johnson",
      title: "Senior Software Engineer",
      location: "San Francisco, CA, USA",
      industry: "IT & Software",
      domain: "AI/ML Development",
      matchPercentage: 95,
      profilePictureUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      skills: ["Python", "TensorFlow", "Machine Learning", "React", "AWS"],
      matchDetails: {
        industryMatch: 100,
        domainMatch: 100,
        experienceMatch: 90,
        locationMatch: 90
      }
    },
    {
      id: 102,
      name: "Maria Rodriguez",
      title: "Product Manager",
      location: "New York City, USA",
      industry: "IT & Software",
      domain: "Software Development",
      matchPercentage: 87,
      profilePictureUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      skills: ["Product Strategy", "Agile", "UX/UI", "Data Analysis", "Technical Requirements"],
      matchDetails: {
        industryMatch: 100,
        domainMatch: 80,
        experienceMatch: 85,
        locationMatch: 75
      }
    },
    {
      id: 103,
      name: "David Chen",
      title: "UI/UX Designer",
      location: "Seattle, WA, USA",
      industry: "IT & Software",
      domain: "UI/UX Design",
      matchPercentage: 82,
      profilePictureUrl: "https://randomuser.me/api/portraits/men/75.jpg",
      skills: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping"],
      matchDetails: {
        industryMatch: 100,
        domainMatch: 80,
        experienceMatch: 80,
        locationMatch: 70
      }
    }
  ];
};

interface MatchmakingFormData {
  lookingFor: string;
  jobTitle: string;
  experienceLevel: string;
  industry: string;
  domain: string;
  location: string;
}

interface ProfileMatch {
  id: number;
  name: string;
  title: string;
  location: string;
  industry: string;
  domain: string;
  matchPercentage: number;
  profilePictureUrl: string;
  skills: string[];
  matchDetails: {
    industryMatch: number;
    domainMatch: number;
    experienceMatch: number;
    locationMatch: number;
  };
}

export default function SmartConnectPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [formData, setFormData] = useState<MatchmakingFormData>({
    lookingFor: "industry_experts",
    jobTitle: "",
    experienceLevel: "",
    industry: "",
    domain: "",
    location: ""
  });
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  // Get user data for pre-filling form
  const { data: userData } = useQuery<{
    id: number;
    username: string;
    email: string;
    name: string;
    photoURL: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    lookingFor: string | null;
    profileCompleted: number;
    createdAt: string;
  }>({
    queryKey: ["/api/users/1"],
    enabled: isAuthenticated,
  });

  // Pre-fill form with user data when available
  useEffect(() => {
    if (userData) {
      let lookingFor = userData.lookingFor || "industry_experts";
      
      // Map user's lookingFor value to our options
      const lookingForOption = LOOKING_FOR_OPTIONS.find(option => 
        option.value === lookingFor || option.label.toLowerCase().includes(lookingFor.toLowerCase())
      );
      
      // Initialize form with user data
      setFormData(prev => ({
        ...prev,
        lookingFor: lookingForOption ? lookingForOption.value : "industry_experts",
        jobTitle: userData.title || "",
        location: userData.location || "",
        industry: userData.industry ? userData.industry.split(": ")[0] : "",
        domain: userData.industry && userData.industry.includes(": ") ? userData.industry.split(": ")[1] : ""
      }));
      
      // Set experience level if it can be extracted from title
      if (userData.title) {
        for (const level of EXPERIENCE_LEVELS) {
          if (userData.title.startsWith(level + " ")) {
            setFormData(prev => ({
              ...prev,
              experienceLevel: level
            }));
            break;
          }
        }
      }
    }
  }, [userData]);

  // Update domains when industry changes
  useEffect(() => {
    if (formData.industry && DOMAIN_EXPERTISE[formData.industry as keyof typeof DOMAIN_EXPERTISE]) {
      setDomains(DOMAIN_EXPERTISE[formData.industry as keyof typeof DOMAIN_EXPERTISE]);
    } else {
      setDomains([]);
    }
  }, [formData.industry]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle location suggestions
    if (name === 'location' && value.trim()) {
      // Filter locations that match the input value
      const inputValue = value.toLowerCase();
      
      // Show more suggestions to ensure comprehensive matches
      const maxSuggestions = 30;
      
      // First try exact matches (most relevant)
      let filtered = popularLocations.filter(location => 
        location.toLowerCase().includes(inputValue)
      );
      
      // If no exact matches or very few, try fuzzy matching for spelling variations
      if (filtered.length < 5) {
        // Try alternative spellings and common misspellings
        const alternativeMatches = popularLocations.filter(location => {
          const locationLower = location.toLowerCase();
          
          // Handle common spelling variations for major cities
          if (inputValue.includes('melb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('malb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('syd') && locationLower.includes('sydney')) return true;
          if (inputValue.includes('bris') && locationLower.includes('brisbane')) return true;
          if (inputValue.includes('auck') && locationLower.includes('auckland')) return true;
          if (inputValue.includes('sing') && locationLower.includes('singapore')) return true;
          if (inputValue.includes('bangl') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('bengal') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('york') && locationLower.includes('new york')) return true;
          if (inputValue.includes('angeles') && locationLower.includes('los angeles')) return true;
          if (inputValue.includes('fran') && locationLower.includes('san francisco')) return true;
          if (inputValue.includes('tokyo') && locationLower.includes('tokyo')) return true;
          if (inputValue.includes('dubai') && locationLower.includes('dubai')) return true;
          if (inputValue.includes('lon') && locationLower.includes('london')) return true;
          if (inputValue.includes('berl') && locationLower.includes('berlin')) return true;
          if (inputValue.includes('mad') && locationLower.includes('madrid')) return true;
          if (inputValue.includes('mum') && locationLower.includes('mumbai')) return true;
          if (inputValue.includes('bomb') && locationLower.includes('mumbai')) return true;
          if (inputValue.includes('del') && locationLower.includes('delhi')) return true;
          if (inputValue.includes('rio') && locationLower.includes('rio de janeiro')) return true;
          if (inputValue.includes('chi') && (locationLower.includes('chicago') || locationLower.includes('chiang'))) return true;
          if (inputValue.includes('beij') && locationLower.includes('beijing')) return true;
          if (inputValue.includes('pek') && locationLower.includes('beijing')) return true;
          if (inputValue.includes('shan') && locationLower.includes('shanghai')) return true;
          if (inputValue.includes('toro') && locationLower.includes('toronto')) return true;
          if (inputValue.includes('istan') && locationLower.includes('istanbul')) return true;
          if (inputValue.includes('const') && locationLower.includes('istanbul')) return true;
          
          return false;
        });
        
        // Combine both sets of results with exact matches first
        filtered = [...filtered, ...alternativeMatches];
      }
      
      // Show many more suggestions for complete coverage
      setLocationSuggestions(filtered.slice(0, maxSuggestions));
    } else if (name === 'location' && !value.trim()) {
      setLocationSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion
    }));
    setLocationSuggestions([]);
  };

  // Event handler for location suggestion div to prevent bubbling
  const handleSuggestionClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to keep dropdown open until selection
    event.stopPropagation();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMatchResults(true);
  };

  // Handle "Find More" button to reset form
  const handleReset = () => {
    setShowMatchResults(false);
  };

  // Mutation for finding matches
  const matchMutation = useMutation({
    mutationFn: findMatches,
    onError: (error) => {
      console.error("Error finding matches:", error);
    }
  });

  // Trigger mutation when showing match results
  useEffect(() => {
    if (showMatchResults) {
      matchMutation.mutate(formData);
    }
  }, [showMatchResults]);

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="smart-connect" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Smart Connect</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Find professionals matching your criteria using AI-powered matchmaking
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matchmaking Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{showMatchResults ? "Your Match Criteria" : "Find Your Match"}</CardTitle>
                    <CardDescription>
                      {showMatchResults 
                        ? "Based on these criteria, we found relevant matches for you" 
                        : "Fill in the criteria to find professionals matching your needs"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showMatchResults ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="lookingFor">I am looking for</Label>
                          <Select 
                            value={formData.lookingFor}
                            onValueChange={(value) => setFormData({...formData, lookingFor: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select what you're looking for" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOOKING_FOR_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <JobTitleCombobox
                            value={formData.jobTitle}
                            onChange={(value) => setFormData({...formData, jobTitle: value})}
                            placeholder="Enter job title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experienceLevel">Experience Level</Label>
                          <Select 
                            value={formData.experienceLevel}
                            onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPERIENCE_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Select 
                            value={formData.industry}
                            onValueChange={(value) => {
                              setFormData({
                                ...formData, 
                                industry: value,
                                domain: '' // Reset domain when industry changes
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRIES.map(industry => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.industry && domains.length > 0 && (
                          <div className="space-y-2">
                            <Label htmlFor="domain">Domain Expertise</Label>
                            <Select 
                              value={formData.domain}
                              onValueChange={(value) => setFormData({...formData, domain: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain expertise" />
                              </SelectTrigger>
                              <SelectContent>
                                {domains.map(domain => (
                                  <SelectItem key={domain} value={domain}>
                                    {domain}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2 relative">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter location"
                            autoComplete="off"
                          />
                          {locationSuggestions.length > 0 && (
                            <div 
                              className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-60 overflow-auto"
                              onClick={handleSuggestionClick}
                            >
                              {locationSuggestions.map((suggestion, index) => (
                                <div 
                                  key={index}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button type="submit" className="w-full mt-6">
                          Find Matches
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Looking For:</span>
                          <div className="mt-1">
                            <Badge className="mr-1">{LOOKING_FOR_OPTIONS.find(opt => opt.value === formData.lookingFor)?.label}</Badge>
                          </div>
                        </div>
                        
                        {formData.jobTitle && (
                          <div>
                            <span className="text-sm font-medium">Job Title:</span>
                            <p className="text-sm mt-1">{formData.jobTitle}</p>
                          </div>
                        )}
                        
                        {formData.experienceLevel && (
                          <div>
                            <span className="text-sm font-medium">Experience Level:</span>
                            <p className="text-sm mt-1">{formData.experienceLevel}</p>
                          </div>
                        )}
                        
                        {formData.industry && (
                          <div>
                            <span className="text-sm font-medium">Industry:</span>
                            <p className="text-sm mt-1">{formData.industry}</p>
                          </div>
                        )}
                        
                        {formData.domain && (
                          <div>
                            <span className="text-sm font-medium">Domain Expertise:</span>
                            <p className="text-sm mt-1">{formData.domain}</p>
                          </div>
                        )}
                        
                        {formData.location && (
                          <div>
                            <span className="text-sm font-medium">Location:</span>
                            <p className="text-sm mt-1">{formData.location}</p>
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={handleReset}
                        >
                          Modify Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Match Results */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {showMatchResults ? "Your Matches" : "Ready to Connect?"}
                    </CardTitle>
                    <CardDescription>
                      {showMatchResults
                        ? "Based on your criteria, here are your top matches"
                        : "Complete the form to find your ideal matches"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px]">
                    {!showMatchResults ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                          <Users className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">Find Your Perfect Professional Match</h3>
                          <p className="text-gray-500 text-sm mt-2">
                            Fill out the criteria on the left to discover professionals who match your requirements.
                            Our AI will analyze profiles and present you with the best matches.
                          </p>
                        </div>
                      </div>
                    ) : matchMutation.isPending ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <div>
                          <h3 className="font-medium text-lg">Finding Your Matches</h3>
                          <p className="text-gray-500 text-sm mt-2">
                            Our AI is analyzing profiles to find your perfect matches...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {matchMutation.data && matchMutation.data.map((match) => (
                          <div key={match.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <img 
                                  src={match.profilePictureUrl} 
                                  alt={match.name} 
                                  className="w-20 h-20 rounded-full object-cover"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
                                  {match.matchPercentage}%
                                </div>
                              </div>
                            </div>
                            <div className="flex-grow space-y-2">
                              <div>
                                <h3 className="font-semibold text-lg">{match.name}</h3>
                                <p className="text-gray-600 text-sm">{match.title}</p>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{match.location}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {match.skills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col justify-between gap-2 min-w-[120px]">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Industry</span>
                                  <span className="font-medium">{match.matchDetails.industryMatch}%</span>
                                </div>
                                <Progress value={match.matchDetails.industryMatch} className="h-1" />
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span>Domain</span>
                                  <span className="font-medium">{match.matchDetails.domainMatch}%</span>
                                </div>
                                <Progress value={match.matchDetails.domainMatch} className="h-1" />
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span>Experience</span>
                                  <span className="font-medium">{match.matchDetails.experienceMatch}%</span>
                                </div>
                                <Progress value={match.matchDetails.experienceMatch} className="h-1" />
                              </div>
                              <Button className="mt-auto">Connect</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {showMatchResults && matchMutation.isSuccess && (
                    <CardFooter className="flex justify-between">
                      <p className="text-sm text-gray-500">Showing top {matchMutation.data.length} matches</p>
                      <Button variant="outline">View More</Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}