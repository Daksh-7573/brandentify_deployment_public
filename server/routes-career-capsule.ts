import { Router } from 'express';
import { storage } from './storage';
import { generateCapsuleMilestones, saveCapsuleMilestones } from './services/musk-capsule-milestones';

const router = Router();

// Get user's career capsule
router.get('/users/:userId/career-capsule', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const capsule = await storage.getUserCareerCapsule(userId);
    return res.json(capsule);
  } catch (error) {
    console.error('Error fetching career capsule:', error);
    return res.status(500).json({ message: 'Error fetching career capsule' });
  }
});

// Get career goal by ID
router.get('/career-goals/:goalId', async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    if (isNaN(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const goal = await storage.getCareerCapsuleById(goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Career goal not found' });
    }

    console.log(`[Goal Details] Found goal ${goalId}: ${JSON.stringify(goal)}`);

    // Get years for the capsule with extensive logging
    console.log(`[Goal Details] Fetching years for career capsule ${goalId}`);
    const years = await storage.getCapsuleYearsByCapsuleId(goalId);
    console.log(`[Goal Details] Found ${years.length} years for career capsule ${goalId}`);
    
    // Log each year for debugging
    years.forEach((year, index) => {
      console.log(`[Goal Details] Year ${index + 1}: id=${year.id}, title=${year.title}, year=${year.year}, progress=${year.progress}`);
    });

    // Get tasks for each year with detailed logging
    console.log(`[Goal Details] Starting to fetch tasks for ${years.length} years`);
    
    const milestonesWithTasks = await Promise.all(years.map(async (year) => {
      console.log(`[Goal Details] Fetching tasks for year ${year.id}`);
      const tasks = await storage.getCapsuleTasksByYearId(year.id);
      console.log(`[Goal Details] Found ${tasks.length} tasks for year ${year.id}`);
      
      // Log first task details for debugging if available
      if (tasks.length > 0) {
        console.log(`[Goal Details] First task for year ${year.id}: ${JSON.stringify(tasks[0])}`);
      } else {
        console.log(`[Goal Details] WARNING: No tasks found for year ${year.id}`);
      }
      
      // Format milestone based on the client's expected structure
      const milestone = {
        id: year.id,
        goalId: year.capsuleId,
        title: year.title,
        description: year.description || '',
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + year.year)),
        status: year.progress === 100 ? 'completed' : 'in_progress',
        order: year.year,
        createdAt: year.createdAt,
        updatedAt: year.updatedAt || year.createdAt,
        completedAt: year.progress === 100 ? new Date() : null,
        tasks: tasks
      };
      
      console.log(`[Goal Details] Created milestone structure for year ${year.id}: ${JSON.stringify(milestone).substring(0, 200)}...`);
      
      return milestone;
    }));

    // Construct the complete goal details
    const goalDetails = {
      goal: {
        ...goal,
        status: goal.overallProgress === 100 ? 'completed' : 'in_progress',
        targetDate: goal.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + (goal.timeframe || 1))),
      },
      milestones: milestonesWithTasks,
      skills: [], // Skills will be added later if needed
      progressLogs: [] // Progress logs will be added later if needed
    };

    return res.json(goalDetails);
  } catch (error) {
    console.error('Error fetching career goal details:', error);
    return res.status(500).json({ error: 'Failed to fetch career goal details' });
  }
});

// Create career capsule
router.post('/users/:userId/career-capsule', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const capsuleData = {
      userId,
      title: req.body.title,
      description: req.body.description || null,
      overallProgress: 0,
      goalType: req.body.goalType || 'position_change', // Ensures goalType is never null
      customGoal: req.body.customGoal || null,
      timeframe: req.body.timeframe || 5,
      industry: req.body.industry || null,
      isPrivate: req.body.isPrivate || false,
      isMuskGenerated: true, // Setting this to true since we'll create default milestones
    };

    console.log('[Career Capsule] Creating career capsule with data:', JSON.stringify(capsuleData));
    const capsule = await storage.createCareerCapsule(capsuleData);
    console.log(`[Career Capsule] Created capsule with ID: ${capsule.id}`);
    
    // Check available API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    console.log(`[Career Capsule] API Keys available: OpenAI: ${openaiKey ? 'YES' : 'NO'}, Anthropic: ${anthropicKey ? 'YES' : 'NO'}`);
    
    // Use Anthropic if OpenAI key is not available but Anthropic is
    const aiModel = openaiKey ? 'openai' : (anthropicKey ? 'anthropic' : 'openai');
    console.log(`[Career Capsule] Selected AI model: ${aiModel}`);
    
    // Set up the options for AI-generated milestones
    const options = {
      userId: userId,
      capsuleId: capsule.id,
      goalType: capsuleData.goalType,
      customGoal: capsuleData.customGoal,
      timeframe: parseInt(capsuleData.timeframe.toString()) || 3,
      industry: capsuleData.industry,
      description: capsuleData.description,
      useModel: aiModel as 'openai' | 'anthropic', // Force type to be correct
    };
    
    console.log('Generating AI milestones for new capsule:', capsule.id);
    
    try {
      // Generate milestones using Musk AI
      const result = await generateCapsuleMilestones(options);
      
      if (result.success && result.years) {
        console.log(`Successfully generated ${result.years.length} years of milestones with Musk AI`);
        
        // Save the AI-generated milestones
        const saved = await saveCapsuleMilestones(capsule.id, result.years);
        
        if (saved) {
          // Update the capsule to indicate AI milestones were generated
          await storage.updateCareerCapsule(capsule.id, {
            isMuskGenerated: true
          });
          
          // Return the created capsule with success message
          return res.status(201).json({
            ...capsule,
            milestonesGenerated: true,
            message: 'Career capsule created with AI-generated milestones'
          });
        } else {
          console.error('Failed to save AI-generated milestones. Falling back to default milestones.');
        }
      } else {
        console.error('Failed to generate AI milestones:', result.message);
        console.log('Falling back to default milestones');
      }
    } catch (error) {
      console.error('Error during AI milestone generation:', error);
      console.log('Falling back to default milestones');
    }
    
    // FALLBACK: Create default milestones if AI generation fails
    console.log('Creating default milestones for new capsule:', capsule.id);
    
    const timeframe = parseInt(capsuleData.timeframe.toString()) || 3; // Default to 3 years if parsing fails
    const years = [];
    
    for (let yearNum = 1; yearNum <= timeframe; yearNum++) {
      // Create a year
      const year = await storage.createCapsuleYear({
        capsuleId: capsule.id,
        year: yearNum,
        title: `Year ${yearNum}${yearNum === 1 ? " - Foundation" : yearNum === timeframe ? " - Achievement" : " - Development"}`,
        description: `Focus on ${yearNum === 1 ? "building foundational skills and knowledge" : 
                       yearNum === timeframe ? "reaching your target goal and establishing yourself" : 
                       "developing advanced expertise and expanding your network"}`,
        milestone: `${yearNum === 1 ? "Foundation Building" : yearNum === timeframe ? "Goal Achievement" : "Skills Development"} - Year ${yearNum}`,
        progress: 0
      });
      
      years.push(year);
      
      // Create tasks for each year
      const tasks = [
        {
          title: `${yearNum === 1 ? "Research" : yearNum === timeframe ? "Achieve" : "Advance"} in ${capsuleData.title}`,
          description: `${yearNum === 1 ? 
            "Conduct thorough research on requirements and pathways" : 
            yearNum === timeframe ? 
            "Accomplish your primary goal and celebrate your achievement" : 
            "Continue building on previous progress and expanding your expertise"}`,
          isCompleted: false,
          dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + yearNum, 5, 30)).toISOString().split('T')[0] // Mid-year due date
        },
        {
          title: `${yearNum === 1 ? "Learn" : yearNum === timeframe ? "Lead" : "Master"} Key Skills`,
          description: `${yearNum === 1 ? 
            "Identify and begin learning essential skills for your goal" : 
            yearNum === timeframe ? 
            "Demonstrate leadership and mentor others in your field" : 
            "Deepen your expertise in specialized areas relevant to your goal"}`,
          isCompleted: false,
          dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + yearNum, 2, 15)).toISOString().split('T')[0] // Early in year
        },
        {
          title: `Build ${yearNum === 1 ? "Initial" : yearNum === timeframe ? "Expert" : "Strong"} Network`,
          description: `${yearNum === 1 ? 
            "Connect with professionals in your target field and join relevant communities" : 
            yearNum === timeframe ? 
            "Establish yourself as a known expert in your specific area" : 
            "Expand your professional connections to include senior professionals"}`,
          isCompleted: false,
          dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + yearNum, 8, 15)).toISOString().split('T')[0] // Later in year
        }
      ];
      
      // Save each task
      for (const taskData of tasks) {
        await storage.createCapsuleTask({
          ...taskData,
          yearId: year.id
        });
      }
    }
    
    // Update the capsule to indicate milestones were generated (fallback)
    await storage.updateCareerCapsule(capsule.id, {
      isMuskGenerated: true
    });
    
    // Return the created capsule with success message for fallback
    return res.status(201).json({
      ...capsule,
      milestonesGenerated: true,
      message: 'Career capsule created with default milestones (AI generation failed)'
    });
  } catch (error) {
    console.error('Error creating career capsule:', error);
    return res.status(500).json({ message: 'Error creating career capsule' });
  }
});

// Update career capsule
router.put('/career-capsules/:capsuleId', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      overallProgress: req.body.overallProgress,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    };

    const capsule = await storage.updateCareerCapsule(capsuleId, updatedData);
    return res.json(capsule);
  } catch (error) {
    console.error('Error updating career capsule:', error);
    return res.status(500).json({ message: 'Error updating career capsule' });
  }
});

// Get capsule years
router.get('/career-capsules/:capsuleId/years', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const years = await storage.getCapsuleYearsByCapsuleId(capsuleId);
    return res.json(years);
  } catch (error) {
    console.error('Error fetching capsule years:', error);
    return res.status(500).json({ message: 'Error fetching capsule years' });
  }
});

// Create capsule year
router.post('/career-capsules/:capsuleId/years', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const yearData = {
      capsuleId,
      year: req.body.yearNumber || req.body.year || 1, // Accept either year or yearNumber from client
      title: req.body.title || `Year ${req.body.yearNumber || req.body.year || 1}`,
      description: req.body.description || null,
      milestone: req.body.milestone || null,
      progress: 0,
    };

    const year = await storage.createCapsuleYear(yearData);
    return res.status(201).json(year);
  } catch (error) {
    console.error('Error creating capsule year:', error);
    return res.status(500).json({ message: 'Error creating capsule year' });
  }
});

// Update capsule year
router.put('/capsule-years/:yearId', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      year: req.body.yearNumber || req.body.year, // Support both client properties
      milestone: req.body.milestone,
      progress: req.body.progress,
    };

    const year = await storage.updateCapsuleYear(yearId, updatedData);
    return res.json(year);
  } catch (error) {
    console.error('Error updating capsule year:', error);
    return res.status(500).json({ message: 'Error updating capsule year' });
  }
});

// Delete capsule year
router.delete('/capsule-years/:yearId', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    await storage.deleteCapsuleYear(yearId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting capsule year:', error);
    return res.status(500).json({ message: 'Error deleting capsule year' });
  }
});

// Get tasks for year
router.get('/capsule-years/:yearId/tasks', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const tasks = await storage.getCapsuleTasksByYearId(yearId);
    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching capsule tasks:', error);
    return res.status(500).json({ message: 'Error fetching capsule tasks' });
  }
});

// Create task for year
router.post('/capsule-years/:yearId/tasks', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const taskData = {
      yearId,
      title: req.body.title,
      description: req.body.description || null,
      isCompleted: false,
      dueDate: req.body.dueDate || null,
    };

    const task = await storage.createCapsuleTask(taskData);
    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating capsule task:', error);
    return res.status(500).json({ message: 'Error creating capsule task' });
  }
});

// Update task
router.put('/capsule-tasks/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      isCompleted: req.body.isCompleted,
      dueDate: req.body.dueDate,
    };

    const task = await storage.updateCapsuleTask(taskId, updatedData);
    return res.json(task);
  } catch (error) {
    console.error('Error updating capsule task:', error);
    return res.status(500).json({ message: 'Error updating capsule task' });
  }
});

// Toggle task completion
router.post('/capsule-tasks/:taskId/toggle', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await storage.toggleCapsuleTaskCompletion(taskId);
    return res.json(task);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return res.status(500).json({ message: 'Error toggling task completion' });
  }
});

// Delete task
router.delete('/capsule-tasks/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    await storage.deleteCapsuleTask(taskId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting capsule task:', error);
    return res.status(500).json({ message: 'Error deleting capsule task' });
  }
});

// Regenerate milestones for an existing capsule
// Regenerate milestones endpoint removed as requested

// Get journals for year
router.get('/capsule-years/:yearId/journals', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const journals = await storage.getCapsuleJournalsByYearId(yearId);
    return res.json(journals);
  } catch (error) {
    console.error('Error fetching capsule journals:', error);
    return res.status(500).json({ message: 'Error fetching capsule journals' });
  }
});

// Create journal for year
router.post('/capsule-years/:yearId/journals', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const journalData = {
      yearId,
      title: req.body.title,
      content: req.body.content,
      entryDate: req.body.entryDate,
    };

    const journal = await storage.createCapsuleJournal(journalData);
    return res.status(201).json(journal);
  } catch (error) {
    console.error('Error creating capsule journal:', error);
    return res.status(500).json({ message: 'Error creating capsule journal' });
  }
});

// Update journal
router.put('/capsule-journals/:journalId', async (req, res) => {
  try {
    const journalId = parseInt(req.params.journalId);
    if (isNaN(journalId)) {
      return res.status(400).json({ message: 'Invalid journal ID' });
    }

    const updatedData = {
      title: req.body.title,
      content: req.body.content,
      entryDate: req.body.entryDate,
    };

    const journal = await storage.updateCapsuleJournal(journalId, updatedData);
    return res.json(journal);
  } catch (error) {
    console.error('Error updating capsule journal:', error);
    return res.status(500).json({ message: 'Error updating capsule journal' });
  }
});

// Delete journal
router.delete('/capsule-journals/:journalId', async (req, res) => {
  try {
    const journalId = parseInt(req.params.journalId);
    if (isNaN(journalId)) {
      return res.status(400).json({ message: 'Invalid journal ID' });
    }

    await storage.deleteCapsuleJournal(journalId);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting capsule journal:', error);
    return res.status(500).json({ message: 'Error deleting capsule journal' });
  }
});

// Generate AI milestones for a career capsule
router.post('/career-capsules/:capsuleId/generate-milestones', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }
    
    // Get the capsule to verify it exists and access its data
    const capsule = await storage.getCareerCapsuleById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ message: 'Career capsule not found' });
    }
    
    const options = {
      userId: capsule.userId,
      capsuleId: capsule.id,
      goalType: req.body.goalType || capsule.goalType,
      customGoal: req.body.customGoal || capsule.customGoal,
      timeframe: req.body.timeframe || capsule.timeframe,
      industry: req.body.industry || capsule.industry,
      description: req.body.description || capsule.description,
      useModel: req.body.useModel || 'openai',
    };
    
    // Generate the milestones
    const result = await generateCapsuleMilestones(options);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    // Save the generated milestones with detailed logging
    console.log(`[Milestone API] Attempting to save ${result.years?.length || 0} generated years for capsule ${capsuleId}`);
    
    // Extra validation for years
    if (!result.years || result.years.length === 0) {
      console.error(`[Milestone API] No years were generated for capsule ${capsuleId}`);
      return res.status(500).json({ message: 'No milestone years were generated' });
    }
    
    // Log the first year structure for debugging
    console.log(`[Milestone API] First year structure: ${JSON.stringify(result.years[0])}`);
    
    const saved = await saveCapsuleMilestones(capsuleId, result.years);
    
    if (!saved) {
      console.error(`[Milestone API] Failed to save milestones for capsule ${capsuleId}`);
      return res.status(500).json({ message: 'Failed to save generated milestones' });
    }
    
    // Return the generated years with detailed logging
    console.log(`[Milestone API] Successfully saved milestones, retrieving years for capsule ${capsuleId}`);
    const years = await storage.getCapsuleYearsByCapsuleId(capsuleId);
    console.log(`[Milestone API] Retrieved ${years.length} years from database for capsule ${capsuleId}`);
    
    // Log the first returned year for debugging
    if (years.length > 0) {
      console.log(`[Milestone API] First year from database: ${JSON.stringify(years[0])}`);
      
      // Fetch tasks for the first year to verify the full data chain
      const tasks = await storage.getCapsuleTasksByYearId(years[0].id);
      console.log(`[Milestone API] First year has ${tasks.length} tasks`);
      if (tasks.length > 0) {
        console.log(`[Milestone API] First task from database: ${JSON.stringify(tasks[0])}`);
      }
    }
    
    return res.json({
      success: true,
      message: 'Successfully generated and saved milestones',
      data: years
    });
  } catch (error) {
    console.error('Error generating capsule milestones:', error);
    return res.status(500).json({ 
      message: 'Error generating capsule milestones',
      error: error.message 
    });
  }
});

// Delete career capsule
router.delete('/career-capsules/:capsuleId', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    console.log(`[DELETE] Career capsule delete request received for ID: ${capsuleId}`);
    
    if (isNaN(capsuleId)) {
      console.error(`[DELETE] Invalid capsule ID: ${req.params.capsuleId}`);
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }
    
    // Check if the capsule exists
    console.log(`[DELETE] Checking if capsule exists with ID: ${capsuleId}`);
    const capsule = await storage.getCareerCapsuleById(capsuleId);
    
    if (!capsule) {
      console.error(`[DELETE] Career capsule not found with ID: ${capsuleId}`);
      return res.status(404).json({ message: 'Career capsule not found' });
    }
    
    console.log(`[DELETE] Found capsule to delete:`, JSON.stringify(capsule));
    
    // Delete the capsule
    console.log(`[DELETE] Attempting to delete capsule with ID: ${capsuleId}`);
    const deleted = await storage.deleteCareerCapsule(capsuleId);
    
    if (deleted) {
      console.log(`[DELETE] Successfully deleted capsule with ID: ${capsuleId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Career capsule deleted successfully' 
      });
    } else {
      console.error(`[DELETE] Failed to delete capsule with ID: ${capsuleId}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete career capsule' 
      });
    }
  } catch (error) {
    console.error(`[DELETE] Error deleting career capsule with ID: ${req.params.capsuleId}:`, error);
    return res.status(500).json({ 
      success: false,
      message: 'Error deleting career capsule',
      error: error.message 
    });
  }
});

export default router;