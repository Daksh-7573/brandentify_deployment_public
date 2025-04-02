import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface JobTitleComboboxProps {
  value: string
  onChange: (value: string) => void
}

const JOB_TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Data Scientist",
  "Data Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Researcher",
  "Product Manager",
  "Project Manager",
  "Program Manager",
  "UX Designer",
  "UI Designer",
  "Graphic Designer",
  "Web Designer",
  "QA Engineer",
  "Test Engineer",
  "Technical Writer",
  "System Administrator",
  "Network Engineer",
  "Security Engineer",
  "Cloud Engineer",
  "Database Administrator",
  "Scrum Master",
  "Agile Coach",
  "IT Support Specialist",
  "Business Analyst",
  "Sales Representative",
  "Sales Manager",
  "Marketing Manager",
  "Digital Marketing Specialist",
  "Content Writer",
  "SEO Specialist",
  "HR Manager",
  "Recruiter",
  "Talent Acquisition Specialist",
  "Operations Manager",
  "Finance Manager",
  "Accountant",
  "Customer Support Representative",
  "Executive Assistant",
  "Office Manager",
  "Chief Executive Officer (CEO)",
  "Chief Technology Officer (CTO)",
  "Chief Information Officer (CIO)",
  "Chief Financial Officer (CFO)",
  "Chief Operating Officer (COO)",
  "Chief Marketing Officer (CMO)",
  "Chief Product Officer (CPO)",
  "Chief Human Resources Officer (CHRO)",
  "Vice President (VP) of Engineering",
  "Vice President (VP) of Sales",
  "Vice President (VP) of Marketing",
  "Vice President (VP) of Product",
  "Director of Engineering",
  "Director of Product",
  "Director of Marketing",
  "Director of Sales",
  "Engineering Manager",
  "Product Manager",
  "Technical Project Manager",
  "Student",
  "Graduate Student",
  "PhD Candidate",
  "Postdoctoral Researcher",
  "Professor",
  "Teacher",
  "Lecturer",
  "Research Scientist",
  "Physician",
  "Nurse",
  "Pharmacist",
  "Lawyer",
  "Attorney",
  "Consultant",
  "Management Consultant",
  "Freelancer",
  "Entrepreneur",
  "Founder",
  "Co-Founder",
  "Small Business Owner",
  "Architect",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Chemical Engineer",
  "Industrial Designer",
  "Construction Manager",
  "Real Estate Agent",
  "Insurance Agent",
  "Financial Advisor",
  "Investment Banker",
  "Portfolio Manager",
  "Trader",
  "Broker",
  "Bank Teller",
  "Loan Officer",
  "Accountant",
  "CPA",
  "Tax Preparer",
  "Bookkeeper",
  "Auditor",
  "Compliance Officer",
  "Risk Manager",
  "Underwriter",
  "Actuary",
  "Chef",
  "Baker",
  "Bartender",
  "Barista",
  "Server",
  "Host/Hostess",
  "Restaurant Manager",
  "Hotel Manager",
  "Flight Attendant",
  "Pilot",
  "Driver",
  "Truck Driver",
  "Delivery Driver",
  "Logistics Coordinator",
  "Supply Chain Manager",
  "Warehouse Manager",
  "Inventory Specialist",
  "Retail Sales Associate",
  "Store Manager",
  "Cashier",
  "Customer Service Representative",
  "Call Center Agent",
  "Technical Support Representative",
  "Help Desk Technician",
  "Social Media Manager",
  "Content Creator",
  "Influencer",
  "Blogger",
  "Vlogger",
  "Podcast Host",
  "Journalist",
  "Editor",
  "Writer",
  "Translator",
  "Interpreter",
  "Actor",
  "Actress",
  "Director",
  "Producer",
  "Filmmaker",
  "Animator",
  "Game Developer",
  "Video Game Designer",
  "Musician",
  "Singer",
  "Composer",
  "Sound Engineer",
  "DJ",
  "Dancer",
  "Choreographer",
  "Photographer",
  "Videographer",
  "Artist",
  "Illustrator",
  "Interior Designer",
  "Fashion Designer",
  "Stylist",
  "Makeup Artist",
  "Hair Stylist",
  "Personal Trainer",
  "Fitness Instructor",
  "Yoga Teacher",
  "Coach",
  "Sports Instructor",
  "Professional Athlete",
  "Therapist",
  "Counselor",
  "Psychologist",
  "Psychiatrist",
  "Social Worker",
  "Dietitian",
  "Nutritionist",
  "Physical Therapist",
  "Occupational Therapist",
  "Speech Therapist",
  "Massage Therapist",
  "Chiropractor",
  "Dentist",
  "Dental Hygienist",
  "Optometrist",
  "Optician",
  "Veterinarian",
  "Veterinary Technician",
  "Zoologist",
  "Wildlife Biologist",
  "Marine Biologist",
  "Environmental Scientist",
  "Conservation Scientist",
  "Geologist",
  "Meteorologist",
  "Astronomer",
  "Physicist",
  "Chemist",
  "Biologist",
  "Biochemist",
  "Microbiologist",
  "Geneticist",
  "Botanist",
  "Horticulturist",
  "Landscape Architect",
  "Urban Planner",
  "Surveyor",
  "Carpenter",
  "Electrician",
  "Plumber",
  "Welder",
  "Mechanic",
  "HVAC Technician",
  "Auto Mechanic",
  "Aircraft Mechanic",
  "Machinist",
  "Blacksmith",
  "Jeweler",
  "Tailor",
  "Seamstress",
  "Woodworker",
  "Craftsman",
  "Artisan",
  "Farmer",
  "Rancher",
  "Agricultural Manager",
  "Agricultural Scientist",
  "Fisherman",
  "Logger",
  "Miner",
  "Oil Rig Worker",
  "Wind Turbine Technician",
  "Solar Panel Installer",
  "Firefighter",
  "Police Officer",
  "Security Guard",
  "Military Officer",
  "Military Enlisted",
  "Paramedic",
  "EMT",
  "Lifeguard",
  "Park Ranger",
  "Government Official",
  "Diplomat",
  "Foreign Service Officer",
  "Intelligence Officer",
  "Analyst",
  "Policy Advisor",
  "Lobbyist",
  "Community Organizer",
  "Non-Profit Director",
  "Volunteer Coordinator",
  "Fundraiser",
  "Grant Writer",
  "Archivist",
  "Librarian",
  "Curator",
  "Museum Director",
  "Historian",
  "Archaeologist",
  "Anthropologist",
  "Sociologist",
  "Economist",
  "Political Scientist",
  "Linguist",
  "Philosopher",
  "Theologian",
  "Clergy",
  "Religious Leader",
  "Life Coach",
  "Career Coach",
  "Executive Coach",
  "Travel Agent",
  "Tour Guide",
  "Event Planner",
  "Wedding Planner",
  "Party Planner",
  "Florist",
  "Mortician",
  "Funeral Director",
];

export function JobTitleCombobox({
  value,
  onChange,
}: JobTitleComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Filter job titles based on search term
  const filteredTitles = React.useMemo(() => {
    if (!searchTerm) return JOB_TITLES
    
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return JOB_TITLES.filter(title => 
      title.toLowerCase().includes(lowercasedSearchTerm)
    )
  }, [searchTerm])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select job title..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search job title..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No job title found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {filteredTitles.map((title) => (
              <CommandItem
                key={title}
                value={title}
                onSelect={(currentValue) => {
                  onChange(currentValue)
                  setOpen(false)
                  setSearchTerm("")
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === title ? "opacity-100" : "opacity-0"
                  )}
                />
                {title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}