import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Landing() {
  const { enterDemoMode, isLoading, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated - using useEffect to avoid state updates during render
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary text-2xl font-bold">Brandentifier</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                className="ml-4"
                onClick={enterDemoMode}
                disabled={false} // Never disable demo mode button
              >
                Try Demo
              </Button>
              <Button 
                variant="default" 
                className="ml-4"
                onClick={() => setLocation('/auth-page')}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Elevate your career with</span>
                  <span className="block text-primary">AI-powered insights</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Brandentifier analyzes your professional profile, identifies skill gaps, and connects you with personalized opportunities to advance your career.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button 
                      size="lg"
                      className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10"
                      onClick={() => setLocation('/auth')}
                      disabled={isLoading}
                    >
                      Sign up now
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10"
                      onClick={enterDemoMode}
                      disabled={false} // Never disable demo mode button
                    >
                      Try Demo Mode
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
            src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Professional working on laptop" 
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Transform your career journey
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-robot"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">AI Career Advisor</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get personalized career guidance from Musk, our AI career coach, available 24/7.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Resume Optimization</h3>
                <p className="mt-2 text-base text-gray-500">
                  AI-powered resume analysis with keyword optimization for higher interview rates.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Skill Gap Analysis</h3>
                <p className="mt-2 text-base text-gray-500">
                  Identify missing skills for your dream job and get personalized learning paths.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Smart Job Matching</h3>
                <p className="mt-2 text-base text-gray-500">
                  Discover jobs that match your profile with AI-powered recommendations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Learning Recommendations</h3>
                <p className="mt-2 text-base text-gray-500">
                  Course suggestions from top platforms like LinkedIn Learning, Udemy, and Coursera.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-primary text-2xl mb-4">
                  <i className="fas fa-newspaper"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Industry Insights</h3>
                <p className="mt-2 text-base text-gray-500">
                  Stay updated with AI-curated industry news and trends relevant to your career path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Brandentifier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
