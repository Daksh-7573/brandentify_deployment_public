import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Briefcase } from "lucide-react"
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
import { Input } from "@/components/ui/input"

// Common job titles for the combobox
const commonJobTitles = [
  // Technology & IT
  "Software Engineer",
  "Senior Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI Researcher",
  "UI/UX Designer",
  "Product Designer",
  "Product Manager",
  "Project Manager",
  "Scrum Master",
  "QA Engineer",
  "Systems Administrator",
  "Cloud Engineer",
  "Security Engineer",
  "Database Administrator",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "CTO",
  "VP of Engineering",
  "Technical Lead",
  "Engineering Manager",
  "IT Support Specialist",
  "Network Engineer",
  
  // Business & Finance
  "CEO",
  "COO",
  "CFO",
  "Business Analyst",
  "Financial Analyst",
  "Investment Banker",
  "Accountant",
  "Financial Controller",
  "Auditor",
  "Tax Specialist",
  "Management Consultant",
  "Strategy Consultant",
  "Business Development Manager",
  "Sales Representative",
  "Account Executive",
  "Account Manager",
  "Customer Success Manager",
  "Operations Manager",
  "Supply Chain Manager",
  "Procurement Specialist",
  
  // Marketing & Communications
  "Marketing Manager",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "Content Marketing Manager",
  "Social Media Manager",
  "Brand Manager",
  "Public Relations Specialist",
  "Communications Manager",
  "Copywriter",
  "Content Writer",
  "Graphic Designer",
  "Creative Director",
  "Art Director",
  "UX Writer",
  "Marketing Analyst",
  
  // Healthcare
  "Medical Doctor",
  "Physician",
  "Nurse",
  "Nurse Practitioner",
  "Pharmacist",
  "Physical Therapist",
  "Occupational Therapist",
  "Dentist",
  "Dental Hygienist",
  "Veterinarian",
  "Medical Researcher",
  "Healthcare Administrator",
  "Medical Assistant",
  "Clinical Research Associate",
  
  // Education
  "Teacher",
  "Professor",
  "Tutor",
  "School Principal",
  "Dean",
  "Academic Advisor",
  "Education Consultant",
  "Curriculum Developer",
  "Special Education Teacher",
  "School Counselor",
  
  // Legal
  "Lawyer",
  "Attorney",
  "Legal Counsel",
  "Paralegal",
  "Judge",
  "Legal Consultant",
  "Compliance Officer",
  
  // Engineering & Construction
  "Mechanical Engineer",
  "Civil Engineer",
  "Electrical Engineer",
  "Structural Engineer",
  "Architect",
  "Construction Manager",
  "Project Engineer",
  "Environmental Engineer",
  "Aerospace Engineer",
  
  // Arts & Entertainment
  "Graphic Designer",
  "Illustrator",
  "Photographer",
  "Videographer",
  "Film Director",
  "Actor",
  "Musician",
  "Writer",
  "Journalist",
  "Editor",
  
  // Human Resources
  "HR Manager",
  "Recruiter",
  "Talent Acquisition Specialist",
  "HR Generalist",
  "Learning & Development Specialist",
  "Compensation Analyst",
  "Employee Relations Manager",
  
  // Customer Service
  "Customer Service Representative",
  "Customer Support Specialist",
  "Help Desk Support",
  "Call Center Agent",
  
  // Others
  "Consultant",
  "Freelancer",
  "Intern",
  "Researcher",
  "Analyst",
];

interface JobTitleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function JobTitleCombobox({ value, onChange, disabled = false, error = false }: JobTitleComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // Filter job titles based on search
  const filteredJobTitles = React.useMemo(() => {
    if (!searchTerm) return commonJobTitles;
    
    return commonJobTitles.filter((title) =>
      title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  
  // Handle custom job title input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customValue = e.target.value;
    setSearchTerm(customValue);
    onChange(customValue);
  };
  
  return (
    <div>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground",
                error && "border-red-500"
              )}
              disabled={disabled}
            >
              <div className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                {value || "Select job title..."}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput 
                placeholder="Search job title..." 
                className="h-9" 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandEmpty>
                <div className="p-2 text-sm">
                  <p className="text-muted-foreground">No job title found</p>
                  <p className="text-muted-foreground text-xs mt-1">You can enter a custom job title</p>
                  <Input
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="mt-2"
                    placeholder="Enter custom job title"
                  />
                </div>
              </CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {filteredJobTitles.map((title) => (
                  <CommandItem
                    key={title}
                    value={title}
                    onSelect={() => {
                      onChange(title);
                      setSearchTerm("");
                      setOpen(false);
                    }}
                  >
                    {title}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === title ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}