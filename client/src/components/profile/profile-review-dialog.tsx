import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Define types for parsed profile data
export type ParsedExperience = {
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
};

export type ParsedEducation = {
  degree: string;
  institution: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
};

export type ParsedSkill = {
  name: string;
  level: string;
  proficiency: number | null;
};

export type ParsedProfileData = {
  title?: string;
  location?: string;
  experiences: ParsedExperience[];
  educations: ParsedEducation[];
  skills: ParsedSkill[];
  counts: {
    experiences: number;
    educations: number;
    skills: number;
  };
  status?: string;
  message?: string;
};

interface ProfileReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedData: ParsedProfileData | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isConfirming: boolean;
  source: 'resume' | 'linkedin';
}

export function ProfileReviewDialog({
  open,
  onOpenChange,
  parsedData,
  onConfirm,
  onCancel,
  isConfirming,
  source
}: ProfileReviewDialogProps) {
  const [activeTab, setActiveTab] = useState("experience");

  if (!parsedData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>
          Confirm {source === 'resume' ? 'Resume' : 'LinkedIn'} Data
        </DialogTitle>
        <DialogDescription>
          Please review the information extracted from your {source === 'resume' ? 'resume' : 'LinkedIn profile'}. 
          This data will replace your current profile information.
        </DialogDescription>

        <div className="mt-4">
          {/* Title and Location */}
          {(parsedData.title || parsedData.location) && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
              {parsedData.title && (
                <p className="text-sm"><span className="font-medium">Position:</span> {parsedData.title}</p>
              )}
              {parsedData.location && (
                <p className="text-sm"><span className="font-medium">Location:</span> {parsedData.location}</p>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="experience">
                Work Experience {parsedData.counts.experiences > 0 && 
                  <Badge variant="secondary" className="ml-2">{parsedData.counts.experiences}</Badge>
                }
              </TabsTrigger>
              <TabsTrigger value="education">
                Education {parsedData.counts.educations > 0 && 
                  <Badge variant="secondary" className="ml-2">{parsedData.counts.educations}</Badge>
                }
              </TabsTrigger>
              <TabsTrigger value="skills">
                Skills {parsedData.counts.skills > 0 && 
                  <Badge variant="secondary" className="ml-2">{parsedData.counts.skills}</Badge>
                }
              </TabsTrigger>
            </TabsList>
            
            {/* Experience Tab */}
            <TabsContent value="experience">
              {parsedData.experiences.length === 0 ? (
                <Alert>
                  <AlertDescription>No work experience could be extracted.</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.experiences.map((exp, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{exp.title}</TableCell>
                        <TableCell>{exp.company}</TableCell>
                        <TableCell>{exp.location || 'N/A'}</TableCell>
                        <TableCell>
                          {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Education Tab */}
            <TabsContent value="education">
              {parsedData.educations.length === 0 ? (
                <Alert>
                  <AlertDescription>No education information could be extracted.</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Degree</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.educations.map((edu, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{edu.degree}</TableCell>
                        <TableCell>{edu.institution}</TableCell>
                        <TableCell>{edu.location || 'N/A'}</TableCell>
                        <TableCell>
                          {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : '- Present'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills">
              {parsedData.skills.length === 0 ? (
                <Alert>
                  <AlertDescription>No skills could be extracted.</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="p-2 justify-between">
                      {skill.name}
                      {skill.level && (
                        <span className="ml-2 text-xs text-muted-foreground">{skill.level}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Saving..." : "Save to Profile"}
            {isConfirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}