// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // bisa email atau username
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Deteksi apakah input berupa email atau username
      const isEmail = identifier.includes('@');
      
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Kirim field yang sesuai berdasarkan input
          ...(isEmail ? { email: identifier } : { uname: identifier }),
          password
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }

      const data = await res.json();
      console.log('✅ Login successful:', data);
      alert(`Welcome, ${data.user.uname}!`);
      navigate('/groups');
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>Komunimart</h1>
      <input
        type="text"
        placeholder="Email or Username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate('/register')}>Daftar</button>
    </div>
  );
}
