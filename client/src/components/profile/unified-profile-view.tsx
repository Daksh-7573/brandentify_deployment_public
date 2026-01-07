/**
 * Unified Profile View Component
 * 
 * This component showcases the comprehensive user profile data fetching
 * using the useUserProfile hook to get all user data in a single request.
 */

import { FC } from 'react';
import { useParams } from 'wouter';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BriefcaseBusiness, GraduationCap, Medal, Layout, Hammer, User2, MapPin, Sparkles, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UnifiedProfileViewProps {
  userId?: string;
}

export const UnifiedProfileView: FC<UnifiedProfileViewProps> = ({ userId: propUserId }) => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const parsedUserId = userId ? parseInt(userId) : undefined; // No fallback - require valid ID
  
  const { data: profileData, isLoading, error } = useUserProfile(parsedUserId);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User2 className="h-5 w-5" />
            Loading User Profile...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error || !profileData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unable to load user profile data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User2 className="h-5 w-5" />
            User Profile
          </CardTitle>
        </div>
        <CardDescription>
          Comprehensive user profile data with all related information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-6 w-full mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <User2 className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-1">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-1">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-1">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-1">
              <Hammer className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.photoURL || ''} alt={profileData.name || 'User'} />
                    <AvatarFallback>{profileData.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground">{profileData.title}</p>
                    {profileData.location && (
                      <p className="text-xs text-muted-foreground mt-1">{profileData.location}</p>
                    )}
                  </div>
                </div>
              </div>
              
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {profileData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                <span className="font-medium text-primary">
                  {profileData.title} {profileData.company && `at ${profileData.company}`}
                </span>
                {profileData.location && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{profileData.location}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {profileData.industry}
                </Badge>
                {profileData.domain && (
                  <Badge variant="outline" className="border-primary/20 text-muted-foreground">
                    {profileData.domain}
                  </Badge>
                )}
              </div>
            </div>

            {profileData.lookingFor && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 inline-flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Looking For:</span>
                <span className="text-sm font-medium text-white">{profileData.lookingFor}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
        </div>
      </Card>

      {/* Professional Brand Section */}
      {(profileData.tagline || profileData.visionStatement || profileData.missionStatement || (profileData.coreValues && profileData.coreValues.length > 0) || profileData.uniqueValueProposition) && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-white/10 space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Professional Brand
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profileData.tagline && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary uppercase tracking-widest">Tagline</h3>
                <p className="text-lg italic text-muted-foreground font-serif">"{profileData.tagline}"</p>
              </div>
            )}

            {profileData.uniqueValueProposition && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary uppercase tracking-widest">Unique Value Proposition</h3>
                <p className="text-muted-foreground leading-relaxed">{profileData.uniqueValueProposition}</p>
              </div>
            )}

            {(profileData.visionStatement || profileData.missionStatement) && (
              <div className="space-y-4">
                {profileData.visionStatement && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-primary uppercase tracking-widest">Vision</h3>
                    <p className="text-muted-foreground">{profileData.visionStatement}</p>
                  </div>
                )}
                {profileData.missionStatement && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-primary uppercase tracking-widest">Mission</h3>
                    <p className="text-muted-foreground">{profileData.missionStatement}</p>
                  </div>
                )}
              </div>
            )}

            {profileData.coreValues && profileData.coreValues.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary uppercase tracking-widest">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.coreValues.map((value: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
            </div>
          </TabsContent>
          
          {/* Work Experience Tab */}
          <TabsContent value="experience">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Work Experience</h3>
              
              {profileData.workExperiences.length === 0 ? (
                <p className="text-muted-foreground">No work experience data available</p>
              ) : (
                <div className="space-y-6">
                  {profileData.workExperiences.map((experience) => (
                    <div key={experience.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{experience.title}</h4>
                          <p className="text-sm">{experience.company}</p>
                          <p className="text-xs text-muted-foreground">{experience.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                            {experience.endDate 
                              ? new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                              : ' Present'}
                          </p>
                          {experience.industry && (
                            <Badge variant="outline" className="mt-1">{experience.industry}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm">{experience.description}</p>
                      
                      {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Key Responsibilities</h5>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {experience.keyResponsibilities.map((responsibility: string, index: number) => (
                              <li key={index}>{responsibility}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Education Tab */}
          <TabsContent value="education">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Education</h3>
              
              {profileData.education.length === 0 ? (
                <p className="text-muted-foreground">No education data available</p>
              ) : (
                <div className="space-y-6">
                  {profileData.education.map((edu) => (
                    <div key={edu.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{edu.institution}</h4>
                          <p className="text-sm">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</p>
                          <p className="text-xs text-muted-foreground">{edu.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                            {edu.endDate 
                              ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                              : ' Present'}
                          </p>
                          {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                      
                      {edu.achievements && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Achievements</h5>
                          <p className="text-sm">{edu.achievements}</p>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Skills</h3>
              
              {profileData.skills.length === 0 ? (
                <p className="text-muted-foreground">No skills data available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {profileData.skills.map((skill) => (
                    <div key={skill.id} className="border rounded-md p-4">
                      <h4 className="font-medium">{skill.name}</h4>
                      <div className="flex justify-between mt-2">
                        <Badge variant="secondary">{skill.level || 'Not specified'}</Badge>
                        {skill.proficiency !== undefined && (
                          <span className="text-sm">{skill.proficiency}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Projects</h3>
              
              {profileData.projects.length === 0 ? (
                <p className="text-muted-foreground">No projects data available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.projects.map((project) => (
                    <Card key={project.id}>
                      <div className="aspect-[2/1.2] w-full overflow-hidden">
                        <img 
                          src={project.thumbnailUrl || 'https://via.placeholder.com/400x200?text=No+Image'} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg">{project.title}</h4>
                        <p className="text-sm mt-1">{project.description}</p>
                        
                        <div className="flex mt-4 justify-between items-center">
                          <Badge variant="outline">
                            {project.category || 'Not categorized'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        
                        {project.projectUrl && (
                          <div className="mt-4">
                            <a 
                              href={project.projectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Visit Project
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Services Tab */}
          <TabsContent value="services">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Services</h3>
              
              {profileData.services.length === 0 ? (
                <p className="text-muted-foreground">No services data available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-6">
                        <h4 className="font-medium text-lg">{service.title}</h4>

                        <p className="text-sm mt-3">{service.description}</p>
                        
                        {service.features && service.features.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Features</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {service.features.map((feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-4 text-right">
                          <p className="font-medium">
                            {service.priceUsd && '$' + service.priceUsd}
                            {service.priceInr && '₹' + service.priceInr}
                            {service.isHourly && '/hr'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedProfileView;