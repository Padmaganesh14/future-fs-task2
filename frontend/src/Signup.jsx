import React, { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, Activity, Key, ShieldCheck } from 'lucide-react';

// Auto-detect API URL. In production (Render), it hits the same domain. Locally, it hits 5000.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

function Signup({ onSwitchToLogin, onSignupSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/signup`, { email, password });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminEmail', email);
        onSignupSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
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
            background: 'rgba(157, 80, 187, 0.1)', 
            padding: '1.2rem', 
            borderRadius: '24px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(157, 80, 187, 0.2)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            {step === 1 ? <ShieldCheck size={36} color="var(--neon-purple)" /> : <CheckCircle size={36} color="var(--success)" />}
          </div>
          <h1 style={{ 
            fontSize: '2.2rem', 
            background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))', 
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
            {step === 1 ? "Initialize Admin Account" : "Identity Verification"}
          </p>
        </div>
        
        {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {message && <div style={{ backgroundColor: 'rgba(63, 185, 80, 0.1)', color: 'var(--success)', border: '1px solid rgba(63, 185, 80, 0.2)', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> Admin Email</label>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={14} /> Access Password</label>
              <input 
                type="password" 
                className="form-input" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength="6"
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', padding: '1.1rem', justifyContent: 'center', background: 'linear-gradient(45deg, var(--neon-purple), #7b2ff7)', boxShadow: '0 4px 15px rgba(157, 80, 187, 0.3)' }} disabled={loading}>
              {loading ? <div className="loader" style={{ width: '24px', height: '24px' }}></div> : "Request Verification"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>Enter 6-digit Protocol Code</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '8px', width: '100%', fontWeight: 700, background: 'rgba(255,255,255,0.05)' }}
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', padding: '1.1rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? <div className="loader" style={{ width: '24px', height: '24px' }}></div> : "Authorize & Login"}
            </button>
            <button 
              type="button" 
              className="btn btn-cancel" 
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', border: 'none' }} 
              onClick={() => { setStep(1); setOtp(''); }}
            >
              Back to Configuration
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          System account exists? <span onClick={onSwitchToLogin} style={{ color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Secure Login</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
