// Career Capsule API routes
import express from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertCareerCapsuleSchema, insertCapsuleYearSchema, insertCapsuleTaskSchema, insertCapsuleJournalSchema } from '../shared/schema';

const router = express.Router();

// GET user's career capsule
router.get('/users/:userId/career-capsule', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const capsules = await storage.getCareerCapsulesByUserId(userId);
    
    if (capsules.length === 0) {
      return res.status(404).json({ message: 'No career capsule found for this user' });
    }
    
    // Return the first capsule (users should only have one)
    return res.status(200).json(capsules[0]);
  } catch (error) {
    console.error('Error fetching career capsule:', error);
    return res.status(500).json({ message: 'Error fetching career capsule' });
  }
});

// POST create a new career capsule
router.post('/users/:userId/career-capsule', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if user already has a career capsule
    const existingCapsules = await storage.getCareerCapsulesByUserId(userId);
    if (existingCapsules.length > 0) {
      return res.status(409).json({ 
        message: 'User already has a career capsule',
        capsuleId: existingCapsules[0].id
      });
    }

    // Validate request body
    const validationResult = insertCareerCapsuleSchema.safeParse({
      ...req.body,
      userId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid career capsule data',
        errors: validationResult.error.format() 
      });
    }

    const newCapsule = await storage.createCareerCapsule(validationResult.data);
    return res.status(201).json(newCapsule);
  } catch (error) {
    console.error('Error creating career capsule:', error);
    return res.status(500).json({ message: 'Error creating career capsule' });
  }
});

// PUT update a career capsule
router.put('/career-capsules/:id', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.id);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const existingCapsule = await storage.getCareerCapsuleById(capsuleId);
    if (!existingCapsule) {
      return res.status(404).json({ message: 'Career capsule not found' });
    }

    // Update the capsule
    const updatedCapsule = await storage.updateCareerCapsule(capsuleId, req.body);
    return res.status(200).json(updatedCapsule);
  } catch (error) {
    console.error('Error updating career capsule:', error);
    return res.status(500).json({ message: 'Error updating career capsule' });
  }
});

// DELETE a career capsule
router.delete('/career-capsules/:id', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.id);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const existingCapsule = await storage.getCareerCapsuleById(capsuleId);
    if (!existingCapsule) {
      return res.status(404).json({ message: 'Career capsule not found' });
    }

    const deleted = await storage.deleteCareerCapsule(capsuleId);
    if (deleted) {
      return res.status(200).json({ message: 'Career capsule deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete career capsule' });
    }
  } catch (error) {
    console.error('Error deleting career capsule:', error);
    return res.status(500).json({ message: 'Error deleting career capsule' });
  }
});

// GET capsule years
router.get('/career-capsules/:capsuleId/years', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const years = await storage.getCapsuleYearsByCapsuleId(capsuleId);
    return res.status(200).json(years);
  } catch (error) {
    console.error('Error fetching capsule years:', error);
    return res.status(500).json({ message: 'Error fetching capsule years' });
  }
});

// POST create a new capsule year
router.post('/career-capsules/:capsuleId/years', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const existingCapsule = await storage.getCareerCapsuleById(capsuleId);
    if (!existingCapsule) {
      return res.status(404).json({ message: 'Career capsule not found' });
    }

    // Validate request body
    const validationResult = insertCapsuleYearSchema.safeParse({
      ...req.body,
      capsuleId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid capsule year data',
        errors: validationResult.error.format() 
      });
    }

    const newYear = await storage.createCapsuleYear(validationResult.data);
    
    // Update the capsule progress
    await storage.updateCapsuleProgress(capsuleId);
    
    return res.status(201).json(newYear);
  } catch (error) {
    console.error('Error creating capsule year:', error);
    return res.status(500).json({ message: 'Error creating capsule year' });
  }
});

// PUT update a capsule year
router.put('/capsule-years/:id', async (req, res) => {
  try {
    const yearId = parseInt(req.params.id);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const existingYear = await storage.getCapsuleYearById(yearId);
    if (!existingYear) {
      return res.status(404).json({ message: 'Capsule year not found' });
    }

    // Update the year
    const updatedYear = await storage.updateCapsuleYear(yearId, req.body);
    
    // Update the capsule progress
    if (existingYear.capsuleId) {
      await storage.updateCapsuleProgress(existingYear.capsuleId);
    }
    
    return res.status(200).json(updatedYear);
  } catch (error) {
    console.error('Error updating capsule year:', error);
    return res.status(500).json({ message: 'Error updating capsule year' });
  }
});

// DELETE a capsule year
router.delete('/capsule-years/:id', async (req, res) => {
  try {
    const yearId = parseInt(req.params.id);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const existingYear = await storage.getCapsuleYearById(yearId);
    if (!existingYear) {
      return res.status(404).json({ message: 'Capsule year not found' });
    }
    
    const capsuleId = existingYear.capsuleId;
    
    const deleted = await storage.deleteCapsuleYear(yearId);
    if (deleted) {
      // Update the capsule progress
      if (capsuleId) {
        await storage.updateCapsuleProgress(capsuleId);
      }
      
      return res.status(200).json({ message: 'Capsule year deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete capsule year' });
    }
  } catch (error) {
    console.error('Error deleting capsule year:', error);
    return res.status(500).json({ message: 'Error deleting capsule year' });
  }
});

// GET tasks for a year
router.get('/capsule-years/:yearId/tasks', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const tasks = await storage.getCapsuleTasksByYearId(yearId);
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching capsule tasks:', error);
    return res.status(500).json({ message: 'Error fetching capsule tasks' });
  }
});

// POST create a new task
router.post('/capsule-years/:yearId/tasks', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const existingYear = await storage.getCapsuleYearById(yearId);
    if (!existingYear) {
      return res.status(404).json({ message: 'Capsule year not found' });
    }

    // Validate request body
    const validationResult = insertCapsuleTaskSchema.safeParse({
      ...req.body,
      yearId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid task data',
        errors: validationResult.error.format() 
      });
    }

    const newTask = await storage.createCapsuleTask(validationResult.data);
    
    // Update the year progress
    await storage.updateCapsuleYearProgress(yearId);
    
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating capsule task:', error);
    return res.status(500).json({ message: 'Error creating capsule task' });
  }
});

// PUT update a task
router.put('/capsule-tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const existingTask = await storage.getCapsuleTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task
    const updatedTask = await storage.updateCapsuleTask(taskId, req.body);
    
    // Update the year progress
    await storage.updateCapsuleYearProgress(existingTask.yearId);
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating capsule task:', error);
    return res.status(500).json({ message: 'Error updating capsule task' });
  }
});

// POST toggle task completion
router.post('/capsule-tasks/:id/toggle', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const existingTask = await storage.getCapsuleTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Toggle the task completion
    const updatedTask = await storage.toggleCapsuleTaskCompletion(taskId);
    
    // Update the year progress
    await storage.updateCapsuleYearProgress(existingTask.yearId);
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return res.status(500).json({ message: 'Error toggling task completion' });
  }
});

// DELETE a task
router.delete('/capsule-tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const existingTask = await storage.getCapsuleTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const yearId = existingTask.yearId;
    
    const deleted = await storage.deleteCapsuleTask(taskId);
    if (deleted) {
      // Update the year progress
      await storage.updateCapsuleYearProgress(yearId);
      
      return res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
  } catch (error) {
    console.error('Error deleting capsule task:', error);
    return res.status(500).json({ message: 'Error deleting capsule task' });
  }
});

// GET journals for a year
router.get('/capsule-years/:yearId/journals', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const journals = await storage.getCapsuleJournalsByYearId(yearId);
    return res.status(200).json(journals);
  } catch (error) {
    console.error('Error fetching capsule journals:', error);
    return res.status(500).json({ message: 'Error fetching capsule journals' });
  }
});

// POST create a new journal
router.post('/capsule-years/:yearId/journals', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    if (isNaN(yearId)) {
      return res.status(400).json({ message: 'Invalid year ID' });
    }

    const existingYear = await storage.getCapsuleYearById(yearId);
    if (!existingYear) {
      return res.status(404).json({ message: 'Capsule year not found' });
    }

    // Validate request body
    const validationResult = insertCapsuleJournalSchema.safeParse({
      ...req.body,
      yearId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid journal data',
        errors: validationResult.error.format() 
      });
    }

    const newJournal = await storage.createCapsuleJournal(validationResult.data);
    return res.status(201).json(newJournal);
  } catch (error) {
    console.error('Error creating capsule journal:', error);
    return res.status(500).json({ message: 'Error creating capsule journal' });
  }
});

// PUT update a journal
router.put('/capsule-journals/:id', async (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    if (isNaN(journalId)) {
      return res.status(400).json({ message: 'Invalid journal ID' });
    }

    const existingJournal = await storage.getCapsuleJournalById(journalId);
    if (!existingJournal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Update the journal
    const updatedJournal = await storage.updateCapsuleJournal(journalId, req.body);
    return res.status(200).json(updatedJournal);
  } catch (error) {
    console.error('Error updating capsule journal:', error);
    return res.status(500).json({ message: 'Error updating capsule journal' });
  }
});

// DELETE a journal
router.delete('/capsule-journals/:id', async (req, res) => {
  try {
    const journalId = parseInt(req.params.id);
    if (isNaN(journalId)) {
      return res.status(400).json({ message: 'Invalid journal ID' });
    }

    const existingJournal = await storage.getCapsuleJournalById(journalId);
    if (!existingJournal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    const deleted = await storage.deleteCapsuleJournal(journalId);
    if (deleted) {
      return res.status(200).json({ message: 'Journal deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete journal' });
    }
  } catch (error) {
    console.error('Error deleting capsule journal:', error);
    return res.status(500).json({ message: 'Error deleting capsule journal' });
  }
});

// GET all journals for a capsule
router.get('/career-capsules/:capsuleId/journals', async (req, res) => {
  try {
    const capsuleId = parseInt(req.params.capsuleId);
    if (isNaN(capsuleId)) {
      return res.status(400).json({ message: 'Invalid capsule ID' });
    }

    const journals = await storage.getCapsuleJournalsByCapsuleId(capsuleId);
    return res.status(200).json(journals);
  } catch (error) {
    console.error('Error fetching capsule journals:', error);
    return res.status(500).json({ message: 'Error fetching capsule journals' });
  }
});

// Export the router
export default router;