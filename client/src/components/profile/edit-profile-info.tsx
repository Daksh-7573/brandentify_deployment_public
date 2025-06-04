import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { JobTitleInput } from '@/components/ui/job-title-input';
import { Loader2, X } from 'lucide-react';
import { UserData } from '@/types/user';
import { apiRequest } from '@/lib/queryClient';

const profileInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().optional(),
  aboutMe: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
  lookingFor: z.string().optional(),
  whatIOffer: z.string().optional(),
});

type ProfileInfoData = z.infer<typeof profileInfoSchema>;

interface EditProfileInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

const EditProfileInfo: React.FC<EditProfileInfoProps> = ({ userData, onCancel, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileInfoData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      name: userData.name || '',
      jobTitle: userData.title || '',
      aboutMe: userData.aboutMe || '',
      location: userData.location || '',
      industry: userData.industry || '',
      domain: userData.domain || '',
      lookingFor: userData.lookingFor || '',
      whatIOffer: userData.whatIOffer || '',
    },
  });

  const onSubmit = async (data: ProfileInfoData) => {
    setIsLoading(true);
    try {
      console.log('Form submission data:', data);
      console.log('User ID being used:', userData.id);
      
      const updatePayload = {
        name: data.name,
        title: data.jobTitle || null,
        aboutMe: data.aboutMe || null,
        location: data.location || null,
        industry: data.industry || null,
        domain: data.domain || null,
        lookingFor: data.lookingFor || null,
        whatIOffer: data.whatIOffer || null,
      };
      
      console.log('Update payload:', updatePayload);
      
      const response = await apiRequest('PUT', `/api/users/${userData.id}`, updatePayload);
      
      console.log('API response status:', response.status);
      console.log('API response:', response);

      if (response.ok) {
        console.log('Profile update successful, calling onSave');
        onSave();
      } else {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile info:', error);
      alert('Error updating profile. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur border border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Edit Profile Information</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Update your professional details and career information
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your full name"
                        className="bg-white/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Title */}
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <JobTitleInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Product Manager"
                        className="bg-white/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* About Me */}
              <FormField
                control={form.control}
                name="aboutMe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Me</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about yourself, your experience, and your goals..."
                        className="bg-white/50 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., San Francisco, CA"
                          className="bg-white/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Technology, Healthcare"
                          className="bg-white/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Domain */}
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Software Development, Finance"
                          className="bg-white/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Looking For */}
                <FormField
                  control={form.control}
                  name="lookingFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Looking For</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="What are you looking for?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="job_opportunities">Job Opportunities</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="mentorship">Mentorship</SelectItem>
                          <SelectItem value="collaboration">Collaboration</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="partnerships">Partnerships</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* What I Offer */}
              <FormField
                control={form.control}
                name="whatIOffer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What I Offer</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your skills, services, or what you can offer to others..."
                        className="bg-white/50 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfileInfo;