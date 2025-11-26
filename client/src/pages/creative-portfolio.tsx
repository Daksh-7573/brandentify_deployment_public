import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CreativeBold from "@/components/portfolio/templates/creative-bold";
import { FeedSkeleton } from "@/components/ui/skeleton-components";
import { useState, useEffect } from "react";

interface UserData {
  id: number;
  name: string;
  email: string | null;
  title: string | null;
  photoURL: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  tagline: string | null;
  visionStatement: string | null;
  missionStatement: string | null;
  coreValues: string[] | null;
  uniqueValueProposition: string | null;
}

interface Skill {
  id: number;
  name: string;
  level?: string | null;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl?: string | null;
  mediaUrls?: string[];
  startDate?: string | null;
  projectUrl?: string | null;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
}

interface Service {
  id: number;
  title: string;
  description?: string | null;
  icon?: string | null;
}

export default function CreativePortfolioPage() {
  const { userId } = useParams<{ userId?: string }>();
  const numericUserId = userId ? parseInt(userId, 10) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numericUserId) {
      setError("Invalid user ID");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [userRes, skillsRes, expRes, projectsRes, eduRes, servicesRes] = await Promise.all([
          fetch(`/api/users/${numericUserId}`),
          fetch(`/api/users/${numericUserId}/skills`),
          fetch(`/api/users/${numericUserId}/experiences`),
          fetch(`/api/users/${numericUserId}/projects`),
          fetch(`/api/users/${numericUserId}/educations`),
          fetch(`/api/users/${numericUserId}/services`),
        ]);

        if (userRes.ok) setUserData(await userRes.json());
        if (skillsRes.ok) setSkills(await skillsRes.json());
        if (expRes.ok) setExperiences(await expRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (eduRes.ok) setEducations(await eduRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
      } catch (err) {
        setError("Failed to load portfolio data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [numericUserId]);

  if (isLoading) return <FeedSkeleton />;
  if (error || !userData) return <div className="flex items-center justify-center min-h-screen text-red-500">{error || "Portfolio not found"}</div>;

  return (
    <CreativeBold
      userInfo={{
        id: userData.id,
        name: userData.name || '',
        email: userData.email,
        title: userData.title,
        aboutMe: userData.aboutMe,
        location: userData.location,
        industry: userData.industry,
        domain: userData.domain,
        lookingFor: userData.lookingFor,
        whatIOffer: userData.whatIOffer,
        photoURL: userData.photoURL,
        tagline: userData.tagline,
        visionStatement: userData.visionStatement,
        misionStatement: userData.missionStatement,
        coreValues: userData.coreValues || [],
        uniqueValueProposition: userData.uniqueValueProposition,
      } as any}
      userSkills={skills.map(s => ({ id: s.id, name: s.name, level: s.level }))}
      userExperiences={experiences.map(e => ({ 
        id: e.id, 
        title: e.title, 
        company: e.company, 
        startDate: e.startDate, 
        endDate: e.endDate, 
        description: e.description || '' 
      }))}
      userProjects={projects.map(p => ({ 
        id: p.id, 
        title: p.title, 
        description: p.description || '', 
        thumbnailUrl: p.thumbnailUrl, 
        mediaUrls: p.mediaUrls || [], 
        startDate: p.startDate, 
        projectUrl: p.projectUrl 
      }))}
      userEducations={educations.map(e => ({ 
        id: e.id, 
        institution: e.institution, 
        degree: e.degree, 
        fieldOfStudy: e.fieldOfStudy, 
        startDate: e.startDate, 
        endDate: e.endDate 
      }))}
      userServices={services.map(s => ({ 
        id: s.id, 
        title: s.title, 
        description: s.description || '', 
        icon: s.icon 
      }))}
      currentUserId={numericUserId || 0}
    />
  );
}
