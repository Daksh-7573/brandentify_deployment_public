import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ChatInterface from "@/components/chat/chat-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AICareer() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const suggestedQuestions = [
    "What skills should I develop for a Senior Data Analyst role?",
    "How can I transition from Data Analysis to Data Science?",
    "What certifications would be most valuable for my career?",
    "What are the current trends in data analytics roles?"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage="ai-career" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 flex flex-col">
          <div className="mx-auto w-full max-w-3xl flex-1 flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">AI Career Booster</h1>
            
            {/* AI Chat Interface */}
            <ChatInterface />
            
            {/* Suggested Questions */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Suggested Questions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left text-gray-700 hover:bg-gray-50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
