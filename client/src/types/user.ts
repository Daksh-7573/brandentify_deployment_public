// Common user data interface used across components
export interface UserData {
  id: number;
  username: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  lookingFor: string | null;
  phoneNumber: string | null;
  company?: string | null; // Optional company name
}