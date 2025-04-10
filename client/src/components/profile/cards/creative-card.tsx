import React, { useState } from "react";
import { UserData } from "@/types/user";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  Code, 
  Building2, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Linkedin,
  MessageSquare,
  Copy,
  Share2,
  QrCode
} from "lucide-react";

interface CreativeCardProps {
  userData: UserData;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ userData }) => {
  // State for FAB menu and swipe
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [swipePosition, setSwipePosition] = useState<'main' | 'left' | 'right'>('main');
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Toggle FAB menu
  const toggleFab = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFabOpen(!isFabOpen);
  };
  
  // Handle swipe start
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };
  
  // Handle mouse down for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
  };
  
  // Handle swipe move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null) return;
    setCurrentX(e.touches[0].clientX);
  };
  
  // Handle mouse move for desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX === null) return;
    setCurrentX(e.clientX);
  };
  
  // Handle swipe end
  const handleTouchEnd = () => {
    if (startX === null || currentX === null) {
      setStartX(null);
      setCurrentX(null);
      return;
    }
    
    const diff = startX - currentX;
    // Swipe right to left (show contact details)
    if (diff > 50 && swipePosition === 'main') {
      setSwipePosition('left');
    } 
    // Swipe left to right (show extra details/QR)
    else if (diff < -50 && swipePosition === 'main') {
      setSwipePosition('right');
    }
    // Return to main from either side
    else if ((diff < -50 && swipePosition === 'left') || (diff > 50 && swipePosition === 'right')) {
      setSwipePosition('main');
    }
    
    setStartX(null);
    setCurrentX(null);
  };
  
  // Handle mouse up for desktop
  const handleMouseUp = () => {
    handleTouchEnd();
  };
  
  // Navigate back to main view
  const navigateToMain = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipePosition('main');
  };
  
  // Navigate to contact details
  const navigateToContacts = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipePosition('left');
  };
  
  // Navigate to extra details
  const navigateToExtras = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipePosition('right');
  };
  
  // FAB actions
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFabOpen(false);
    
    switch (action) {
      case 'email':
        window.location.href = `mailto:${userData.email}`;
        break;
      case 'phone':
        if (userData.phoneNumber) {
          window.location.href = `tel:${userData.phoneNumber}`;
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(profileLink);
        // Show toast notification
        alert("Profile link copied to clipboard!");
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: userData.name || "Profile",
            text: `Check out ${userData.name}'s profile`,
            url: `https://${profileLink}`
          });
        } else {
          navigator.clipboard.writeText(profileLink);
          alert("Profile link copied to clipboard!");
        }
        break;
    }
  };
  
  // This function is no longer used since we're now handling all transforms
  // directly in the style prop of the container
  const getCardTransform = () => {
    if (swipePosition === 'left') {
      return 'translateX(-100%)';
    } else if (swipePosition === 'right') {
      return 'translateX(100%)';
    }
    return 'translateX(0)';
  };
  
  // Calculate any ongoing swipe transform
  const getOngoingSwipeTransform = () => {
    if (startX === null || currentX === null) return 0;
    return currentX - startX;
  };
  
  return (
    <div 
      className="creative-card-container w-full aspect-[2/3.5] relative overflow-hidden rounded-xl shadow-xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Swipe indicators */}
      <div className="swipe-indicator-container absolute top-1/2 -translate-y-1/2 w-full z-10 flex justify-between px-4 pointer-events-none">
        {swipePosition !== 'right' && (
          <div className={`left-indicator ${swipePosition === 'main' ? 'opacity-50' : 'opacity-0'} bg-white/80 rounded-full h-8 w-8 flex items-center justify-center shadow-md transition-opacity duration-300`}>
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </div>
        )}
        {swipePosition !== 'left' && (
          <div className={`right-indicator ${swipePosition === 'main' ? 'opacity-50' : 'opacity-0'} bg-white/80 rounded-full h-8 w-8 flex items-center justify-center shadow-md ml-auto transition-opacity duration-300`}>
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </div>
        )}
      </div>
      
      {/* Swipe container */}
      <div 
        className="swipe-container flex h-full transition-transform duration-300 ease-out"
        style={{ 
          transform: swipePosition === 'left' 
            ? 'translateX(-100%)' 
            : swipePosition === 'right'
              ? 'translateX(100%)'
              : startX !== null && currentX !== null
                ? `translateX(${getOngoingSwipeTransform()}px)`
                : 'translateX(0)'
        }}
      >
        {/* Left view - Contact details */}
        <div className="card-view min-w-full h-full shrink-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex flex-col">
          <div className="px-4 py-3 flex items-center">
            <button 
              className="mr-2 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
              onClick={navigateToMain}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-lg font-semibold">Contact Details</h3>
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
        
        {/* Main view - Basic info */}
        <div className="card-view min-w-full h-full shrink-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white flex flex-col">
          <div className="absolute left-1/2 top-28 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="h-28 w-28 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center shadow-lg">
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
          
          <div className="h-40 w-full bg-gradient-to-b from-black/20 to-transparent"></div>
          
          <div className="flex-1 px-5 pt-20 pb-5 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-1">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-white/80 text-sm mb-4">
              {userData.title || "Add your designation"}
            </p>
            
            {userData.company && (
              <div className="mb-2 inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-white/70" />
                <span className="text-sm">{userData.company}</span>
              </div>
            )}
            
            {userData.location && (
              <div className="mb-2 inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-white/70" />
                <span className="text-sm">{userData.location}</span>
              </div>
            )}
            
            <div className="mt-6 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-white/30"></div>
              <div className="h-1 w-8 rounded-full bg-white/70"></div>
              <div className="h-1 w-1 rounded-full bg-white/30"></div>
            </div>
            
            <p className="text-xs text-white/60 mt-3">
              Swipe to see more details
            </p>
          </div>
          
          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mb-3">
            <button 
              className="h-2 w-2 rounded-full bg-white/30"
              onClick={navigateToContacts}
            ></button>
            <button 
              className="h-2 w-6 rounded-full bg-white/80"
            ></button>
            <button 
              className="h-2 w-2 rounded-full bg-white/30"
              onClick={navigateToExtras}
            ></button>
          </div>
        </div>
        
        {/* Right view - Bio/QR */}
        <div className="card-view min-w-full h-full shrink-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white flex flex-col">
          <div className="px-4 py-3 flex items-center">
            <button 
              className="mr-2 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"
              onClick={navigateToMain}
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
      </div>
      
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