import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  FileText, 
  BriefcaseBusiness, 
  GraduationCap, 
  Code, 
  Award,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// Resume section types
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
  const [activeSection, setActiveSection] = useState<ResumeSection>('summary');
  const [inputPrompt, setInputPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Select a section
  const handleSelectSection = (section: ResumeSection) => {
    setActiveSection(section);
    // Reset states when changing sections
    setInputPrompt('');
    setGeneratedContent('');
  };

  // Handle prompt change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
  };

  // Generate content based on the active section and prompt
  const handleGenerate = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // In a real application, this would be an API call to OpenAI via Musk
      // For this demo, we'll simulate a delay and return pre-defined content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock generated content based on the section
      let content = '';
      
      switch (activeSection) {
        case 'summary':
          content = "Results-driven Software Engineer with 6+ years of experience designing and implementing scalable applications. Specialized in cloud infrastructure and microservices architecture with expertise in React, Node.js, and AWS. Known for delivering high-quality code that addresses complex business challenges while maintaining optimal performance and security.";
          break;
        case 'experience':
          content = "Led development of a customer-facing analytics dashboard that increased user engagement by 37% and reduced support tickets by 42%. Architected and implemented a microservices solution that improved system reliability from 99.1% to 99.9% uptime while reducing operational costs by 28%.";
          break;
        case 'education':
          content = "Master of Science in Computer Science\nStanford University\n2018 - 2020\n• Specialized in Artificial Intelligence and Machine Learning\n• Graduated with Distinction (GPA: 3.92/4.0)";
          break;
        case 'skills':
          content = "• Programming Languages: JavaScript (ES6+), TypeScript, Python, Java\n• Frontend: React, Redux, Angular, Vue.js, HTML5, CSS3, SASS\n• Backend: Node.js, Express, Django, Spring Boot\n• Databases: PostgreSQL, MongoDB, Redis, MySQL\n• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform";
          break;
        case 'projects':
          content = "Smart Home IoT Platform (2022)\n• Designed and built a scalable IoT platform that connects and manages over 10,000 smart home devices\n• Implemented real-time data processing using Kafka and Node.js microservices architecture\n• Reduced data retrieval latency by 78% through optimized database queries and caching strategies";
          break;
        case 'achievements':
          content = "• Awarded 'Tech Innovator of the Year' for developing an AI-powered recommendation engine that increased customer conversion rates by 28%\n• Published 3 technical articles in industry-leading journals on microservices architecture best practices\n• Granted a patent for a novel approach to secure cloud data synchronization";
          break;
        default:
          content = "Content generated for " + activeSection;
      }
      
      setGeneratedContent(content);
      
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle content acceptance
  const handleAcceptContent = () => {
    if (onGenerate) {
      onGenerate(activeSection, generatedContent);
    }
    
    // Reset states after accepting
    setInputPrompt('');
    setGeneratedContent('');
  };

  // Section configuration for UI display
  const sections = [
    { id: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4 mr-1" /> },
    { id: 'experience', label: 'Experience', icon: <BriefcaseBusiness className="h-4 w-4 mr-1" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="h-4 w-4 mr-1" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="h-4 w-4 mr-1" /> },
    { id: 'projects', label: 'Projects', icon: <FileText className="h-4 w-4 mr-1" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4 mr-1" /> },
  ];

  // Section-specific prompt templates
  const getSectionPromptTemplate = () => {
    switch (activeSection) {
      case 'summary':
        return "Describe your career focus and key strengths. Example: 'I'm a software engineer with 5 years of experience in full-stack development, specialized in React and Node.js.'";
      case 'experience':
        return "Describe your role and achievements. Example: 'Led the frontend team for an e-commerce site, improving performance by 40%'";
      case 'education':
        return "Enter your degree, institution, and graduation year. Example: 'BS in Computer Science, Stanford University, 2021'";
      case 'skills':
        return "List your professional skills. Example: 'React, Node.js, AWS, TypeScript, Project Management'";
      case 'projects':
        return "Describe a project you worked on. Example: 'Built a mobile app for fitness tracking using React Native and Firebase'";
      case 'achievements':
        return "Describe awards, recognitions, or notable accomplishments. Example: 'Received Employee of the Year award for leading a successful product launch'";
      default:
        return "Enter your information here and Musk will help format it for your resume.";
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 text-primary mr-2" />
              <span>Musk Resume Writer</span>
            </CardTitle>
            <CardDescription>
              Let Musk help you create professional resume content
            </CardDescription>
          </div>
          <Badge variant="outline">AI-Powered</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Section Selector */}
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              className="flex items-center"
              onClick={() => handleSelectSection(section.id as ResumeSection)}
            >
              {section.icon}
              {section.label}
            </Button>
          ))}
        </div>
        
        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="input-prompt">Your Information</Label>
            {activeSection && (
              <Badge variant="secondary" className="font-normal">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </Badge>
            )}
          </div>
          <Textarea
            id="input-prompt"
            placeholder={getSectionPromptTemplate()}
            value={inputPrompt}
            onChange={handlePromptChange}
            rows={3}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !inputPrompt.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Professional Content'}
          </Button>
        </div>
        
        {/* Results Area */}
        {generatedContent && (
          <div className="space-y-3 mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>Generated Content</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleAcceptContent}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Accept & Add to Resume</span>
              </Button>
            </div>
            <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Content will be professionally formatted for your resume
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-xs"
          onClick={() => window.open('#', '_blank')}
        >
          <span>Resume Writing Tips</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}