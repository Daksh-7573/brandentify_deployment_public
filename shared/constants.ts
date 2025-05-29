// Shared constants for industry and domain mappings
// This ensures consistency across all components

export interface IndustryDomainMap {
  [key: string]: string[];
}

export const INDUSTRY_DOMAINS: IndustryDomainMap = {
  "Technology": [
    "Software Development", 
    "IT Services", 
    "Hardware", 
    "Cloud Computing", 
    "AI/Machine Learning", 
    "Cybersecurity", 
    "Data Science", 
    "DevOps",
    "Blockchain",
    "IoT"
  ],
  "Finance": [
    "Banking", 
    "Investment Banking", 
    "Venture Capital", 
    "Private Equity", 
    "Financial Services", 
    "Insurance", 
    "FinTech", 
    "Accounting",
    "Wealth Management",
    "Risk Management"
  ],
  "Healthcare": [
    "Hospital Management", 
    "Medical Devices", 
    "Pharmaceuticals", 
    "Biotechnology", 
    "Healthcare IT", 
    "Mental Health", 
    "Telehealth", 
    "Public Health",
    "Health Insurance",
    "Elder Care"
  ],
  "Education": [
    "K-12 Education",
    "Higher Education",
    "Online Learning",
    "Educational Technology",
    "Curriculum Development",
    "Academic Administration",
    "Student Services",
    "Educational Research",
    "Training & Development",
    "Language Learning"
  ],
  "Consulting": [
    "Management Consulting",
    "Strategy Consulting",
    "Technology Consulting",
    "Financial Consulting",
    "HR Consulting",
    "Operations Consulting",
    "Marketing Consulting",
    "Legal Consulting",
    "Environmental Consulting",
    "Business Process Improvement"
  ],
  "Marketing": [
    "Digital Marketing",
    "Content Marketing",
    "Social Media Marketing",
    "Brand Management",
    "Public Relations",
    "Advertising",
    "Market Research",
    "Email Marketing",
    "SEO/SEM",
    "Event Marketing"
  ],
  "Media": [
    "Journalism",
    "Broadcasting",
    "Film & Video Production",
    "Publishing",
    "Digital Media",
    "Social Media",
    "Photography",
    "Graphic Design",
    "Content Creation",
    "Media Planning"
  ],
  "Entertainment": [
    "Film & Television",
    "Music Industry",
    "Gaming",
    "Sports & Recreation",
    "Theater & Performing Arts",
    "Event Production",
    "Talent Management",
    "Entertainment Marketing",
    "Streaming Platforms",
    "Live Events"
  ],
  "Retail": [
    "Fashion & Apparel",
    "E-commerce",
    "Consumer Electronics",
    "Food & Beverage",
    "Home & Garden",
    "Automotive Retail",
    "Luxury Goods",
    "Sporting Goods",
    "Beauty & Personal Care",
    "Book & Media Retail"
  ],
  "Manufacturing": [
    "Automotive Manufacturing",
    "Electronics Manufacturing",
    "Aerospace & Defense",
    "Chemical Manufacturing",
    "Food Processing",
    "Textile Manufacturing",
    "Industrial Equipment",
    "Consumer Goods",
    "Pharmaceutical Manufacturing",
    "Medical Device Manufacturing"
  ],
  "Energy": [
    "Oil & Gas",
    "Renewable Energy",
    "Solar Energy",
    "Wind Energy",
    "Nuclear Energy",
    "Energy Trading",
    "Utilities",
    "Energy Storage",
    "Energy Efficiency",
    "Power Generation"
  ],
  "Transportation": [
    "Airlines",
    "Shipping & Logistics",
    "Railway Transportation",
    "Trucking & Freight",
    "Public Transportation",
    "Ride Sharing",
    "Supply Chain Management",
    "Warehousing",
    "Port Operations",
    "Transportation Technology"
  ],
  "Real Estate": [
    "Residential Real Estate",
    "Commercial Real Estate",
    "Property Management",
    "Real Estate Development",
    "Real Estate Investment",
    "Construction Management",
    "Architecture",
    "Urban Planning",
    "Property Valuation",
    "Real Estate Technology"
  ],
  "Hospitality": [
    "Hotels & Resorts",
    "Restaurants & Food Service",
    "Travel & Tourism",
    "Event Planning",
    "Cruise Lines",
    "Casino & Gaming",
    "Hospitality Technology",
    "Vacation Rentals",
    "Corporate Travel",
    "Destination Management"
  ],
  "Agriculture": [
    "Crop Production",
    "Livestock",
    "Agricultural Technology",
    "Food Safety",
    "Sustainable Agriculture",
    "Agricultural Finance",
    "Farm Management",
    "Agricultural Research",
    "Aquaculture",
    "Agricultural Equipment"
  ],
  "Construction": [
    "Residential Construction",
    "Commercial Construction",
    "Infrastructure Development",
    "Construction Management",
    "Building Materials",
    "Green Building",
    "Heavy Construction",
    "Specialty Trades",
    "Construction Technology",
    "Project Management"
  ],
  "Nonprofit": [
    "Social Services",
    "Environmental Conservation",
    "Education & Literacy",
    "Healthcare Access",
    "Human Rights",
    "Community Development",
    "Arts & Culture",
    "Religious Organizations",
    "International Aid",
    "Advocacy & Policy"
  ],
  "Government": [
    "Federal Government",
    "State Government",
    "Local Government",
    "Public Policy",
    "Defense & Security",
    "Public Administration",
    "Law Enforcement",
    "Regulatory Affairs",
    "Public Health",
    "International Relations"
  ]
};

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Consulting",
  "Marketing",
  "Media",
  "Entertainment",
  "Retail",
  "Manufacturing",
  "Energy",
  "Transportation",
  "Real Estate",
  "Hospitality",
  "Agriculture",
  "Construction",
  "Nonprofit",
  "Government"
];

// Looking for options
export const LOOKING_FOR_OPTIONS = [
  "Job Opportunities",
  "Networking",
  "Mentorship",
  "Collaboration",
  "Investment",
  "Learning",
  "Career Advice",
  "Business Partnerships"
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level", 
  "Senior Level",
  "Executive Level",
  "Intern",
  "Student"
];