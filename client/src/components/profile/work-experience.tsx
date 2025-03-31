import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WorkExperienceItem = {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
};

export default function WorkExperience() {
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([
    {
      id: 1,
      title: "Senior Data Analyst",
      company: "TechCorp Inc.",
      location: "New York, NY",
      startDate: "Jan 2020",
      endDate: "Present",
      description: "Led data analytics projects for Fortune 500 clients, improving business intelligence reporting efficiency by 35%. Developed automated data pipelines using Python and SQL."
    },
    {
      id: 2,
      title: "Data Analyst",
      company: "GlobalFinance",
      location: "Chicago, IL",
      startDate: "Mar 2018",
      endDate: "Dec 2019",
      description: "Conducted financial data analysis and created monthly reports for executive stakeholders. Improved data accuracy by implementing new validation procedures."
    }
  ]);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new work experience");
  };

  const handleEdit = (id: number) => {
    // In a real app, this would open a form modal with the experience data
    console.log("Edit experience", id);
  };

  const handleDelete = (id: number) => {
    // In a real app, this would show a confirmation dialog
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Work Experience</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-600 hover:bg-transparent"
            onClick={handleAdd}
          >
            <i className="fas fa-plus mr-1"></i> Add
          </Button>
        </div>
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">{exp.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{exp.company} • {exp.location}</p>
                  <p className="text-sm text-gray-500 mt-1">{exp.startDate} - {exp.endDate}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => handleEdit(exp.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => handleDelete(exp.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
