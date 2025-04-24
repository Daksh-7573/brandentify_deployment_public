import React from "react";
import { UserData } from "@/types/user";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  Satellite, 
  Code, 
  Copy, 
  Check,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuantumCardProps {
  userData: UserData;
}

const QuantumCard: React.FC<QuantumCardProps> = ({ userData }) => {
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  
  // Helpers
  const formatProfileLink = () => {
    return `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  };
  
  const handleCopy = async (text: string, field: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedFields({ ...copiedFields, [field]: true });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedFields({ ...copiedFields, [field]: false });
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Animations
  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const hoverAnimation = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="w-full h-full quantum-card aspect-[2/3.5] rounded-lg overflow-hidden relative">
      {/* Background with quantum-inspired gradient and pulse grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F2C] to-[#1F1B44] z-0">
        {/* Pulse grid animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-12 h-full w-full">
            {Array.from({ length: 96 }).map((_, index) => (
              <motion.div
                key={index}
                className="border-[0.5px] border-blue-400/10"
                animate={{
                  opacity: [
                    0.1,
                    Math.random() * 0.5 + 0.1,
                    0.1
                  ],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Tech circuit lines */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 C150,80 150,120 300,100" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
            <path d="M0,200 C150,180 150,220 300,200" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
            <path d="M0,300 C150,280 150,320 300,300" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
            <path d="M0,400 C150,380 150,420 300,400" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
            <path d="M100,0 C80,150 120,150 100,500" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
            <path d="M200,0 C180,150 220,150 200,500" stroke="#4F46E5" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
      </div>
      
      {/* Card Content with futuristic styling */}
      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Header with holographic profile image */}
        <div className="flex flex-col items-center mb-5">
          {/* Hexagonal profile photo frame with holographic effect */}
          <div className="relative mb-4">
            <div className="w-24 h-24 mx-auto clip-hex bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm p-[2px] rounded-full overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-[1px]">
                {userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover rounded-full"
                    style={{
                      boxShadow: "0 0 15px rgba(123, 97, 255, 0.5)",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0A0F2C&color=fff`;
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0A0F2C&color=fff`}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover rounded-full"
                    style={{
                      boxShadow: "0 0 15px rgba(123, 97, 255, 0.5)",
                    }}
                  />
                )}
              </div>
            </div>
            
            {/* Glowing orb effect */}
            <motion.div 
              className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-sm"
              variants={pulseAnimation}
              animate="animate"
            />
          </div>
          
          {/* Name in futuristic bold font */}
          <h2 className="text-xl font-bold text-white tracking-wider mb-1 text-center"
            style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}>
            {userData.name || "Quantum Professional"}
          </h2>
          
          {/* Title in neon chip */}
          <div className="bg-indigo-900/50 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 px-3 py-1 text-sm rounded-full mb-1">
            <span className="relative">
              <span className="mr-1.5">○</span>
              {userData.title || "Tech Professional"}
            </span>
          </div>
        </div>
        
        {/* Main content - Professional details with interactive elements */}
        <div className="flex-1 space-y-3 text-sm">
          {/* Industry as chip */}
          {userData.industry && (
            <motion.div 
              className="flex items-center group"
              variants={hoverAnimation}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-900/40 rounded-full">
                  <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                </span>
                <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-md px-2 py-0.5 text-blue-300 mr-1">
                  {userData.industry}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Domain as animated pulse-tag */}
          {userData.domain && (
            <motion.div 
              className="flex items-center group"
              variants={hoverAnimation}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 flex items-center justify-center bg-indigo-900/40 rounded-full">
                  <Code className="h-3.5 w-3.5 text-indigo-400" />
                </span>
                <motion.div 
                  className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/20 rounded-md px-2 py-0.5 text-indigo-300 relative overflow-hidden"
                  variants={pulseAnimation}
                  animate="animate"
                >
                  <span className="relative z-10">#{userData.domain === "all" ? "General" : userData.domain}</span>
                  <motion.div 
                    className="absolute inset-0 bg-indigo-500/10" 
                    animate={{ 
                      x: ['-100%', '100%'],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3, 
                      ease: "linear" 
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Location with satellite icon */}
          {userData.location && (
            <div className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => handleCopy(userData.location!, 'location')}>
              <span className="w-6 h-6 flex items-center justify-center bg-purple-900/40 rounded-full group-hover:bg-purple-800/60 transition-colors">
                <Satellite className="h-3.5 w-3.5 text-purple-400" />
              </span>
              <span className="text-purple-300 flex-1">{userData.location}</span>
              <motion.button 
                className="h-5 w-5 flex items-center justify-center text-purple-400/70 hover:text-purple-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(userData.location!, 'location');
                }}
              >
                {copiedFields['location'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </motion.button>
            </div>
          )}
          
          {/* Company */}
          {userData.company && (
            <div className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => handleCopy(userData.company!, 'company')}>
              <span className="w-6 h-6 flex items-center justify-center bg-cyan-900/40 rounded-full group-hover:bg-cyan-800/60 transition-colors">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
              </span>
              <span className="text-cyan-300 flex-1">{userData.company}</span>
              <motion.button 
                className="h-5 w-5 flex items-center justify-center text-cyan-400/70 hover:text-cyan-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(userData.company!, 'company');
                }}
              >
                {copiedFields['company'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </motion.button>
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => handleCopy(userData.email, 'email')}>
            <span className="w-6 h-6 flex items-center justify-center bg-blue-900/40 rounded-full group-hover:bg-blue-800/60 transition-colors">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
            </span>
            <span className="text-blue-300 flex-1 truncate">{userData.email}</span>
            <motion.button 
              className="h-5 w-5 flex items-center justify-center text-blue-400/70 hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(userData.email, 'email');
              }}
            >
              {copiedFields['email'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </motion.button>
          </div>
          
          {/* Phone */}
          {userData.phoneNumber && (
            <div className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => handleCopy(userData.phoneNumber!, 'phone')}>
              <span className="w-6 h-6 flex items-center justify-center bg-green-900/40 rounded-full group-hover:bg-green-800/60 transition-colors">
                <Phone className="h-3.5 w-3.5 text-green-400" />
              </span>
              <span className="text-green-300 flex-1">{userData.phoneNumber}</span>
              <motion.button 
                className="h-5 w-5 flex items-center justify-center text-green-400/70 hover:text-green-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(userData.phoneNumber!, 'phone');
                }}
              >
                {copiedFields['phone'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Footer with barcode-style profile link */}
        <div className="mt-4">
          <div className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => handleCopy(formatProfileLink(), 'profile')}>
            <span className="w-6 h-6 flex items-center justify-center bg-purple-900/40 rounded-full group-hover:bg-purple-800/60 transition-colors">
              <Globe className="h-3.5 w-3.5 text-purple-400" />
            </span>
            <div className="flex-1 overflow-hidden flex items-center">
              <div className="h-5 overflow-hidden">
                {/* Barcode-style design with URL */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-0.5 h-5",
                        i % 3 === 0 ? "h-4 bg-purple-500/80" : "bg-purple-400/50"
                      )}
                      style={{
                        height: `${Math.max(8, Math.floor(Math.random() * 20))}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-purple-300 ml-2 text-xs truncate">{formatProfileLink()}</span>
            </div>
            <motion.button 
              className="h-5 w-5 flex items-center justify-center text-purple-400/70 hover:text-purple-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(formatProfileLink(), 'profile');
              }}
            >
              {copiedFields['profile'] ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </motion.button>
          </div>
        </div>
        
        {/* Quantum Card label */}
        <div className="absolute bottom-3 right-3">
          <div className="text-xs text-indigo-400/70 bg-indigo-900/30 backdrop-blur-sm rounded-full px-2 py-0.5 border border-indigo-500/20">
            Quantum Card
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCard;