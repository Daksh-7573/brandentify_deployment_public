import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/auth-context";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Calendar, FileText, Target, ChevronRight, Edit, BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addYears, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useUserCareerCapsule,
  useCreateCareerCapsule,
  useCapsuleYears,
  useCreateCapsuleYear,
  useCapsuleTasks,
  useCreateCapsuleTask,
  useToggleTaskCompletion,
  useCapsuleJournals,
  useCreateCapsuleJournal,
  CapsuleYear,
  CapsuleTask,
  CapsuleJournal
} from "@/hooks/use-career-capsule";

// Create career capsule form schema
const createCapsuleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  startDate: z.string(),
  endDate: z.string()
});

// Create year form schema
const createYearSchema = z.object({
  year: z.coerce.number().min(2020, "Year must be 2020 or later").max(2050, "Year must be 2050 or earlier"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  goalType: z.enum(["career_growth", "skill_development", "financial", "entrepreneurship", "well_being", "other"])
});

// Create task form schema
const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  dueDate: z.string().optional()
});

// Create journal form schema
const createJournalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content cannot exceed 2000 characters"),
  entryDate: z.string()
});

export default function CareerCapsulePage() {
  const { user, isLoading } = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  const [createCapsuleOpen, setCreateCapsuleOpen] = useState(false);
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<CapsuleYear | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createJournalOpen, setCreateJournalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");

  // Career capsule data
  const { data: capsule, isLoading: isCapsuleLoading } = useUserCareerCapsule(user?.id || 0);
  const { data: years = [], isLoading: isYearsLoading } = useCapsuleYears(capsule?.id || null);
  const { data: tasks = [], isLoading: isTasksLoading } = useCapsuleTasks(activeYear?.id || null);
  const { data: journals = [], isLoading: isJournalsLoading } = useCapsuleJournals(activeYear?.id || null);

  // Mutations
  const createCapsule = useCreateCareerCapsule();
  const createYear = useCreateCapsuleYear();
  const createTask = useCreateCapsuleTask();
  const toggleTask = useToggleTaskCompletion();
  const createJournal = useCreateCapsuleJournal();

  // Forms
  const capsuleForm = useForm<z.infer<typeof createCapsuleSchema>>({
    resolver: zodResolver(createCapsuleSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addYears(new Date(), 5), "yyyy-MM-dd")
    }
  });

  const yearForm = useForm<z.infer<typeof createYearSchema>>({
    resolver: zodResolver(createYearSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      title: "",
      description: "",
      goalType: "career_growth"
    }
  });

  const taskForm = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd")
    }
  });

  const journalForm = useForm<z.infer<typeof createJournalSchema>>({
    resolver: zodResolver(createJournalSchema),
    defaultValues: {
      title: "",
      content: "",
      entryDate: format(new Date(), "yyyy-MM-dd")
    }
  });

  // Set active year when years load
  useEffect(() => {
    if (years.length > 0 && !activeYear) {
      setActiveYear(years[0]);
    }
  }, [years, activeYear]);

  // Redirect if no user
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Handle create career capsule submission
  const onSubmitCreateCapsule = async (data: z.infer<typeof createCapsuleSchema>) => {
    if (!user) return;
    
    try {
      await createCapsule.mutateAsync({
        userId: user.id,
        data: {
          title: data.title,
          description: data.description || null,
          startDate: data.startDate,
          endDate: data.endDate
        }
      });
      setCreateCapsuleOpen(false);
      capsuleForm.reset();
    } catch (error) {
      console.error("Error creating career capsule:", error);
    }
  };

  // Handle create year submission
  const onSubmitCreateYear = async (data: z.infer<typeof createYearSchema>) => {
    if (!capsule) return;
    
    try {
      await createYear.mutateAsync({
        capsuleId: capsule.id,
        data: {
          year: data.year,
          title: data.title,
          description: data.description || null,
          goalType: data.goalType
        }
      });
      setCreateYearOpen(false);
      yearForm.reset();
    } catch (error) {
      console.error("Error creating year:", error);
    }
  };

  // Handle create task submission
  const onSubmitCreateTask = async (data: z.infer<typeof createTaskSchema>) => {
    if (!activeYear) return;
    
    try {
      await createTask.mutateAsync({
        yearId: activeYear.id,
        data: {
          title: data.title,
          description: data.description || null,
          dueDate: data.dueDate || null,
          isCompleted: false
        }
      });
      setCreateTaskOpen(false);
      taskForm.reset();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Handle create journal submission
  const onSubmitCreateJournal = async (data: z.infer<typeof createJournalSchema>) => {
    if (!activeYear) return;
    
    try {
      await createJournal.mutateAsync({
        yearId: activeYear.id,
        data: {
          title: data.title,
          content: data.content,
          entryDate: data.entryDate
        }
      });
      setCreateJournalOpen(false);
      journalForm.reset();
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };

  // Handle task toggle
  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTask.mutateAsync({ taskId });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // Loading state
  if (isLoading || isCapsuleLoading) {
    return (
      <PageLayout title="Career Capsule">
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // No career capsule yet
  if (!capsule) {
    return (
      <PageLayout title="Career Capsule">
        <div className="container max-w-6xl mx-auto py-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Plan Your Next 5 Years</CardTitle>
              <CardDescription>
                The Career Capsule helps you map out your professional journey over the next five years with clarity and purpose.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
              <div className="rounded-full bg-primary/10 p-6">
                <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Create Your Career Capsule</h3>
                <p className="text-muted-foreground max-w-md">
                  Set strategic career goals, track your progress, and receive AI-powered guidance from Musk to help you stay on track.
                </p>
              </div>
              <Button onClick={() => setCreateCapsuleOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Career Capsule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Career Capsule Dialog */}
        <Dialog open={createCapsuleOpen} onOpenChange={setCreateCapsuleOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Your Career Capsule</DialogTitle>
              <DialogDescription>
                Define your 5-year career plan with milestones and goals to track your progress.
              </DialogDescription>
            </DialogHeader>
            <Form {...capsuleForm}>
              <form onSubmit={capsuleForm.handleSubmit(onSubmitCreateCapsule)} className="space-y-4">
                <FormField
                  control={capsuleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My 5-Year Tech Career Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={capsuleForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your overall career goals for the next 5 years..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={capsuleForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={capsuleForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCapsule.isPending}>
                    {createCapsule.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Career Capsule"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Career Capsule">
      <div className="container max-w-6xl mx-auto py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{capsule.title}</CardTitle>
                <CardDescription>
                  {capsule.createdAt && format(parseISO(capsule.createdAt), "MMMM yyyy")} - {capsule.timeframe} year plan
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">{capsule.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(capsule.overallProgress)}%</span>
                </div>
                <Progress value={capsule.overallProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-muted-foreground">
              {capsule.createdAt && `Created on ${format(parseISO(capsule.createdAt), "MMMM d, yyyy")}`}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast({
                  title: "AI Analysis",
                  description: "Musk is analyzing your progress. This feature will be available soon!",
                });
              }}
            >
              <BrainCircuit className="h-4 w-4 mr-1" />
              AI Guidance
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Year by Year Plan</h2>
          <Button onClick={() => setCreateYearOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Year
          </Button>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-2">
            {isYearsLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : years.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No years added yet. Add your first year to get started.</p>
                </CardContent>
              </Card>
            ) : (
              years.map((year) => (
                <Card 
                  key={year.id}
                  className={`cursor-pointer transition-colors ${activeYear?.id === year.id ? 'border-primary' : ''}`}
                  onClick={() => setActiveYear(year)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{year.year}</h3>
                        <p className="text-sm text-muted-foreground">{year.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">{Math.round(year.progress)}%</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="md:col-span-9">
            {activeYear ? (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{activeYear.title} ({activeYear.year})</CardTitle>
                      <CardDescription>{activeYear.description}</CardDescription>
                    </div>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium">
                      {activeYear.goalType.replace('_', ' ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full border-b rounded-none">
                      <TabsTrigger value="timeline" className="flex-1">
                        <Target className="h-4 w-4 mr-2" />
                        Goals
                      </TabsTrigger>
                      <TabsTrigger value="journal" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Journal
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Tasks & Goals</h3>
                        <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                      </div>

                      {isTasksLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : tasks.length === 0 ? (
                        <div className="text-center p-6 bg-muted/20 rounded-md">
                          <p className="text-sm text-muted-foreground">No tasks added for this year yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-start p-3 border rounded-md bg-background"
                            >
                              <div 
                                className={`h-5 w-5 rounded-md border mr-3 flex-shrink-0 cursor-pointer ${
                                  task.isCompleted ? 'bg-primary border-primary' : 'bg-transparent'
                                }`}
                                onClick={() => handleToggleTask(task.id)}
                              />
                              <div className="flex-1">
                                <h4 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className={`text-sm mt-1 ${task.isCompleted ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
                                    {task.description}
                                  </p>
                                )}
                                {task.dueDate && (
                                  <div className="flex items-center mt-2">
                                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {task.dueDate && `Due: ${format(parseISO(task.dueDate), "MMM d, yyyy")}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="journal" className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Journal Entries</h3>
                        <Button size="sm" onClick={() => setCreateJournalOpen(true)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Entry
                        </Button>
                      </div>

                      {isJournalsLoading ? (
                        <div className="flex justify-center p-6">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : journals.length === 0 ? (
                        <div className="text-center p-6 bg-muted/20 rounded-md">
                          <p className="text-sm text-muted-foreground">No journal entries yet. Record your thoughts and progress here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {journals.map((journal) => (
                            <Card key={journal.id}>
                              <CardHeader className="p-4">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">{journal.title}</CardTitle>
                                  <div className="text-xs text-muted-foreground">
                                    {journal.createdAt && format(parseISO(journal.createdAt), "MMM d, yyyy")}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <p className="text-sm whitespace-pre-wrap">{journal.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Select a year from the sidebar or add a new year to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Year Dialog */}
      <Dialog open={createYearOpen} onOpenChange={setCreateYearOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add a Year to Your Plan</DialogTitle>
            <DialogDescription>
              Set specific goals and milestones for this year of your career journey.
            </DialogDescription>
          </DialogHeader>
          <Form {...yearForm}>
            <form onSubmit={yearForm.handleSubmit(onSubmitCreateYear)} className="space-y-4">
              <FormField
                control={yearForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Developer Transition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your goals for this year..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a goal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="career_growth">Career Growth</SelectItem>
                        <SelectItem value="skill_development">Skill Development</SelectItem>
                        <SelectItem value="financial">Financial Goal</SelectItem>
                        <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                        <SelectItem value="well_being">Work-Life Balance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the primary focus area for this year
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createYear.isPending}>
                  {createYear.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Year"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add a Task</DialogTitle>
            <DialogDescription>
              Create a new task or goal for {activeYear?.year}.
            </DialogDescription>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitCreateTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Complete AWS Certification" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add details about this task..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Task"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Journal Dialog */}
      <Dialog open={createJournalOpen} onOpenChange={setCreateJournalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Journal Entry</DialogTitle>
            <DialogDescription>
              Record your thoughts, progress, and reflections for {activeYear?.year}.
            </DialogDescription>
          </DialogHeader>
          <Form {...journalForm}>
            <form onSubmit={journalForm.handleSubmit(onSubmitCreateJournal)} className="space-y-4">
              <FormField
                control={journalForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quarterly Reflection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={journalForm.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={journalForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your thoughts, reflections, or notes..."
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createJournal.isPending}>
                  {createJournal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Entry"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}