import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  postType: z.enum(["news", "poll", "image", "video"]),
  industry: z.string().min(1, "Please select an industry"),
  tags: z.string().optional(),
  mediaUrl: z.string().optional(),
  pollOptions: z.string().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

interface CreatePulsePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePulsePostDialog({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePulsePostDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pollOptionsArray, setPollOptionsArray] = useState<string[]>([""]);

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      postType: "news",
      industry: "",
      tags: "",
      mediaUrl: "",
      pollOptions: "",
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      // Format poll options if present
      if (data.postType === "poll" && pollOptionsArray.length > 0) {
        const filteredOptions = pollOptionsArray.filter(opt => opt.trim() !== "");
        data.pollOptions = JSON.stringify(filteredOptions);
      }
      
      return await apiRequest("POST", "/api/industry-pulse/posts", {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags.split(",").map(tag => tag.trim())) : null,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      form.reset();
      setPollOptionsArray([""]);
      onPostCreated();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/industry-pulse/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addPollOption = () => {
    setPollOptionsArray([...pollOptionsArray, ""]);
  };

  const removePollOption = (index: number) => {
    const newOptions = [...pollOptionsArray];
    newOptions.splice(index, 1);
    setPollOptionsArray(newOptions);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptionsArray];
    newOptions[index] = value;
    setPollOptionsArray(newOptions);
  };

  const onSubmit = (data: CreatePostForm) => {
    createPost.mutate(data);
  };

  const postType = form.watch("postType");

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setPollOptionsArray([""]);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share insights, news, or questions with your professional network.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your post" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a post type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="news">News Article</SelectItem>
                      <SelectItem value="poll">Poll</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of content you want to share
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {postType === "poll" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Poll Options</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                  >
                    Add Option
                  </Button>
                </div>
                {pollOptionsArray.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {pollOptionsArray.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePollOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(postType === "image" || postType === "video") && (
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {postType === "image" ? "Image URL" : "Video URL"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          postType === "image"
                            ? "Enter image URL"
                            : "Enter video URL (YouTube, Vimeo, etc.)"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {postType === "image"
                        ? "Direct link to your image"
                        : "Link to a video on YouTube, Vimeo, or other platforms"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to help others discover your post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="mt-2"
                disabled={createPost.isPending}
              >
                {createPost.isPending ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}