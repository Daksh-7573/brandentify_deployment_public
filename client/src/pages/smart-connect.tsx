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
    // India - Major Cities & Tech Hubs
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
    "Chandigarh, India",
    "Lucknow, India",
    "Coimbatore, India",
    "Indore, India",
    "Bhubaneswar, India",
    "Nagpur, India",
    "Surat, India",
    "Visakhapatnam, India",
    "Vadodara, India",
    "Thiruvananthapuram, India",
    "Bhopal, India",
    "Patna, India",
    "Ludhiana, India",
    "Agra, India",
    "Nashik, India",
    "Varanasi, India",
    "Kanpur, India",
    "Mysore, India",
    "Guwahati, India",
    "Dehradun, India",
    "Pondicherry, India",
    "Ranchi, India",
    "Mangalore, India",
    "Trivandrum, India",
    "Raipur, India",
    "Noida, India",
    "Gurgaon, India",
    "Faridabad, India",
    "Jodhpur, India",
    "Udaipur, India",
    "Aurangabad, India",
    "Rajkot, India",
    "Amritsar, India",
    "Allahabad, India",
    "Vijayawada, India",
    "Bhubaneshwar, India",
    "Gwalior, India",
    "Kota, India",
    "Jalandhar, India",
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
    "Cayenne, French Guiana",
    
    // Additional Countries - Europe
    "Nicosia, Cyprus",
    "Valletta, Malta",
    "Andorra la Vella, Andorra",
    "San Marino, San Marino",
    "Vaduz, Liechtenstein",
    "Monaco, Monaco",
    "Vatican City",
    "Tirana, Albania",
    "Podgorica, Montenegro",
    "Skopje, North Macedonia",
    "Pristina, Kosovo",
    "Sarajevo, Bosnia and Herzegovina",
    "Banja Luka, Bosnia and Herzegovina",
    
    // Additional Countries - Nordics
    "Aalborg, Denmark",
    "Tampere, Finland",
    "Oulu, Finland",
    "Stavanger, Norway",
    "Tromso, Norway",
    "Uppsala, Sweden",
    "Malmo, Sweden",
    "Reykjavik, Iceland",
    "Akureyri, Iceland",
    
    // Additional Countries - Asia
    "Ulaanbaatar, Mongolia",
    "Thimphu, Bhutan",
    "Male, Maldives",
    "Vientiane, Laos",
    "Bandar Seri Begawan, Brunei",
    "Dili, Timor-Leste",
    "Pyongyang, North Korea",
    "Nur-Sultan, Kazakhstan",
    "Dushanbe, Tajikistan",
    "Ashgabat, Turkmenistan",
    "Baku, Azerbaijan",
    "Yerevan, Armenia",
    "Tbilisi, Georgia",
    
    // Additional Countries - Caribbean
    "Havana, Cuba",
    "Nassau, Bahamas",
    "Kingston, Jamaica",
    "Port-au-Prince, Haiti",
    "Santo Domingo, Dominican Republic",
    "San Juan, Puerto Rico",
    "Bridgetown, Barbados",
    "Port of Spain, Trinidad and Tobago",
    
    // Additional Countries - Oceania
    "Nuku'alofa, Tonga",
    "Apia, Samoa",
    "Honiara, Solomon Islands",
    "Port Vila, Vanuatu",
    "Noumea, New Caledonia",
    "Papeete, Tahiti, French Polynesia",
    "Majuro, Marshall Islands",
    "Tarawa, Kiribati",
    "Funafuti, Tuvalu",
    "Yaren, Nauru",
    "Palikir, Micronesia",
    
    // Additional Countries - Middle East
    "Sana'a, Yemen",
    "Damascus, Syria",
    "Erbil, Iraq",
    "Kabul, Afghanistan",
    "Ramallah, Palestine",
    "Gaza City, Palestine",
    
    // Additional Countries - Africa
    "Nouakchott, Mauritania",
    "Niamey, Niger",
    "N'Djamena, Chad",
    "Bangui, Central African Republic",
    "Juba, South Sudan",
    "Brazzaville, Republic of the Congo",
    "Bujumbura, Burundi",
    "Malabo, Equatorial Guinea",
    "Bissau, Guinea-Bissau",
    "Freetown, Sierra Leone",
    "Monrovia, Liberia",
    "Banjul, Gambia",
    "Praia, Cape Verde",
    "Sao Tome, Sao Tome and Principe",
    "Maseru, Lesotho",
    "Mbabane, Eswatini",
    "Djibouti, Djibouti",
    
    // Remote and Digital Nomad Locations
    "Remote, United States",
    "Remote, European Union",
    "Remote, Worldwide",
    "Remote, UK/London",
    "Remote, APAC Region",
    "Digital Nomad, Asia",
    "Digital Nomad, Europe",
    "Digital Nomad, Latin America"
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
      
      // Show many more suggestions to ensure comprehensive matches
      const maxSuggestions = 100; // Increased to show many more suggestions
      
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
          // City variations - Australia, New Zealand
          if (inputValue.includes('melb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('malb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('syd') && locationLower.includes('sydney')) return true;
          if (inputValue.includes('bris') && locationLower.includes('brisbane')) return true;
          if (inputValue.includes('brizzy') && locationLower.includes('brisbane')) return true;
          if (inputValue.includes('auck') && locationLower.includes('auckland')) return true;
          if (inputValue.includes('adel') && locationLower.includes('adelaide')) return true;
          if (inputValue.includes('perth') && locationLower.includes('perth')) return true;
          if (inputValue.includes('canberra') && locationLower.includes('canberra')) return true;
          if (inputValue.includes('canb') && locationLower.includes('canberra')) return true;
          if (inputValue.includes('hobart') && locationLower.includes('hobart')) return true;
          if (inputValue.includes('well') && locationLower.includes('wellington')) return true;
          if (inputValue.includes('christ') && locationLower.includes('christchurch')) return true;
          
          // Asia - Major Cities
          if (inputValue.includes('sing') && locationLower.includes('singapore')) return true;
          if (inputValue.includes('bangl') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('bengal') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('tokyo') && locationLower.includes('tokyo')) return true;
          if (inputValue.includes('tokio') && locationLower.includes('tokyo')) return true;
          if (inputValue.includes('osaka') && locationLower.includes('osaka')) return true;
          if (inputValue.includes('kyoto') && locationLower.includes('kyoto')) return true;
          if (inputValue.includes('hk') && locationLower.includes('hong kong')) return true;
          if (inputValue.includes('hong') && locationLower.includes('hong kong')) return true;
          if (inputValue.includes('dubai') && locationLower.includes('dubai')) return true;
          if (inputValue.includes('seoul') && locationLower.includes('seoul')) return true;
          // Indian Cities
          if (inputValue.includes('mum') && locationLower.includes('mumbai')) return true;
          if (inputValue.includes('bomb') && locationLower.includes('mumbai')) return true;
          if (inputValue.includes('del') && locationLower.includes('delhi')) return true;
          if (inputValue.includes('ncr') && locationLower.includes('delhi')) return true;
          if (inputValue.includes('banga') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('bengaluru') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('hyd') && locationLower.includes('hyderabad')) return true;
          if (inputValue.includes('chen') && locationLower.includes('chennai')) return true;
          if (inputValue.includes('madr') && locationLower.includes('chennai')) return true;
          if (inputValue.includes('kol') && locationLower.includes('kolkata')) return true;
          if (inputValue.includes('calc') && locationLower.includes('kolkata')) return true;
          if (inputValue.includes('pune') && locationLower.includes('pune')) return true;
          if (inputValue.includes('poona') && locationLower.includes('pune')) return true;
          if (inputValue.includes('ahm') && locationLower.includes('ahmedabad')) return true;
          if (inputValue.includes('jai') && locationLower.includes('jaipur')) return true;
          if (inputValue.includes('luck') && locationLower.includes('lucknow')) return true;
          if (inputValue.includes('chan') && locationLower.includes('chandigarh')) return true;
          if (inputValue.includes('coi') && locationLower.includes('coimbatore')) return true;
          if (inputValue.includes('indor') && locationLower.includes('indore')) return true;
          if (inputValue.includes('cochin') && locationLower.includes('kochi')) return true;
          if (inputValue.includes('bhub') && locationLower.includes('bhubaneswar')) return true;
          if (inputValue.includes('nag') && locationLower.includes('nagpur')) return true;
          if (inputValue.includes('sur') && locationLower.includes('surat')) return true;
          if (inputValue.includes('vizag') && locationLower.includes('visakhapatnam')) return true;
          if (inputValue.includes('vado') && locationLower.includes('vadodara')) return true;
          if (inputValue.includes('baro') && locationLower.includes('vadodara')) return true;
          if (inputValue.includes('thiru') && locationLower.includes('thiruvananthapuram')) return true;
          if (inputValue.includes('triv') && locationLower.includes('trivandrum')) return true;
          if (inputValue.includes('bhop') && locationLower.includes('bhopal')) return true;
          if (inputValue.includes('pat') && locationLower.includes('patna')) return true;
          if (inputValue.includes('gur') && locationLower.includes('gurgaon')) return true;
          if (inputValue.includes('noida') && locationLower.includes('noida')) return true;
          if (inputValue.includes('sector') && (locationLower.includes('noida') || locationLower.includes('gurgaon') || locationLower.includes('chandigarh'))) return true;
          if (inputValue.includes('guwah') && locationLower.includes('guwahati')) return true;
          if (inputValue.includes('beij') && locationLower.includes('beijing')) return true;
          if (inputValue.includes('pek') && locationLower.includes('beijing')) return true;
          if (inputValue.includes('shan') && locationLower.includes('shanghai')) return true;
          if (inputValue.includes('kl') && locationLower.includes('kuala lumpur')) return true;
          if (inputValue.includes('bang') && locationLower.includes('bangkok')) return true;
          if (inputValue.includes('taipei') && locationLower.includes('taipei')) return true;
          if (inputValue.includes('manila') && locationLower.includes('manila')) return true;
          if (inputValue.includes('jakarta') && locationLower.includes('jakarta')) return true;
          if (inputValue.includes('hanoi') && locationLower.includes('hanoi')) return true;
          if (inputValue.includes('saigon') && locationLower.includes('ho chi minh')) return true;
          if (inputValue.includes('hcm') && locationLower.includes('ho chi minh')) return true;
          
          // US Cities
          if (inputValue.includes('york') && locationLower.includes('new york')) return true;
          if (inputValue.includes('nyc') && locationLower.includes('new york')) return true;
          if (inputValue.includes('angeles') && locationLower.includes('los angeles')) return true;
          if (inputValue.includes('la ') && locationLower.includes('los angeles')) return true;
          if (inputValue.includes('fran') && locationLower.includes('san francisco')) return true;
          if (inputValue.includes('sf') && locationLower.includes('san francisco')) return true;
          if (inputValue.includes('chi') && locationLower.includes('chicago')) return true;
          if (inputValue.includes('chi town') && locationLower.includes('chicago')) return true;
          if (inputValue.includes('wash') && locationLower.includes('washington')) return true;
          if (inputValue.includes('dc') && locationLower.includes('washington, dc')) return true;
          if (inputValue.includes('philly') && locationLower.includes('philadelphia')) return true;
          if (inputValue.includes('phil') && locationLower.includes('philadelphia')) return true;
          if (inputValue.includes('hou') && locationLower.includes('houston')) return true;
          if (inputValue.includes('bos') && locationLower.includes('boston')) return true;
          if (inputValue.includes('atl') && locationLower.includes('atlanta')) return true;
          if (inputValue.includes('sea') && locationLower.includes('seattle')) return true;
          if (inputValue.includes('vegas') && locationLower.includes('las vegas')) return true;
          if (inputValue.includes('den') && locationLower.includes('denver')) return true;
          if (inputValue.includes('aust') && locationLower.includes('austin')) return true;
          if (inputValue.includes('dall') && locationLower.includes('dallas')) return true;
          if (inputValue.includes('det') && locationLower.includes('detroit')) return true;
          if (inputValue.includes('port') && locationLower.includes('portland')) return true;
          if (inputValue.includes('san d') && locationLower.includes('san diego')) return true;
          if (inputValue.includes('sd') && locationLower.includes('san diego')) return true;
          if (inputValue.includes('sd,') && locationLower.includes('san diego')) return true;
          
          // Canada Cities
          if (inputValue.includes('toro') && locationLower.includes('toronto')) return true;
          if (inputValue.includes('mont') && locationLower.includes('montreal')) return true;
          if (inputValue.includes('vanc') && locationLower.includes('vancouver')) return true;
          if (inputValue.includes('calg') && locationLower.includes('calgary')) return true;
          if (inputValue.includes('ott') && locationLower.includes('ottawa')) return true;
          if (inputValue.includes('edm') && locationLower.includes('edmonton')) return true;
          if (inputValue.includes('queb') && locationLower.includes('quebec')) return true;
          if (inputValue.includes('winn') && locationLower.includes('winnipeg')) return true;
          if (inputValue.includes('hal') && locationLower.includes('halifax')) return true;
          
          // European Cities 
          if (inputValue.includes('lon') && locationLower.includes('london')) return true;
          if (inputValue.includes('berl') && locationLower.includes('berlin')) return true;
          if (inputValue.includes('mad') && locationLower.includes('madrid')) return true;
          if (inputValue.includes('madr') && locationLower.includes('madrid')) return true;
          if (inputValue.includes('barc') && locationLower.includes('barcelona')) return true;
          if (inputValue.includes('bar') && locationLower.includes('barcelona')) return true;
          if (inputValue.includes('pari') && locationLower.includes('paris')) return true;
          if (inputValue.includes('rome') && locationLower.includes('rome')) return true;
          if (inputValue.includes('roma') && locationLower.includes('rome')) return true;
          if (inputValue.includes('ams') && locationLower.includes('amsterdam')) return true;
          if (inputValue.includes('amst') && locationLower.includes('amsterdam')) return true;
          if (inputValue.includes('vien') && locationLower.includes('vienna')) return true;
          if (inputValue.includes('wien') && locationLower.includes('vienna')) return true;
          if (inputValue.includes('copenh') && locationLower.includes('copenhagen')) return true;
          if (inputValue.includes('zuri') && locationLower.includes('zurich')) return true;
          if (inputValue.includes('stoc') && locationLower.includes('stockholm')) return true;
          if (inputValue.includes('istan') && locationLower.includes('istanbul')) return true;
          if (inputValue.includes('const') && locationLower.includes('istanbul')) return true;
          if (inputValue.includes('athen') && locationLower.includes('athens')) return true;
          if (inputValue.includes('dub') && locationLower.includes('dublin')) return true;
          if (inputValue.includes('osio') && locationLower.includes('oslo')) return true;
          if (inputValue.includes('lisb') && locationLower.includes('lisbon')) return true;
          if (inputValue.includes('lisbo') && locationLower.includes('lisbon')) return true;
          if (inputValue.includes('prag') && locationLower.includes('prague')) return true;
          if (inputValue.includes('buda') && locationLower.includes('budapest')) return true;
          if (inputValue.includes('buch') && locationLower.includes('bucharest')) return true;
          if (inputValue.includes('wars') && locationLower.includes('warsaw')) return true;
          if (inputValue.includes('bruss') && locationLower.includes('brussels')) return true;
          if (inputValue.includes('frankf') && locationLower.includes('frankfurt')) return true;
          if (inputValue.includes('manch') && locationLower.includes('manchester')) return true;
          if (inputValue.includes('glasg') && locationLower.includes('glasgow')) return true;
          if (inputValue.includes('birm') && locationLower.includes('birmingham')) return true;
          if (inputValue.includes('edinb') && locationLower.includes('edinburgh')) return true;
          if (inputValue.includes('edin') && locationLower.includes('edinburgh')) return true;
          
          // South America
          if (inputValue.includes('rio') && locationLower.includes('rio de janeiro')) return true;
          if (inputValue.includes('sao') && locationLower.includes('são paulo')) return true;
          if (inputValue.includes('paulo') && locationLower.includes('são paulo')) return true;
          if (inputValue.includes('bue') && locationLower.includes('buenos aires')) return true;
          if (inputValue.includes('sant') && locationLower.includes('santiago')) return true;
          if (inputValue.includes('lima') && locationLower.includes('lima')) return true;
          if (inputValue.includes('bog') && locationLower.includes('bogotá')) return true;
          if (inputValue.includes('med') && locationLower.includes('medellín')) return true;
          
          // Middle East & Africa
          if (inputValue.includes('cairo') && locationLower.includes('cairo')) return true;
          if (inputValue.includes('riyad') && locationLower.includes('riyadh')) return true;
          if (inputValue.includes('tel') && locationLower.includes('tel aviv')) return true;
          if (inputValue.includes('doha') && locationLower.includes('doha')) return true;
          if (inputValue.includes('johan') && locationLower.includes('johannesburg')) return true;
          if (inputValue.includes('cape') && locationLower.includes('cape town')) return true;
          if (inputValue.includes('lagos') && locationLower.includes('lagos')) return true;
          if (inputValue.includes('nair') && locationLower.includes('nairobi')) return true;
          if (inputValue.includes('casa') && locationLower.includes('casablanca')) return true;
          
          // Countries (to match country names in locations)
          if (inputValue.includes('us') && (locationLower.includes('usa') || locationLower.includes('united states'))) return true;
          if (inputValue.includes('uk') && (locationLower.includes('uk') || locationLower.includes('united kingdom'))) return true;
          if (inputValue.includes('can') && locationLower.includes('canada')) return true;
          if (inputValue.includes('aus') && locationLower.includes('australia')) return true;
          if (inputValue.includes('nz') && locationLower.includes('new zealand')) return true;
          // India and Indian states
          if (inputValue.includes('india') && locationLower.includes('india')) return true;
          if (inputValue.includes('mh') && (locationLower.includes('maharashtra') || locationLower.includes('mumbai'))) return true;
          if (inputValue.includes('up') && (locationLower.includes('uttar pradesh') || locationLower.includes('lucknow'))) return true;
          if (inputValue.includes('tn') && (locationLower.includes('tamil nadu') || locationLower.includes('chennai'))) return true;
          if (inputValue.includes('ka') && (locationLower.includes('karnataka') || locationLower.includes('bangalore'))) return true;
          if (inputValue.includes('ap') && (locationLower.includes('andhra pradesh') || locationLower.includes('hyderabad'))) return true;
          if (inputValue.includes('ts') && (locationLower.includes('telangana') || locationLower.includes('hyderabad'))) return true;
          if (inputValue.includes('wb') && (locationLower.includes('west bengal') || locationLower.includes('kolkata'))) return true;
          if (inputValue.includes('gj') && (locationLower.includes('gujarat') || locationLower.includes('ahmedabad'))) return true;
          if (inputValue.includes('rj') && (locationLower.includes('rajasthan') || locationLower.includes('jaipur'))) return true;
          if (inputValue.includes('kl') && (locationLower.includes('kerala') || locationLower.includes('kochi') || locationLower.includes('trivandrum'))) return true;
          if (inputValue.includes('pb') && (locationLower.includes('punjab') || locationLower.includes('chandigarh'))) return true;
          if (inputValue.includes('hr') && (locationLower.includes('haryana') || locationLower.includes('chandigarh') || locationLower.includes('gurgaon'))) return true;
          if (inputValue.includes('delhi') && (locationLower.includes('delhi') || locationLower.includes('new delhi'))) return true;
          if (inputValue.includes('ncr') && (locationLower.includes('delhi') || locationLower.includes('gurgaon') || locationLower.includes('noida') || locationLower.includes('faridabad'))) return true;
          if (inputValue.includes('chin') && locationLower.includes('china')) return true;
          if (inputValue.includes('jap') && locationLower.includes('japan')) return true;
          if (inputValue.includes('ger') && locationLower.includes('germany')) return true;
          if (inputValue.includes('deut') && locationLower.includes('germany')) return true;
          if (inputValue.includes('fra') && locationLower.includes('france')) return true;
          if (inputValue.includes('ital') && locationLower.includes('italy')) return true;
          if (inputValue.includes('spain') && locationLower.includes('spain')) return true;
          if (inputValue.includes('esp') && locationLower.includes('spain')) return true;
          if (inputValue.includes('rus') && locationLower.includes('russia')) return true;
          if (inputValue.includes('braz') && locationLower.includes('brazil')) return true;
          if (inputValue.includes('brasil') && locationLower.includes('brazil')) return true;
          if (inputValue.includes('mex') && locationLower.includes('mexico')) return true;
          if (inputValue.includes('thai') && locationLower.includes('thailand')) return true;
          if (inputValue.includes('indo') && locationLower.includes('indonesia')) return true;
          if (inputValue.includes('malay') && locationLower.includes('malaysia')) return true;
          if (inputValue.includes('sau') && locationLower.includes('saudi')) return true;
          if (inputValue.includes('tur') && locationLower.includes('turkey')) return true;
          if (inputValue.includes('turk') && locationLower.includes('türkiye')) return true;
          
          // Remote and Digital Nomad
          if (inputValue.includes('remote') && locationLower.includes('remote')) return true;
          if (inputValue.includes('wfh') && locationLower.includes('remote')) return true;
          if (inputValue.includes('work from home') && locationLower.includes('remote')) return true;
          if (inputValue.includes('nomad') && locationLower.includes('nomad')) return true;
          if (inputValue.includes('digit') && locationLower.includes('digital')) return true;
          
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