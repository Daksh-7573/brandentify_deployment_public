import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience-new";
import Education from "@/components/profile/education-new";
import Skills from "@/components/profile/skills";
import ResumeUpload from "@/components/profile/resume-upload";
import LinkedInImport from "@/components/profile/linkedin-import";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for edit dialogs
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    industry: '',
    lookingFor: ''
  });
  
  // Get user ID (use demo ID if in demo mode)
  const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
  
  // Also fetch current user data for the profile
  const { data: userData, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && isAuthenticated,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch user skills for the badges
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/skills`],
    enabled: !!userId && isAuthenticated,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Mutation for updating user basic info
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/users/${userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
      setShowEditBasicInfo(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // List of popular cities for location suggestions
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
    "Boise, ID, USA",
    "Richmond, VA, USA",
    "Birmingham, AL, USA",
    "Providence, RI, USA",
    "Jacksonville, FL, USA",
    "Albany, NY, USA",
    "Rochester, NY, USA",
    "Baton Rouge, LA, USA",
    "Des Moines, IA, USA",
    "Charleston, SC, USA",
    "Savannah, GA, USA",
    "Madison, WI, USA",
    "Boulder, CO, USA",
    "Ann Arbor, MI, USA",
    "Eugene, OR, USA",
    "Santa Fe, NM, USA",
    "Asheville, NC, USA",
    "Spokane, WA, USA",
    "Tacoma, WA, USA",
    // Canada
    "Toronto, Canada",
    "Vancouver, Canada",
    "Montreal, Canada",
    "Calgary, Canada",
    "Ottawa, Canada",
    "Edmonton, Canada",
    "Winnipeg, Canada",
    "Quebec City, Canada",
    "Hamilton, Canada",
    "Halifax, Canada",
    "Victoria, Canada",
    "London, Canada",
    "Kitchener, Canada",
    "Windsor, Canada",
    "Oshawa, Canada",
    "Saskatoon, Canada",
    "Regina, Canada",
    "St. John's, Canada",
    "Kelowna, Canada",
    "Abbotsford, Canada",
    "Kingston, Canada",
    "Guelph, Canada",
    "Barrie, Canada",
    "Moncton, Canada",
    "Thunder Bay, Canada",
    "Fredericton, Canada",
    "Sherbrooke, Canada",
    "Red Deer, Canada",
    "Sudbury, Canada",
    "Kamloops, Canada",
    "Chilliwack, Canada",
    "Niagara Falls, Canada",
    "Gatineau, Canada",
    "Lethbridge, Canada",
    "Saint John, Canada",
    "Nanaimo, Canada",
    "Burnaby, Canada",
    "Richmond, Canada",
    "Surrey, Canada",
    "Mississauga, Canada",
    "Brampton, Canada",
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
    "Lisbon, Portugal",
    "Porto, Portugal",
    "Rome, Italy",
    "Milan, Italy",
    "Florence, Italy",
    "Naples, Italy",
    "Turin, Italy",
    "Bologna, Italy",
    "Venice, Italy",
    "Palermo, Italy",
    "Vienna, Austria",
    "Salzburg, Austria",
    "Innsbruck, Austria",
    "Graz, Austria",
    "Zurich, Switzerland",
    "Geneva, Switzerland",
    "Basel, Switzerland",
    "Bern, Switzerland",
    "Lausanne, Switzerland",
    "Brussels, Belgium",
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Bruges, Belgium",
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    "Odense, Denmark",
    "Oslo, Norway",
    "Bergen, Norway",
    "Trondheim, Norway",
    "Stockholm, Sweden",
    "Gothenburg, Sweden",
    "Malmö, Sweden",
    "Helsinki, Finland",
    "Tampere, Finland",
    "Turku, Finland",
    "Reykjavik, Iceland",
    "Prague, Czech Republic",
    "Brno, Czech Republic",
    "Warsaw, Poland",
    "Krakow, Poland",
    "Gdansk, Poland",
    "Wroclaw, Poland",
    "Poznan, Poland",
    "Budapest, Hungary",
    "Debrecen, Hungary",
    "Bratislava, Slovakia",
    "Ljubljana, Slovenia",
    "Zagreb, Croatia",
    "Split, Croatia",
    "Dubrovnik, Croatia",
    "Belgrade, Serbia",
    "Sarajevo, Bosnia and Herzegovina",
    "Skopje, North Macedonia",
    "Tirana, Albania",
    "Sofia, Bulgaria",
    "Bucharest, Romania",
    "Cluj-Napoca, Romania",
    "Athens, Greece",
    "Thessaloniki, Greece",
    "Heraklion, Greece",
    "Nicosia, Cyprus",
    "Valletta, Malta",
    "Tallinn, Estonia",
    "Riga, Latvia",
    "Vilnius, Lithuania",
    "Minsk, Belarus",
    "Kiev, Ukraine",
    "Lviv, Ukraine",
    "Odessa, Ukraine",
    "Moscow, Russia",
    "Saint Petersburg, Russia",
    "Kazan, Russia",
    "Yekaterinburg, Russia",
    
    // Asia - East Asia
    "Tokyo, Japan",
    "Osaka, Japan",
    "Kyoto, Japan",
    "Sapporo, Japan",
    "Fukuoka, Japan",
    "Nagoya, Japan",
    "Yokohama, Japan",
    "Kobe, Japan",
    "Hiroshima, Japan",
    "Nara, Japan",
    "Sendai, Japan",
    "Kawasaki, Japan",
    "Okinawa, Japan",
    "Seoul, South Korea",
    "Busan, South Korea",
    "Incheon, South Korea",
    "Daegu, South Korea",
    "Daejeon, South Korea",
    "Gwangju, South Korea",
    "Suwon, South Korea",
    "Ulsan, South Korea",
    "Jeju, South Korea",
    "Beijing, China",
    "Shanghai, China",
    "Guangzhou, China",
    "Shenzhen, China",
    "Chengdu, China",
    "Hangzhou, China",
    "Nanjing, China",
    "Wuhan, China",
    "Tianjin, China",
    "Xian, China",
    "Chongqing, China",
    "Suzhou, China",
    "Qingdao, China",
    "Dalian, China",
    "Xiamen, China",
    "Kunming, China",
    "Changsha, China",
    "Zhengzhou, China",
    "Hong Kong",
    "Macau",
    "Taipei, Taiwan",
    "Kaohsiung, Taiwan",
    "Taichung, Taiwan",
    "Tainan, Taiwan",
    "Hsinchu, Taiwan",
    "Ulaanbaatar, Mongolia",
    
    // Asia - Southeast Asia
    "Singapore",
    "Kuala Lumpur, Malaysia",
    "Penang, Malaysia",
    "Johor Bahru, Malaysia",
    "Ipoh, Malaysia",
    "Kuching, Malaysia",
    "Kota Kinabalu, Malaysia",
    "Bangkok, Thailand",
    "Chiang Mai, Thailand",
    "Phuket, Thailand",
    "Pattaya, Thailand",
    "Krabi, Thailand",
    "Hua Hin, Thailand",
    "Jakarta, Indonesia",
    "Bali, Indonesia",
    "Surabaya, Indonesia",
    "Bandung, Indonesia",
    "Yogyakarta, Indonesia",
    "Medan, Indonesia",
    "Makassar, Indonesia",
    "Manila, Philippines",
    "Cebu, Philippines",
    "Davao, Philippines",
    "Boracay, Philippines",
    "Baguio, Philippines",
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam",
    "Da Nang, Vietnam",
    "Hoi An, Vietnam",
    "Nha Trang, Vietnam",
    "Hue, Vietnam",
    "Phnom Penh, Cambodia",
    "Siem Reap, Cambodia",
    "Vientiane, Laos",
    "Luang Prabang, Laos",
    "Yangon, Myanmar",
    "Mandalay, Myanmar",
    "Brunei",
    // India
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Pune, India",
    "Ahmedabad, India",
    "Gandhinagar, India",
    "Jaipur, India",
    "Lucknow, India",
    "Chandigarh, India",
    "Kochi, India",
    "Goa, India",
    "Nagpur, India",
    "Indore, India",
    "Thane, India",
    "Bhopal, India",
    "Visakhapatnam, India",
    "Surat, India",
    "Vadodara, India",
    "Ludhiana, India",
    "Agra, India",
    "Nashik, India",
    "Faridabad, India",
    "Meerut, India",
    "Rajkot, India",
    "Varanasi, India",
    "Srinagar, India",
    "Aurangabad, India",
    "Dhanbad, India",
    "Amritsar, India",
    "Allahabad, India",
    "Ranchi, India",
    "Coimbatore, India",
    "Jabalpur, India",
    "Gwalior, India",
    "Vijayawada, India",
    "Jodhpur, India",
    "Madurai, India",
    "Raipur, India",
    "Kota, India",
    "Guwahati, India",
    "Trivandrum, India",
    "Tiruchirapalli, India",
    "Hubli, India",
    "Mangalore, India",
    "Mysore, India",
    "Dehradun, India",
    "Bhubaneswar, India",
    "Salem, India",
    "Warangal, India",
    "Jamshedpur, India",
    "Noida, India",
    "Gurgaon, India",
    "Thiruvananthapuram, India",
    "Patna, India",
    "Pimpri-Chinchwad, India",
    "Durgapur, India",
    "Gangtok, India",
    "Shimla, India",
    "Ooty, India",
    "Rishikesh, India",
    "Udaipur, India",
    "Haridwar, India",
    "Jammu, India",
    "Mussoorie, India",
    "Nainital, India",
    "Darjeeling, India",
    "Panaji, India",
    "Dharamshala, India",
    "Shillong, India",
    "Port Blair, India",
    "Manali, India",
    "Kanpur, India",
    // West Asia & Middle East
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Sharjah, UAE",
    "Al Ain, UAE",
    "Ras Al Khaimah, UAE",
    "Fujairah, UAE",
    "Ajman, UAE",
    "Umm Al Quwain, UAE",
    "Istanbul, Turkey",
    "Ankara, Turkey",
    "Antalya, Turkey",
    "Izmir, Turkey",
    "Bursa, Turkey",
    "Adana, Turkey",
    "Konya, Turkey",
    "Bodrum, Turkey",
    "Cappadocia, Turkey",
    "Tel Aviv, Israel",
    "Jerusalem, Israel",
    "Haifa, Israel",
    "Eilat, Israel",
    "Amman, Jordan",
    "Petra, Jordan",
    "Aqaba, Jordan",
    "Beirut, Lebanon",
    "Byblos, Lebanon",
    "Tripoli, Lebanon",
    "Doha, Qatar",
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Mecca, Saudi Arabia",
    "Medina, Saudi Arabia",
    "Dammam, Saudi Arabia",
    "Muscat, Oman",
    "Salalah, Oman",
    "Kuwait City, Kuwait",
    "Manama, Bahrain",
    
    // South Asia
    "Lahore, Pakistan",
    "Karachi, Pakistan",
    "Islamabad, Pakistan",
    "Peshawar, Pakistan",
    "Faisalabad, Pakistan",
    "Multan, Pakistan",
    "Rawalpindi, Pakistan",
    "Quetta, Pakistan",
    "Kathmandu, Nepal",
    "Pokhara, Nepal",
    "Dhaka, Bangladesh",
    "Chittagong, Bangladesh",
    "Sylhet, Bangladesh",
    "Khulna, Bangladesh",
    "Colombo, Sri Lanka",
    "Kandy, Sri Lanka",
    "Galle, Sri Lanka",
    "Male, Maldives",
    "Thimphu, Bhutan",
    
    // Australia
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
    "Wollongong, Australia",
    "Geelong, Australia",
    "Cairns, Australia",
    "Townsville, Australia",
    "Alice Springs, Australia",
    "Sunshine Coast, Australia",
    "Toowoomba, Australia",
    "Ballarat, Australia",
    "Bendigo, Australia",
    "Mandurah, Australia",
    "Albury, Australia",
    "Wodonga, Australia",
    "Launceston, Australia",
    "Mackay, Australia",
    "Rockhampton, Australia",
    "Bunbury, Australia",
    "Bundaberg, Australia",
    "Hervey Bay, Australia",
    "Wagga Wagga, Australia",
    "Coffs Harbour, Australia",
    "Gladstone, Australia",
    "Mildura, Australia",
    "Shepparton, Australia",
    "Port Macquarie, Australia",
    "Tamworth, Australia",
    "Orange, Australia",
    "Dubbo, Australia",
    "Geraldton, Australia",
    // New Zealand
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    "Christchurch, New Zealand",
    "Queenstown, New Zealand",
    "Dunedin, New Zealand",
    "Hamilton, New Zealand",
    "Tauranga, New Zealand",
    "Napier-Hastings, New Zealand",
    "Palmerston North, New Zealand",
    "Nelson, New Zealand",
    "Rotorua, New Zealand",
    "New Plymouth, New Zealand",
    "Whangarei, New Zealand",
    "Invercargill, New Zealand",
    "Whanganui, New Zealand",
    "Gisborne, New Zealand",
    "Timaru, New Zealand",
    "Taupo, New Zealand",
    "Blenheim, New Zealand",
    "Pukekohe, New Zealand",
    "Cambridge, New Zealand",
    "Te Awamutu, New Zealand",
    "Oamaru, New Zealand",
    "Whakatane, New Zealand",
    "Kerikeri, New Zealand",
    "Ashburton, New Zealand",
    "Rangiora, New Zealand",
    "Paraparaumu, New Zealand",
    "Motueka, New Zealand",
    "Suva, Fiji",
    "Port Moresby, Papua New Guinea",
    "Nouméa, New Caledonia",
    "Port Vila, Vanuatu",
    "Apia, Samoa",
    "Nuku'alofa, Tonga",
    "Honolulu, Hawaii, USA",
    
    // Africa
    "Cairo, Egypt",
    "Alexandria, Egypt",
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Durban, South Africa",
    "Pretoria, South Africa",
    "Lagos, Nigeria",
    "Abuja, Nigeria",
    "Nairobi, Kenya",
    "Mombasa, Kenya",
    "Casablanca, Morocco",
    "Marrakech, Morocco",
    "Rabat, Morocco",
    "Accra, Ghana",
    "Kumasi, Ghana",
    "Addis Ababa, Ethiopia",
    "Tunis, Tunisia",
    "Algiers, Algeria",
    "Dakar, Senegal",
    "Dar es Salaam, Tanzania",
    "Kampala, Uganda",
    "Lusaka, Zambia",
    "Harare, Zimbabwe",
    "Kigali, Rwanda",
    "Windhoek, Namibia",
    "Gaborone, Botswana",
    "Maputo, Mozambique",
    "Libreville, Gabon",
    "Luanda, Angola",
    "Antananarivo, Madagascar",
    "Port Louis, Mauritius",
    "Victoria, Seychelles",
    "Tripoli, Libya",
    "Khartoum, Sudan",
    "Abidjan, Ivory Coast",
    "Bamako, Mali",
    "Ouagadougou, Burkina Faso",
    "Cotonou, Benin",
    "Lomé, Togo",
    "Yaoundé, Cameroon",
    
    // South America
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Brasília, Brazil",
    "Salvador, Brazil",
    "Recife, Brazil",
    "Fortaleza, Brazil",
    "Curitiba, Brazil",
    "Manaus, Brazil",
    "Porto Alegre, Brazil",
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
    "Caracas, Venezuela",
    "Maracaibo, Venezuela",
    "Valencia, Venezuela",
    "Montevideo, Uruguay",
    "Punta del Este, Uruguay",
    "Quito, Ecuador",
    "Guayaquil, Ecuador",
    "Asunción, Paraguay",
    "La Paz, Bolivia",
    "Santa Cruz, Bolivia",
    "Georgetown, Guyana",
    "Paramaribo, Suriname",
    "Cayenne, French Guiana"
  ];
  
  // State for location suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  // Initialize form data when user data changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        title: userData.title || '',
        location: userData.location || '',
        industry: userData.industry || '',
        lookingFor: userData.lookingFor || ''
      });
    }
  }, [userData]);

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
      
      // First try exact matches (most relevant)
      let filtered = popularLocations.filter(location => 
        location.toLowerCase().includes(inputValue)
      );
      
      // If no exact matches or very few, try fuzzy matching for spelling variations
      if (filtered.length < 3) {
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
          
          return false;
        });
        
        // Combine both sets of results with exact matches first
        filtered = [...filtered, ...alternativeMatches];
      }
      
      setLocationSuggestions(filtered.slice(0, 10)); // Show up to 10 suggestions
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
  
  // Reset suggestions when dialog closes
  useEffect(() => {
    if (!showEditBasicInfo) {
      setLocationSuggestions([]);
    }
  }, [showEditBasicInfo]);
  
  // Event handler for location suggestion div to prevent bubbling
  const handleSuggestionClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to keep dropdown open until selection
    event.stopPropagation();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

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
      {/* Edit Basic Info Dialog */}
      <Dialog open={showEditBasicInfo} onOpenChange={setShowEditBasicInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Info</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Your job title"
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your location"
                  autoComplete="off"
                />
                {locationSuggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-60 overflow-auto"
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
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="Your industry (e.g., Technology, Healthcare, Finance)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lookingFor">I am looking for</Label>
                <Input
                  id="lookingFor"
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleInputChange}
                  placeholder="What are you looking for? (e.g., Job opportunities, Mentorship)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditBasicInfo(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="profile" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <div className="text-right">
                <p className="text-sm text-gray-500">Profile Completion</p>
                <div className="flex items-center mt-1">
                  <div className="w-36 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div id="profile-completion-bar" className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">65%</span>
                </div>
              </div>
            </div>
            
            {/* Profile Header */}
            <Card className="mb-6 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
              <CardContent className="relative pt-16 pb-4">
                <div className="absolute -top-16 left-1/2 sm:left-6 transform -translate-x-1/2 sm:translate-x-0">
                  <div className="h-24 w-24 overflow-hidden rounded-full bg-white ring-4 ring-white flex items-center justify-center">
                    <img 
                      className="h-full w-full object-cover" 
                      src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                </div>
                <div className="pl-0 sm:pl-32 mt-12 sm:mt-2">
                  <div className="flex justify-between items-center group">
                    <h2 className="text-xl font-bold text-gray-900">{userData?.name || user?.name || 'User'}</h2>
                    <button 
                      onClick={() => setShowEditBasicInfo(true)}
                      className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{userData?.title || user?.title || 'Professional'}</p>
                  <p className="text-sm text-gray-500 mt-1">{userData?.location || user?.location || 'Location not specified'}</p>
                  {userData?.industry && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Industry:</span> {userData.industry}
                    </p>
                  )}
                  {userData?.lookingFor && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Looking for:</span> {userData.lookingFor}
                    </p>
                  )}
                </div>
                <div className="mt-4 pl-0 md:pl-32 flex flex-wrap gap-2">
                  {isLoadingSkills ? (
                    <p className="text-sm text-gray-500">Loading skills...</p>
                  ) : skills && skills.length > 0 ? (
                    skills.map((skill: any) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline" 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                      >
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-1">
                <ResumeUpload />
              </div>
              <div className="md:col-span-1">
                <LinkedInImport />
              </div>
            </div>
            
            {/* Work Experience */}
            <WorkExperience />
            
            {/* Education */}
            <Education />
            
            {/* Skills */}
            <Skills />
            
            {/* Action Buttons */}
            <div className="flex justify-between mb-6">
              <Button 
                variant="outline" 
                className="px-6"
                onClick={() => {
                  // Invalidate all queries to force fresh refetches
                  console.log("Manual refresh triggered");
                  
                  // Refresh all profile data queries
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/experiences`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/educations`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
                  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
                  
                  // Show toast notification
                  window.alert("Profile data refreshed. If you still don't see your updated profile data, please try uploading your resume or LinkedIn profile again.");
                }}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Data
              </Button>
              
              <Button className="px-6">
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
