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
              <a 
                href={`/${userData.brandName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}
              >
                {profileLink}
              </a>
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
  
  // Handle different card types
  if (cardType === "neoglow") {
    return (
      <div style={{
        width: "100%", 
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(to bottom, #111827, #1e293b)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Profile header with neon border */}
        <div style={{ 
          height: "140px", 
          position: "relative",
          backgroundColor: "#0c1222",
          borderBottom: "2px solid #0ea5e9"
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
            border: "4px solid #0ea5e9",
            boxShadow: "0 0 15px #0ea5e9",
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
              color: "#ffffff",
              textShadow: "0 0 10px #0ea5e9",
              lineHeight: 1.2
            }}>
              {userData.name || "Your Name"}
            </h2>
            <p style={{ 
              fontSize: "14px", 
              color: "#94a3b8",
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
                <Code size={14} style={{ color: "#0ea5e9" }} />
                <span style={{ color: "#cbd5e1" }}>{userData.domain === "all" ? "General" : userData.domain}</span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Building2 size={14} style={{ color: "#0ea5e9" }} />
                <span style={{ color: "#cbd5e1" }}>{userData.industry}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <MapPin size={14} style={{ color: "#0ea5e9" }} />
                <span style={{ color: "#cbd5e1" }}>{userData.location}</span>
              </div>
            )}
            
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Mail size={14} style={{ color: "#0ea5e9" }} />
              <span style={{ color: "#cbd5e1" }}>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Phone size={14} style={{ color: "#0ea5e9" }} />
              <span style={{ color: "#cbd5e1" }}>{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Globe size={14} style={{ color: "#0ea5e9" }} />
              <span style={{ color: "#0ea5e9" }}>{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          height: "30px", 
          backgroundColor: "rgba(14, 165, 233, 0.2)", 
          borderTop: "1px solid #0ea5e9",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <span style={{ fontSize: "12px", fontWeight: "light", color: "#0ea5e9", textShadow: "0 0 5px #0ea5e9" }}>Quantum Card</span>
        </div>
      </div>
    );
  } else if (cardType === "3d-animated") {
    return (
      <div style={{
        width: "100%", 
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)",
        background: "linear-gradient(135deg, #e2e8f0, #f8fafc)",
        color: "#334155",
        display: "flex",
        flexDirection: "column",
        transform: "perspective(1000px) rotateX(5deg) rotateY(-5deg)",
      }}>
        {/* Profile header section */}
        <div style={{ 
          height: "140px", 
          position: "relative",
          background: "linear-gradient(135deg, #60a5fa, #3b82f6)"
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
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
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
          flexDirection: "column",
          backgroundColor: "white"
        }}>
          {/* Name and title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ 
              fontSize: "22px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0",
              color: "#334155",
              lineHeight: 1.2
            }}>
              {userData.name || "Your Name"}
            </h2>
            <p style={{ 
              fontSize: "14px", 
              color: "#64748b",
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
                <span style={{ color: "#64748b" }}>{userData.domain === "all" ? "General" : userData.domain}</span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Building2 size={14} style={{ color: "#3b82f6" }} />
                <span style={{ color: "#64748b" }}>{userData.industry}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <MapPin size={14} style={{ color: "#3b82f6" }} />
                <span style={{ color: "#64748b" }}>{userData.location}</span>
              </div>
            )}
            
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Mail size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "#64748b" }}>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Phone size={14} style={{ color: "#3b82f6" }} />
              <span style={{ color: "#64748b" }}>{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Globe size={14} style={{ color: "#3b82f6" }} />
              <a 
                href={`/${userData.brandName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}
              >
                {profileLink}
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          height: "30px", 
          background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <span style={{ fontSize: "12px", fontWeight: "light", color: "white" }}>Quantum Card</span>
        </div>
      </div>
    );
  } else if (cardType === "creative") {
    return (
      <div style={{
        width: "100%", 
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(135deg, #f9a8d4, #f472b6)",
        color: "#701a75",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Profile header section */}
        <div style={{ 
          height: "140px", 
          position: "relative",
          backgroundColor: "rgba(255, 255, 255, 0.3)"
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
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
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
          flexDirection: "column",
          backgroundColor: "rgba(255, 255, 255, 0.7)"
        }}>
          {/* Name and title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ 
              fontSize: "22px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0",
              color: "#9d174d",
              lineHeight: 1.2
            }}>
              {userData.name || "Your Name"}
            </h2>
            <p style={{ 
              fontSize: "14px", 
              color: "#be185d",
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
                <Code size={14} style={{ color: "#db2777" }} />
                <span style={{ color: "#831843" }}>{userData.domain === "all" ? "General" : userData.domain}</span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Building2 size={14} style={{ color: "#db2777" }} />
                <span style={{ color: "#831843" }}>{userData.industry}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <MapPin size={14} style={{ color: "#db2777" }} />
                <span style={{ color: "#831843" }}>{userData.location}</span>
              </div>
            )}
            
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Mail size={14} style={{ color: "#db2777" }} />
              <span style={{ color: "#831843" }}>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Phone size={14} style={{ color: "#db2777" }} />
              <span style={{ color: "#831843" }}>{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Globe size={14} style={{ color: "#db2777" }} />
              <span style={{ color: "#db2777" }}>{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          height: "30px", 
          backgroundColor: "#db2777", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <span style={{ fontSize: "12px", fontWeight: "light", color: "white" }}>Quantum Card</span>
        </div>
      </div>
    );
  } else if (cardType === "holographic") {
    return (
      <div style={{
        width: "100%", 
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Profile header section */}
        <div style={{ 
          height: "140px", 
          position: "relative",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
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
            border: "4px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
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
          flexDirection: "column",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))"
        }}>
          {/* Name and title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ 
              fontSize: "22px", 
              fontWeight: "bold", 
              margin: "0 0 4px 0",
              color: "#0f172a",
              lineHeight: 1.2
            }}>
              {userData.name || "Your Name"}
            </h2>
            <p style={{ 
              fontSize: "14px", 
              color: "#334155",
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
                <Code size={14} style={{ color: "#64748b" }} />
                <span style={{ color: "#334155" }}>{userData.domain === "all" ? "General" : userData.domain}</span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <Building2 size={14} style={{ color: "#64748b" }} />
                <span style={{ color: "#334155" }}>{userData.industry}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <MapPin size={14} style={{ color: "#64748b" }} />
                <span style={{ color: "#334155" }}>{userData.location}</span>
              </div>
            )}
            
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Mail size={14} style={{ color: "#64748b" }} />
              <span style={{ color: "#334155" }}>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Phone size={14} style={{ color: "#64748b" }} />
              <span style={{ color: "#334155" }}>{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <Globe size={14} style={{ color: "#64748b" }} />
              <a 
                href={`/${userData.brandName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}
              >
                {profileLink}
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          height: "30px", 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <span style={{ fontSize: "12px", fontWeight: "light", color: "#334155" }}>Quantum Card</span>
        </div>
      </div>
    );
  }
  
  // Default to professional-renewed style
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