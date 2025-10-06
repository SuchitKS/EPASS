document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  // Backend URL
  const API_BASE = 'https://epass-backend.onrender.com';

  // Toggle between sign in and sign up forms
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });

  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });

  // Handle Sign In
  const signInButton = document.querySelector('.sign-in button[type="button"]');
  if (signInButton) {
    signInButton.addEventListener("click", handleSignIn);
  }

  // Handle Sign Up
  const signUpButton = document.querySelector('.sign-up button[type="button"]');
  if (signUpButton) {
    signUpButton.addEventListener("click", handleSignUp);
  }

  // Check if user is already logged in
  checkAuthStatus();

  // Sign In Function
  async function handleSignIn() {
    const usnInput = document.getElementById("usn");
    const passwordInput = document.getElementById("password");

    if (!usnInput || !passwordInput) {
      showMessage("Login form elements not found.", true);
      return;
    }

    const usn = usnInput.value.trim();
    const password = passwordInput.value;

    if (!usn || !password) {
      showMessage("Please fill in all fields", true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usn, password })
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Welcome back, ${data.userName}!`);
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        
        setTimeout(() => {
          window.location.href = 'events.html';
        }, 1500);
      } else {
        showMessage(data.error, true);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showMessage('Network error. Please try again.', true);
    }
  }

  // Sign Up Function
  async function handleSignUp() {
    const signUpForm = document.querySelector('.sign-up form');
    const inputs = signUpForm.querySelectorAll('input');
    
    const name = inputs[0].value.trim();
    const usn = inputs[1].value.trim().toUpperCase();
    const sem = parseInt(inputs[2].value);
    const mobno = inputs[3].value.trim();
    const email = inputs[4].value.trim();
    const password = inputs[5].value;

    // Basic validation
    if (!name || !usn || !sem || !mobno || !email || !password) {
      showMessage("Please fill in all fields", true);
      return;
    }

    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(usn)) {
      showMessage("Invalid USN format. Example: 1BM23CS101", true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showMessage("Please enter a valid email address", true);
      return;
    }

    if (!/^\d{10}$/.test(mobno)) {
      showMessage("Please enter a valid 10-digit mobile number", true);
      return;
    }

    if (sem < 1 || sem > 8) {
      showMessage("Semester must be between 1 and 8", true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, usn, sem, mobno, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.error || 'Failed to sign up. Please try again.', true);
        return;
      }

      const data = await response.json();

      if (data.success) {
        showMessage(`Account created successfully! Welcome, ${data.userName}!`);
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        
        signUpForm.reset();
        
        setTimeout(() => {
          window.location.href = 'events.html';
        }, 2000);
      } else {
        showMessage(data.error, true);
      }
    } catch (error) {
      console.error('Signup network error:', error);
      showMessage('Network error during signup. Please check your connection and try again.', true);
    }
  }

  // Check if user is already authenticated
  async function checkAuthStatus() {
    try {
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        window.location.href = 'events.html';
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  }

  // Show message function (unchanged)
  function showMessage(text, isError = false) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = text;
    
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: normal;
      z-index: 1000;
      animation: slideIn 0.3s ease-in-out;
      ${isError ? 'background-color:rgb(225, 108, 95);' : 'background-color:rgb(114, 221, 158);'}
    `;

    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style');
      style.id = 'message-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // Handle Enter key press in forms
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      if (container.classList.contains('active')) {
        handleSignUp();
      } else {
        handleSignIn();
      }
    }
  });
});
