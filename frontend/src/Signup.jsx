import React, { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000';

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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(88, 166, 255, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            {step === 1 ? <Mail size={32} color="#58a6ff" /> : <CheckCircle size={32} color="#58a6ff" />}
          </div>
          <h1 style={{ fontSize: '1.8rem', background: '-webkit-linear-gradient(45deg, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Nexus CRM
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {step === 1 ? "Create Admin Account" : "Verify Your Email"}
          </p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ backgroundColor: 'rgba(46, 160, 67, 0.1)', color: '#2ea043', border: '1px solid rgba(46, 160, 67, 0.4)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
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
                minLength="6"
              />
            </div>
            <button type="submit" className="btn btn-login" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? "Sending..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Enter 6-digit OTP</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
              />
            </div>
            <button type="submit" className="btn btn-login" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button 
              type="button" 
              className="btn btn-cancel" 
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} 
              onClick={() => { setStep(1); setOtp(''); }}
            >
              Go Back
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <span onClick={onSwitchToLogin} style={{ color: '#58a6ff', cursor: 'pointer', fontWeight: 600 }}>Login here</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
