import React, { useState } from 'react';
import axios from 'axios';
import { Lock } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminEmail', res.data.email);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(88, 166, 255, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Lock size={32} color="#58a6ff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', background: '-webkit-linear-gradient(45deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Nexus CRM
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Admin Portal Login</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexuscrm.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-login" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <span onClick={onSwitchToSignup} style={{ color: '#58a6ff', cursor: 'pointer', fontWeight: 600 }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
