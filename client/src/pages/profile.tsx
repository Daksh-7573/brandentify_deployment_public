// This file is no longer used - replaced by profile-neo.tsx
// We're keeping a minimal implementation here to avoid build issues
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/profile");
  }, [navigate]);
  
  return null;
}