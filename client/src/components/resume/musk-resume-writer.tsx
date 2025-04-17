import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Lightbulb, Sparkles, Pencil, Briefcase, GraduationCap, 
  Award, FolderKanban, Hammer, Loader2, Send, RotateCw,
  Zap, FileText, BookOpen, Code, Heart } from 'lucide-react';

type ResumeSection = 
  | 'summary' 
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'projects'
  | 'achievements';

interface MuskResumeWriterProps {
  onGenerate?: (section: ResumeSection, content: string) => void;
}

export default function MuskResumeWriter({ onGenerate }: MuskResumeWriterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<ResumeSection>('summary');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample prompts for each section
  const sectionPrompts: Record<ResumeSection, string[]> = {
    summary: [
      "Write a concise professional summary highlighting my tech skills and leadership",
      "Create an impactful summary for a career transition to product management",
      "Draft a summary emphasizing my remote work capabilities and collaboration skills"
    ],
    experience: [
      "Enhance my job description with quantifiable achievements and metrics",
      "Rewrite my experience to highlight cross-functional team leadership",
      "Refine my bullet points to show problem-solving capabilities"
    ],
    education: [
      "Frame my education to highlight relevant coursework for my target role",
      "Format my education section to emphasize specialized training",
      "Create education entries that showcase academic achievements"
    ],
    skills: [
      "Organize my skills into relevant categories for a tech leadership role",
      "List my skills in order of proficiency with appropriate descriptions",
      "Identify skill gaps based on my target role and suggest alternatives I might have"
    ],
    projects: [
      "Format my project contributions to highlight my specific role",
      "Rewrite project descriptions to emphasize business impact",
      "Create project entries that showcase technical problem-solving"
    ],
    achievements: [
      "Format achievements to include quantifiable results",
      "Create achievement statements that highlight leadership impact",
      "Write achievements that demonstrate industry recognition"
    ]
  };

  // Section icons
  const sectionIcons: Record<ResumeSection, React.ReactNode> = {
    summary: <FileText className="h-4 w-4" />,
    experience: <Briefcase className="h-4 w-4" />,
    education: <GraduationCap className="h-4 w-4" />,
    skills: <Code className="h-4 w-4" />,
    projects: <FolderKanban className="h-4 w-4" />,
    achievements: <Award className="h-4 w-4" />
  };

  // Handle section change
  const handleSelectSection = (section: ResumeSection) => {
    setSelectedSection(section);
    setPrompt('');
    setGeneratedContent('');
  };

  // Handle prompt template click
  const handlePromptClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  // Generate content
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate content",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // In a real implementation, this would call an API endpoint to generate content
      // Using Musk's AI capabilities (e.g., OpenAI integration)
      setTimeout(() => {
        // Mock response for demo purposes
        let generatedText = '';
        
        switch(selectedSection) {
          case 'summary':
            generatedText = `Innovative Senior Software Engineer with ${Math.floor(Math.random() * 5) + 5} years of experience designing scalable applications and leading development teams. Specialized in cloud-native architectures, microservices, and DevOps practices with a proven track record of reducing deployment times by 40% and system downtime by 25%. Passionate about creating elegant solutions to complex problems while maintaining a focus on user experience and business requirements.`;
            break;
          case 'experience':
            generatedText = `Senior Software Engineer | XYZ Technologies\nJan 2022 - Present\n\n• Led migration of legacy monolith to microservices architecture, reducing deployment time by 40% and improving system reliability\n• Mentored junior developers through pair programming and code reviews, improving team velocity by 30%\n• Implemented CI/CD pipelines with automated testing, achieving 90% test coverage and reducing regression issues by 60%\n• Collaborated with product managers to refine requirements and ensure technical feasibility while advocating for optimal user experience`;
            break;
          case 'education':
            generatedText = `Master of Science in Computer Science\nStanford University\n2018 - 2020\n\nCoursework: Advanced Algorithms, Machine Learning, Distributed Systems, Cloud Computing\nThesis: "Optimizing Microservice Communication in Cloud-Native Applications"`;
            break;
          case 'skills':
            generatedText = `Technical Skills:\n• Programming: JavaScript/TypeScript, Python, Java, Go\n• Web Technologies: React, Node.js, Express, Next.js\n• Cloud Platforms: AWS (Certified Solutions Architect), Google Cloud Platform\n• DevOps: Docker, Kubernetes, Jenkins, GitHub Actions\n• Databases: PostgreSQL, MongoDB, Redis\n\nSoft Skills:\n• Technical Leadership & Mentoring\n• Agile Project Management\n• Cross-functional Collaboration\n• Problem-solving & Critical Thinking`;
            break;
          case 'projects':
            generatedText = `Cloud-Native E-commerce Platform Redesign\n2023 - Present\n\n• Architected and implemented cloud-native e-commerce platform supporting 10,000+ concurrent users\n• Designed microservices architecture with Kubernetes orchestration reducing infrastructure costs by 35%\n• Implemented real-time inventory management with event-driven architecture\n• Technologies: Node.js, React, Kubernetes, Kafka, PostgreSQL, Redis`;
            break;
          case 'achievements':
            generatedText = `• Received "Innovation Champion" award for redesigning legacy system that increased processing speed by 300%\n• Published technical article on microservice architecture in tech industry publication with 50,000+ readers\n• Granted patent for unique approach to distributed database synchronization\n• Selected as speaker at three regional developer conferences on cloud-native technologies`;
            break;
        }
        
        setGeneratedContent(generatedText);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating content. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  // Apply generated content
  const handleApply = () => {
    if (onGenerate && generatedContent) {
      onGenerate(selectedSection, generatedContent);
      setGeneratedContent('');
      setPrompt('');
      
      toast({
        title: "Content applied",
        description: `Your ${selectedSection} has been updated successfully.`,
      });
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Musk Resume Writer</span>
            </CardTitle>
            <CardDescription>
              Generate professional resume content with AI assistance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(sectionIcons).map(([section, icon]) => (
            <Button
              key={section}
              size="sm"
              variant={selectedSection === section ? "default" : "outline"}
              className="gap-1"
              onClick={() => handleSelectSection(section as ResumeSection)}
            >
              {icon}
              <span className="capitalize">{section}</span>
            </Button>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="resume-prompt" className="text-base font-medium">
              What would you like Musk to help with?
            </Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {sectionPrompts[selectedSection].map((promptTemplate, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted transition-colors duration-200"
                  onClick={() => handlePromptClick(promptTemplate)}
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {promptTemplate.length > 40 ? promptTemplate.substring(0, 40) + '...' : promptTemplate}
                </Badge>
              ))}
            </div>
            <Textarea
              id="resume-prompt"
              placeholder={`Enter your prompt for the ${selectedSection} section...`}
              className="min-h-[100px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPrompt('')}
              disabled={isGenerating || !prompt}
            >
              Clear
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="gap-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
          
          {generatedContent && (
            <div className="mt-4 space-y-3">
              <Label className="text-base font-medium">Generated Content</Label>
              <div className="p-4 border rounded-md bg-muted/30 whitespace-pre-wrap">
                {generatedContent}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedContent('')}
                  className="gap-1"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </Button>
                <Button 
                  onClick={handleApply}
                  className="gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Apply to Resume</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground text-center max-w-prose">
          Musk uses AI to help you craft professional resume content. For best results, provide specific details about your experience and goals.
        </p>
      </CardFooter>
    </Card>
  );
}