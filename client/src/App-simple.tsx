import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

// Simple landing page component
function SimpleLanding() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>Brandentifier - AI-Powered Career Platform</h1>
      <p>Professional networking and career development platform</p>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Platform Features:</h2>
        <ul>
          <li>Industry Pulse - Stay updated with career trends</li>
          <li>AI Career Assistant - Get personalized guidance</li>
          <li>Professional Networking - Connect with peers</li>
          <li>Brand Quests - Gamified career building</li>
          <li>Portfolio Builder - Showcase your work</li>
        </ul>
      </div>
    </div>
  );
}

// Simple App component with minimal dependencies
function SimpleApp() {
  useEffect(() => {
    console.log("Simple App mounted successfully");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Switch>
          <Route path="/industry-pulse" component={SimpleLanding} />
          <Route path="/" component={SimpleLanding} />
          <Route>
            <div style={{ padding: '20px' }}>
              <h1>Page Not Found</h1>
              <p>The requested page could not be found.</p>
            </div>
          </Route>
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default SimpleApp;