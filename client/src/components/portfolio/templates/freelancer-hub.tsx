import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Download, File, FileImage, Laptop, Lightbulb, Linkedin, Mail, PenTool, Quote } from "lucide-react";
import { Project, Skill } from "@shared/schema";

interface FreelancerHubProps {
  userInfo: {
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
  };
  userSkills: Skill[];
  userProjects: Project[];
  publicUrl?: string | null;
}

export default function FreelancerHub({ userInfo, userSkills, userProjects, publicUrl }: FreelancerHubProps) {
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  return (
    <Card className="overflow-hidden shadow-lg bg-white">
      {/* Header with vibrant playful styling */}
      <div className="h-40 relative overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7F50] to-[#6A0572] opacity-90"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Lobster, cursive" }}>
            {userInfo.name}
          </h1>
          <p className="text-lg opacity-90" style={{ fontFamily: "Nunito, sans-serif" }}>
            {userInfo.title || "Freelancer"} {userInfo.industry ? `specializing in ${userInfo.industry}` : ''}
          </p>
        </div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center shadow-lg">
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "User profile"}
            />
          </div>
        </div>
      </div>
      
      <CardContent className="pt-16 px-8 pb-8">
        {/* Bio section */}
        <div className="text-center mb-10">
          <p className="text-gray-600 max-w-2xl mx-auto">
            {userInfo.lookingFor || `Creative ${userInfo.title || "freelancer"} passionate about delivering exceptional results. Based in ${userInfo.location || "your area"} and ready to bring your vision to life!`}
          </p>
          
          <div className="flex justify-center gap-3 mt-5">
            <Button size="sm" className="rounded-full bg-[#FF7F50] hover:bg-[#FF6347]">
              <Mail className="mr-2 h-4 w-4" /> Contact Me
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Download className="mr-2 h-4 w-4" /> Portfolio PDF
            </Button>
          </div>
        </div>
        
        {/* Services section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>
            My Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {userSkills.length > 0 ? (
              sortedSkills.slice(0, 3).map((skill, index) => (
                <div key={skill.id} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FF7F50] mx-auto mb-4 flex items-center justify-center text-white">
                    {index === 0 && <Lightbulb className="h-6 w-6" />}
                    {index === 1 && <PenTool className="h-6 w-6" />}
                    {index === 2 && <Laptop className="h-6 w-6" />}
                  </div>
                  <h3 className="font-bold mb-2">{skill.name}</h3>
                  <p className="text-sm text-gray-600">Professional {skill.level.toLowerCase()} service with attention to detail and quick turnaround times.</p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FF7F50] mx-auto mb-4 flex items-center justify-center text-white">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">Creative Consulting</h3>
                  <p className="text-sm text-gray-600">Strategic creative direction for brands and businesses looking to stand out.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FF7F50] mx-auto mb-4 flex items-center justify-center text-white">
                    <PenTool className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">Content Creation</h3>
                  <p className="text-sm text-gray-600">High-quality content that engages audiences and drives conversions.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FF7F50] mx-auto mb-4 flex items-center justify-center text-white">
                    <Laptop className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold mb-2">Digital Solutions</h3>
                  <p className="text-sm text-gray-600">Custom digital strategies and implementations for modern businesses.</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Projects section */}
        {userProjects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6 text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>
              Featured Work
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProjects.slice(0, 4).map((project) => (
                <div key={project.id} className="rounded-lg overflow-hidden bg-white border hover:shadow-md transition-all duration-300">
                  <div className="h-40 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F50]/20 to-[#6A0572]/20 flex items-center justify-center">
                      <FileImage className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-2">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{project.startDate ? project.startDate.substring(0, 10) : 'No date'}</span>
                      <Button variant="ghost" size="sm" className="text-[#6A0572] hover:text-[#FF7F50]">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Testimonials section */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>
            Client Feedback
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-lg p-6 relative">
              <Quote className="h-10 w-10 text-[#FF7F50]/20 absolute top-3 left-3" />
              <div className="pl-6">
                <p className="italic text-gray-600 mb-4">"{userInfo.name} is exceptional at what they do. Their creativity and professionalism made our project a success!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <p className="font-bold text-sm">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Marketing Director</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 relative">
              <Quote className="h-10 w-10 text-[#FF7F50]/20 absolute top-3 left-3" />
              <div className="pl-6">
                <p className="italic text-gray-600 mb-4">"Working with {userInfo.name} was a game-changer for our brand. Highly recommend their services!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <p className="font-bold text-sm">Michael Peters</p>
                    <p className="text-xs text-gray-500">Startup Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}