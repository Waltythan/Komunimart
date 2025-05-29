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

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || 'Login failed');
      }
      storeSessionData(responseData.token); // Store the token in sessionStorage

      alert(`Welcome, ${responseData.user.uname}!`);
      navigate('/home'); // Redirect to home page after successful login
    } catch (err: any) {
      alert('❌ '+ (err.message || 'Login failed'));
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
