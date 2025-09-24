export interface User {
  id: string;
  name: string;
  title: string;
  avatar: string;
  email: string;
  role: string;
  department: string;
  isOnline: boolean;
  lastActive: Date;
}