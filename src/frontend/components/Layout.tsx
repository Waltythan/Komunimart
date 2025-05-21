// src/frontend/components/Layout.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useLocation, useParams } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const params = useParams<{ groupId?: string, postId?: string }>();
  const [subtitle, setSubtitle] = useState<string | undefined>();
  
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
  }, [path, params]);
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Navbar subtitle={subtitle} />
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;
