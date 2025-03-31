import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EducationItem = {
  id: number;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
};

export default function Education() {
  const [educations, setEducations] = useState<EducationItem[]>([
    {
      id: 1,
      degree: "Master of Science in Analytics",
      institution: "University of Chicago",
      location: "Chicago, IL",
      startDate: "2016",
      endDate: "2018"
    },
    {
      id: 2,
      degree: "Bachelor of Science in Mathematics",
      institution: "University of Michigan",
      location: "Ann Arbor, MI",
      startDate: "2012",
      endDate: "2016"
    }
  ]);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new education");
  };

  const handleEdit = (id: number) => {
    // In a real app, this would open a form modal with the education data
    console.log("Edit education", id);
  };

  const handleDelete = (id: number) => {
    // In a real app, this would show a confirmation dialog
    setEducations(educations.filter(edu => edu.id !== id));
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Education</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-600 hover:bg-transparent"
            onClick={handleAdd}
          >
            <i className="fas fa-plus mr-1"></i> Add
          </Button>
        </div>
        <div className="space-y-6">
          {educations.map((edu) => (
            <div key={edu.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-500 mt-1">{edu.institution} • {edu.location}</p>
                  <p className="text-sm text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => handleEdit(edu.id)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => handleDelete(edu.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
