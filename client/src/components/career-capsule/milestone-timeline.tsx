import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  MoreHorizontal, 
  Star 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Types for the milestone timeline component
export interface MilestoneTask {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
  priority?: number;
}

export interface MilestoneYear {
  id: number;
  year: number;
  title: string;
  description: string;
  milestone: string;
  progress: number;
  tasks: MilestoneTask[];
}

export interface MilestoneTimelineProps {
  years: MilestoneYear[];
  goalId: number;
  onToggleTask: (taskId: number) => Promise<void>;
  onEditTask?: (taskId: number, taskData: Partial<MilestoneTask>) => Promise<void>;
  isLoading?: boolean;
}

// Format date from ISO string to human-readable format
const formatDate = (dateString?: string) => {
  if (!dateString) return "No due date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Progress color based on value
const getProgressColor = (value: number) => {
  if (value < 25) return "bg-red-500";
  if (value < 50) return "bg-orange-500";
  if (value < 75) return "bg-yellow-500";
  return "bg-green-500";
};

// Priority badge based on value (1=High, 2=Medium, 3=Low)
const getPriorityBadge = (priority?: number) => {
  switch(priority) {
    case 1:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Priority</Badge>;
    case 2:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Priority</Badge>;
    case 3:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Low Priority</Badge>;
    default:
      return null;
  }
};

export default function MilestoneTimeline({
  years,
  goalId,
  onToggleTask,
  onEditTask,
  isLoading = false,
}: MilestoneTimelineProps) {
  const [selectedTask, setSelectedTask] = useState<MilestoneTask | null>(null);
  const [showTaskEditDialog, setShowTaskEditDialog] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Handle opening the edit dialog for a task
  const handleEditTask = (task: MilestoneTask) => {
    setSelectedTask(task);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditingTaskId(task.id);
    setShowTaskEditDialog(true);
  };

  // Handle saving task edits
  const handleSaveTaskEdit = async () => {
    if (!editingTaskId || !onEditTask) return;
    
    try {
      await onEditTask(editingTaskId, {
        title: editedTitle,
        description: editedDescription,
      });
      
      setShowTaskEditDialog(false);
      setSelectedTask(null);
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // If still loading or no years provided, show loading state
  if (isLoading) {
    return (
      <div className="my-8 space-y-6">
        <div className="h-10 w-60 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 w-40 animate-pulse rounded-md"></div>
                <div className="h-4 bg-gray-200 w-3/4 animate-pulse rounded-md mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 w-full animate-pulse rounded-md"></div>
                <div className="h-20 bg-gray-200 w-full animate-pulse rounded-md mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!years || years.length === 0) {
    return (
      <div className="my-8 py-8 text-center bg-muted/20 rounded-lg">
        <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Milestones Available</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          No milestones have been created for this career goal yet.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        Career Milestones
      </h2>
      
      <div className="timeline-container space-y-6">
        {years.map((year, index) => (
          <Card key={year.id} className={cn(
            "w-full transition-all duration-300 hover:shadow-md",
            index === 0 ? "border-l-4 border-l-primary" : ""
          )}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <Badge 
                  className={cn(
                    "px-3 py-1 text-sm font-medium",
                    index === 0 ? "bg-primary/90 hover:bg-primary/80" : "bg-primary/70 hover:bg-primary/60"
                  )}
                >
                  Year {year.year}
                </Badge>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {year.progress}% Complete
                  </span>
                </div>
              </div>
              <CardTitle className="text-xl mt-2">{year.title}</CardTitle>
              <CardDescription className="mt-1">{year.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-4">
              <div className="mb-4">
                <Progress 
                  value={year.progress} 
                  className={cn("h-2", getProgressColor(year.progress))} 
                />
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Primary Milestone</h4>
                <p className="text-muted-foreground text-sm">{year.milestone}</p>
              </div>
              
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-sm font-medium">
                    Tasks for Year {year.year} ({year.tasks.filter(t => t.isCompleted).length}/{year.tasks.length} completed)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-3">
                      {year.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={cn(
                            "p-3 border rounded-md flex items-start gap-3 group transition-all hover:bg-muted/50",
                            task.isCompleted ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-gray-200"
                          )}
                        >
                          <Checkbox 
                            checked={task.isCompleted}
                            onCheckedChange={() => onToggleTask(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className={cn(
                                "font-medium",
                                task.isCompleted ? "line-through text-muted-foreground" : ""
                              )}>
                                {task.title}
                              </h5>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleEditTask(task)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className={cn(
                              "text-sm mt-1",
                              task.isCompleted ? "line-through text-muted-foreground" : "text-muted-foreground"
                            )}>
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              {getPriorityBadge(task.priority)}
                              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            
            <CardFooter className="pt-0">
              <div className="w-full flex justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {year.tasks.filter(t => t.isCompleted).length} of {year.tasks.length} tasks completed
                </span>
                <span className="text-xs text-muted-foreground">
                  {year.progress >= 100 ? (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
                  )}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Task Edit Dialog */}
      <Dialog open={showTaskEditDialog} onOpenChange={setShowTaskEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Career Task</DialogTitle>
            <DialogDescription>
              Update the details of this career milestone task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTaskEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}