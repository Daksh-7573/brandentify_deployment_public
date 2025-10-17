import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X, Plus, Briefcase, GraduationCap, FolderKanban } from "lucide-react";

interface OnboardingTier4Props {
  onComplete: (data: {
    projects?: Array<{ title: string; description: string }>;
    workExperiences?: Array<{ title: string; company: string; startDate: string; endDate?: string }>;
    educations?: Array<{ degree: string; institution: string; startDate: string; endDate?: string }>;
  }) => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingTier4({ 
  onComplete, 
  onBack,
  onSkip
}: OnboardingTier4Props) {
  const [projects, setProjects] = useState<Array<{ title: string; description: string }>>([]);
  const [workExperiences, setWorkExperiences] = useState<Array<{ title: string; company: string; startDate: string; endDate?: string }>>([]);
  const [educations, setEducations] = useState<Array<{ degree: string; institution: string; startDate: string; endDate?: string }>>([]);

  const addProject = () => {
    setProjects([...projects, { title: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: 'title' | 'description', value: string) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { title: "", company: "", startDate: "", endDate: "" }]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const updateWorkExperience = (index: number, field: 'title' | 'company' | 'startDate' | 'endDate', value: string) => {
    const newExperiences = [...workExperiences];
    newExperiences[index][field] = value;
    setWorkExperiences(newExperiences);
  };

  const addEducation = () => {
    setEducations([...educations, { degree: "", institution: "", startDate: "", endDate: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: 'degree' | 'institution' | 'startDate' | 'endDate', value: string) => {
    const newEducations = [...educations];
    newEducations[index][field] = value;
    setEducations(newEducations);
  };

  const handleContinue = () => {
    const validProjects = projects.filter(p => p.title.trim() && p.description.trim());
    const validWorkExperiences = workExperiences.filter(w => w.title.trim() && w.company.trim() && w.startDate.trim());
    const validEducations = educations.filter(e => e.degree.trim() && e.institution.trim() && e.startDate.trim());

    onComplete({ 
      projects: validProjects.length > 0 ? validProjects : undefined,
      workExperiences: validWorkExperiences.length > 0 ? validWorkExperiences : undefined,
      educations: validEducations.length > 0 ? validEducations : undefined
    });
  };

  const hasAnyData = 
    projects.some(p => p.title.trim() || p.description.trim()) ||
    workExperiences.some(w => w.title.trim() || w.company.trim()) ||
    educations.some(e => e.degree.trim() || e.institution.trim());

  return (
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-y-auto py-8">
        <div className="w-full max-w-4xl my-8">
          <NeoGlassSection className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                🚀 Complete Your Profile
              </h1>
              
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                Add projects, experience, and education
              </p>
              
              <p className="text-white/60 max-w-2xl mx-auto text-sm">
                This section is optional but helps build a comprehensive professional profile
              </p>
            </div>

            {/* Form */}
            <div className="space-y-8 mb-8">
              {/* Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium text-lg flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-blue-400" />
                    Projects <span className="text-white/60 text-sm font-normal">(Optional)</span>
                  </Label>
                  <Button
                    onClick={addProject}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-white/10"
                    data-testid="button-add-project"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Project
                  </Button>
                </div>

                {projects.length > 0 && (
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
                        <div className="flex justify-between items-start">
                          <Label className="text-white/80 text-sm">Project {index + 1}</Label>
                          <Button
                            onClick={() => removeProject(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 -mt-1"
                            data-testid={`button-remove-project-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={project.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                          placeholder="Project title"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                          data-testid={`input-project-title-${index}`}
                        />
                        <Textarea
                          value={project.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Brief description of the project..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40 min-h-20"
                          data-testid={`textarea-project-description-${index}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Experience Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                    Work Experience <span className="text-white/60 text-sm font-normal">(Optional)</span>
                  </Label>
                  <Button
                    onClick={addWorkExperience}
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300 hover:bg-white/10"
                    data-testid="button-add-work"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Experience
                  </Button>
                </div>

                {workExperiences.length > 0 && (
                  <div className="space-y-4">
                    {workExperiences.map((work, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
                        <div className="flex justify-between items-start">
                          <Label className="text-white/80 text-sm">Experience {index + 1}</Label>
                          <Button
                            onClick={() => removeWorkExperience(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 -mt-1"
                            data-testid={`button-remove-work-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={work.title}
                            onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                            placeholder="Job title"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-work-title-${index}`}
                          />
                          <Input
                            value={work.company}
                            onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                            placeholder="Company"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-work-company-${index}`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="month"
                            value={work.startDate}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                            placeholder="Start date"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-work-start-${index}`}
                          />
                          <Input
                            type="month"
                            value={work.endDate}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                            placeholder="End date (or leave blank)"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-work-end-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-400" />
                    Education <span className="text-white/60 text-sm font-normal">(Optional)</span>
                  </Label>
                  <Button
                    onClick={addEducation}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300 hover:bg-white/10"
                    data-testid="button-add-education"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Education
                  </Button>
                </div>

                {educations.length > 0 && (
                  <div className="space-y-4">
                    {educations.map((edu, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
                        <div className="flex justify-between items-start">
                          <Label className="text-white/80 text-sm">Education {index + 1}</Label>
                          <Button
                            onClick={() => removeEducation(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 -mt-1"
                            data-testid={`button-remove-education-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="Degree/Certification"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-edu-degree-${index}`}
                          />
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="Institution"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-edu-institution-${index}`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            placeholder="Start date"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-edu-start-${index}`}
                          />
                          <Input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            placeholder="End date (or leave blank)"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:border-white/40"
                            data-testid={`input-edu-end-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Value Preview */}
              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💼</div>
                  <div>
                    <div className="text-white font-medium mb-1">Build your professional story:</div>
                    <div className="text-white/80 text-sm">
                      Adding your background helps:
                    </div>
                    <div className="mt-2 space-y-1.5 text-white/70 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">🎯</span>
                        <span>Create a comprehensive portfolio that stands out</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">🎯</span>
                        <span>Connect with others based on shared experiences</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">🎯</span>
                        <span>Showcase your growth and achievements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                data-testid="button-back"
              >
                ← Back
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  data-testid="button-skip-tier3"
                >
                  Skip for now
                </Button>

                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105"
                  data-testid="button-complete-tier3"
                >
                  Complete Setup →
                </Button>
              </div>
            </div>

            {/* Time Indicator */}
            <div className="text-center mt-6 text-white/50 text-sm">
              Step 5 of 5 · Final step! ~10 minutes
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </div>
  );
}
