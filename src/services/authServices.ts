// Function to store token in sessionStorage
export const storeSessionData = (token: string) => {
  sessionStorage.setItem('token', token);
};

// Function to retrieve token from sessionStorage
export const getSessionData = (): string | null => {
  return sessionStorage.getItem('token');
};

// Function to clear session data from sessionStorage
export const clearSessionData = () => {
  sessionStorage.removeItem('token');
  // Also clear any user-related data
  sessionStorage.removeItem('current_username');
};
