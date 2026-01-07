import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MapPin, ExternalLink, Briefcase, Award, GraduationCap } from "lucide-react";
import PortfolioCtaButtons from '../portfolio-cta-buttons';

interface CreativeBoldProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills?: Array<{ 
    id: number; 
    name: string; 
    level?: string | null;
    category?: string | null;
    yearsOfExperience?: number | null;
  }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    keyResponsibilities?: string[];
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string;
    startDate?: string | null;
    endDate?: string | null;
    thumbnailUrl?: string | null;
    projectUrl?: string | null;
    technologies?: string[];
    outcome?: string | null;
    impact?: string | null;
    role?: string | null;
    teamSize?: number | null;
  }>;
  userEducations?: Array<{
    id: number;
    degree: string;
    institution: string;
    fieldOfStudy?: string | null;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    industry?: string | null;
    skillsAcquired?: string[];
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description?: string | null;
    priceInr?: string | null;
    priceUsd?: string | null;
    isHourly?: boolean;
    priceType?: string | null;
  }>;
  currentUserId?: number;
  isPreview?: boolean;
}

const CORAL = '#FF6B5A';
const PAPER_WHITE = '#FFFFFF';
const INK_BLACK = '#0C0C0C';
const COOL_GRAY = '#575757';
const PORCELAIN = '#F4F6F8';

export default function CreativeBold({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  isPreview = false
}: CreativeBoldProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedExperiences = [...userExperiences].sort((a, b) => {
    const aDate = a.endDate || '9999-12-31';
    const bDate = b.endDate || '9999-12-31';
    return bDate.localeCompare(aDate);
  });

  const sortedProjects = [...userProjects].sort((a, b) => {
    const aDate = a.startDate || '';
    const bDate = b.startDate || '';
    return bDate.localeCompare(aDate);
  });

  const displayTitle = userInfo.title || "Creative Professional";

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER_WHITE, color: INK_BLACK }}>
      {/* STICKY HEADER - Hidden in preview mode */}
      {!isPreview && !window.location.pathname.includes('/portfolio-builder') && (
        <motion.header 
          initial={{ y: -100 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.6 }}
          className="fixed top-0 w-full z-50 transition-all"
          style={{ backgroundColor: PAPER_WHITE, borderBottom: `1px solid #E5E7EB` }}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: INK_BLACK }}>{userInfo.name}</h2>
            <div className="flex items-center gap-4">
              <PortfolioCtaButtons 
                variant="minimal"
                userId={userInfo.id}
                userName={userInfo.name}
                userEmail={userInfo.email || undefined}
              />
            </div>
          </div>
        </motion.header>
      )}

      {/* HERO - Service-First with Photo */}
      <section className={`pb-20 px-6 md:px-12 ${isPreview ? 'pt-6' : 'pt-32'}`}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* LEFT: Photo - Minimalist */}
            {userInfo.photoURL && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center lg:justify-start order-2 lg:order-1"
              >
                <div className="relative">
                  {/* Subtle gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B5A]/8 to-[#FF6B5A]/4 rounded-2xl blur-3xl" />
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="relative w-full max-w-[380px] h-[500px] object-cover rounded-2xl shadow-xl"
                  />
                  {/* Subtle overlay accent */}
                  <div className="absolute inset-0 rounded-2xl" style={{ border: `2px solid ${CORAL}`, opacity: 0.2 }} />
                </div>
              </motion.div>
            )}

            {/* RIGHT: Content */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8 }}
              className="space-y-8 order-1 lg:order-2"
            >
              {/* Name with coral underline */}
              <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-2" style={{ color: INK_BLACK }}>
                  {userInfo.name}
                </h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: CORAL }} />
              </div>

              {/* Tagline */}
              {userInfo.tagline && (
                <p className="text-lg italic max-w-2xl" style={{ color: COOL_GRAY }}>
                  {userInfo.tagline}
                </p>
              )}

              {/* About Me */}
              {userInfo.aboutMe && (
                <p className="text-lg leading-relaxed max-w-2xl" style={{ color: COOL_GRAY }}>
                  {userInfo.aboutMe}
                </p>
              )}

              {/* Grouped Location & Industry badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {userInfo.location && (
                  <Badge variant="outline" style={{ borderColor: COOL_GRAY, color: COOL_GRAY }} className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 mr-1" /> {userInfo.location}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge variant="outline" style={{ borderColor: COOL_GRAY, color: COOL_GRAY }}>
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge variant="outline" style={{ borderColor: COOL_GRAY, color: COOL_GRAY }}>
                    {userInfo.domain}
                  </Badge>
                )}
              </div>

              {/* Grouped Job Title & Company */}
              {(displayTitle || sortedExperiences[0]?.company || userInfo.lookingFor) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
                  {(displayTitle || sortedExperiences[0]?.company) && (
                    <div>
                      <p className="text-xs uppercase font-bold mb-1" style={{ color: CORAL }}>Current Role</p>
                      <p style={{ color: INK_BLACK }} className="font-medium">
                        {displayTitle} {sortedExperiences[0]?.company && <span style={{ color: COOL_GRAY }}>at {sortedExperiences[0].company}</span>}
                      </p>
                    </div>
                  )}
                  {userInfo.lookingFor && (
                    <div>
                      <p className="text-xs uppercase font-bold mb-1" style={{ color: CORAL }}>Looking For</p>
                      <p style={{ color: INK_BLACK }}>{userInfo.lookingFor}</p>
                    </div>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="pt-4">
                <PortfolioCtaButtons 
                  variant="creative"
                  userId={userInfo.id}
                  userName={userInfo.name}
                  userEmail={userInfo.email}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BRAND IDENTITY - Vision/Mission/Values/About */}
      {(userInfo.visionStatement || userInfo.missionStatement || userInfo.coreValues?.length || userInfo.uniqueValueProposition) && (
        <section className="py-20 px-6 md:px-12 relative" style={{ backgroundColor: PORCELAIN }}>
          <div className="max-w-[1200px] mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              {/* Profile Meta Info - UVP Moved here */}
              <div className="grid grid-cols-1">
                {userInfo.uniqueValueProposition && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: CORAL }}>Unique Value Proposition</h3>
                    <p className="text-2xl font-medium leading-snug" style={{ color: INK_BLACK }}>{userInfo.uniqueValueProposition}</p>
                  </div>
                )}
              </div>

              {/* BRAND STORY & CORE PILLARS */}
              <div className="pt-12 border-t" style={{ borderColor: '#E5E7EB' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  {userInfo.aboutMe && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: CORAL }}>Background</h3>
                      <p className="text-lg leading-relaxed" style={{ color: COOL_GRAY }}>{userInfo.aboutMe}</p>
                    </div>
                  )}
                  
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: CORAL }}>Values</h3>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.coreValues.map((value, idx) => (
                          <Badge key={idx} style={{ backgroundColor: CORAL, color: PAPER_WHITE }} className="px-3 py-1">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t" style={{ borderColor: '#E5E7EB' }}>
                  {userInfo.missionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: CORAL }}>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: CORAL }}>Mission</h3>
                      <p className="text-lg leading-relaxed whitespace-pre-wrap overflow-hidden break-words" style={{ color: COOL_GRAY }}>{userInfo.missionStatement}</p>
                    </div>
                  )}

                  {userInfo.visionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: CORAL }}>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: CORAL }}>Vision</h3>
                      <p className="text-lg leading-relaxed whitespace-pre-wrap overflow-hidden break-words" style={{ color: COOL_GRAY }}>{userInfo.visionStatement}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* SERVICES - CORE SECTION */}
      {userServices && userServices.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Services
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-lg transition-all relative flex flex-col min-h-[160px]"
                  style={{ 
                    backgroundColor: PORCELAIN, 
                    borderTop: `4px solid ${CORAL}`,
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: INK_BLACK }}>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-sm mb-4" style={{ color: COOL_GRAY }}>
                        {service.description}
                      </p>
                    )}
                  </div>
                  {((service.priceUsd && parseFloat(String(service.priceUsd)) > 0) || (service.priceInr && parseFloat(String(service.priceInr)) > 0)) && (
                    <div className="mt-auto">
                      <Badge className="bg-amber-100 text-amber-900 border border-amber-200">
                        {service.priceUsd && parseFloat(String(service.priceUsd)) > 0 ? `$${service.priceUsd}` : `₹${service.priceInr}`}
                        {service.isHourly && ' / hr'}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* PROJECTS GALLERY */}
      {sortedProjects.length > 0 && (
        <section className="py-20 px-6 md:px-12" style={{ backgroundColor: PORCELAIN }}>
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Work
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {sortedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                  className="cursor-pointer group"
                >
                  {project.thumbnailUrl && (
                    <div className="relative overflow-hidden rounded-lg mb-4" style={{ backgroundColor: '#ddd' }}>
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
                        style={{ backgroundColor: CORAL }}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-1" style={{ color: INK_BLACK }}>
                    {project.title}
                  </h3>
                  {project.startDate && (
                    <p className="text-sm" style={{ color: COOL_GRAY }}>
                      {new Date(project.startDate).getFullYear()}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Project Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl" style={{ backgroundColor: PAPER_WHITE }}>
              <DialogHeader>
                <DialogTitle style={{ color: INK_BLACK }}>
                  {selectedProject?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedProject?.thumbnailUrl && (
                  <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="w-full rounded-lg" />
                )}
                {selectedProject?.description && (
                  <p style={{ color: COOL_GRAY }}>{selectedProject.description}</p>
                )}
                {selectedProject?.projectUrl && (
                  <Button 
                    onClick={() => window.open(selectedProject.projectUrl, '_blank')}
                    style={{ backgroundColor: CORAL, color: PAPER_WHITE }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> View Project
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </section>
      )}

              {/* EXPERIENCE TIMELINE */}
      {sortedExperiences.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Experience
            </motion.h2>

            <div className="space-y-12">
              {sortedExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-8 group"
                >
                  <div className="flex flex-col items-center">
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: CORAL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    {idx !== sortedExperiences.length - 1 && (
                      <div className="w-px h-full mt-4" style={{ backgroundColor: '#E5E7EB' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-12">
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold" style={{ color: INK_BLACK }}>
                        {exp.title}
                      </h3>
                      <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: PORCELAIN, color: CORAL }}>
                        {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                      </span>
                    </div>
                    <p className="text-xl mb-4 font-medium" style={{ color: CORAL }}>{exp.company}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      {exp.location && (
                        <p className="text-sm flex items-center" style={{ color: COOL_GRAY }}>
                          <MapPin className="w-4 h-4 mr-1" /> {exp.location}
                        </p>
                      )}
                      {exp.industry && (
                        <p className="text-sm flex items-center" style={{ color: COOL_GRAY }}>
                          <Briefcase className="w-4 h-4 mr-1" /> {exp.industry}
                        </p>
                      )}
                      {exp.domain && (
                        <p className="text-sm flex items-center" style={{ color: COOL_GRAY }}>
                          <ExternalLink className="w-4 h-4 mr-1" /> {exp.domain}
                        </p>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-lg leading-relaxed mb-6" style={{ color: COOL_GRAY }}>
                        {exp.description}
                      </p>
                    )}
                    
                    {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs uppercase font-bold tracking-widest" style={{ color: CORAL }}>Key Impact</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {exp.keyResponsibilities.map((resp, idx) => (
                            <li key={idx} className="text-sm leading-relaxed flex items-start" style={{ color: COOL_GRAY }}>
                              <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CORAL }} />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS - Filtered to remove unwanted skills */}
      {(() => {
        const filteredSkills = userSkills.filter(skill => {
          const unwantedSkills = [
            'Automation & Workflow Optimization',
            'Machine Learning Solutions',
            'AI Strategy & Consulting',
            'ChatGPT said'
          ];
          return !unwantedSkills.some(unwanted => 
            skill.name.toLowerCase().includes(unwanted.toLowerCase())
          );
        });
        
        return filteredSkills.length > 0 && (
          <section className="py-20 px-6 md:px-12" style={{ backgroundColor: PORCELAIN }}>
            <div className="max-w-[1200px] mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl font-bold mb-12"
                style={{ color: INK_BLACK }}
              >
                Skills
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSkills.map((skill) => (
                  <div key={skill.id} className="p-4 bg-white rounded-lg">
                    <h3 className="font-bold mb-2" style={{ color: INK_BLACK }}>
                      {skill.name}
                    </h3>
                    {skill.level && (
                      <p className="text-sm" style={{ color: COOL_GRAY }}>
                        Level: {skill.level}
                      </p>
                    )}
                    {skill.category && (
                      <p className="text-sm" style={{ color: COOL_GRAY }}>
                        Category: {skill.category}
                      </p>
                    )}
                    {skill.yearsOfExperience && (
                      <p className="text-sm" style={{ color: COOL_GRAY }}>
                        Experience: {skill.yearsOfExperience} years
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        );
      })()}

      {/* EDUCATION */}
      {userEducations.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Education
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-xl border border-gray-100"
                  style={{ backgroundColor: PAPER_WHITE }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: PORCELAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap className="w-6 h-6" style={{ color: CORAL }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: INK_BLACK }}>{edu.degree}</h3>
                      <p className="text-lg font-medium" style={{ color: CORAL }}>{edu.institution}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <span className="text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: PORCELAIN, color: CORAL }}>
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </span>
                      {edu.location && (
                        <p className="text-sm flex items-center" style={{ color: COOL_GRAY }}>
                          <MapPin className="w-4 h-4 mr-1" /> {edu.location}
                        </p>
                      )}
                    </div>

                    {edu.fieldOfStudy && (
                      <p className="text-sm" style={{ color: COOL_GRAY }}>
                        <span className="font-bold text-black uppercase text-[10px] tracking-widest mr-2">Major:</span>
                        {edu.fieldOfStudy}
                      </p>
                    )}

                    {edu.industry && (
                      <p className="text-sm" style={{ color: COOL_GRAY }}>
                        <span className="font-bold text-black uppercase text-[10px] tracking-widest mr-2">Industry:</span>
                        {edu.industry}
                      </p>
                    )}

                    {edu.skillsAcquired && edu.skillsAcquired.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-bold tracking-widest mb-2" style={{ color: CORAL }}>Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {edu.skillsAcquired.map((skill, sIdx) => (
                            <Badge key={sIdx} variant="secondary" className="bg-gray-50 text-gray-600 border-none font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <p style={{ color: COOL_GRAY }}>© {new Date().getFullYear()}. {userInfo.name}</p>
        </div>
      </footer>
    </div>
  );
}
