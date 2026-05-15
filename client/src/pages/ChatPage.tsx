import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import Chat from '@/components/messaging/Chat';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { Loader2, MessageSquare, Home, Search, MapPin, Trophy, Flag, Shield, Zap, MessageCircle, Settings, BellRing, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import { NeoGlassLayout } from '@/components/layout/neo-glass-layout';
import '../styles/neo-glass-spotify.css';
import { ChatPageSkeleton } from '@/components/ui/page-skeletons/chat-skeleton';
import { Helmet } from "react-helmet";

const ChatPage: React.FC = () => {
  // Get current user data from the auth context
  const { user, isLoading: authLoading } = useAuth();
  const { isPremium, aiChat } = useFeatureAccess();
  const [, setLocation] = useLocation();
  
  // Get current user ID (from auth context or localStorage as fallback)
  const userId = user?.id || Number(localStorage.getItem('userId')) || 0;
  
  // Fetch current user for verification from our backend
  const { data: userData, isLoading: dataLoading, isError } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return <ChatPageSkeleton />;
  }

  // If we're not loading and either there's no user or there was an error fetching
  if (!user && !userData) {
    return (
      <div className="neo-spotify-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md p-8 bg-spotify-glass-bg backdrop-filter backdrop-blur-[15px] rounded-xl border border-spotify-glass-border shadow-lg">
            <div className="w-16 h-16 bg-spotify-glass-highlight rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-spotify-white" />
            </div>
            <div className="text-xl font-semibold mb-4 text-spotify-white">Authentication Required</div>
            <p className="text-spotify-light-gray mb-6">
              Please log in to access the messaging feature and connect with other professionals
            </p>
            <a 
              href="/" 
              className="px-6 py-3 rounded-full bg-spotify-white text-spotify-black hover:opacity-90 transition-opacity inline-block font-medium"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Brandentify Messages",
    "description": "Professional messaging and networking communication platform",
    "url": "https://brandentify.com/messages",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Professional Messaging",
      "Network Communication",
      "Career Collaboration",
      "Secure Chat"
    ]
  };

  return (
    <div 
      className="neo-spotify-container responsive-background flex flex-col min-h-screen overflow-y-auto"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed'
      }}
    >
      <Helmet>
        <title>Messages - Professional Networking Communication | Brandentify</title>
        <meta name="description" content="Connect with professionals through secure messaging. Build your network, collaborate on projects, and advance your career through professional communication." />
        <meta name="keywords" content="professional messaging, business communication, networking messages, career networking, professional connections" />
        <meta property="og:title" content="Messages - Professional Networking Communication" />
        <meta property="og:description" content="Secure professional messaging platform for career networking and collaboration" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://brandentify.com/messages-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Messages - Professional Communication" />
        <link rel="canonical" href="https://brandentify.com/messages" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Glass UI overlay to maintain design consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm fixed z-0"></div>
      
      <div className="relative z-10 w-full flex flex-col h-full">
        <Header />
        
        <div className="flex-1 w-full pb-12">
          <div className="mt-1 mx-3 sm:mx-6 flex flex-col gap-8">
            <div className="neo-glass-panel rounded-lg p-3 sm:p-4 md:p-6 flex flex-col h-[80vh]">
              {/* Page Heading */}
              <div className="pb-3 sm:pb-4 md:pb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-spotify-white mb-1 md:mb-2">Messages</h1>
                <p className="text-xs sm:text-sm md:text-base text-spotify-light-gray">Connect with professionals in your network</p>
              </div>
              
              <ChatProvider userId={userId}>
                <div className="flex-1 overflow-hidden">
                  <Chat userId={userId} />
                </div>
              </ChatProvider>
            </div>

            {/* Messages FAQ Section for SEO */}
            <section id="messaging-faq" className="neo-glass-panel rounded-lg p-6 md:p-8 mb-8 max-w-4xl mx-auto w-full">
              <h2 className="text-2xl font-bold mb-6 text-white">Messages FAQ</h2>
              <div className="space-y-6" itemScope itemType="https://schema.org/FAQPage">
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">How do professional messages work?</h3>
                  <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                    <p itemProp="text" className="text-gray-400">Connect with professionals in your network through secure messaging. Share ideas, collaborate on projects, and build meaningful professional relationships.</p>
                  </div>
                </div>
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">Is professional messaging secure?</h3>
                  <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                    <p itemProp="text" className="text-gray-400">Yes, all professional messages are encrypted and secure. Your conversations with industry professionals are protected with enterprise-grade security.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
