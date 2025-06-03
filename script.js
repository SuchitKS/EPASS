document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

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
      const response = await fetch('http://localhost:3000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usn, password })
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Welcome back, ${data.userName}!`);
        // Store user info in sessionStorage for client-side access
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        
        // Redirect to events page after short delay
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

    // Validate USN format
    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(usn)) {
      showMessage("Invalid USN format. Example: 1BM23CS101", true);
      return;
    }

    // Validate email
    if (!/\S+@\S+\.\S+/.test(email)) {
      showMessage("Please enter a valid email address", true);
      return;
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobno)) {
      showMessage("Please enter a valid 10-digit mobile number", true);
      return;
    }

    // Validate semester
    if (sem < 1 || sem > 8) {
      showMessage("Semester must be between 1 and 8", true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, usn, sem, mobno, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Signup error response:', errorData);
        showMessage(errorData.error || 'Failed to sign up. Please try again.', true);
        return;
      }

      const data = await response.json();

      if (data.success) {
        showMessage(`Account created successfully! Welcome, ${data.userName}!`);
        // Store user info in sessionStorage
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        
        // Clear form
        signUpForm.reset();
        
        // Redirect to events page after short delay
        setTimeout(() => {
          window.location.href = 'events.html';
        }, 2000);
      } else {
        console.error('Signup failed:', data.error);
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
      const response = await fetch('http://localhost:3000/api/me');
      if (response.ok) {
        const data = await response.json();
        // User is already logged in, redirect to events page
        sessionStorage.setItem('userUSN', data.userUSN);
        sessionStorage.setItem('userName', data.userName);
        window.location.href = 'events.html';
      }
    } catch (error) {
      // User not authenticated, stay on login page
      console.log('User not authenticated');
    }
  }

  // Show message to user
  function showMessage(text, isError = false) {
    // Remove any existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = text;
    
    // Style the message
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

    // Add CSS animation
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

    // Remove message after 5 seconds
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
        // Sign up form is active
        handleSignUp();
      } else {
        // Sign in form is active
        handleSignIn();
      }
    }
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const container = document.getElementById("container");
//   const registerBtn = document.getElementById("register");
//   const loginBtn = document.getElementById("login");

//   // Toggle between sign in and sign up forms
//   registerBtn.addEventListener("click", () => {
//     container.classList.add("active");
//   });

//   loginBtn.addEventListener("click", () => {
//     container.classList.remove("active");
//   });

//   // Handle Sign In
//   const signInButton = document.querySelector('.sign-in button[type="button"]');
//   if (signInButton) {
//     signInButton.addEventListener("click", handleSignIn);
//   }

//   // Handle Sign Up
//   const signUpButton = document.querySelector('.sign-up button[type="button"]');
//   if (signUpButton) {
//     signUpButton.addEventListener("click", handleSignUp);
//   }

//   // Check if user is already logged in
//   checkAuthStatus();

//   // Sign In Function
//   async function handleSignIn() {
//     const usnInput = document.getElementById("usn");
//     const passwordInput = document.getElementById("password");

//     if (!usnInput || !passwordInput) {
//       showMessage("Login form elements not found.", true);
//       return;
//     }

//     const usn = usnInput.value.trim();
//     const password = passwordInput.value;

//     if (!usn || !password) {
//       showMessage("Please fill in all fields", true);
//       return;
//     }

//     try {
//       const response = await fetch('/api/signin', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ usn, password })
//       });

//       const data = await response.json();

//       if (data.success) {
//         showMessage(`Welcome back, ${data.userName}!`);
//         // Store user info in sessionStorage for client-side access
//         sessionStorage.setItem('userUSN', data.userUSN);
//         sessionStorage.setItem('userName', data.userName);
        
//         // Redirect to events page after short delay
//         setTimeout(() => {
//           window.location.href = 'events.html';
//         }, 1500);
//       } else {
//         showMessage(data.error, true);
//       }
//     } catch (error) {
//       console.error('Sign in error:', error);
//       showMessage('Network error. Please try again.', true);
//     }
//   }

//   // Sign Up Function
//   async function handleSignUp() {
//     const signUpForm = document.querySelector('.sign-up form');
//     const inputs = signUpForm.querySelectorAll('input');
    
//     const name = inputs[0].value.trim();
//     const usn = inputs[1].value.trim().toUpperCase();
//     const sem = inputs[2].value;
//     const mobno = inputs[3].value.trim();
//     const email = inputs[4].value.trim();
//     const password = inputs[5].value;

//     // Basic validation
//     if (!name || !usn || !sem || !mobno || !email || !password) {
//       showMessage("Please fill in all fields", true);
//       return;
//     }

//     // Validate USN format
//     if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(usn)) {
//       showMessage("Invalid USN format. Example: 1BM23CS101", true);
//       return;
//     }

//     // Validate email
//     if (!/\S+@\S+\.\S+/.test(email)) {
//       showMessage("Please enter a valid email address", true);
//       return;
//     }

//     // Validate mobile number
//     if (!/^\d{10}$/.test(mobno)) {
//       showMessage("Please enter a valid 10-digit mobile number", true);
//       return;
//     }

//     // Validate semester
//     if (sem < 1 || sem > 8) {
//       showMessage("Semester must be between 1 and 8", true);
//       return;
//     }

//     try {
//       const response = await fetch('/api/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, usn, sem, mobno, email, password })
//       });

//       const data = await response.json();

//       if (data.success) {
//         showMessage(`Account created successfully! Welcome, ${data.userName}!`);
//         // Store user info in sessionStorage
//         sessionStorage.setItem('userUSN', data.userUSN);
//         sessionStorage.setItem('userName', data.userName);
        
//         // Clear form
//         signUpForm.reset();
        
//         // Redirect to events page after short delay
//         setTimeout(() => {
//           window.location.href = 'events.html';
//         }, 2000);
//       } else {
//         showMessage(data.error, true);
//       }
//     } catch (error) {
//       console.error('Sign up error:', error);
//       showMessage('Network error. Please try again.', true);
//     }
//   }

//   // Check if user is already authenticated
//   async function checkAuthStatus() {
//     try {
//       const response = await fetch('/api/me');
//       if (response.ok) {
//         const data = await response.json();
//         // User is already logged in, redirect to events page
//         sessionStorage.setItem('userUSN', data.userUSN);
//         sessionStorage.setItem('userName', data.userName);
//         window.location.href = 'events.html';
//       }
//     } catch (error) {
//       // User not authenticated, stay on login page
//       console.log('User not authenticated');
//     }
//   }

//   // Show message to user
//   function showMessage(text, isError = false) {
//     // Remove any existing message
//     const existingMessage = document.querySelector('.message');
//     if (existingMessage) {
//       existingMessage.remove();
//     }

//     // Create new message element
//     const messageDiv = document.createElement('div');
//     messageDiv.className = `message ${isError ? 'error' : 'success'}`;
//     messageDiv.textContent = text;
    
//     // Style the message
//     messageDiv.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       padding: 15px 20px;
//       border-radius: 5px;
//       color: white;
//       font-weight: normal;
//       z-index: 1000;
//       animation: slideIn 0.3s ease-in-out;
//       ${isError ? 'background-color:rgb(225, 108, 95);' : 'background-color:rgb(114, 221, 158);'}
//     `;

//     // Add CSS animation
//     if (!document.querySelector('#message-styles')) {
//       const style = document.createElement('style');
//       style.id = 'message-styles';
//       style.textContent = `
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//       `;
//       document.head.appendChild(style);
//     }

//     document.body.appendChild(messageDiv);

//     // Remove message after 5 seconds
//     setTimeout(() => {
//       if (messageDiv.parentNode) {
//         messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse';
//         setTimeout(() => {
//           if (messageDiv.parentNode) {
//             messageDiv.remove();
//           }
//         }, 300);
//       }
//     }, 5000);
//   }

//   // Handle Enter key press in forms
//   document.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//       if (container.classList.contains('active')) {
//         // Sign up form is active
//         handleSignUp();
//       } else {
//         // Sign in form is active
//         handleSignIn();
//       }
//     }
//   });
// });
