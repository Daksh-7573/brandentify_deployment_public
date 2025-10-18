import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Briefcase, GraduationCap, FolderOpen, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { INDUSTRIES, INDUSTRY_DOMAINS } from '@shared/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Step = 'intro' | 'experience' | 'education' | 'project' | 'complete';

export default function GuidedPortfolioCompletion() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Work Experience State
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expIndustry, setExpIndustry] = useState("");
  const [expDomain, setExpDomain] = useState("");
  const [expLocation, setExpLocation] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expCurrentRole, setExpCurrentRole] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  
  // Education State
  const [eduDegree, setEduDegree] = useState("");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduFieldOfStudy, setEduFieldOfStudy] = useState("");
  const [eduLocation, setEduLocation] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduCurrent, setEduCurrent] = useState(false);
  
  // Project State
  const [projTitle, setProjTitle] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projTechnologies, setProjTechnologies] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projStartDate, setProjStartDate] = useState("");
  const [projEndDate, setProjEndDate] = useState("");

  const userId = user?.id;

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const handleSaveExperience = async () => {
    if (!expTitle || !expCompany || !expStartDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least job title, company, and start date.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/work-experiences', {
        userId,
        title: expTitle,
        company: expCompany,
        industry: expIndustry || null,
        domain: expDomain || null,
        location: expLocation || null,
        startDate: expStartDate,
        endDate: expCurrentRole ? null : expEndDate || null,
        description: expDescription || null
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/work-experiences', userId] });
      
      toast({
        title: "Work Experience Added!",
        description: "Great job! Let's add your education next.",
      });
      
      setCurrentStep('education');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save work experience. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEducation = async () => {
    if (!eduDegree || !eduInstitution || !eduStartDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least degree, institution, and start date.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/educations', {
        userId,
        degree: eduDegree,
        institution: eduInstitution,
        fieldOfStudy: eduFieldOfStudy || null,
        location: eduLocation || null,
        startDate: eduStartDate,
        endDate: eduCurrent ? null : eduEndDate || null
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/educations', userId] });
      
      toast({
        title: "Education Added!",
        description: "Excellent! Now let's add a project to showcase your work.",
      });
      
      setCurrentStep('project');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipEducation = () => {
    setCurrentStep('project');
  };

  const handleSaveProject = async () => {
    if (!projTitle || !projDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least project title and description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/projects', {
        userId,
        title: projTitle,
        description: projDescription,
        technologies: projTechnologies || null,
        url: projLink || null,
        startDate: projStartDate || null,
        endDate: projEndDate || null
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/projects', userId] });
      
      setCurrentStep('complete');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    toast({
      title: "Portfolio Complete!",
      description: "✨ Your portfolio is ready. Time to start your Brand Quests!",
    });
    
    setTimeout(() => {
      setLocation('/brand-quests');
    }, 500);
  };

  const renderIntro = () => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
        <Sparkles className="h-10 w-10 text-purple-400" />
      </div>
      
      <h1 className="text-4xl font-bold text-white">Build Your Portfolio</h1>
      <p className="text-white/70 text-lg max-w-2xl mx-auto">
        Let's add the essential sections to make your portfolio stand out. This will only take about 20 minutes.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <Briefcase className="h-8 w-8 text-blue-400 mb-3 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Work Experience</h3>
          <p className="text-white/60 text-sm">Add your professional background</p>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <GraduationCap className="h-8 w-8 text-green-400 mb-3 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Education</h3>
          <p className="text-white/60 text-sm">Share your academic achievements</p>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <FolderOpen className="h-8 w-8 text-purple-400 mb-3 mx-auto" />
          <h3 className="text-white font-semibold mb-2">Projects</h3>
          <p className="text-white/60 text-sm">Showcase your best work</p>
        </div>
      </div>
      
      <Button
        onClick={() => setCurrentStep('experience')}
        className="mt-8 h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl"
        data-testid="button-start-guided-portfolio"
      >
        Let's Get Started
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
          <Briefcase className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Work Experience</h2>
        <p className="text-white/70">Add your most recent or current role</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded-full bg-blue-500"></div>
            <span className="text-blue-400 text-sm font-medium">Step 1</span>
          </div>
          <div className="w-8 h-0.5 bg-white/20"></div>
          <div className="w-8 h-1 rounded-full bg-white/20"></div>
          <div className="w-8 h-0.5 bg-white/20"></div>
          <div className="w-8 h-1 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      <div className="backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-white/20 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Job Title *</Label>
              <Input
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-job-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Company *</Label>
              <Input
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                placeholder="e.g. Tech Corp"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-company"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Industry</Label>
              <Select value={expIndustry} onValueChange={setExpIndustry}>
                <SelectTrigger className="bg-[rgba(18,18,18,0.95)] text-white border-white/20">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Location</Label>
              <Input
                value={expLocation}
                onChange={(e) => setExpLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Start Date *</Label>
              <Input
                type="month"
                value={expStartDate}
                onChange={(e) => setExpStartDate(e.target.value)}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-start-date"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">End Date {expCurrentRole && "(Current Role)"}</Label>
              <Input
                type="month"
                value={expEndDate}
                onChange={(e) => setExpEndDate(e.target.value)}
                disabled={expCurrentRole}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20 disabled:opacity-50"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={expCurrentRole}
                  onChange={(e) => setExpCurrentRole(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span className="text-white/70 text-sm">I currently work here</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="Describe your role, responsibilities, and achievements..."
              rows={4}
              className="bg-[rgba(18,18,18,0.95)] text-white border-white/20 resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => setCurrentStep('intro')}
            variant="outline"
            className="flex-1 border-white/20 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleSaveExperience}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            data-testid="button-save-experience"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next: Education
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <GraduationCap className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Education</h2>
        <p className="text-white/70">Add your academic background (optional)</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="w-8 h-0.5 bg-white/40"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded-full bg-green-500"></div>
            <span className="text-green-400 text-sm font-medium">Step 2</span>
          </div>
          <div className="w-8 h-0.5 bg-white/20"></div>
          <div className="w-8 h-1 rounded-full bg-white/20"></div>
        </div>
      </div>
      
      <div className="backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-white/20 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Degree *</Label>
              <Input
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                placeholder="e.g. Bachelor of Science"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-degree"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Institution *</Label>
              <Input
                value={eduInstitution}
                onChange={(e) => setEduInstitution(e.target.value)}
                placeholder="e.g. Stanford University"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-institution"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Field of Study</Label>
              <Input
                value={eduFieldOfStudy}
                onChange={(e) => setEduFieldOfStudy(e.target.value)}
                placeholder="e.g. Computer Science"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Location</Label>
              <Input
                value={eduLocation}
                onChange={(e) => setEduLocation(e.target.value)}
                placeholder="e.g. Palo Alto, CA"
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Start Date *</Label>
              <Input
                type="month"
                value={eduStartDate}
                onChange={(e) => setEduStartDate(e.target.value)}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                data-testid="input-edu-start-date"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">End Date {eduCurrent && "(Currently Studying)"}</Label>
              <Input
                type="month"
                value={eduEndDate}
                onChange={(e) => setEduEndDate(e.target.value)}
                disabled={eduCurrent}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20 disabled:opacity-50"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={eduCurrent}
                  onChange={(e) => setEduCurrent(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span className="text-white/70 text-sm">I'm currently studying here</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleSkipEducation}
            variant="outline"
            className="flex-1 border-white/20 hover:bg-white/10 text-white"
            data-testid="button-skip-education"
          >
            Skip for Now
          </Button>
          
          <Button
            onClick={handleSaveEducation}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            data-testid="button-save-education"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next: Project
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProject = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
          <FolderOpen className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Featured Project</h2>
        <p className="text-white/70">Showcase your best work</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="w-8 h-0.5 bg-white/40"></div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="w-8 h-0.5 bg-white/40"></div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded-full bg-purple-500"></div>
            <span className="text-purple-400 text-sm font-medium">Step 3</span>
          </div>
        </div>
      </div>
      
      <div className="backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-white/20 rounded-2xl p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Project Title *</Label>
            <Input
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              placeholder="e.g. E-commerce Platform Redesign"
              className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              data-testid="input-project-title"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Description *</Label>
            <Textarea
              value={projDescription}
              onChange={(e) => setProjDescription(e.target.value)}
              placeholder="Describe what you built, the problem it solved, and the impact it had..."
              rows={5}
              className="bg-[rgba(18,18,18,0.95)] text-white border-white/20 resize-none"
              data-testid="input-project-description"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Technologies/Skills Used</Label>
            <Input
              value={projTechnologies}
              onChange={(e) => setProjTechnologies(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, AWS"
              className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Project Link (Optional)</Label>
            <Input
              value={projLink}
              onChange={(e) => setProjLink(e.target.value)}
              placeholder="https://..."
              className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Start Date</Label>
              <Input
                type="month"
                value={projStartDate}
                onChange={(e) => setProjStartDate(e.target.value)}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">End Date</Label>
              <Input
                type="month"
                value={projEndDate}
                onChange={(e) => setProjEndDate(e.target.value)}
                className="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => setCurrentStep('education')}
            variant="outline"
            className="flex-1 border-white/20 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleSaveProject}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            data-testid="button-save-project"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Portfolio
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6 max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 mb-4 animate-pulse">
        <CheckCircle2 className="h-12 w-12 text-green-400" />
      </div>
      
      <h1 className="text-4xl font-bold text-white">Portfolio Complete!</h1>
      <p className="text-white/70 text-lg">
        Awesome work! Your professional portfolio is now ready to impress.
      </p>
      
      <div className="backdrop-blur-xl bg-[rgba(18,18,18,0.95)] border border-white/20 rounded-2xl p-8 mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-white/80">Your personalized Brand Quests are ready</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-white/80">Complete quests to build your professional brand</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-white/80">Earn XP and unlock advanced features</p>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleFinish}
        className="mt-8 h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg rounded-xl"
        data-testid="button-start-quests"
      >
        Start Brand Quests
        <Sparkles className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-4xl">
        {currentStep === 'intro' && renderIntro()}
        {currentStep === 'experience' && renderExperience()}
        {currentStep === 'education' && renderEducation()}
        {currentStep === 'project' && renderProject()}
        {currentStep === 'complete' && renderComplete()}
      </div>
    </div>
  );
}
