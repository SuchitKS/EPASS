import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import '../styles/Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    sem: '',
    mobno: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { api, clearMessages } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isSignUp) {
      // Validate form data for signup
      if (!formData.name || !formData.usn || !formData.sem || !formData.mobno || !formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (!/^1BM\d{2}[A-Z]{2}\d{3}$/i.test(formData.usn)) {
        throw new Error('Invalid USN format. Example: 1BM23CS101');
      }

      if (!/^\d{10}$/.test(formData.mobno)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
    } else {
      // Validate form data for login
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    clearMessages();

    try {
      validateForm();

      if (isSignUp) {

        if (parseInt(formData.sem) < 1 || parseInt(formData.sem) > 8) {
          throw new Error('Semester must be between 1 and 8');
        }

        const { data, error } = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          usn: formData.usn,
          semester: formData.sem,
          phone: formData.mobno
        });

        if (error) throw new Error(error);
        
        // Auto-login after successful registration
        const loginResponse = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.success) {
          navigate(from, { replace: true });
        }
      } else {
        // Handle login
        if (!formData.usn || !formData.password) {
          throw new Error('Please enter USN and password');
        }

        const { success, data, error } = await api.login(
          formData.usn.toUpperCase(),
          formData.password
        );

        if (success) {
          setIsAuthenticated(true);
          navigate('/events');
        } else {
          throw new Error(error || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className={`container ${isSignUp ? 'active' : ''}`} id="container">
      <div className="form-container sign-up">
        <form onSubmit={handleSubmit}>
          <h1>Create Account</h1>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="text"
            name="usn"
            placeholder="USN"
            value={formData.usn}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="number"
            name="sem"
            placeholder="Semester"
            min="1"
            max="8"
            value={formData.sem}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="tel"
            name="mobno"
            placeholder="Mobile No"
            value={formData.mobno}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div className="form-container sign-in">
        <form onSubmit={handleSubmit}>
          <h1>Sign In</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="social-icons">
            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
          <input
            type="text"
            name="usn"
            placeholder="USN"
            value={formData.usn}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <a href="#">Forgot Your Password?</a>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className="hidden" id="login" onClick={toggleForm}>
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to Create New Account</p>
            <button className="hidden" id="register" onClick={toggleForm}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
