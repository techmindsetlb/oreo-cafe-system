import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('employee', JSON.stringify(response.data.employee));
      navigate('/pos');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1><i className="fa-solid fa-mug-hot"></i> Cue Corner</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
          <div className="form-group">
            <label><i className="fa-solid fa-envelope"></i> Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label><i className="fa-solid fa-lock"></i> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Signing in...</> : <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>}
          </button>
        </form>
        <div className="login-footer">
          
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
