import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

export default function LoginPage() {
  const [uname, setUname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Replace with actual API later
      console.log('Logging in:', { uname, password });
      navigate('/groups');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h1>Komunimart</h1>
      <input type="text" placeholder="Username" onChange={e => setUname(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate('/register')}>Daftar</button>
    </div>
  );
}
