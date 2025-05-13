import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  AlertCircle, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  BadgeInfo
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Define the structure of data extracted from resume
interface ExtractedData {
  personalInfo?: {
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    summary?: string;
  };
  skills?: {
    name: string;
    category?: string;
    level?: number;
  }[];
  workExperience?: {
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    highlights?: string[];
    industry?: string;
    domain?: string;
  }[];
  education?: {
    degree: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    fieldOfStudy?: string;
    gpa?: string;
    achievements?: string[];
  }[];
  projects?: {
    title: string;
    description?: string;
    technologies?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }[];
  certifications?: {
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }[];
}

// Define what fields are mapped to profile
interface ProfileMapping {
  personalInfo: {
    include: boolean;
    edited: boolean;
    data: ExtractedData['personalInfo'];
  };
  skills: {
    include: boolean;
    edited: boolean;
    data: ExtractedData['skills'];
  };
  workExperience: {
    include: boolean;
    edited: boolean;
    data: ExtractedData['workExperience'];
  };
  education: {
    include: boolean;
    edited: boolean;
    data: ExtractedData['education'];
  };
  projects: {
    include: boolean;
    edited: boolean;
    data: ExtractedData['projects'];
  };
}

interface ResumeMappingProps {
  extractedData: ExtractedData;
  onApproveMapping: (mappedData: ProfileMapping) => void;
  onCancel: () => void;
}

export function ResumeMapping({ extractedData, onApproveMapping, onCancel }: ResumeMappingProps) {
  const { toast } = useToast();
  
  // Initialize mapping with extracted data
  const [mapping, setMapping] = useState<ProfileMapping>({
    personalInfo: {
      include: true,
      edited: false,
      data: extractedData.personalInfo || {}
    },
    skills: {
      include: true,
      edited: false,
      data: extractedData.skills || []
    },
    workExperience: {
      include: true,
      edited: false,
      data: extractedData.workExperience || []
    },
    education: {
      include: true,
      edited: false,
      data: extractedData.education || []
    },
    projects: {
      include: true,
      edited: false,
      data: extractedData.projects || []
    }
  });
  
  // Track current editing section
  const [activeTab, setActiveTab] = useState("personalInfo");
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    let totalSections = 0;
    let completedSections = 0;
    
    Object.entries(mapping).forEach(([key, section]) => {
      if (extractedData[key as keyof ExtractedData] && 
          Array.isArray(extractedData[key as keyof ExtractedData]) ? 
          (extractedData[key as keyof ExtractedData] as any[]).length > 0 : 
          Object.keys(extractedData[key as keyof ExtractedData] || {}).length > 0) {
        totalSections++;
        if (section.include) {
          completedSections++;
        }
      }
    });
    
    return totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  };
  
  const handleToggleSection = (section: keyof ProfileMapping) => {
    setMapping(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        include: !prev[section].include
      }
    }));
  };
  
  const handleEditPersonalInfo = (field: string, value: string) => {
    setMapping(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        edited: true,
        data: {
          ...(prev.personalInfo.data || {}),
          [field]: value
        }
      }
    }));
  };
  
  const handleApproveMapping = () => {
    onApproveMapping(mapping);
    
    toast({
      title: "Profile mapping approved",
      description: "Your profile will be updated with the selected information",
      variant: "default"
    });
  };
  
  const handleSkipAll = () => {
    onCancel();
    
    toast({
      title: "Resume mapping skipped",
      description: "No changes have been made to your profile",
      variant: "default"
    });
  };
  
  // Render section status icon
  const renderSectionStatus = (section: keyof ProfileMapping) => {
    if (mapping[section].include) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get section icon
  const getSectionIcon = (section: string) => {
    switch(section) {
      case 'personalInfo': return <User className="h-5 w-5" />;
      case 'workExperience': return <Briefcase className="h-5 w-5" />;
      case 'education': return <GraduationCap className="h-5 w-5" />;
      case 'skills': return <Code className="h-5 w-5" />;
      case 'projects': return <BadgeInfo className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Review & Confirm</CardTitle>
        <CardDescription>
          Review what Musk found in your resume and confirm what to add to your profile
        </CardDescription>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm">{Math.round(calculateCompletionPercentage())}%</span>
          </div>
          <Progress value={calculateCompletionPercentage()} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="personalInfo" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Info
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Code className="h-4 w-4" /> Skills
            </TabsTrigger>
            <TabsTrigger value="workExperience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Work
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Education
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <BadgeInfo className="h-4 w-4" /> Projects
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Info Section */}
          <TabsContent value="personalInfo">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" /> Personal Information
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={mapping.personalInfo.include ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggleSection('personalInfo')}
                  >
                    {mapping.personalInfo.include ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Include</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-2" /> Skip</>
                    )}
                  </Button>
                </div>
              </div>
              
              {!mapping.personalInfo.include && (
                <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                  This section will be skipped when updating your profile
                </div>
              )}
              
              {mapping.personalInfo.include && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={mapping.personalInfo.data?.name || ''} 
                        onChange={(e) => handleEditPersonalInfo('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input 
                        id="title" 
                        value={mapping.personalInfo.data?.title || ''} 
                        onChange={(e) => handleEditPersonalInfo('title', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={mapping.personalInfo.data?.location || ''} 
                        onChange={(e) => handleEditPersonalInfo('location', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={mapping.personalInfo.data?.email || ''} 
                        onChange={(e) => handleEditPersonalInfo('email', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea 
                      id="summary" 
                      rows={4}
                      value={mapping.personalInfo.data?.summary || ''} 
                      onChange={(e) => handleEditPersonalInfo('summary', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Skills Section - Simplified for brevity */}
          <TabsContent value="skills">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" /> Professional Skills
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={mapping.skills.include ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggleSection('skills')}
                  >
                    {mapping.skills.include ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Include</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-2" /> Skip</>
                    )}
                  </Button>
                </div>
              </div>
              
              {!mapping.skills.include && (
                <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                  This section will be skipped when updating your profile
                </div>
              )}
              
              {mapping.skills.include && (
                <div className="space-y-4">
                  {mapping.skills.data && mapping.skills.data.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {mapping.skills.data.map((skill, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            {skill.category && (
                              <p className="text-sm text-muted-foreground">Category: {skill.category}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-md text-center text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p>No skills found in your resume</p>
                      <Button variant="outline" size="sm" className="mt-2">Add Skills Manually</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Work Experience - Simplified for brevity */}
          <TabsContent value="workExperience">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Work Experience
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={mapping.workExperience.include ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggleSection('workExperience')}
                  >
                    {mapping.workExperience.include ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Include</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-2" /> Skip</>
                    )}
                  </Button>
                </div>
              </div>
              
              {!mapping.workExperience.include && (
                <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                  This section will be skipped when updating your profile
                </div>
              )}
              
              {mapping.workExperience.include && (
                <div className="space-y-4">
                  {mapping.workExperience.data && mapping.workExperience.data.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {mapping.workExperience.data.map((job, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{job.title}</h4>
                              <p className="text-muted-foreground">{job.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {job.location && <p>{job.location}</p>}
                            {(job.startDate || job.endDate) && (
                              <p>{job.startDate || 'N/A'} - {job.endDate || 'Present'}</p>
                            )}
                          </div>
                          {job.description && (
                            <p className="mt-2 text-sm line-clamp-2">{job.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-md text-center text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p>No work experience found in your resume</p>
                      <Button variant="outline" size="sm" className="mt-2">Add Work Experience Manually</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Education - Simplified for brevity */}
          <TabsContent value="education">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" /> Education
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={mapping.education.include ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggleSection('education')}
                  >
                    {mapping.education.include ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Include</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-2" /> Skip</>
                    )}
                  </Button>
                </div>
              </div>
              
              {!mapping.education.include && (
                <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                  This section will be skipped when updating your profile
                </div>
              )}
              
              {mapping.education.include && (
                <div className="space-y-4">
                  {mapping.education.data && mapping.education.data.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {mapping.education.data.map((edu, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-muted-foreground">{edu.institution}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {edu.location && <p>{edu.location}</p>}
                            {(edu.startDate || edu.endDate) && (
                              <p>{edu.startDate || 'N/A'} - {edu.endDate || 'Present'}</p>
                            )}
                          </div>
                          {edu.fieldOfStudy && (
                            <p className="mt-2 text-sm">{edu.fieldOfStudy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-md text-center text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p>No education history found in your resume</p>
                      <Button variant="outline" size="sm" className="mt-2">Add Education Manually</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Projects - Simplified for brevity */}
          <TabsContent value="projects">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BadgeInfo className="h-5 w-5" /> Projects
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={mapping.projects.include ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleToggleSection('projects')}
                  >
                    {mapping.projects.include ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Include</>
                    ) : (
                      <><XCircle className="h-4 w-4 mr-2" /> Skip</>
                    )}
                  </Button>
                </div>
              </div>
              
              {!mapping.projects.include && (
                <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                  This section will be skipped when updating your profile
                </div>
              )}
              
              {mapping.projects.include && (
                <div className="space-y-4">
                  {mapping.projects.data && mapping.projects.data.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {mapping.projects.data.map((project, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{project.title}</h4>
                              {project.technologies && (
                                <p className="text-sm text-muted-foreground">
                                  {project.technologies.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {project.description && (
                            <p className="mt-2 text-sm line-clamp-2">{project.description}</p>
                          )}
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary mt-2 inline-block"
                            >
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-md text-center text-muted-foreground flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p>No projects found in your resume</p>
                      <Button variant="outline" size="sm" className="mt-2">Add Projects Manually</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 border-t pt-4 flex justify-between">
          <Button variant="outline" onClick={handleSkipAll}>
            Skip All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleApproveMapping}>
              Approve & Update Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}