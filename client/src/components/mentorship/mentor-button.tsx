import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useSession } from '@/lib/auth';

// Define the form schema with zod
const requestFormSchema = z.object({
  message: z.string()
    .min(10, { message: 'Message must be at least 10 characters long' })
    .max(500, { message: 'Message cannot exceed 500 characters' }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface MentorButtonProps {
  mentorId: number;
  mentorName: string;
}

export function MentorButton({ mentorId, mentorName }: MentorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      message: '',
    },
  });

  // If not logged in, return null or a disabled button
  if (!user) {
    return (
      <Button variant="outline" disabled>
        Request Mentorship
      </Button>
    );
  }
  
  // Don't show the button if viewing your own profile
  if (user.id === mentorId) {
    return null;
  }

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to request mentorship',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      const response = await apiRequest('/api/mentorship/request', {
        method: 'POST',
        body: JSON.stringify({
          mentorId,
          menteeId: user.id,
          message: data.message,
          status: 'pending'
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Mentorship Requested',
          description: `Your mentorship request has been sent to ${mentorName}`,
        });
        setIsOpen(false);
        form.reset();
        
        // Invalidate any relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/mentorship/mentee', user.id] });
      } else {
        const errorData = await response.json();
        
        // Check for specific error cases
        if (response.status === 409) {
          toast({
            title: 'Request Already Exists',
            description: 'You have already requested mentorship from this user',
            variant: 'destructive',
          });
        } else if (response.status === 400 && errorData.message.includes('maximum number')) {
          toast({
            title: 'Limit Reached',
            description: 'You have reached the maximum number of active mentorships (5)',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: errorData.message || 'Failed to send mentorship request',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 16l4-4-4-4" />
          <path d="M6 8l-4 4 4 4" />
          <path d="m14 4-4 16" />
        </svg>
        Request Mentorship
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Mentorship from {mentorName}</DialogTitle>
            <DialogDescription>
              Send a message to request mentorship. Be clear about your goals and what you hope to learn.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I'd like to request your mentorship to help me develop skills in..."
                        className="h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain why you're seeking mentorship and what specific areas you'd like guidance with.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Request'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}