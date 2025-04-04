import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Skill, WorkExperience } from "@shared/schema";
import { useEffect } from "react";
import { Mail, Linkedin, Instagram, Camera, Film, ExternalLink, Calendar, Eye } from "lucide-react";

interface VisualExpertProps {
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
  userExperiences: WorkExperience[];
  userProjects: Project[];
}

export default function VisualExpert({ userInfo, userSkills, userExperiences, userProjects }: VisualExpertProps) {
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort projects by date (most recent first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Initialize animations and styles on component mount
  useEffect(() => {
    // Add web fonts for Playfair Display and Futura
    const playfairLink = document.createElement('link');
    playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap';
    playfairLink.rel = 'stylesheet';
    
    const futuraLink = document.createElement('link');
    futuraLink.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;600;700&display=swap'; // Jost as Futura alternative
    futuraLink.rel = 'stylesheet';
    
    document.head.appendChild(playfairLink);
    document.head.appendChild(futuraLink);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Visual Expert Template Animations & Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes zoomIn {
        from { transform: scale(1); }
        to { transform: scale(1.05); }
      }
      
      @keyframes shine {
        0% { background-position: -100px; }
        60% { background-position: 200px; }
        100% { background-position: 200px; }
      }
      
      .visual-expert-template .section-title {
        font-family: 'Playfair Display', serif;
        position: relative;
        display: inline-block;
      }
      
      .visual-expert-template .section-title::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 2px;
        background: #F8C471;
      }
      
      .visual-expert-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .visual-expert-template .project-card {
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
      }
      
      .visual-expert-template .project-card:hover {
        transform: translateY(-5px);
      }
      
      .visual-expert-template .project-card:hover .project-overlay {
        opacity: 1;
      }
      
      .visual-expert-template .project-card:hover .project-image {
        animation: zoomIn 0.5s forwards;
      }
      
      .visual-expert-template .project-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(24, 24, 24, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 1.5rem;
      }
      
      .visual-expert-template .skill-tag {
        position: relative;
        overflow: hidden;
      }
      
      .visual-expert-template .skill-tag::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
        animation: shine 3s infinite linear;
        pointer-events: none;
      }
      
      /* Staggered animations */
      .visual-expert-template .fade-in:nth-child(1) { animation-delay: 0.1s; }
      .visual-expert-template .fade-in:nth-child(2) { animation-delay: 0.2s; }
      .visual-expert-template .fade-in:nth-child(3) { animation-delay: 0.3s; }
      .visual-expert-template .fade-in:nth-child(4) { animation-delay: 0.4s; }
      .visual-expert-template .fade-in:nth-child(5) { animation-delay: 0.5s; }
      .visual-expert-template .fade-in:nth-child(6) { animation-delay: 0.6s; }
      
      /* Masonry Grid layout */
      .visual-expert-template .masonry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        grid-auto-rows: 250px;
        grid-auto-flow: dense;
        grid-gap: 15px;
      }
      
      .visual-expert-template .masonry-item-tall {
        grid-row: span 2;
      }
      
      .visual-expert-template .masonry-item-wide {
        grid-column: span 2;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(playfairLink);
      document.head.removeChild(futuraLink);
    };
  }, []);
  
  // Function to generate mock project images (for demo only)
  const getProjectImage = (index: number) => {
    const colors = ['#F8C471', '#EC7063', '#85C1E9', '#7DCEA0'];
    return (
      <div 
        className="w-full h-full flex items-center justify-center project-image" 
        style={{ 
          background: colors[index % colors.length], 
          transition: 'transform 0.5s ease'
        }}
      >
        {index % 2 === 0 ? 
          <Camera className="h-12 w-12 text-[#181818]/80" /> : 
          <Film className="h-12 w-12 text-[#181818]/80" />
        }
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden shadow-xl visual-expert-template" style={{ background: "#181818" }}>
      {/* Hero header */}
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[#181818] opacity-80"></div>
        <div className="relative px-8 pt-16 pb-20 flex flex-col items-center text-center z-10">
          <div className="overflow-hidden rounded-full w-32 h-32 mb-6 border-4 border-[#F8C471] fade-in">
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "Visual Expert"}
              className="h-full w-full object-cover"
            />
          </div>
          
          <h1 className="text-white text-4xl mb-3 fade-in" style={{ fontFamily: "Playfair Display, serif", fontWeight: 700 }}>
            {userInfo.name}
          </h1>
          
          <p className="text-[#F8C471] tracking-wider uppercase mb-4 fade-in" style={{ fontFamily: "Jost, sans-serif", letterSpacing: '3px' }}>
            {userInfo.title || userInfo.domain || "Visual Designer"}
          </p>
          
          <div className="flex gap-3 fade-in">
            {userInfo.email && (
              <a href={`mailto:${userInfo.email}`} className="w-10 h-10 rounded-full border border-[#F8C471] text-[#F8C471] flex items-center justify-center hover:bg-[#F8C471] hover:text-[#181818] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            )}
            <a href="#" className="w-10 h-10 rounded-full border border-[#F8C471] text-[#F8C471] flex items-center justify-center hover:bg-[#F8C471] hover:text-[#181818] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-[#F8C471] text-[#F8C471] flex items-center justify-center hover:bg-[#F8C471] hover:text-[#181818] transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      
      <CardContent className="p-8 relative">
        {/* About me section */}
        <div className="mb-16 fade-in">
          <h2 className="text-[#FFFFFF] text-3xl mb-8 section-title">
            My Story
          </h2>
          
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/2">
              <p className="text-[#FFFFFF]/80 leading-relaxed mb-4" style={{ fontFamily: "Jost, sans-serif" }}>
                {userInfo.lookingFor || 
                `I'm a passionate ${userInfo.title || "visual creative"} with a keen eye for detail and aesthetics. 
                My work focuses on creating impactful visual stories that resonate with audiences and leave lasting impressions.`}
              </p>
              {userInfo.location && (
                <p className="text-[#FFFFFF]/80" style={{ fontFamily: "Jost, sans-serif" }}>
                  Based in {userInfo.location}
                </p>
              )}
            </div>
            
            <div className="md:w-1/2">
              <div className="flex flex-wrap gap-3">
                {sortedSkills.length > 0 ? (
                  sortedSkills.slice(0, 8).map((skill, index) => (
                    <Badge 
                      key={skill.id} 
                      className="bg-[#181818] border border-[#F8C471] text-[#F8C471] hover:bg-[#F8C471]/10 px-3 py-1.5 text-sm skill-tag"
                      style={{ fontFamily: "Jost, sans-serif" }}
                    >
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  // Default skills if none are provided
                  <>
                    <Badge className="bg-[#181818] border border-[#F8C471] text-[#F8C471] hover:bg-[#F8C471]/10 px-3 py-1.5 text-sm skill-tag" style={{ fontFamily: "Jost, sans-serif" }}>
                      {userInfo.domain || "Photography"}
                    </Badge>
                    <Badge className="bg-[#181818] border border-[#EC7063] text-[#EC7063] hover:bg-[#EC7063]/10 px-3 py-1.5 text-sm skill-tag" style={{ fontFamily: "Jost, sans-serif" }}>
                      {userInfo.industry || "Design"}
                    </Badge>
                    <Badge className="bg-[#181818] border border-[#F8C471] text-[#F8C471] hover:bg-[#F8C471]/10 px-3 py-1.5 text-sm skill-tag" style={{ fontFamily: "Jost, sans-serif" }}>
                      Creative Direction
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Portfolio projects - Masonry Grid */}
        <div className="mb-16">
          <h2 className="text-[#FFFFFF] text-3xl mb-8 section-title fade-in">
            Featured Work
          </h2>
          
          <div className="masonry-grid">
            {sortedProjects.length > 0 ? (
              sortedProjects.slice(0, 6).map((project, index) => {
                // Determine if item should be wide or tall based on index
                const isWide = index % 3 === 0;
                const isTall = index % 4 === 1;
                
                return (
                  <div 
                    key={project.id} 
                    className={`project-card fade-in overflow-hidden rounded-md 
                      ${isWide ? 'masonry-item-wide' : ''} 
                      ${isTall ? 'masonry-item-tall' : ''}
                    `}
                  >
                    {/* Project thumbnail */}
                    {getProjectImage(index)}
                    
                    {/* Overlay */}
                    <div className="project-overlay">
                      <h3 className="text-white text-xl mb-2 font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-white/80 text-sm mb-3 line-clamp-3" style={{ fontFamily: "Jost, sans-serif" }}>
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[#F8C471] text-sm mt-auto">
                        <Eye className="h-4 w-4" />
                        <span style={{ fontFamily: "Jost, sans-serif" }}>View Project</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty state for projects
              <div className="col-span-full text-center py-16 border border-[#F8C471]/20 rounded-md">
                <Camera className="h-12 w-12 text-[#F8C471]/50 mx-auto mb-4" />
                <p className="text-[#FFFFFF]/50" style={{ fontFamily: "Jost, sans-serif" }}>
                  Your portfolio projects will appear here
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Testimonials/Experience */}
        <div className="mb-16 fade-in">
          <h2 className="text-[#FFFFFF] text-3xl mb-8 section-title">
            Experience & Expertise
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userExperiences.length > 0 ? (
              userExperiences.slice(0, 4).map((exp) => (
                <div key={exp.id} className="bg-[#232323] p-6 rounded-md fade-in hover:border-l-2 hover:border-[#F8C471] transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[#F8C471] text-lg font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
                      {exp.title}
                    </h3>
                    <Badge className="bg-[#181818] text-[#EC7063] border border-[#EC7063]">
                      {exp.startDate.substring(0, 4)}
                      {exp.endDate ? `-${exp.endDate.substring(0, 4)}` : '-Now'}
                    </Badge>
                  </div>
                  <p className="text-white text-sm mb-2" style={{ fontFamily: "Jost, sans-serif" }}>
                    {exp.company} · {exp.location}
                  </p>
                  {exp.description && (
                    <p className="text-white/70 text-sm line-clamp-3" style={{ fontFamily: "Jost, sans-serif" }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              // Alternative content when no experiences
              <div className="col-span-2 bg-[#232323] p-8 rounded-md text-center">
                <p className="text-[#F8C471] mb-3 text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Expertise Highlights</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border border-[#F8C471]/30 rounded-md hover:border-[#F8C471] transition-colors">
                    <p className="text-white" style={{ fontFamily: "Jost, sans-serif" }}>Visual Storytelling</p>
                  </div>
                  <div className="p-4 border border-[#EC7063]/30 rounded-md hover:border-[#EC7063] transition-colors">
                    <p className="text-white" style={{ fontFamily: "Jost, sans-serif" }}>Brand Development</p>
                  </div>
                  <div className="p-4 border border-[#F8C471]/30 rounded-md hover:border-[#F8C471] transition-colors">
                    <p className="text-white" style={{ fontFamily: "Jost, sans-serif" }}>Creative Direction</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#FFFFFF]/10 flex justify-between items-center fade-in">
          <p className="text-[#FFFFFF]/40 text-sm" style={{ fontFamily: "Jost, sans-serif" }}>
            &copy; {new Date().getFullYear()} {userInfo.name} | Powered by <span className="text-[#F8C471]">Brandentifier</span>
          </p>
          <Badge className="bg-[#F8C471] text-[#181818]" style={{ fontFamily: "Jost, sans-serif" }}>
            Visual Expert
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}