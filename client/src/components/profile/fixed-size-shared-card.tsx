import React from "react";
import type { UserData as UserDataType } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";

// This is a specialized version of the card designed for the shared view
// with fixed dimensions and styling to ensure consistency
interface FixedSizeSharedCardProps {
  userData: UserDataType;
  cardType: string;
}

const FixedSizeSharedCard: React.FC<FixedSizeSharedCardProps> = ({
  userData,
  cardType,
}) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  if (cardType === "artistic") {
    return (
      <div style={{
        width: "100%", 
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(135deg, #43a6db 0%, #a370f1 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Profile picture */}
        <div style={{ 
          height: "140px", 
          position: "relative",
          backgroundImage: "linear-gradient(45deg, rgba(66, 153, 225, 0.6), rgba(129, 83, 240, 0.6))"
        }}>
          <div style={{
            position: "absolute",
            left: "50%",
            top: "70px",
            transform: "translateX(-50%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid white"
          }}>
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div style={{ 
          flex: 1, 
          padding: "48px 16px 16px 16px", 
          display: "flex", 
          flexDirection: "column"
        }}>
          {/* Name and title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ 
              fontSize: "22px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0",
              lineHeight: 1.2
            }}>
              {userData.name || "Your Name"}
            </h2>
            <p style={{ 
              fontSize: "14px", 
              opacity: 0.9,
              margin: 0,
              lineHeight: 1.2
            }}>
              {userData.title || "Professional"}
            </p>
          </div>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Domain */}
            {userData.domain && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Code size={14} style={{ opacity: 0.7 }} />
                <span>{userData.domain === "all" ? "General" : userData.domain}</span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Building2 size={14} style={{ opacity: 0.7 }} />
                <span>{userData.industry}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <MapPin size={14} style={{ opacity: 0.7 }} />
                <span>{userData.location}</span>
              </div>
            )}
            
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Mail size={14} style={{ opacity: 0.7 }} />
              <span>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Phone size={14} style={{ opacity: 0.7 }} />
              <span>{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Globe size={14} style={{ opacity: 0.7 }} />
              <span>{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          height: "30px", 
          backgroundColor: "rgba(255,255,255,0.1)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <span style={{ fontSize: "12px", fontWeight: "light" }}>Quantum Card</span>
        </div>
      </div>
    );
  }
  
  // Default to professional-renewed style for all other card types
  return (
    <div style={{
      width: "100%", 
      height: "100%",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      backgroundColor: "white",
      color: "#333",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Profile header section */}
      <div style={{ 
        height: "140px", 
        position: "relative",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{
          position: "absolute",
          left: "50%",
          top: "70px",
          transform: "translateX(-50%)",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid white",
          backgroundColor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {userData.photoURL ? (
            <img 
              src={userData.photoURL} 
              alt={userData.name || "Profile"} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}`;
              }}
            />
          ) : (
            <img 
              src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
              alt={userData.name || "Profile"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div style={{ 
        flex: 1, 
        padding: "48px 16px 16px 16px", 
        display: "flex", 
        flexDirection: "column"
      }}>
        {/* Name and title */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h2 style={{ 
            fontSize: "22px", 
            fontWeight: "bold", 
            margin: "0 0 4px 0",
            color: "#111827",
            lineHeight: 1.2
          }}>
            {userData.name || "Your Name"}
          </h2>
          <p style={{ 
            fontSize: "14px", 
            color: "#6b7280",
            margin: 0,
            lineHeight: 1.2
          }}>
            {userData.title || "Professional"}
          </p>
        </div>
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Domain */}
          {userData.domain && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Code size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "#4b5563" }}>{userData.domain === "all" ? "General" : userData.domain}</span>
            </div>
          )}
          
          {/* Industry */}
          {userData.industry && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Building2 size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "#4b5563" }}>{userData.industry}</span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <MapPin size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "#4b5563" }}>{userData.location}</span>
            </div>
          )}
          
          {/* Email */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <Mail size={14} style={{ color: "#3b82f6" }} />
            <span style={{ color: "#4b5563" }}>{userData.email}</span>
          </div>
          
          {/* Phone */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <Phone size={14} style={{ color: "#3b82f6" }} />
            <span style={{ color: "#4b5563" }}>{userData.phoneNumber || "Add phone number"}</span>
          </div>
          
          {/* Profile Link */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <Globe size={14} style={{ color: "#3b82f6" }} />
            <span style={{ color: "#3b82f6" }}>{profileLink}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        height: "30px", 
        backgroundColor: "#3b82f6", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <span style={{ fontSize: "12px", fontWeight: "light", color: "white" }}>Quantum Card</span>
      </div>
    </div>
  );
};

export default FixedSizeSharedCard;