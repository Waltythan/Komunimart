// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './frontend/pages/LoginPage';
import RegisterPage from './frontend/pages/RegisterPage';
import GroupListPage from './frontend/pages/GroupList';
import MainPage from './frontend/pages/MainPage';
import GroupDetailPage from './frontend/pages/GroupDetail';
import NewPostPage from './frontend/pages/NewPostPage';
import NewGroupPage from './frontend/pages/NewGroupPage';
import PostDetail from './frontend/pages/PostDetail';
import ProfilePage from './frontend/pages/ProfilePage';
import HomePage from './frontend/pages/HomePage';

import Layout from './frontend/components/Layout';
import ProtectedRoute from './frontend/components/ProtectedRoute';
import AuthRoute from './frontend/components/AuthRoute';
import RootRedirect from './frontend/components/RootRedirect';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route - automatically redirects based on session */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth pages - redirect to home if already logged in */}
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        
        {/* Protected pages - require authentication */}
        <Route path="/home" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Layout><GroupListPage /></Layout></ProtectedRoute>} />
        <Route path="/groups/new" element={<ProtectedRoute><Layout><NewGroupPage /></Layout></ProtectedRoute>} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><Layout><GroupDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/groups/:groupId/new-post" element={<ProtectedRoute><Layout><NewPostPage /></Layout></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><Layout><PostDetail /></Layout></ProtectedRoute>} />
        <Route path="/post/:postId/comments" element={<ProtectedRoute><Layout><div>Post Comments</div></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<ProtectedRoute><Layout><div>404 Not Found</div></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
