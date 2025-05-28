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
import { BriefcaseBusiness, GraduationCap, Medal, Layout, Hammer, User2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UnifiedProfileViewProps {
  userId?: string;
}

export const UnifiedProfileView: FC<UnifiedProfileViewProps> = ({ userId: propUserId }) => {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const userId = propUserId || paramUserId;
  const parsedUserId = userId ? parseInt(userId) : 1; // Default to user ID 1 if none provided
  
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
              
              <div className="md:w-2/3 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">About Me</h4>
                  <p className="text-sm text-muted-foreground">{profileData.aboutMe || 'No about me information available'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Phone</h4>
                    <p className="text-sm text-muted-foreground">{profileData.phoneNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Industry</h4>
                    <p className="text-sm text-muted-foreground">{profileData.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Domain</h4>
                    <p className="text-sm text-muted-foreground">{profileData.domain || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Looking For</h4>
                  <p className="text-sm text-muted-foreground">{profileData.lookingFor || 'Not specified'}</p>
                </div>
                

              </div>
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