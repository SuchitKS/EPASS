import React, { useEffect } from 'react';
import './style.css';

export default function Index() {
  useEffect(() => {
    // You can move the script.js logic here if needed
    // For now, just a placeholder for any side effects
  }, []);

  return (
    <div className="container" id="container">
      <div className="form-container sign-up">
        <form>
          <h1>Create Account</h1>
          <input type="text" placeholder="Name" />
          <input type="text" placeholder="USN" />
          <input type="number" placeholder="Sem" />
          <input type="number" placeholder="Mobile No" />
          <input type="text" placeholder="email ID" />
          <input type="password" placeholder="Password" />
          <button type="button">Sign Up</button>
        </form>
      </div>
      <div className="form-container sign-in">
        <form>
          <h1>Sign In</h1>
          <div className="social-icons">
            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
          <input type="text" placeholder="USN" id="usn" />
          <input type="password" placeholder="Password" id="password" />
          <a href="#">Forgot Your Password?</a>
          <button type="button">Sign In</button>
        </form>
      </div>
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className="hidden" id="login">Sign In</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to Create New Account</p>
            <button className="hidden" id="register">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}
