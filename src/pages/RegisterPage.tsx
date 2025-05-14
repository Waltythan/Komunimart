import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

export default function RegisterPage() {
  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Registering:', { uname, email, password });
      navigate('/');
    } catch (err) {
      alert('Register failed');
    }
  };

  return (
    <div className="auth-container">
      <h1>Nama Aplikasi</h1>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUname(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Daftar</button>
      <button onClick={() => navigate('/')}>Kembali ke Login</button>
    </div>
  );
}
