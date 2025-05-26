// src/services/userServices.ts
import { jwtDecode } from "jwt-decode";
import { getSessionData } from "./authServices";

export interface DecodedToken {
  userId: string;
  username: string;
  // add more fields if needed
}

export function getCurrentUserId(): string | null {
  const token = getSessionData();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.userId;
  } catch {
    return null;
  }
}

export function getCurrentUsername(): string | null {
  const token = getSessionData();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.username;
  } catch {
    return null;
  }
}

// Function to get user details by ID
export async function getUserById(userId: string): Promise<any> {
  try {
    const token = getSessionData();
    const response = await fetch(`http://localhost:3000/debug/users`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const users = await response.json();
    const user = users.find((u: any) => u.user_id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
