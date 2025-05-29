# Komunimart API Services

This directory contains centralized services for interacting with the Komunimart backend API.

## Services Overview

### apiClient.ts
The core API client that handles authentication, request formatting, and error handling.

```typescript
import apiFetch from './apiClient';

// Basic usage
const data = await apiFetch('/endpoint-path');

// With options
const result = await apiFetch('/posts', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Post' })
});

// For public endpoints
const publicData = await apiFetch('/public-endpoint', { allowUnauthenticated: true });
```

### authServices.ts
Handles authentication and user sessions.

```typescript
import { login, register, getSessionData } from './authServices';

// Login
const userData = await login('username', 'password');

// Register
await register('username', 'email@example.com', 'password');

// Get current session token
const token = getSessionData();
```

### userServices.ts
User-related operations.

```typescript
import { getUserProfile, updateUserProfile } from './userServices';

// Get user profile
const profile = await getUserProfile('user-id');

// Update profile
const formData = new FormData();
formData.append('profile_image', imageFile);
await updateUserProfile(formData);
```

### postServices.ts
Post and comment operations.

```typescript
import { createPost, getProtectedPostById, addPostLike } from './postServices';

// Create a post
const formData = new FormData();
formData.append('title', 'My Post');
formData.append('content', 'Post content');
formData.append('image', imageFile);
const post = await createPost(formData);

// Get post by ID
const post = await getProtectedPostById('post-id');

// Like a post
await addPostLike('post-id', 'user-id');
```

### groupServices.ts
Group operations.

```typescript
import { createGroup, getGroupById, updateGroup } from './groupServices';

// Create a group
const formData = new FormData();
formData.append('name', 'Group Name');
formData.append('description', 'Group description');
const group = await createGroup(formData);

// Get group by ID
const group = await getGroupById('group-id');
```

### membershipServices.ts
Group membership operations.

```typescript
import { joinGroup, leaveGroup, getUserGroups } from './membershipServices';

// Join a group
await joinGroup('group-id', 'user-id');

// Leave a group
await leaveGroup('group-id', 'user-id');

// Get user's groups
const groups = await getUserGroups('user-id');
```

### bookmarkServices.ts
Bookmark operations.

```typescript
import { addBookmark, removeBookmark, getBookmarks } from './bookmarkServices';

// Add bookmark
await addBookmark('post-id');

// Remove bookmark
await removeBookmark('post-id');

// Get user's bookmarks
const bookmarks = await getBookmarks();
```

### searchServices.ts
Search operations.

```typescript
import { searchContent, getSearchSuggestions } from './searchServices';

// Search for content
const results = await searchContent('query', 'all', 20);

// Get search suggestions
const suggestions = await getSearchSuggestions('query', 5);
```

## Centralized Import
You can import from the index file to get all services:

```typescript
import { 
  getUserProfile, 
  createPost, 
  joinGroup 
} from '../services';
```
