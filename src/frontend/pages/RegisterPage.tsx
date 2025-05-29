import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

export default function RegisterPage() {
  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{uname?: string, email?: string, password?: string}>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {uname?: string, email?: string, password?: string} = {};
    
    // Username validation
    if (!uname) {
      newErrors.uname = 'Username is required';
    } else if (uname.length < 3) {
      newErrors.uname = 'Username must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uname, email, password }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }
        alert('Registration successful!');
      navigate('/login');
    } catch (err: any) {
      alert('Registration failed: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>Register - Komunimart</h1>
      <div className="form-field">
        <input 
          type="text" 
          placeholder="Username" 
          value={uname}
          onChange={e => setUname(e.target.value)} 
          className={errors.uname ? "error" : ""}
        />
        {errors.uname && <div className="error-message">{errors.uname}</div>}
      </div>
      
      <div className="form-field">
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={e => setEmail(e.target.value)} 
          className={errors.email ? "error" : ""}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="form-field">
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          className={errors.password ? "error" : ""}
        />
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>
      
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
}