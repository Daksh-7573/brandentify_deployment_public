import React, { useState } from 'react';
import { Mail, Phone, Share2, Plus, X, MapPin, ChevronLeft, ChevronRight, Briefcase, MessageSquare, QrCode, Copy, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { UserData } from '@/types/user';

interface CreativeCardProps {
  userData: UserData;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ userData }) => {
  const { toast } = useToast();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'contact' | 'main' | 'about'>('main');
  
  const profileLink = `https://brandentifier.com/@${userData.username}`;
  
  // Toggle FAB open/close
  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };
  
  // Handle FAB actions
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'email':
        if (userData.email) {
          window.location.href = `mailto:${userData.email}`;
        } else {
          toast({
            title: "No Email Available",
            description: "This profile doesn't have an email address.",
            variant: "destructive"
          });
        }
        break;
      
      case 'phone':
        if (userData.phoneNumber) {
          window.location.href = `tel:${userData.phoneNumber}`;
        } else {
          toast({
            title: "No Phone Number",
            description: "This profile doesn't have a phone number.",
            variant: "destructive"
          });
        }
        break;
      
      case 'copy':
        navigator.clipboard.writeText(profileLink).then(() => {
          toast({
            title: "Link Copied",
            description: "Profile link copied to clipboard.",
          });
        });
        break;
      
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: userData.name || "Brandentifier Profile",
            text: `Check out ${userData.name || "this"} profile on Brandentifier`,
            url: profileLink,
          }).catch(() => {
            toast({
              title: "Share Cancelled",
              description: "Profile sharing was cancelled.",
            });
          });
        } else {
          navigator.clipboard.writeText(profileLink).then(() => {
            toast({
              title: "Link Copied",
              description: "Profile link copied to clipboard for sharing.",
            });
          });
        }
        break;
    }
  };
  
  return (
    <div className="creative-card w-full aspect-[2/3.5] rounded-xl shadow-xl overflow-hidden relative">
      {/* Card Content - Dynamically show different views */}
      {currentView === 'main' && (
        <div className="main-view h-full flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
          {/* Top section with photo */}
          <div className="relative h-48 bg-gradient-to-b from-black/30 to-transparent">
            <div className="absolute left-1/2 top-24 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-28 w-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                {userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Profile"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User");
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                    alt={userData.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 px-6 pt-14 pb-5 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-1">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-white/80 text-sm mb-5">
              {userData.title || "Add your designation"}
            </p>
            
            {/* Additional info */}
            <div className="w-full space-y-3">
              {userData.company && (
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="h-4 w-4 text-white/70" />
                  <span className="text-sm">{userData.company}</span>
                </div>
              )}
              
              {userData.location && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-white/70" />
                  <span className="text-sm">{userData.location}</span>
                </div>
              )}
            </div>
            
            {/* Swipe indicator */}
            <div className="mt-auto pt-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <button 
                  className="h-2 w-2 rounded-full bg-white/30"
                  onClick={() => setCurrentView('contact')}
                ></button>
                <button 
                  className="h-2 w-6 rounded-full bg-white/80"
                ></button>
                <button 
                  className="h-2 w-2 rounded-full bg-white/30"
                  onClick={() => setCurrentView('about')}
                ></button>
              </div>
              <p className="text-xs text-white/60">
                Tap arrows to see more details
              </p>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-3 pointer-events-none">
            <button 
              className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center pointer-events-auto"
              onClick={() => setCurrentView('contact')}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button 
              className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center pointer-events-auto"
              onClick={() => setCurrentView('about')}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* Contact View */}
      {currentView === 'contact' && (
        <div className="contact-view h-full flex flex-col bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
          <div className="px-4 py-3 flex items-center">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            <button 
              className="ml-auto h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
              onClick={() => setCurrentView('main')}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
          
          <div className="flex-1 p-5 space-y-6">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Email</p>
                <p className="text-sm font-medium">{userData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Phone</p>
                <p className="text-sm font-medium">{userData.phoneNumber || "Add phone number"}</p>
              </div>
            </div>
            
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">LinkedIn</p>
                <p className="text-sm font-medium">LinkedIn Profile</p>
              </div>
            </div>
            
            {/* Message */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Message</p>
                <p className="text-sm font-medium">Send a message</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* About View */}
      {currentView === 'about' && (
        <div className="about-view h-full flex flex-col bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
          <div className="px-4 py-3 flex items-center">
            <button 
              className="mr-2 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
              onClick={() => setCurrentView('main')}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-lg font-semibold">About Me</h3>
          </div>
          
          <div className="flex-1 p-5 flex flex-col items-center">
            <div className="mb-5 bg-white p-4 rounded-lg shadow-md w-40 h-40 flex items-center justify-center">
              <QrCode className="h-full w-full text-gray-800 p-2" />
            </div>
            
            <h4 className="text-sm font-medium mb-3">Scan to Connect</h4>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg w-full mt-3">
              <h4 className="text-sm font-semibold mb-2">Bio</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {userData.lookingFor || `Professional with ${userData.industry ? `experience in ${userData.industry}` : 'industry experience'}. 
                ${userData.domain ? `Specialized in ${userData.domain}.` : 'Open to new opportunities and connections.'}
                Let's connect and explore potential collaborations.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button (FAB) */}
      <div className="fab-container absolute bottom-6 right-6 z-20">
        {/* Buttons that appear when FAB is expanded */}
        <div 
          className={`fab-buttons flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        >
          {/* Email button */}
          <button 
            className="group h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 relative"
            onClick={(e) => handleAction('email', e)}
            aria-label="Send Email"
          >
            <Mail className="h-5 w-5" />
            <span className="absolute right-14 bg-indigo-600 text-white px-2 py-1 rounded whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Send Email
            </span>
          </button>
          
          {/* Phone button */}
          <button 
            className="group h-12 w-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 relative"
            onClick={(e) => handleAction('phone', e)}
            aria-label="Call"
          >
            <Phone className="h-5 w-5" />
            <span className="absolute right-14 bg-green-600 text-white px-2 py-1 rounded whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Call
            </span>
          </button>
          
          {/* Copy profile link button */}
          <button 
            className="group h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 relative"
            onClick={(e) => handleAction('copy', e)}
            aria-label="Copy Profile Link"
          >
            <Copy className="h-5 w-5" />
            <span className="absolute right-14 bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Copy Link
            </span>
          </button>
          
          {/* Share button */}
          <button 
            className="group h-12 w-12 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 relative"
            onClick={(e) => handleAction('share', e)}
            aria-label="Share Profile"
          >
            <Share2 className="h-5 w-5" />
            <span className="absolute right-14 bg-purple-600 text-white px-2 py-1 rounded whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Share
            </span>
          </button>
        </div>
        
        {/* Main FAB button that expands/collapses */}
        <button 
          className={`h-14 w-14 rounded-full bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-xl flex items-center justify-center transform transition-all duration-300 ${isFabOpen ? 'rotate-45' : 'animate-pulse'}`}
          onClick={toggleFab}
          aria-label={isFabOpen ? "Close menu" : "Open contact menu"}
        >
          {isFabOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

export default CreativeCard;