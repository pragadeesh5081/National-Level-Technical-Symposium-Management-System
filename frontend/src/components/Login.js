import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

const Login = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'setup'
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: form.username,
        password: form.password,
      });
      login(res.data.token, res.data.admin);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/setup`, form);
      setSuccess(res.data.message + ' Please log in now.');
      setMode('login');
      setForm({ username: form.username, password: '', email: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">
        {/* Logo / Branding */}
        <div className="login-brand">
          <div className="login-logo">🎓</div>
          <h1 className="login-title">Symposium Admin</h1>
          <p className="login-subtitle">National Level Technical Symposium Management System</p>
        </div>

        {/* Tab Switcher */}
        <div className="login-tabs">
          <button
            className={`login-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            className={`login-tab-btn ${mode === 'setup' ? 'active' : ''}`}
            onClick={() => { setMode('setup'); setError(''); setSuccess(''); }}
          >
            First-Time Setup
          </button>
        </div>

        {/* Alerts */}
        {error && <div className="login-alert login-alert-error">⚠️ {error}</div>}
        {success && <div className="login-alert login-alert-success">✅ {success}</div>}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="login-username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : 'Sign In →'}
            </button>
          </form>
        )}

        {/* Setup Form */}
        {mode === 'setup' && (
          <form onSubmit={handleSetup} className="login-form">
            <div className="login-notice">
              ℹ️ Use this only once to create the first admin account.
            </div>

            <div className="login-field">
              <label htmlFor="setup-username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  id="setup-username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="setup-email">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉️</span>
                <input
                  id="setup-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="setup-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  id="setup-password"
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="login-btn login-btn-setup" disabled={loading}>
              {loading ? <span className="login-spinner" /> : 'Create Admin Account →'}
            </button>
          </form>
        )}

        <p className="login-footer">© 2025 Symposium Management System</p>
      </div>
    </div>
  );
};

export default Login;
