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
