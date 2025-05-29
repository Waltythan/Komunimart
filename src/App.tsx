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
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages - no layout */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          {/* Pages with navbar layout */}
        <Route path="/home" element={<Layout><HomePage /></Layout>} />
        <Route path="/groups" element={<Layout><GroupListPage /></Layout>} />
        <Route path="/groups/new" element={<Layout><NewGroupPage /></Layout>} />
        <Route path="/groups/:groupId" element={<Layout><GroupDetailPage /></Layout>} />
        <Route path="/groups/:groupId/new-post" element={<Layout><NewPostPage /></Layout>} />
        <Route path="/post/:postId" element={<Layout><PostDetail /></Layout>} />
        <Route path="/post/:postId/comments" element={<Layout><div>Post Comments</div></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="*" element={<Layout><div>404 Not Found</div></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
