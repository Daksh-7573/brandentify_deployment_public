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
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    };

    const capsule = await storage.createCareerCapsule(capsuleData);
    return res.status(201).json(capsule);
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

    const years = await storage.getCapsuleYears(capsuleId);
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
      year: req.body.year,
      title: req.body.title,
      description: req.body.description || null,
      goalType: req.body.goalType,
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
      goalType: req.body.goalType,
      progress: req.body.progress,
      year: req.body.year,
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

    const tasks = await storage.getCapsuleTasks(yearId);
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

// Get journals for year
router.get('/capsule-years/:yearId/journals', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const journals = await storage.getCapsuleJournals(yearId);
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
    
    // Save the generated milestones
    const saved = await saveCapsuleMilestones(capsuleId, result.years);
    
    if (!saved) {
      return res.status(500).json({ message: 'Failed to save generated milestones' });
    }
    
    // Return the generated years
    const years = await storage.getCapsuleYears(capsuleId);
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

export default router;