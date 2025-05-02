import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCareerRoadmap, CareerGoal, GoalMilestone, GoalSkill, GoalProgressLog } from '@/hooks/use-career-roadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, ChevronRightIcon, Clock, Flag, ListTodo, Plus, PlusCircle, Star, Trophy, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';

// Define form schemas
const createGoalSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  targetDate: z.date(),
  goalType: z.enum(['custom', 'certification', 'education', 'position_change', 'skill_acquisition', 'promotion', 'industry_switch', 'entrepreneurship', 'relocation']),
  industryFocus: z.string().optional(),
});

const createMilestoneSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  targetDate: z.date(),
  status: z.enum(['completed', 'not_started', 'in_progress', 'abandoned']),
});

const createSkillSchema = z.object({
  skillName: z.string().min(2, { message: "Skill name must be at least 2 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['completed', 'in_progress', 'not_started']),
});

const createProgressLogSchema = z.object({
  entry: z.string().min(5, { message: "Entry must be at least 5 characters long" }),
  milestoneId: z.number().optional().nullable(),
  entryType: z.enum(['accomplishment', 'challenge', 'learning', 'reflection']),
});

// Component to display a milestone
const MilestoneItem = ({ 
  milestone, 
  goalId, 
  onDelete, 
  onStatusChange 
}: { 
  milestone: GoalMilestone; 
  goalId: number; 
  onDelete: (id: number) => void; 
  onStatusChange: (id: number, status: string) => void;
}) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'abandoned': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{milestone.title}</CardTitle>
          <Badge className={getStatusColor(milestone.status)}>{milestone.status?.replace('_', ' ')}</Badge>
        </div>
        <CardDescription>
          Target date: {format(new Date(milestone.targetDate), 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{milestone.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Select 
            defaultValue={milestone.status || 'not_started'} 
            onValueChange={(value) => onStatusChange(milestone.id, value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => onDelete(milestone.id)}>
          <X className="h-4 w-4 mr-1" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component to display a skill
const SkillItem = ({ 
  skill, 
  goalId, 
  onDelete, 
  onStatusChange 
}: { 
  skill: GoalSkill; 
  goalId: number; 
  onDelete: (id: number) => void; 
  onStatusChange: (id: number, status: string) => void;
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{skill.skillName}</CardTitle>
          <div className="flex space-x-2">
            <Badge className={getPriorityColor(skill.priority)}>
              {skill.priority} priority
            </Badge>
            <Badge className={getStatusColor(skill.status)}>
              {skill.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{skill.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Select 
            defaultValue={skill.status} 
            onValueChange={(value) => onStatusChange(skill.id, value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => onDelete(skill.id)}>
          <X className="h-4 w-4 mr-1" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component to display a progress log
const ProgressLogItem = ({ 
  log, 
  goalId, 
  onDelete 
}: { 
  log: GoalProgressLog; 
  goalId: number; 
  onDelete: (id: number) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accomplishment': return 'bg-green-100 text-green-800 border-green-300';
      case 'challenge': return 'bg-red-100 text-red-800 border-red-300';
      case 'learning': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'reflection': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Badge className={getTypeColor(log.entryType)}>
              {log.entryType}
            </Badge>
            <span className="text-sm text-gray-500">
              {format(new Date(log.createdAt), 'PPP')}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onDelete(log.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{log.entry}</p>
      </CardContent>
    </Card>
  );
};

// Career Roadmap Page Component
const CareerRoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 0;
  const {
    useGoals,
    useGoalDetails,
    useCreateGoal,
    useUpdateGoal,
    useDeleteGoal,
    useCreateMilestone,
    useUpdateMilestone,
    useDeleteMilestone,
    useCreateSkill,
    useUpdateSkill,
    useDeleteSkill,
    useCreateProgressLog,
    useDeleteProgressLog,
  } = useCareerRoadmap(userId);

  const { data: goals, isLoading: isLoadingGoals } = useGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const { data: goalDetails, isLoading: isLoadingGoalDetails } = useGoalDetails(selectedGoalId || 0);
  
  // Dialog states
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [isNewMilestoneDialogOpen, setIsNewMilestoneDialogOpen] = useState(false);
  const [isNewSkillDialogOpen, setIsNewSkillDialogOpen] = useState(false);
  const [isNewProgressLogDialogOpen, setIsNewProgressLogDialogOpen] = useState(false);

  // Mutation hooks
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal(selectedGoalId || 0);
  const deleteGoalMutation = useDeleteGoal();
  const createMilestoneMutation = useCreateMilestone(selectedGoalId || 0);
  const updateMilestoneMutation = useUpdateMilestone(0, selectedGoalId || 0);
  const deleteMilestoneMutation = useDeleteMilestone(selectedGoalId || 0);
  const createSkillMutation = useCreateSkill(selectedGoalId || 0);
  const updateSkillMutation = useUpdateSkill(0, selectedGoalId || 0);
  const deleteSkillMutation = useDeleteSkill(selectedGoalId || 0);
  const createProgressLogMutation = useCreateProgressLog(selectedGoalId || 0);
  const deleteProgressLogMutation = useDeleteProgressLog(selectedGoalId || 0);

  // Create Goal Form
  const createGoalForm = useForm<z.infer<typeof createGoalSchema>>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      goalType: 'position_change',
      industryFocus: '',
    },
  });

  // Create Milestone Form
  const createMilestoneForm = useForm<z.infer<typeof createMilestoneSchema>>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'not_started',
    },
  });

  // Create Skill Form
  const createSkillForm = useForm<z.infer<typeof createSkillSchema>>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: {
      skillName: '',
      description: '',
      priority: 'medium',
      status: 'not_started',
    },
  });

  // Create Progress Log Form
  const createProgressLogForm = useForm<z.infer<typeof createProgressLogSchema>>({
    resolver: zodResolver(createProgressLogSchema),
    defaultValues: {
      entry: '',
      milestoneId: null,
      entryType: 'accomplishment',
    },
  });

  // Form Submission Handlers
  const onSubmitNewGoal = (data: z.infer<typeof createGoalSchema>) => {
    createGoalMutation.mutate(data, {
      onSuccess: () => {
        setIsNewGoalDialogOpen(false);
        createGoalForm.reset();
      },
    });
  };

  const onSubmitNewMilestone = (data: z.infer<typeof createMilestoneSchema>) => {
    createMilestoneMutation.mutate(data, {
      onSuccess: () => {
        setIsNewMilestoneDialogOpen(false);
        createMilestoneForm.reset();
      },
    });
  };

  const onSubmitNewSkill = (data: z.infer<typeof createSkillSchema>) => {
    createSkillMutation.mutate(data, {
      onSuccess: () => {
        setIsNewSkillDialogOpen(false);
        createSkillForm.reset();
      },
    });
  };

  const onSubmitNewProgressLog = (data: z.infer<typeof createProgressLogSchema>) => {
    createProgressLogMutation.mutate(data, {
      onSuccess: () => {
        setIsNewProgressLogDialogOpen(false);
        createProgressLogForm.reset();
      },
    });
  };

  // Event Handlers
  const handleGoalSelect = (goalId: number) => {
    setSelectedGoalId(goalId);
  };

  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this career goal? This action cannot be undone.')) {
      deleteGoalMutation.mutate(goalId, {
        onSuccess: () => {
          setSelectedGoalId(null);
        },
      });
    }
  };

  const handleUpdateMilestoneStatus = (milestoneId: number, status: string) => {
    updateMilestoneMutation.mutate({ id: milestoneId, status });
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestoneMutation.mutate(milestoneId);
    }
  };

  const handleUpdateSkillStatus = (skillId: number, status: string) => {
    updateSkillMutation.mutate({ id: skillId, status });
  };

  const handleDeleteSkill = (skillId: number) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      deleteSkillMutation.mutate(skillId);
    }
  };

  const handleDeleteProgressLog = (logId: number) => {
    if (window.confirm('Are you sure you want to delete this progress log?')) {
      deleteProgressLogMutation.mutate(logId);
    }
  };

  // UI rendering
  if (isLoadingGoals) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Career Roadmap</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Career Roadmap</h1>
        <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Career Goal</DialogTitle>
              <DialogDescription>
                Set a new career goal with a clear target and timeframe
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createGoalForm}>
              <form onSubmit={createGoalForm.handleSubmit(onSubmitNewGoal)} className="space-y-4">
                <FormField
                  control={createGoalForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter goal title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createGoalForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your goal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createGoalForm.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Target Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date > new Date('2100-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createGoalForm.control}
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
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="position_change">Position Change</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="skill_acquisition">Skill Acquisition</SelectItem>
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="industry_switch">Industry Switch</SelectItem>
                          <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                          <SelectItem value="relocation">Relocation</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createGoalForm.control}
                  name="industryFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Focus (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Technology, Healthcare, Finance" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify if your goal is tied to a specific industry
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createGoalMutation.isPending}>
                    {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Your Career Goals</h2>
            
            {goals?.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">You haven't set any career goals yet.</p>
                <Button onClick={() => setIsNewGoalDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals?.map((goal: CareerGoal) => (
                  <div 
                    key={goal.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGoalId === goal.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleGoalSelect(goal.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{goal.title}</h3>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status?.replace('_', ' ') || 'In Progress'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</span>
                    </div>
                    <Progress className="h-2 mt-2" value={goal.progress} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {!selectedGoalId ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto max-w-md">
                <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Select a Goal</h2>
                <p className="text-gray-500 mb-6">
                  Select a career goal from the left panel to view details, or create a new goal to get started.
                </p>
                <Button onClick={() => setIsNewGoalDialogOpen(true)}>
                  Create New Goal
                </Button>
              </div>
            </div>
          ) : isLoadingGoalDetails ? (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{goalDetails?.goal.title}</h2>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                      <span>
                        <span className="font-medium">Target:</span> {format(new Date(goalDetails?.goal.targetDate), 'PPP')}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>
                        <span className="font-medium">Type:</span> {goalDetails?.goal.goalType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleDeleteGoal(selectedGoalId)}>
                      Delete Goal
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Progress 
                    value={goalDetails?.goal.progress} 
                    className="h-2" 
                    indicatorClassName={cn(
                      goalDetails?.goal.progress === 100 ? "bg-green-500" : undefined
                    )}
                  />
                  <div className="flex justify-between mt-1 text-sm">
                    <span>{goalDetails?.goal.progress}% complete</span>
                    {goalDetails?.goal.progress === 100 && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Goal achieved
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="mt-4 text-gray-700">{goalDetails?.goal.description}</p>
              </div>
              
              <Tabs defaultValue="milestones" className="p-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="skills">Required Skills</TabsTrigger>
                  <TabsTrigger value="progress">Progress Log</TabsTrigger>
                </TabsList>
                
                <TabsContent value="milestones">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Milestones</h3>
                    <Dialog open={isNewMilestoneDialogOpen} onOpenChange={setIsNewMilestoneDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Milestone
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Milestone</DialogTitle>
                          <DialogDescription>
                            Create key milestones to track progress toward your career goal
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...createMilestoneForm}>
                          <form onSubmit={createMilestoneForm.handleSubmit(onSubmitNewMilestone)} className="space-y-4">
                            <FormField
                              control={createMilestoneForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter milestone title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createMilestoneForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Describe this milestone" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createMilestoneForm.control}
                              name="targetDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Target Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                          date < new Date() || date > new Date(goalDetails?.goal.targetDate)
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormDescription>
                                    Must be before your goal's target date
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createMilestoneForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="abandoned">Abandoned</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button type="submit" disabled={createMilestoneMutation.isPending}>
                                {createMilestoneMutation.isPending ? 'Adding...' : 'Add Milestone'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {goalDetails?.milestones.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">No milestones defined yet</p>
                      <Button onClick={() => setIsNewMilestoneDialogOpen(true)}>
                        Add Your First Milestone
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {goalDetails?.milestones.map((milestone) => (
                        <MilestoneItem
                          key={milestone.id}
                          milestone={milestone}
                          goalId={selectedGoalId}
                          onDelete={handleDeleteMilestone}
                          onStatusChange={handleUpdateMilestoneStatus}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="skills">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Required Skills</h3>
                    <Dialog open={isNewSkillDialogOpen} onOpenChange={setIsNewSkillDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Required Skill</DialogTitle>
                          <DialogDescription>
                            Add skills you need to develop to achieve your career goal
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...createSkillForm}>
                          <form onSubmit={createSkillForm.handleSubmit(onSubmitNewSkill)} className="space-y-4">
                            <FormField
                              control={createSkillForm.control}
                              name="skillName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Skill Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter skill name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createSkillForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Describe this skill and why it's needed" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createSkillForm.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority Level</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="high">High Priority</SelectItem>
                                      <SelectItem value="medium">Medium Priority</SelectItem>
                                      <SelectItem value="low">Low Priority</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createSkillForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Status</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="in_progress">Learning in Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button type="submit" disabled={createSkillMutation.isPending}>
                                {createSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {goalDetails?.skills.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">No skills defined yet</p>
                      <Button onClick={() => setIsNewSkillDialogOpen(true)}>
                        Add Your First Skill
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {goalDetails?.skills.map((skill) => (
                        <SkillItem
                          key={skill.id}
                          skill={skill}
                          goalId={selectedGoalId}
                          onDelete={handleDeleteSkill}
                          onStatusChange={handleUpdateSkillStatus}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="progress">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Progress Log</h3>
                    <Dialog open={isNewProgressLogDialogOpen} onOpenChange={setIsNewProgressLogDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Entry
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Your Progress</DialogTitle>
                          <DialogDescription>
                            Record achievements, challenges, or reflections related to your goal
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...createProgressLogForm}>
                          <form onSubmit={createProgressLogForm.handleSubmit(onSubmitNewProgressLog)} className="space-y-4">
                            <FormField
                              control={createProgressLogForm.control}
                              name="entry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Entry</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your progress, challenge, or reflection" 
                                      className="min-h-[100px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createProgressLogForm.control}
                              name="entryType"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>Entry Type</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex flex-col space-y-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="accomplishment" id="accomplishment" />
                                        <Label htmlFor="accomplishment">Accomplishment</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="challenge" id="challenge" />
                                        <Label htmlFor="challenge">Challenge</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="learning" id="learning" />
                                        <Label htmlFor="learning">Learning</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="reflection" id="reflection" />
                                        <Label htmlFor="reflection">Reflection</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createProgressLogForm.control}
                              name="milestoneId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Related Milestone (Optional)</FormLabel>
                                  <Select
                                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                                    value={field.value?.toString() || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a milestone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="">None</SelectItem>
                                      {goalDetails?.milestones.map((milestone) => (
                                        <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                          {milestone.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Connect this entry to a specific milestone
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button type="submit" disabled={createProgressLogMutation.isPending}>
                                {createProgressLogMutation.isPending ? 'Adding...' : 'Add Entry'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {goalDetails?.progressLogs.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <ChevronRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">No progress logs yet</p>
                      <Button onClick={() => setIsNewProgressLogDialogOpen(true)}>
                        Add Your First Log Entry
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {goalDetails?.progressLogs
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((log) => (
                          <ProgressLogItem
                            key={log.id}
                            log={log}
                            goalId={selectedGoalId}
                            onDelete={handleDeleteProgressLog}
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// For Label component
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
};

export default CareerRoadmapPage;