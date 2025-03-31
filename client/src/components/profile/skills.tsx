import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SkillItem = {
  id: number;
  name: string;
  level: string; // "Beginner", "Intermediate", "Advanced"
  proficiency: number; // Percentage 0-100
};

export default function Skills() {
  const [skills, setSkills] = useState<SkillItem[]>([
    { id: 1, name: "Data Analysis", level: "Advanced", proficiency: 85 },
    { id: 2, name: "SQL", level: "Intermediate", proficiency: 60 },
    { id: 3, name: "Python", level: "Intermediate", proficiency: 65 },
    { id: 4, name: "Excel", level: "Advanced", proficiency: 90 },
    { id: 5, name: "Data Visualization", level: "Beginner", proficiency: 30 }
  ]);

  const handleAdd = () => {
    // In a real app, this would open a form modal
    console.log("Add new skill");
  };

  // Get color based on proficiency
  const getColor = (proficiency: number) => {
    if (proficiency >= 80) return "bg-green-500";
    if (proficiency >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Skills</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-600 hover:bg-transparent"
            onClick={handleAdd}
          >
            <i className="fas fa-plus mr-1"></i> Add
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.id} className="border border-gray-200 rounded-md p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span className="text-xs text-gray-500">{skill.level}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`${getColor(skill.proficiency)} h-1.5 rounded-full`} 
                  style={{ width: `${skill.proficiency}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
