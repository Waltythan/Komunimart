// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/pages/LoginPage';
import RegisterPage from './pages/pages/RegisterPage';
import GroupListPage from './pages/pages/GroupList';
import MainPage from './pages/pages/MainPage';
import GroupDetailPage from './pages/pages/GroupDetail';
import NewPostPage from './pages/pages/NewPostPage';
import NewGroupPage from './pages/pages/NewGroupPage'; // Tambahkan import
import PostDetail from './pages/pages/PostDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/new" element={<NewGroupPage />} /> {/* Tambahkan ini */}
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/groups/:groupId/new-post" element={<NewPostPage />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/post/:postId/comments" element={<div>Post Comments</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
