import { useState } from 'react';
import '../styles/Login.css';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log(data);
      

      if (response.ok) {
        // Store the access token in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('full_name', data.full_name);
        
        // Redirect to dashboard or home page
        // window.location.href = '/';
         // ✅ Show success notification
        showSuccess('Login successful! Redirecting...', 4000);

      // Optionally redirect after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        const message = data?.error || data?.message || 'Login failed. Please try again.';
        setError(message);
        showError(message, 5000); // ❌ Show error notification
      }
    } catch (err) {
      const message = 'An error occurred. Please try again later.';
      setError(message);
      showError(message, 5000); // ❌ Show error notification

    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to your account to continue</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* {error && <div className="error-message">{error}</div>} */}
          
          <div className="form-group">
            <label htmlFor="email">
              Email address
              <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="remember-forgot">
            {/* <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label> */}
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <div className="divider">
          <span>Simple and secure</span>
        </div>

        <div className="signup-prompt">
          Don't have an account?
          <a href="/signup" className="signup-link">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 