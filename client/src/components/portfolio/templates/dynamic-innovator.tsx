import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProfileImage } from "@/components/ui/profile-image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Brain, Code, Database, ExternalLink, Github, Layers, Linkedin, Mail, TerminalSquare, CircuitBoard } from "lucide-react";
import { UserInfo, UserProject, UserExperience, UserSkill } from "@/types";

interface DynamicInnovatorProps {
  userInfo: UserInfo;
  userSkills: UserSkill[];
  userExperiences: UserExperience[];
  userProjects: UserProject[];
}

export function DynamicInnovator({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
}: DynamicInnovatorProps) {
  const [animatedText, setAnimatedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [showBlinker, setShowBlinker] = useState(true);
  
  // Text animation effect for the terminal-like intro
  useEffect(() => {
    const texts = [
      "Innovating with AI",
      "Building tech solutions",
      "Pushing boundaries",
      "Engineering the future"
    ];
    
    const text = texts[textIndex];
    
    if (animatedText.length < text.length) {
      const timeout = setTimeout(() => {
        setAnimatedText(text.substring(0, animatedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setAnimatedText("");
        setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [animatedText, textIndex]);
  
  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBlinker((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Get top skills limited to 6
  const topSkills = userSkills.slice(0, 6);
  
  // Get latest project or use placeholder
  const latestProject = userProjects[0] || {
    id: 0,
    title: null,
    description: null,
    thumbnailUrl: null
  };

  // Get latest experiences limited to 3
  const recentExperiences = userExperiences.slice(0, 3);

  return (
    <div className="w-full bg-black text-[#EAEAEA] font-['Space_Grotesk',sans-serif] min-h-screen">
      {/* Header - Neon gradient bar */}
      <div className="w-full h-1 bg-gradient-to-r from-[#0FF0FC] to-[#FF007F]"></div>
      
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full grid grid-cols-12 grid-rows-6">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border border-[#0FF0FC]/10"></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="md:w-2/3">
              <div className="mb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0FF0FC]/10 text-[#0FF0FC] text-xs mb-6 border border-[#0FF0FC]/30">
                  <span className="mr-1">$ whoami</span>
                  <span className={showBlinker ? "opacity-100" : "opacity-0"}>|</span>
                </div>
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0FF0FC] to-[#FF007F]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {userInfo.name || "AI Innovator"}
                </motion.h1>
                <motion.h2
                  className="text-xl md:text-2xl text-[#EAEAEA]/80 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {userInfo.title || "AI/ML Engineer & Technology Expert"}
                </motion.h2>
                <motion.div
                  className="flex flex-wrap gap-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {topSkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      className="bg-black text-[#0FF0FC] border border-[#0FF0FC]/30 hover:bg-[#0FF0FC]/10 transition-all"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                  {topSkills.length === 0 && (
                    <>
                      <Badge className="bg-black text-[#0FF0FC] border border-[#0FF0FC]/30 hover:bg-[#0FF0FC]/10 transition-all">
                        AI/ML
                      </Badge>
                      <Badge className="bg-black text-[#0FF0FC] border border-[#0FF0FC]/30 hover:bg-[#0FF0FC]/10 transition-all">
                        Python
                      </Badge>
                      <Badge className="bg-black text-[#0FF0FC] border border-[#0FF0FC]/30 hover:bg-[#0FF0FC]/10 transition-all">
                        Data Science
                      </Badge>
                    </>
                  )}
                </motion.div>
              </div>
              
              <motion.div
                className="flex flex-col space-y-1 mb-10 font-['Roboto_Mono',monospace] text-[#EAEAEA]/70 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex">
                  <span className="text-[#0FF0FC] mr-2">$</span>
                  <span>cd ./expertise</span>
                </div>
                <div className="flex">
                  <span className="text-[#0FF0FC] mr-2">$</span>
                  <span>ls -la</span>
                </div>
                <div className="pl-4 text-[#EAEAEA]/80">
                  <div className="flex justify-between">
                    <span>drwxr-xr-x</span>
                    <span className="text-[#FF007F]">machine_learning/</span>
                  </div>
                  <div className="flex justify-between">
                    <span>drwxr-xr-x</span>
                    <span className="text-[#FF007F]">deep_learning/</span>
                  </div>
                  <div className="flex justify-between">
                    <span>drwxr-xr-x</span>
                    <span className="text-[#FF007F]">generative_ai/</span>
                  </div>
                  <div className="flex justify-between">
                    <span>drwxr-xr-x</span>
                    <span className="text-[#FF007F]">cloud_computing/</span>
                  </div>
                </div>
                <div className="flex">
                  <span className="text-[#0FF0FC] mr-2">$</span>
                  <span>{animatedText}</span>
                  <span className={showBlinker ? "opacity-100" : "opacity-0"}>|</span>
                </div>
              </motion.div>
              
              <motion.div
                className="flex gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <a 
                  href={`mailto:${userInfo.email}`} 
                  className="w-10 h-10 border border-[#0FF0FC]/30 text-[#0FF0FC] rounded-full flex items-center justify-center hover:bg-[#0FF0FC]/10 transition-all"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 border border-[#0FF0FC]/30 text-[#0FF0FC] rounded-full flex items-center justify-center hover:bg-[#0FF0FC]/10 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 border border-[#0FF0FC]/30 text-[#0FF0FC] rounded-full flex items-center justify-center hover:bg-[#0FF0FC]/10 transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
            
            <motion.div 
              className="md:w-1/3 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-60 h-60 md:w-72 md:h-72">
                {/* Animated circles */}
                <div className="absolute inset-0 rounded-full border-2 border-[#0FF0FC]/30 animate-ping-slow"></div>
                <div className="absolute inset-2 rounded-full border-2 border-[#FF007F]/30 animate-ping-slow animation-delay-500"></div>
                
                {/* Profile image container */}
                <div className="absolute inset-4 rounded-full border-2 border-[#0FF0FC]/30 overflow-hidden flex items-center justify-center bg-[#0FF0FC]/5">
                  <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden">
                    <ProfileImage
                      src={userInfo.photoURL}
                      alt={userInfo.name || "Profile"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Decorative dots */}
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#0FF0FC] animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#FF007F] animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-[#0FF0FC] animate-pulse"></div>
                <div className="absolute bottom-1/2 left-0 w-2 h-2 rounded-full bg-[#FF007F] animate-pulse"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Skills section with glowing visualization */}
      <div className="bg-[#080808] py-16 border-y border-[#0FF0FC]/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10 flex items-center">
            <Bot className="w-6 h-6 mr-3 text-[#FF007F]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FF0FC] to-[#FF007F]">
              AI-Powered Skills
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI & Machine Learning */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="w-10 h-10 text-[#0FF0FC] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">AI & Machine Learning</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Expert in developing ML models, neural networks, and AI systems for real-world applications.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0FF0FC] to-[#0FF0FC]/60 w-[90%]"></div>
              </div>
            </motion.div>
            
            {/* Data Engineering */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Database className="w-10 h-10 text-[#FF007F] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">Data Engineering</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Building scalable data pipelines and architecting robust data solutions for big data environments.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF007F] to-[#FF007F]/60 w-[85%]"></div>
              </div>
            </motion.div>
            
            {/* Cloud & DevOps */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Layers className="w-10 h-10 text-[#0FF0FC] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">Cloud & DevOps</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Implementing CI/CD pipelines and managing cloud infrastructure on AWS, Azure and GCP.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0FF0FC] to-[#0FF0FC]/60 w-[80%]"></div>
              </div>
            </motion.div>
            
            {/* Software Development */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Code className="w-10 h-10 text-[#FF007F] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">Software Development</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Full-stack development with modern frameworks and programming languages like Python, JavaScript, and Go.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF007F] to-[#FF007F]/60 w-[95%]"></div>
              </div>
            </motion.div>
            
            {/* Systems Architecture */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <CircuitBoard className="w-10 h-10 text-[#0FF0FC] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">Systems Architecture</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Designing and implementing scalable, resilient system architectures for enterprise applications.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0FF0FC] to-[#0FF0FC]/60 w-[75%]"></div>
              </div>
            </motion.div>
            
            {/* Technical Leadership */}
            <motion.div 
              className="p-6 border border-[#0FF0FC]/20 rounded-lg bg-gradient-to-br from-black to-[#0FF0FC]/5 hover:to-[#0FF0FC]/10 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(15, 240, 252, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <TerminalSquare className="w-10 h-10 text-[#FF007F] mb-4" />
              <h3 className="text-lg font-bold mb-2 text-white">Technical Leadership</h3>
              <p className="text-[#EAEAEA]/70 mb-4 text-sm">
                Leading technical teams, mentoring engineers, and driving technology strategy and innovation.
              </p>
              <div className="h-2 bg-[#0FF0FC]/10 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF007F] to-[#FF007F]/60 w-[85%]"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Experience timeline */}
      <div className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-10 flex items-center">
          <CircuitBoard className="w-6 h-6 mr-3 text-[#FF007F]" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF007F] to-[#0FF0FC]">
            Innovation Timeline
          </span>
        </h2>
        
        <div className="relative border-l-2 border-[#0FF0FC]/30 pl-6 ml-6 space-y-12">
          {recentExperiences.length > 0 ? (
            recentExperiences.map((exp, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,0.7)]"></div>
                <span className="text-[#0FF0FC] text-sm font-['Roboto_Mono',monospace] mb-1 block">
                  {exp.startDate ? new Date(exp.startDate).getFullYear() : ""} 
                  {exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : exp.current ? " - Present" : ""}
                </span>
                <h3 className="text-lg font-bold text-white mb-1">{exp.title}</h3>
                <h4 className="text-[#EAEAEA]/80 mb-2">{exp.company}</h4>
                <p className="text-[#EAEAEA]/60 text-sm">
                  {exp.description}
                </p>
              </motion.div>
            ))
          ) : (
            // Placeholder experiences if none provided
            <>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,0.7)]"></div>
                <span className="text-[#0FF0FC] text-sm font-['Roboto_Mono',monospace] mb-1 block">
                  2023 - Present
                </span>
                <h3 className="text-lg font-bold text-white mb-1">AI Research Engineer</h3>
                <h4 className="text-[#EAEAEA]/80 mb-2">TechFusion AI</h4>
                <p className="text-[#EAEAEA]/60 text-sm">
                  Leading advanced research in generative AI models and applications. Developed proprietary 
                  algorithms that improved model performance by 40%.
                </p>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,0.7)]"></div>
                <span className="text-[#0FF0FC] text-sm font-['Roboto_Mono',monospace] mb-1 block">
                  2021 - 2023
                </span>
                <h3 className="text-lg font-bold text-white mb-1">Senior Machine Learning Engineer</h3>
                <h4 className="text-[#EAEAEA]/80 mb-2">DataSphere Technologies</h4>
                <p className="text-[#EAEAEA]/60 text-sm">
                  Architected and implemented end-to-end ML pipelines for production environments.
                  Reduced model training time by 60% while improving accuracy.
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>
      
      {/* Featured Project Section */}
      <div className="bg-[#080808] py-16 border-t border-[#0FF0FC]/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10 flex items-center">
            <Bot className="w-6 h-6 mr-3 text-[#0FF0FC]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0FF0FC] to-[#FF007F]">
              Featured Innovation
            </span>
          </h2>
          
          <motion.div 
            className="relative overflow-hidden border border-[#0FF0FC]/20 rounded-lg bg-black"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-[#0FF0FC] to-[#FF007F] blur-md"></div>
            </div>
            
            {/* Content */}
            <div className="relative p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                    {latestProject.title || "Quantum Neural Networks for Climate Prediction"}
                  </h3>
                  <p className="text-[#EAEAEA]/70 mb-6">
                    {latestProject.description || 
                     "An innovative AI system leveraging quantum computing principles to predict climate patterns with unprecedented accuracy. The model processes massive datasets to help environmental scientists make more informed decisions."}
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30">
                        Deep Learning
                      </Badge>
                      <Badge className="bg-[#0FF0FC]/10 text-[#0FF0FC] border-[#0FF0FC]/30">
                        Quantum Computing
                      </Badge>
                      <Badge className="bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30">
                        Climate Science
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <a 
                        href="#" 
                        className="text-[#0FF0FC] hover:text-[#0FF0FC]/80 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Github className="w-4 h-4" />
                        <span>Repository</span>
                      </a>
                      <a 
                        href="#" 
                        className="text-[#0FF0FC] hover:text-[#0FF0FC]/80 transition-colors flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Live Demo</span>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <a 
                      href="#" 
                      className="inline-flex items-center gap-2 px-4 py-2 border border-[#0FF0FC] text-[#0FF0FC] rounded hover:bg-[#0FF0FC]/10 transition-all"
                    >
                      <span>View Project Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="aspect-video bg-gradient-to-br from-[#080808] to-[#101010] rounded-md overflow-hidden border border-[#0FF0FC]/20 flex items-center justify-center">
                    {latestProject.thumbnailUrl ? (
                      <img 
                        src={latestProject.thumbnailUrl} 
                        alt={latestProject.title || "Project thumbnail"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <CircuitBoard className="w-16 h-16 text-[#0FF0FC]/30 mx-auto mb-4" />
                        <p className="text-[#EAEAEA]/50 text-sm font-['Roboto_Mono',monospace]">
                          // Project visualization
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Animated code snippet */}
                  <div className="mt-4 bg-[#080808] border border-[#0FF0FC]/20 rounded-md p-4 font-['Roboto_Mono',monospace] text-xs text-[#EAEAEA]/70 overflow-hidden">
                    <pre className="whitespace-pre-wrap">
                      <div className="flex">
                        <span className="text-[#0FF0FC]">import</span> <span className="text-[#EAEAEA]">tensorflow</span> <span className="text-[#0FF0FC]">as</span> <span className="text-[#EAEAEA]">tf</span>
                      </div>
                      <div className="flex">
                        <span className="text-[#0FF0FC]">import</span> <span className="text-[#EAEAEA]">numpy</span> <span className="text-[#0FF0FC]">as</span> <span className="text-[#EAEAEA]">np</span>
                      </div>
                      <div className="flex">
                        <span className="text-[#0FF0FC]">from</span> <span className="text-[#EAEAEA]">quantum_layer</span> <span className="text-[#0FF0FC]">import</span> <span className="text-[#EAEAEA]">QuantumLayer</span>
                      </div>
                      <br />
                      <div className="flex">
                        <span className="text-[#FF007F]">class</span> <span className="text-[#0FF0FC]">QuantumNeuralNetwork(tf.keras.Model):</span>
                      </div>
                      <div className="flex pl-4">
                        <span className="text-[#FF007F]">def</span> <span className="text-[#0FF0FC]">__init__</span><span className="text-[#EAEAEA]">(self):</span>
                      </div>
                      <div className="flex pl-8">
                        <span className="text-[#EAEAEA]">super().__init__()</span>
                      </div>
                      <div className="flex pl-8">
                        <span className="text-[#EAEAEA]">self.quantum_layer = QuantumLayer(4)</span>
                      </div>
                      <div className="flex pl-8">
                        <span className="text-[#EAEAEA]">self.dense = tf.keras.layers.Dense(1)</span>
                      </div>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer with contact info */}
      <div className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0FF0FC] to-[#FF007F]">
              Connect & Collaborate
            </h2>
            <p className="text-[#EAEAEA]/70 mb-6 max-w-lg">
              I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
            </p>
            
            <div className="space-y-3">
              {userInfo.email && (
                <a 
                  href={`mailto:${userInfo.email}`}
                  className="flex items-center gap-3 text-[#EAEAEA]/80 hover:text-[#0FF0FC] transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#0FF0FC]" />
                  <span>{userInfo.email}</span>
                </a>
              )}
              
              {userInfo.location && (
                <div className="flex items-center gap-3 text-[#EAEAEA]/80">
                  <CircuitBoard className="w-5 h-5 text-[#FF007F]" />
                  <span>{userInfo.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex flex-col gap-4 items-start">
              <div>
                <p className="text-[#EAEAEA]/50 text-sm mb-1 font-['Roboto_Mono',monospace]">// Let's innovate together</p>
                <div className="h-1 w-20 bg-gradient-to-r from-[#0FF0FC] to-[#FF007F] rounded-full"></div>
              </div>
              
              <a 
                href="#" 
                className="px-6 py-3 bg-[#0FF0FC]/10 border border-[#0FF0FC]/30 text-[#0FF0FC] rounded-md hover:bg-[#0FF0FC]/20 transition-all flex items-center gap-2"
              >
                <CircuitBoard className="w-4 h-4" />
                <span>Start a conversation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animation styles to global stylesheet instead of inline jsx */}
    </div>
  );
}