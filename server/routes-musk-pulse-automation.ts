/**
 * Musk Pulse Automation Routes
 * 
 * API endpoints for managing automated Musk pulse generation
 * - Start/stop scheduling
 * - Generate test pulses
 * - Monitor generation status
 */

import { Router, Request, Response } from 'express';
import { muskPulseScheduler } from './services/musk-pulse-scheduler';
import { muskPulseGenerator } from './services/musk-pulse-generator';

const router = Router();

/**
 * POST /api/musk-pulse/start-automation
 * Start the automated pulse generation schedule
 */
router.post('/start-automation', async (req: Request, res: Response) => {
  try {
    console.log('[MuskPulse] Starting automation');
    
    muskPulseScheduler.start();
    
    res.json({
      message: 'Musk Pulse automation started successfully',
      schedule: {
        times: ['9:00 AM', '2:00 PM', '7:00 PM'],
        eventDriven: true,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('[MuskPulse] Error starting automation:', error);
    res.status(500).json({ message: 'Failed to start automation' });
  }
});

/**
 * POST /api/musk-pulse/stop-automation
 * Stop the automated pulse generation schedule
 */
router.post('/stop-automation', async (req: Request, res: Response) => {
  try {
    console.log('[MuskPulse] Stopping automation');
    
    muskPulseScheduler.stop();
    
    res.json({
      message: 'Musk Pulse automation stopped successfully',
      status: 'inactive'
    });
  } catch (error) {
    console.error('[MuskPulse] Error stopping automation:', error);
    res.status(500).json({ message: 'Failed to stop automation' });
  }
});

/**
 * GET /api/musk-pulse/status
 * Get the current automation status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = muskPulseScheduler.getStatus();
    
    res.json({
      automation: status,
      nextScheduledTimes: [
        '9:00 AM daily',
        '2:00 PM daily', 
        '7:00 PM daily'
      ],
      eventMonitoring: status.isRunning
    });
  } catch (error) {
    console.error('[MuskPulse] Error getting status:', error);
    res.status(500).json({ message: 'Failed to get status' });
  }
});

/**
 * POST /api/musk-pulse/generate-test
 * Generate a test pulse immediately
 */
router.post('/generate-test', async (req: Request, res: Response) => {
  try {
    const { type = 'afternoon' } = req.body;
    
    console.log(`[MuskPulse] Generating test ${type} pulse`);
    
    await muskPulseScheduler.generateTestPulse(type);
    
    res.json({
      message: `Test ${type} pulse generated successfully`,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MuskPulse] Error generating test pulse:', error);
    res.status(500).json({ message: 'Failed to generate test pulse' });
  }
});

/**
 * POST /api/musk-pulse/generate-event
 * Generate an event-driven pulse for specific industry
 */
router.post('/generate-event', async (req: Request, res: Response) => {
  try {
    const { industry, eventDescription } = req.body;
    
    if (!industry || !eventDescription) {
      return res.status(400).json({ 
        message: 'Industry and event description are required' 
      });
    }
    
    console.log(`[MuskPulse] Generating event pulse for ${industry}`);
    
    await muskPulseGenerator.generateEventDrivenPulse(industry, eventDescription);
    
    res.json({
      message: `Event-driven pulse generated for ${industry}`,
      industry,
      event: eventDescription,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MuskPulse] Error generating event pulse:', error);
    res.status(500).json({ message: 'Failed to generate event pulse' });
  }
});

export default router;