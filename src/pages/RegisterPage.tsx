import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

export default function RegisterPage() {
  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!uname || !email || !password) {
      alert('All fields are required');
      return;
    }

    try {
      // This will need to be connected to your real API
      console.log('Registering:', { uname, email, password });
      
      // For now, just navigate to login page after "registration"
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h1>Register - Komunimart</h1>
      <input 
        type="text" 
        placeholder="Username" 
        value={uname}
        onChange={e => setUname(e.target.value)} 
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={e => setPassword(e.target.value)} 
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
}