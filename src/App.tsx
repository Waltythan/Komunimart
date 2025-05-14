// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GroupListPage from './pages/GroupList';
import MainPage from './pages/MainPage';
import PostDetailPage from './pages/PostDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/:groupId" element={<MainPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/post/:postId" element={<div>Post Detail</div>} />
        <Route path="/post/:postId/comments" element={<div>Post Comments</div>} />
      </Routes>
    </Router>
  );
}

export default App;
