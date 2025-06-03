/**
 * AI Monitoring and Management Routes
 * Provides endpoints to monitor AI performance and cost savings
 */

import { Router } from 'express';
import { aiMonitoringDashboard } from './services/ai-monitoring-dashboard';
import { localAIService } from './services/local-ai-service';

const router = Router();

// Get AI service health and performance metrics
router.get('/ai/status', async (req, res) => {
  try {
    const status = await aiMonitoringDashboard.getHealthStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

// Get daily AI performance report
router.get('/ai/daily-report', async (req, res) => {
  try {
    const report = aiMonitoringDashboard.getDailyReport();
    res.json(report);
  } catch (error) {
    console.error('Error getting daily report:', error);
    res.status(500).json({ error: 'Failed to get daily report' });
  }
});

// Get weekly AI performance trends
router.get('/ai/weekly-trends', async (req, res) => {
  try {
    const trends = aiMonitoringDashboard.getWeeklyTrends();
    res.json(trends);
  } catch (error) {
    console.error('Error getting weekly trends:', error);
    res.status(500).json({ error: 'Failed to get weekly trends' });
  }
});

// Test local AI service
router.post('/ai/test', async (req, res) => {
  try {
    const { message = "Give me brief career advice" } = req.body;
    
    const startTime = Date.now();
    const testProfile = {
      user: {
        name: "Test User",
        title: "Software Developer",
        industry: "Technology"
      },
      workExperiences: [],
      skills: [],
      educations: [],
      adviceType: "test",
      customAdviceText: message
    };
    
    const response = await localAIService.generateCareerAdvice(testProfile);
    const latency = Date.now() - startTime;
    
    // Track the test request
    aiMonitoringDashboard.trackRequest('local-ai', latency, true, 1000);
    
    res.json({
      success: true,
      response: response.substring(0, 200) + '...',
      latency: `${latency}ms`,
      provider: 'Local AI',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI test failed:', error);
    const latency = Date.now() - (req.body.startTime || Date.now());
    aiMonitoringDashboard.trackRequest('local-ai', latency, false);
    
    res.status(500).json({
      success: false,
      error: 'AI test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cost savings summary
router.get('/ai/cost-savings', async (req, res) => {
  try {
    const status = await aiMonitoringDashboard.getHealthStatus();
    const costSavings = status.summary.totalCostSavings;
    const totalRequests = status.summary.totalRequests;
    
    // Calculate potential OpenAI costs
    const estimatedOpenAICost = totalRequests * 0.02; // Rough estimate per request
    const actualCost = 0; // Local AI is free
    const savings = estimatedOpenAICost;
    
    res.json({
      totalRequests,
      estimatedOpenAICost: `$${estimatedOpenAICost.toFixed(2)}`,
      actualCost: `$${actualCost.toFixed(2)}`,
      totalSavings: `$${savings.toFixed(2)}`,
      savingsPercentage: '100%',
      monthlySavingsProjection: `$${(savings * 30).toFixed(2)}`,
      summary: 'Complete elimination of AI processing costs through local models'
    });
  } catch (error) {
    console.error('Error calculating cost savings:', error);
    res.status(500).json({ error: 'Failed to calculate cost savings' });
  }
});

export default router;