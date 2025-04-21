import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, Linkedin, MapPin, Camera, Film, Calendar, CheckCircle,
  Download, Sparkles, Github, MessagesSquare, ExternalLink, 
  Instagram, Zap, Palette, ArrowUpRight, Compass, HardDrive,
  Code, Briefcase, Lock, GraduationCap, Globe, Lightbulb, Play,
  Star, Eye, Mouse, LayoutGrid, ImagePlus, X, Plus, Share2
} from "lucide-react";

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
  userEducations?: Education[];
  userServices?: Service[];
}

// Helper function to get random number
const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function VisualExpert({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: VisualExpertProps) {
  const [typedText, setTypedText] = useState("");
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const titleText = userInfo.title || "Visual Storyteller";
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort projects by date (most recent first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services by title
  const sortedServices = [...userServices].sort((a, b) => 
    (a.title || '').localeCompare(b.title || '')
  );
  
  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Initialize animations, styles, and typewriter effect on component mount
  useEffect(() => {
    // Add web fonts - Montserrat (body), Abril Fatface (heading)
    const montserratLink = document.createElement('link');
    montserratLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap';
    montserratLink.rel = 'stylesheet';
    
    const abrilLink = document.createElement('link');
    abrilLink.href = 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap';
    abrilLink.rel = 'stylesheet';
    
    document.head.appendChild(montserratLink);
    document.head.appendChild(abrilLink);
    
    // Add CSS for animations and styles
    const style = document.createElement('style');
    style.textContent = `
      /* Visual Expert Template Animations & Styles */
      .visual-expert-template {
        --color-accent-primary: #ff3d5a;
        --color-accent-secondary: #4d2ceb;
        --color-accent-tertiary: #1fd0c9;
        --color-dark: #111111;
        --color-light: #ffffff;
        --transition-fast: 0.2s ease;
        --transition-medium: 0.4s ease;
        --transition-slow: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Montserrat', sans-serif;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes zoomIn {
        from { transform: scale(0.95); }
        to { transform: scale(1); }
      }
      
      @keyframes floatAnimation {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(255, 61, 90, 0.5); }
        70% { box-shadow: 0 0 0 15px rgba(255, 61, 90, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 61, 90, 0); }
      }
      
      @keyframes rotateInfinite {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes dash {
        to {
          stroke-dashoffset: 0;
        }
      }
      
      .visual-expert-template .headline {
        font-family: 'Abril Fatface', serif;
        font-weight: 400;
        line-height: 1.1;
        background: linear-gradient(to right, var(--color-accent-primary), var(--color-accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }
      
      .visual-expert-template .subheadline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        margin-bottom: 1rem;
        position: relative;
      }
      
      .visual-expert-template .subheadline::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -10px;
        width: 60px;
        height: 3px;
        background: var(--color-accent-primary);
      }
      
      .visual-expert-template .profile-container {
        position: relative;
        perspective: 1000px;
        transform-style: preserve-3d;
      }
      
      .visual-expert-template .profile-frame {
        position: relative;
        border-radius: 0;
        overflow: hidden;
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3);
        transform-style: preserve-3d;
        transform: rotateY(-5deg);
        transition: all var(--transition-slow);
      }
      
      .visual-expert-template .profile-frame::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
        z-index: 1;
      }
      
      .visual-expert-template .profile-frame:hover {
        transform: rotateY(0deg) scale(1.05);
      }
      
      .visual-expert-template .profile-image-wrapper {
        position: relative;
        overflow: hidden;
        transform: scale(1.05);
        transition: transform var(--transition-slow);
      }
      
      .visual-expert-template .profile-frame:hover .profile-image-wrapper {
        transform: scale(1);
      }
      
      .visual-expert-template .frame-border {
        position: absolute;
        inset: 0;
        border: 10px solid rgba(255, 255, 255, 0.1);
        z-index: 2;
        pointer-events: none;
      }
      
      .visual-expert-template .frame-corner {
        position: absolute;
        width: 30px;
        height: 30px;
        border-color: var(--color-accent-primary);
        z-index: 3;
      }
      
      .visual-expert-template .frame-corner-tl {
        top: 0;
        left: 0;
        border-top: 3px solid;
        border-left: 3px solid;
      }
      
      .visual-expert-template .frame-corner-tr {
        top: 0;
        right: 0;
        border-top: 3px solid;
        border-right: 3px solid;
      }
      
      .visual-expert-template .frame-corner-bl {
        bottom: 0;
        left: 0;
        border-bottom: 3px solid;
        border-left: 3px solid;
      }
      
      .visual-expert-template .frame-corner-br {
        bottom: 0;
        right: 0;
        border-bottom: 3px solid;
        border-right: 3px solid;
      }
      
      .visual-expert-template .profile-details {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        z-index: 3;
        color: white;
      }
      
      .visual-expert-template .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.8s forwards;
      }
      
      .visual-expert-template .animate-fade-in-right {
        opacity: 0;
        animation: fadeInRight 0.8s forwards;
      }
      
      .visual-expert-template .animate-fade-in-left {
        opacity: 0;
        animation: fadeInLeft 0.8s forwards;
      }
      
      .visual-expert-template .animate-zoom-in {
        opacity: 0;
        animation: zoomIn 0.8s forwards;
      }
      
      .visual-expert-template .animate-delay-1 { animation-delay: 0.1s; }
      .visual-expert-template .animate-delay-2 { animation-delay: 0.2s; }
      .visual-expert-template .animate-delay-3 { animation-delay: 0.3s; }
      .visual-expert-template .animate-delay-4 { animation-delay: 0.4s; }
      .visual-expert-template .animate-delay-5 { animation-delay: 0.5s; }
      .visual-expert-template .animate-delay-6 { animation-delay: 0.6s; }
      
      .visual-expert-template .canvas-area {
        position: relative;
        min-height: 80vh;
        padding: 6rem 0;
        overflow: hidden;
      }
      
      .visual-expert-template .canvas-area::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z' fill='%23ff3d5a' fill-opacity='0.05'/%3E%3C/svg%3E");
      }
      
      .visual-expert-template .rotating-border {
        position: absolute;
        width: 500px;
        height: 500px;
        border: 2px dashed rgba(255, 61, 90, 0.1);
        border-radius: 50%;
        animation: rotateInfinite 60s linear infinite;
      }
      
      .visual-expert-template .rotating-border-outer {
        width: 700px;
        height: 700px;
        animation-direction: reverse;
        animation-duration: 80s;
      }
      
      .visual-expert-template .project-label {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--color-accent-primary);
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 4px 8px;
        z-index: 5;
      }
      
      .visual-expert-template .project-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-rows: minmax(150px, auto);
        gap: 1.5rem;
      }
      
      .visual-expert-template .project-item {
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;
        border-radius: 0;
        transition: all var(--transition-medium);
        cursor: pointer;
      }
      
      .visual-expert-template .project-item:hover {
        transform: scale(1.02);
        z-index: 10;
      }
      
      .visual-expert-template .project-size-1 {
        grid-column: span 6;
        grid-row: span 3;
      }
      
      .visual-expert-template .project-size-2 {
        grid-column: span 6;
        grid-row: span 2;
      }
      
      .visual-expert-template .project-size-3 {
        grid-column: span 3;
        grid-row: span 2;
      }
      
      .visual-expert-template .project-size-4 {
        grid-column: span 3;
        grid-row: span 3;
      }
      
      @media (max-width: 768px) {
        .visual-expert-template .project-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        
        .visual-expert-template .project-size-1,
        .visual-expert-template .project-size-2,
        .visual-expert-template .project-size-3,
        .visual-expert-template .project-size-4 {
          grid-column: span 6;
          grid-row: span 2;
        }
      }
      
      .visual-expert-template .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
      }
      
      .visual-expert-template .project-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 1.5rem;
        opacity: 0;
        transition: opacity var(--transition-medium);
      }
      
      .visual-expert-template .project-item:hover .project-overlay {
        opacity: 1;
      }
      
      .visual-expert-template .project-item:hover .project-image {
        transform: scale(1.1);
      }
      
      .visual-expert-template .project-title {
        color: white;
        font-weight: 700;
        font-size: 1.25rem;
        margin-bottom: 0.25rem;
        transform: translateY(10px);
        transition: transform var(--transition-medium);
      }
      
      .visual-expert-template .project-item:hover .project-title {
        transform: translateY(0);
      }
      
      .visual-expert-template .project-description {
        color: rgba(255,255,255,0.8);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transform: translateY(10px);
        transition: transform var(--transition-medium);
        transition-delay: 0.05s;
      }
      
      .visual-expert-template .project-item:hover .project-description {
        transform: translateY(0);
      }
      
      .visual-expert-template .project-actions {
        display: flex;
        gap: 0.5rem;
        transform: translateY(10px);
        opacity: 0;
        transition: transform var(--transition-medium), opacity var(--transition-medium);
        transition-delay: 0.1s;
      }
      
      .visual-expert-template .project-item:hover .project-actions {
        transform: translateY(0);
        opacity: 1;
      }
      
      .visual-expert-template .project-preview {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-medium);
      }
      
      .visual-expert-template .project-preview.active {
        opacity: 1;
        pointer-events: all;
      }
      
      .visual-expert-template .preview-content {
        max-width: 1200px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        background: white;
        padding: 2rem;
        transform: translateY(20px);
        transition: transform var(--transition-medium);
      }
      
      .visual-expert-template .project-preview.active .preview-content {
        transform: translateY(0);
      }
      
      .visual-expert-template .preview-close {
        position: absolute;
        top: 2rem;
        right: 2rem;
        background: white;
        color: black;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform var(--transition-fast);
      }
      
      .visual-expert-template .preview-close:hover {
        transform: rotate(90deg);
      }
      
      .visual-expert-template .skill-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .visual-expert-template .skill-item {
        position: relative;
        padding: 1rem;
        border-radius: 0;
        background: white;
        flex: 1 1 calc(33.333% - 1rem);
        min-width: 200px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform var(--transition-medium);
      }
      
      .visual-expert-template .skill-item:hover {
        transform: translateY(-5px);
      }
      
      .visual-expert-template .skill-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: var(--color-accent-primary);
      }
      
      .visual-expert-template .skill-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 61, 90, 0.1);
        color: var(--color-accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        margin-bottom: 1rem;
        transition: transform var(--transition-medium);
      }
      
      .visual-expert-template .skill-item:hover .skill-icon {
        transform: scale(1.1);
      }
      
      .visual-expert-template .skill-progress {
        width: 100%;
        height: 6px;
        background: #f1f1f1;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 0.5rem;
      }
      
      .visual-expert-template .skill-progress-bar {
        height: 100%;
        background: linear-gradient(to right, var(--color-accent-primary), var(--color-accent-secondary));
        border-radius: 3px;
        transition: width 1s ease;
      }
      
      .visual-expert-template .timeline {
        position: relative;
        padding: 2rem 0;
      }
      
      .visual-expert-template .timeline::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #f1f1f1;
        transform: translateX(-50%);
      }
      
      .visual-expert-template .timeline-item {
        position: relative;
        margin-bottom: 3rem;
        width: 100%;
      }
      
      .visual-expert-template .timeline-content {
        width: calc(50% - 2.5rem);
        position: relative;
        padding: 1.5rem;
        border-radius: 0;
        background: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform var(--transition-medium);
      }
      
      .visual-expert-template .timeline-content:hover {
        transform: translateY(-5px);
      }
      
      .visual-expert-template .timeline-content::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        top: 20px;
        transform: rotate(45deg);
      }
      
      .visual-expert-template .timeline-left {
        margin-left: auto;
      }
      
      .visual-expert-template .timeline-left::before {
        right: -10px;
      }
      
      .visual-expert-template .timeline-right {
        margin-right: auto;
      }
      
      .visual-expert-template .timeline-right::before {
        left: -10px;
      }
      
      .visual-expert-template .timeline-dot {
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: white;
        border: 5px solid var(--color-accent-primary);
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
      }
      
      @media (max-width: 768px) {
        .visual-expert-template .timeline::before {
          left: 30px;
        }
        
        .visual-expert-template .timeline-content {
          width: calc(100% - 60px);
          margin-left: 60px !important;
        }
        
        .visual-expert-template .timeline-content::before {
          left: -10px !important;
        }
        
        .visual-expert-template .timeline-dot {
          left: 30px;
        }
      }
      
      .visual-expert-template .cursor-dot {
        position: fixed;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color-accent-primary);
        mix-blend-mode: difference;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
      }
      
      .visual-expert-template .sticky-cta {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 50;
        animation: floatAnimation 3s ease-in-out infinite;
      }
      
      .visual-expert-template .cta-button {
        position: relative;
        background: var(--color-accent-primary);
        color: white;
        border: none;
        font-weight: 700;
        padding: 0.75rem 1.5rem;
        border-radius: 0;
        overflow: hidden;
        transition: all var(--transition-medium);
      }
      
      .visual-expert-template .cta-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }
      
      .visual-expert-template .cta-button:hover::before {
        left: 100%;
      }
      
      .visual-expert-template .title-highlight {
        position: relative;
        display: inline-block;
      }
      
      .visual-expert-template .title-highlight::after {
        content: '';
        position: absolute;
        bottom: 5px;
        left: 0;
        width: 100%;
        height: 10px;
        background: rgba(255, 61, 90, 0.2);
        z-index: -1;
      }
    `;
    
    document.head.appendChild(style);
    
    // Typewriter effect for title
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < titleText.length) {
        setTypedText(titleText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);
    
    // Track mouse position for cursor effects
    const mouseMoveHandler = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    
    // Add and remove event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    
    return () => {
      clearInterval(typeInterval);
      document.head.removeChild(style);
      document.head.removeChild(montserratLink);
      document.head.removeChild(abrilLink);
      document.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [titleText]);
  
  const handleProjectPreview = (project: Project) => {
    setPreviewProject(project);
    setShowPreview(true);
  };
  
  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => {
      setPreviewProject(null);
    }, 400);
  };
  
  // Utility function to assign a projects grid size
  const getProjectSize = (index: number) => {
    const sizes = ['project-size-1', 'project-size-2', 'project-size-3', 'project-size-4'];
    return sizes[index % 4];
  };
  
  // Return icon based on category
  const getCategoryIcon = (category: string | null) => {
    if (!category) return <Camera className="h-5 w-5" />;
    
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('web')) return <Globe className="h-5 w-5" />;
    if (categoryLower.includes('design')) return <Palette className="h-5 w-5" />;
    if (categoryLower.includes('video')) return <Film className="h-5 w-5" />;
    if (categoryLower.includes('photo')) return <Camera className="h-5 w-5" />;
    if (categoryLower.includes('development')) return <Code className="h-5 w-5" />;
    if (categoryLower.includes('tech')) return <HardDrive className="h-5 w-5" />;
    
    return <Lightbulb className="h-5 w-5" />;
  };
  
  // Get skill icon based on name
  const getSkillIcon = (skillName: string) => {
    const nameLower = skillName.toLowerCase();
    
    if (nameLower.includes('design')) return <Palette className="h-5 w-5" />;
    if (nameLower.includes('photo')) return <Camera className="h-5 w-5" />;
    if (nameLower.includes('video')) return <Film className="h-5 w-5" />;
    if (nameLower.includes('development') || nameLower.includes('coding') || nameLower.includes('programming')) 
      return <Code className="h-5 w-5" />;
    if (nameLower.includes('management')) return <Briefcase className="h-5 w-5" />;
    if (nameLower.includes('marketing')) return <Lightbulb className="h-5 w-5" />;
    
    return <Star className="h-5 w-5" />;
  };
  
  return (
    <div className="visual-expert-template w-full bg-white" ref={containerRef}>
      {/* Custom cursor dot - purely decorative, follows mouse */}
      <div 
        className="cursor-dot hidden lg:block" 
        style={{ 
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      ></div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden px-6 md:px-12 py-20">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            {/* Text Content */}
            <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-1">
              <div className="animate-fade-in animate-delay-1">
                <span className="inline-block mb-4 px-4 py-1 border-2 border-black text-sm font-bold tracking-widest uppercase">
                  {userInfo.lookingFor || "Available for Projects"}
                </span>
              </div>
              
              <h1 className="headline text-5xl md:text-7xl lg:text-8xl mb-8 animate-fade-in animate-delay-2">
                {userInfo.name.split(' ')[0]}
                <span className="relative">
                  <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,5 C50,25 150,-15 200,5" fill="none" stroke="#ff3d5a" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <h2 className="text-xl md:text-3xl font-medium mb-6 animate-fade-in animate-delay-3">
                <span className="title-highlight">I'm a {typedText}</span>
                <span className="animate-pulse ml-1">|</span>
              </h2>
              
              <div className="flex gap-3 mb-8 flex-wrap justify-center lg:justify-start animate-fade-in animate-delay-4">
                {userInfo.domain && (
                  <Badge className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-none text-sm">
                    # {userInfo.domain}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-none text-sm">
                    # {userInfo.industry}
                  </Badge>
                )}
                {userInfo.location && (
                  <Badge className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-none text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {userInfo.location}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-6 justify-center lg:justify-start animate-fade-in animate-delay-5">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`} 
                    className="size-12 rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 hover:bg-black hover:text-white"
                    aria-label="Email"
                  >
                    <Mail className="size-5" />
                  </a>
                )}
                <a 
                  href="#" 
                  className="size-12 rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 hover:bg-black hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </a>
                <a 
                  href="#" 
                  className="size-12 rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 hover:bg-black hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="size-5" />
                </a>
                <a 
                  href="#" 
                  className="size-12 rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 hover:bg-black hover:text-white"
                  aria-label="GitHub"
                >
                  <Github className="size-5" />
                </a>
              </div>
            </div>
            
            {/* Profile Image with creative frame */}
            <div className="w-full lg:w-1/3 order-1 lg:order-2 animate-fade-in animate-delay-2">
              <div className="profile-container">
                <div className="profile-frame aspect-[3/4] mx-auto max-w-[350px]">
                  <div className="profile-image-wrapper h-full">
                    <ProfileImage
                      src={userInfo.photoURL}
                      alt={userInfo.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="frame-border"></div>
                  <div className="frame-corner frame-corner-tl"></div>
                  <div className="frame-corner frame-corner-tr"></div>
                  <div className="frame-corner frame-corner-bl"></div>
                  <div className="frame-corner frame-corner-br"></div>
                  <div className="profile-details">
                    <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-80">
                      {userInfo.title || "Creative Professional"}
                    </div>
                    <div className="text-2xl font-bold">
                      {userInfo.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visual elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
          <div className="rotating-border" style={{ transform: 'translate(-50%, -50%)' }}></div>
          <div className="rotating-border rotating-border-outer" style={{ transform: 'translate(-50%, -50%)' }}></div>
        </div>
      </section>
      
      {/* Visual Portfolio Grid */}
      <section className="py-24 px-6 md:px-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="headline text-4xl md:text-5xl lg:text-6xl mb-16 text-center">
            <span className="title-highlight">Visual Portfolio</span>
          </h2>
          
          <div className="project-grid mb-12">
            {sortedProjects.length > 0 ? (
              sortedProjects.slice(0, 8).map((project, index) => (
                <div 
                  key={project.id}
                  className={`project-item ${getProjectSize(index)}`}
                  onClick={() => handleProjectPreview(project)}
                >
                  {/* Project thumbnail */}
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="project-image"
                    />
                  ) : (
                    <div className="project-image bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      {getCategoryIcon(project.category)}
                    </div>
                  )}
                  
                  {/* Project overlay */}
                  <div className="project-overlay">
                    {project.category && (
                      <Badge className="absolute top-4 left-4 bg-white text-black hover:bg-white rounded-none px-3 py-1">
                        {project.category}
                      </Badge>
                    )}
                    
                    <h3 className="project-title">
                      {project.title}
                    </h3>
                    
                    {project.description && (
                      <p className="project-description">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="project-actions">
                      <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-none px-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-white bg-black/20 backdrop-blur-sm hover:bg-black/30 rounded-none px-3 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-sm">Visit</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <div className="project-label">Featured</div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your visual portfolio will appear here once you add projects to showcase your work.
                </p>
              </div>
            )}
          </div>
          
          {sortedProjects.length > 8 && (
            <div className="text-center">
              <Button className="cta-button">
                View All Projects
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Skills & Expertise Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="container mx-auto">
          <h2 className="headline text-4xl md:text-5xl lg:text-6xl mb-16 text-center">
            <span className="title-highlight">Skills & Expertise</span>
          </h2>
          
          <div className="skill-grid">
            {sortedSkills.length > 0 ? (
              sortedSkills.slice(0, 6).map((skill, index) => (
                <div 
                  key={skill.id}
                  className="skill-item animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="skill-icon">
                    {getSkillIcon(skill.name)}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1">{skill.name}</h3>
                  
                  {skill.level && (
                    <p className="text-sm text-gray-500 mb-3">{skill.level}</p>
                  )}
                  
                  <div className="skill-progress">
                    <div 
                      className="skill-progress-bar" 
                      style={{ width: `${skill.proficiency || 50}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-16 text-center bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Skills Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your expertise and skills will be showcased here to highlight your capabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Experience Timeline Section */}
      <section className="py-24 px-6 md:px-12 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="headline text-4xl md:text-5xl lg:text-6xl mb-16 text-center">
            <span className="title-highlight">Experience</span>
          </h2>
          
          <div className="timeline">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.slice(0, 4).map((exp, index) => (
                <div key={exp.id} className="timeline-item">
                  <div className={`timeline-content ${index % 2 === 0 ? 'timeline-left' : 'timeline-right'} animate-fade-in`}
                       style={{ animationDelay: `${0.2 * index}s` }}>
                    {exp.company && (
                      <Badge className="bg-black text-white hover:bg-black rounded-none px-3 py-1 mb-2">
                        {exp.company}
                      </Badge>
                    )}
                    
                    <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </span>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700">{exp.description}</p>
                    )}
                  </div>
                  
                  <div className="timeline-dot"></div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center bg-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Experience Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your professional journey will be showcased here in a visual timeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Education Section (if available) */}
      {sortedEducations.length > 0 && (
        <section className="py-24 px-6 md:px-12 bg-white">
          <div className="container mx-auto">
            <h2 className="headline text-4xl md:text-5xl lg:text-6xl mb-16 text-center">
              <span className="title-highlight">Education</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedEducations.map((edu, index) => (
                <div key={edu.id} className="p-8 bg-gray-50 animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-black text-white rounded-none">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-1">{edu.degree}</h3>
                      
                      {edu.institution && (
                        <p className="text-gray-700 font-medium mb-2">{edu.institution}</p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </span>
                      </div>
                      
                      {edu.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{edu.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact & Collaborate CTA */}
      <section className="py-24 px-6 md:px-12 bg-black text-white">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="headline text-4xl md:text-5xl lg:text-6xl mb-8 text-white">
              Let's Create Something <span className="text-[#ff3d5a]">Amazing</span> Together
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? 
              I'm always open to discussing new creative opportunities.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              {userInfo.email && (
                <a 
                  href={`mailto:${userInfo.email}`} 
                  className="cta-button bg-[#ff3d5a] hover:bg-[#ff2345] flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Let's Talk
                </a>
              )}
              
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-none"
                onClick={() => window.open('#resume', '_blank')}
              >
                <Download className="h-5 w-5 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Links Footer */}
      <footer className="py-12 px-6 md:px-12 bg-gray-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold">{userInfo.name}</h3>
              <p className="text-gray-500">{userInfo.title}</p>
            </div>
            
            <div className="flex gap-4">
              {userInfo.email && (
                <a 
                  href={`mailto:${userInfo.email}`} 
                  className="size-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="size-5" />
                </a>
              )}
              <a 
                href="#" 
                className="size-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </a>
              <a 
                href="#" 
                className="size-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a 
                href="#" 
                className="size-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Message"
              >
                <MessagesSquare className="size-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {userInfo.name} | All Rights Reserved
          </div>
        </div>
      </footer>
      
      {/* Project Preview Modal */}
      <div className={`project-preview ${showPreview ? 'active' : ''}`}>
        {previewProject && (
          <>
            <div className="preview-close" onClick={closePreview}>
              <X className="h-5 w-5" />
            </div>
            
            <div className="preview-content">
              <div className="mb-8">
                {previewProject.thumbnailUrl && (
                  <div className="h-[400px] overflow-hidden mb-6">
                    <img 
                      src={previewProject.thumbnailUrl}
                      alt={previewProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold">{previewProject.title}</h2>
                  
                  <div className="flex gap-2">
                    {previewProject.projectUrl && (
                      <a
                        href={previewProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-none"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Project
                      </a>
                    )}
                    
                    <Button variant="outline" className="border-black text-black rounded-none" onClick={closePreview}>
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {previewProject.category && (
                    <Badge className="bg-black text-white hover:bg-black rounded-none px-3 py-1">
                      {previewProject.category}
                    </Badge>
                  )}
                  
                  <Badge className="bg-gray-100 text-black hover:bg-gray-200 rounded-none px-3 py-1 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {formatDate(previewProject.startDate)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Project Overview</h3>
                  <p className="text-gray-700 mb-6">
                    {previewProject.description || "No description available for this project."}
                  </p>
                  
                  {/* If there are media URLs, display them as a grid */}
                  {previewProject.mediaUrls && previewProject.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      {previewProject.mediaUrls.map((url, index) => (
                        <div key={index} className="aspect-square overflow-hidden">
                          <img src={url} alt={`Project image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-6">
                  <h3 className="text-xl font-bold mb-4">Project Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-bold text-gray-500 mb-1">PROJECT TYPE</div>
                      <div>{previewProject.category || "Uncategorized"}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-bold text-gray-500 mb-1">DATE</div>
                      <div>{formatDate(previewProject.startDate)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-bold text-gray-500 mb-1">CLIENT</div>
                      <div>{previewProject.company || "Personal Project"}</div>
                    </div>
                    
                    {previewProject.projectUrl && (
                      <div>
                        <div className="text-sm font-bold text-gray-500 mb-1">WEBSITE</div>
                        <a 
                          href={previewProject.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#ff3d5a] hover:underline"
                        >
                          Visit Project
                        </a>
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <Button className="w-full rounded-none bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share This Project
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Sticky CTA */}
      <div className="sticky-cta hidden md:block">
        <PortfolioCtaButtons 
          variant="minimal"
          resumeUrl={null} 
          mentorUrl={null}
          connectUrl={null}
          userEmail={userInfo.email}
          userName={userInfo.name}
          className="bg-black text-white border-0"
        />
      </div>
    </div>
  );
}