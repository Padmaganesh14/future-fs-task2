import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Activity, Mail, Key } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            background: 'rgba(0, 210, 255, 0.1)', 
            padding: '1.2rem', 
            borderRadius: '24px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(0, 210, 255, 0.2)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <Lock size={36} color="var(--neon-blue)" />
          </div>
          <h1 style={{ 
            fontSize: '2.2rem', 
            background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-cyan))', 
            WebkitBackgroundClip: 'text', 
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem'
          }}>
            <Activity size={32} color="var(--neon-blue)" /> Nexus CRM
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '1rem', fontWeight: 500 }}>
            Secure Admin Portal Access
          </p>
        </div>
        
        {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexuscrm.ai"
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={14} /> Security Password
            </label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn btn-login" style={{ width: '100%', padding: '1.1rem', justifyContent: 'center', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? <div className="loader" style={{ width: '24px', height: '24px' }}></div> : 'Enter Dashboard'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          System Authorization required. <span onClick={onSwitchToSignup} style={{ color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Request Access</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
