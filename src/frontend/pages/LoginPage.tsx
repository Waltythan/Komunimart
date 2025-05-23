// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';
import { storeSessionData } from '../../services/authServices';

export default function LoginPage() {
  const [uname, setUname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uname, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }

      console.log('Received data:', data);
      storeSessionData(data.token); // Store the token in sessionStorage
      
      console.log('✅ Login successful:', data);
      alert(`Welcome, ${data.user.uname}!`);
      navigate('/groups'); // TODO: Create group page
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>Komunimart</h1>
      <input
        type="text"
        placeholder="Uname"
        onChange={(e) => setUname(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate('/register')}>Daftar</button>
    </div>
  );
}
