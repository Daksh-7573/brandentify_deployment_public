import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { 
  Download, FileImage, Laptop, Lightbulb, Linkedin, 
  Mail, PenTool, Quote, Instagram, Globe, Star, Heart, 
  Palette, Camera, Music, Video, Coffee, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Project, Skill, Service } from "@shared/schema";

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
  userServices: Service[];
  publicUrl?: string | null;
}

export default function FreelancerHub({ userInfo, userSkills, userProjects, userServices, publicUrl }: FreelancerHubProps) {
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // State for pricing toggle
  const [annualBilling, setAnnualBilling] = useState(false);
  
  // Handwritten signature SVG path (simple version)
  const signaturePath = "M10,50 C30,30 40,50 50,40 C60,30 70,20 80,30 C90,40 100,30 110,40 C120,50 130,40 140,50 C150,40 160,30 170,40 C180,50 190,40 200,30";
  
  // Icons for skills with playful style
  const skillIcons = [
    <Palette className="h-6 w-6" />,
    <Camera className="h-6 w-6" />,
    <Music className="h-6 w-6" />,
    <Video className="h-6 w-6" />,
    <PenTool className="h-6 w-6" />,
    <Laptop className="h-6 w-6" />
  ];
  
  return (
    <Card className="overflow-hidden shadow-lg bg-white rounded-2xl">
      {/* Header with vibrant playful styling */}
      <div className="h-48 relative overflow-hidden rounded-t-2xl">
        {/* Playful pattern background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF7F50] to-[#6A0572] opacity-90"></div>
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 20 + 5,
                  height: Math.random() * 20 + 5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * -20, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
          <motion.h1 
            className="text-4xl font-bold mb-2" 
            style={{ fontFamily: "Lobster, cursive" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {userInfo.name}
          </motion.h1>
          <motion.p 
            className="text-lg opacity-90" 
            style={{ fontFamily: "Nunito, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {userInfo.title || "Freelancer"} {userInfo.industry ? `specializing in ${userInfo.industry}` : ''}
          </motion.p>
          
          {/* Handwritten signature animation */}
          <motion.div 
            className="mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <svg width="200" height="40" viewBox="0 0 210 60" className="mx-auto">
              <motion.path
                d={signaturePath}
                fill="none"
                stroke="white"
                strokeWidth="2"
                className="animate-signature"
              />
            </svg>
          </motion.div>
        </div>
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div 
            className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "User profile"}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
      
      <CardContent className="pt-24 px-8 pb-8">
        {/* Bio section */}
        <div className="text-center mb-10">
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Nunito, sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {userInfo.lookingFor || `Creative ${userInfo.title || "freelancer"} passionate about delivering exceptional results. Based in ${userInfo.location || "your area"} and ready to bring your vision to life!`}
          </motion.p>
          
          <div className="flex justify-center gap-3 mt-6">
            <Button 
              size="sm" 
              className="rounded-full bg-[#FF7F50] hover:bg-[#FF6347] animate-bounce-button"
            >
              <Mail className="mr-2 h-4 w-4" /> Contact Me
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full border-[#6A0572] text-[#6A0572] hover:bg-[#6A0572]/10 animate-bounce-button"
            >
              <Download className="mr-2 h-4 w-4" /> Portfolio PDF
            </Button>
          </div>
          
          {/* Social links */}
          <div className="flex justify-center gap-2 mt-5">
            <a href="#" className="w-8 h-8 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center hover:bg-[#FF7F50] hover:text-white transition-all">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center hover:bg-[#FF7F50] hover:text-white transition-all">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center hover:bg-[#FF7F50] hover:text-white transition-all">
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        {/* Services section with playful styling */}
        <div className="mb-12">
          <motion.h2 
            className="text-2xl font-bold text-center mb-6 text-[#6A0572]" 
            style={{ fontFamily: "Lobster, cursive" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Services
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {userServices && userServices.length > 0 ? (
              userServices.slice(0, 3).map((service, index) => (
                <motion.div 
                  key={service.id} 
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-[#FF7F50]/20 overflow-hidden relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Decorative corner shape */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF7F50]/10 rounded-bl-3xl"></div>
                  
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#6A0572] mx-auto mb-4 flex items-center justify-center text-white shadow-md transform transition-transform duration-300 hover:rotate-12">
                    {skillIcons[index % skillIcons.length]}
                  </div>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>{service.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description || "Professional service with attention to detail and quick turnaround times."}</p>
                  
                  <div className="flex justify-center gap-2 mb-3">
                    <Badge className="bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50]">{service.category}</Badge>
                    {Array.isArray(service.features) && service.features.length > 0 && (
                      <Badge className="bg-[#6A0572]/10 text-[#6A0572] hover:bg-[#6A0572]">{service.features[0]}</Badge>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-lg font-bold text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>
                      Starting at ${service.priceUsd ? Number(service.priceUsd).toFixed(2) : (service.priceInr ? `${Number(service.priceInr/80).toFixed(2)}` : '99.00')}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white animate-bounce-button"
                    >
                      Learn More
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : userSkills.length > 0 ? (
              sortedSkills.slice(0, 3).map((skill, index) => (
                <motion.div 
                  key={skill.id} 
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-[#FF7F50]/20 overflow-hidden relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Decorative corner shape */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF7F50]/10 rounded-bl-3xl"></div>
                  
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#6A0572] mx-auto mb-4 flex items-center justify-center text-white shadow-md transform transition-transform duration-300 hover:rotate-12">
                    {skillIcons[index % skillIcons.length]}
                  </div>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>{skill.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Professional {skill.level.toLowerCase()} service with attention to detail and quick turnaround times.</p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-lg font-bold text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>
                      Starting at ${Math.floor((skill.proficiency || 3) * 50)}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3 rounded-full bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white animate-bounce-button"
                    >
                      Learn More
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <>
                <motion.div 
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-[#FF7F50]/20 overflow-hidden relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#6A0572] mx-auto mb-4 flex items-center justify-center text-white">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">No Services Yet</h3>
                  <p className="text-gray-600">Add services to showcase your professional offerings here.</p>
                </motion.div>
              </>
            )}
          </div>
          
          {/* Pricing toggle switch */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium ${!annualBilling ? 'bg-white shadow-sm text-[#6A0572]' : 'text-gray-500'}`}
                onClick={() => setAnnualBilling(false)}
              >
                Monthly
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium ${annualBilling ? 'bg-white shadow-sm text-[#6A0572]' : 'text-gray-500'}`}
                onClick={() => setAnnualBilling(true)}
              >
                Annual <span className="text-xs text-[#FF7F50]">Save 15%</span>
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Projects section with playful styling */}
        {userProjects.length > 0 ? (
          <div className="mb-12">
            <motion.h2 
              className="text-2xl font-bold text-center mb-6 text-[#6A0572]" 
              style={{ fontFamily: "Lobster, cursive" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Featured Work
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProjects.slice(0, 4).map((project, index) => (
                <motion.div 
                  key={project.id} 
                  className="rounded-2xl overflow-hidden bg-white border-2 border-[#FF7F50]/10 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-100 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F50]/20 to-[#6A0572]/20 flex items-center justify-center">
                      {/* Decorative shapes in background */}
                      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#FF7F50]/10 animate-ping-slow"></div>
                      <div className="absolute bottom-5 left-5 w-6 h-6 rounded-full bg-[#6A0572]/10 animate-ping-slow animation-delay-500"></div>
                      
                      {/* Project icon */}
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-[#FF7F50]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    )}
                    
                    {/* Colorful tags/badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50]">
                        Project
                      </Badge>
                      <Badge className="bg-[#6A0572]/10 text-[#6A0572] hover:bg-[#6A0572]">
                        {project.category || "Portfolio"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        {project.startDate ? project.startDate.substring(0, 10) : 'No date'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#6A0572] hover:text-[#FF7F50] animate-bounce-button rounded-full"
                      >
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <motion.h2 
              className="text-2xl font-bold text-center mb-6 text-[#6A0572]" 
              style={{ fontFamily: "Lobster, cursive" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Featured Work
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((_, index) => (
                <motion.div 
                  key={index} 
                  className="rounded-2xl overflow-hidden bg-white border-2 border-[#FF7F50]/10 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-100 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F50]/20 to-[#6A0572]/20 flex items-center justify-center">
                      {/* Decorative shapes in background */}
                      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#FF7F50]/10 animate-ping-slow"></div>
                      <div className="absolute bottom-5 left-5 w-6 h-6 rounded-full bg-[#6A0572]/10 animate-ping-slow animation-delay-500"></div>
                      
                      {/* Project icon */}
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-[#FF7F50]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                      {index === 0 ? "Creative Branding Project" : "Digital Marketing Campaign"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {index === 0 
                        ? "Comprehensive branding project for a tech startup including logo design, brand guidelines, and marketing collateral." 
                        : "Strategic digital marketing campaign that increased client conversions by 150% through targeted content and social media."
                      }
                    </p>
                    
                    {/* Colorful tags/badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50]">
                        Project
                      </Badge>
                      <Badge className="bg-[#6A0572]/10 text-[#6A0572] hover:bg-[#6A0572]">
                        {index === 0 ? "Branding" : "Marketing"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        {index === 0 ? "2023-06-15" : "2023-09-22"}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#6A0572] hover:text-[#FF7F50] animate-bounce-button rounded-full"
                      >
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Testimonials section with playful styling */}
        <div>
          <motion.h2 
            className="text-2xl font-bold text-center mb-6 text-[#6A0572]" 
            style={{ fontFamily: "Lobster, cursive" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Happy Clients
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div 
              className="rounded-2xl bg-white p-6 relative border-2 border-[#FF7F50]/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF7F50]/5 rounded-bl-full"></div>
              <Quote className="h-12 w-12 text-[#FF7F50] absolute top-6 left-6" />
              
              <div className="pl-14 pt-8">
                <motion.p 
                  className="italic text-gray-600 mb-5 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  "{userInfo.name} is exceptional at what they do. Their creativity and professionalism made our project a success! Highly recommend to anyone looking for quality work."
                </motion.p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#6A0572] mr-3 flex items-center justify-center text-white font-bold">
                    SJ
                  </div>
                  <div>
                    <p className="font-bold text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Marketing Director</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#FF7F50] fill-[#FF7F50]" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="rounded-2xl bg-white p-6 relative border-2 border-[#FF7F50]/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#6A0572]/5 rounded-bl-full"></div>
              <Quote className="h-12 w-12 text-[#6A0572] absolute top-6 left-6" />
              
              <div className="pl-14 pt-8">
                <motion.p 
                  className="italic text-gray-600 mb-5 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  "Working with {userInfo.name} was a game-changer for our brand. Their innovative approach and attention to detail exceeded our expectations. Would hire again in a heartbeat!"
                </motion.p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6A0572] to-[#FF7F50] mr-3 flex items-center justify-center text-white font-bold">
                    MP
                  </div>
                  <div>
                    <p className="font-bold text-[#6A0572]" style={{ fontFamily: "Nunito, sans-serif" }}>Michael Peters</p>
                    <p className="text-xs text-gray-500">Startup Founder</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-[#FF7F50] fill-[#FF7F50]" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Contact CTA with animation */}
          <motion.div 
            className="mt-12 bg-gradient-to-r from-[#FF7F50] to-[#6A0572] rounded-2xl p-8 text-center text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Floating bubbles animation */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute rounded-full bg-white opacity-10"
                  style={{
                    width: Math.random() * 30 + 10,
                    height: Math.random() * 30 + 10,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, Math.random() * -50 - 20],
                    opacity: [0.1, 0]
                  }}
                  transition={{
                    duration: Math.random() * 4 + 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
            
            <h3 className="text-2xl font-bold mb-3 relative z-10" style={{ fontFamily: "Lobster, cursive" }}>Ready to Create Something Amazing?</h3>
            <p className="mb-6 max-w-lg mx-auto relative z-10" style={{ fontFamily: "Nunito, sans-serif" }}>
              Let's discuss your project and bring your vision to life with creativity and passion!
            </p>
            <Button 
              className="bg-white text-[#6A0572] hover:bg-white/90 rounded-full px-8 py-6 animate-bounce-button relative z-10"
              size="lg"
            >
              <Mail className="mr-2 h-5 w-5" /> Get in Touch
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}