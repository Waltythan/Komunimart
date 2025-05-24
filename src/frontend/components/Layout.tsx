// src/frontend/components/Layout.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const params = useParams<{ groupId?: string, postId?: string }>();
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [groups, setGroups] = useState<any[]>([]);
  
  // Don't show navbar on authentication pages
  const isAuthPage = path === '/' || path === '/register';
  
  useEffect(() => {
    const fetchPageData = async () => {
      // Group Detail Page
      if (path.includes('/groups/') && params.groupId && !path.includes('new-post') && !path.includes('new')) {
        try {
          const res = await fetch(`http://localhost:3000/groups`);
          if (res.ok) {
            const groups = await res.json();
            const group = groups.find((g: any) => String(g.group_id) === params.groupId);
            if (group) {
              setSubtitle(`Grup: ${group.name}`);
              return;
            }
          }
        } catch (err) {
          console.error('Error fetching group details for navbar:', err);
        }
        setSubtitle('Detail Grup');
      } 
      // Post Detail Page
      else if (path.includes('/post/') && params.postId) {
        try {
          const res = await fetch(`http://localhost:3000/posts/${params.postId}`);
          if (res.ok) {
            const post = await res.json();
            setSubtitle(`Post: ${post.title}`);
            return;
          }
        } catch (err) {
          console.error('Error fetching post details for navbar:', err);
        }
        setSubtitle('Detail Postingan');
      } 
      // Other pages with static subtitles
      else if (path.includes('new-post')) {
        setSubtitle('Buat Postingan Baru');
      } else if (path.includes('/groups/new')) {
        setSubtitle('Buat Grup Baru');
      } else if (path === '/profile') {
        setSubtitle('Profil Saya');
      } else if (path === '/groups') {
        setSubtitle('Daftar Grup');
      }
    };
    
    fetchPageData();
    
    // Fetch groups for sidebar
    if (!isAuthPage) {
      const fetchGroups = async () => {
        try {
          const res = await fetch('http://localhost:3000/groups');
          if (res.ok) {
            const data = await res.json();
            setGroups(data.slice(0, 5)); // Show just first 5 groups in sidebar
          }
        } catch (error) {
          console.error('Failed to fetch groups for sidebar:', error);
        }
      };
      
      fetchGroups();
    }
  }, [path, params, isAuthPage]);
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="layout-container">
      <Navbar subtitle={subtitle} />
      <div className="content-wrapper">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Your Shortcuts</h3>
            </div>
            <div className="sidebar-menu">
              <Link to="/profile" className="sidebar-item">
                <div className="sidebar-icon profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                </div>
                <span>My Profile</span>
              </Link>
              <Link to="/groups" className="sidebar-item">
                <div className="sidebar-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                  </svg>
                </div>
                <span>All Groups</span>
              </Link>
              <Link to="/groups/new" className="sidebar-item">
                <div className="sidebar-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </div>
                <span>Create Group</span>
              </Link>
            </div>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Your Groups</h3>
            </div>
            <div className="sidebar-menu groups-menu">
              {groups.map(group => (
                <Link 
                  to={`/groups/${group.group_id}`} 
                  key={group.group_id} 
                  className="sidebar-item group-item"
                >
                  <div className="sidebar-group-image">
                    {group.image_url ? (
                      <img 
                        src={`http://localhost:3000/uploads/groups/${group.image_url}`}
                        alt={group.name}
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="#E4E6EA"/><text x="20" y="26" text-anchor="middle" fill="#65676B" font-family="Arial" font-size="16" font-weight="bold">${group.name.charAt(0)}</text></svg>`)}`;
                        }}
                      />
                    ) : (
                      <div className="group-image-fallback">{group.name.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <span>{group.name}</span>
                </Link>
              ))}
              <Link to="/groups" className="sidebar-item see-all-link">
                <div className="sidebar-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
                  </svg>
                </div>
                <span>See All Groups</span>
              </Link>
            </div>
          </div>
          
          <footer className="sidebar-footer">
            <p>© 2025 Komunimart</p>
          </footer>
        </aside>
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
