// auth-helper.js - Universal Authentication Helper
// Include this file in all your frontend pages that require authentication

const AUTH_CONFIG = {
  API_BASE: 'https://epass-backend.onrender.com',
  LOGIN_PAGE: '/'
};

// Enhanced authentication check with comprehensive error handling
async function checkAuthStatus() {
  try {
    console.log('🔐 Checking authentication status...');
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE}/api/me`, {
      method: 'GET',
      credentials: 'include', // CRITICAL: Always include credentials for session cookies
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Prevent caching of auth checks
      }
    });

    console.log('🔐 Auth response status:', response.status);
    
    if (response.status === 401) {
      console.log('❌ User not authenticated, redirecting to login');
      redirectToLogin();
      return false;
    }
    
    if (!response.ok) {
      console.error('❌ Auth check failed with status:', response.status);
      throw new Error(`Authentication check failed: ${response.status}`);
    }

    const userData = await response.json();
    console.log('✅ User authenticated:', userData.userUSN);
    return userData;
    
  } catch (error) {
    console.error('❌ Authentication check error:', error);
    
    // Don't redirect on network errors, but show user feedback
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNetworkError();
      return false;
    }
    
    redirectToLogin();
    return false;
  }
}

// Enhanced API fetch wrapper with automatic authentication handling
async function authenticatedFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include', // Always include credentials
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const fetchOptions = { ...defaultOptions, ...options };
  
  try {
    console.log('🌐 Making authenticated request to:', url);
    
    const response = await fetch(url, fetchOptions);
    
    if (response.status === 401) {
      console.log('❌ Request unauthorized, redirecting to login');
      redirectToLogin();
      return null;
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Authenticated fetch error:', error);
    throw error;
  }
}

// Redirect to login with current page preservation
function redirectToLogin() {
  console.log('🔄 Redirecting to login page');
  
  // Store current page for redirect after login
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/' && currentPath !== AUTH_CONFIG.LOGIN_PAGE) {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  window.location.href = AUTH_CONFIG.LOGIN_PAGE;
}

// Enhanced logout function
async function performLogout() {
  try {
    console.log('🚪 Performing logout...');
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE}/api/signout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('🚪 Logout response:', data);
    
    if (data.success) {
      console.log('✅ Logout successful');
      // Clear any stored data
      sessionStorage.clear();
      localStorage.removeItem('userSession'); // If you're using any local storage
      
      // Redirect to login
      window.location.href = AUTH_CONFIG.LOGIN_PAGE;
    } else {
      console.error('❌ Logout failed:', data.error);
      alert('Error logging out. Please try again.');
    }
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even if the request fails, clear local data and redirect
    sessionStorage.clear();
    localStorage.removeItem('userSession');
    window.location.href = AUTH_CONFIG.LOGIN_PAGE;
  }
}

// Show network error message
function showNetworkError() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'network-error-banner';
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f44336;
    color: white;
    text-align: center;
    padding: 10px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  errorDiv.innerHTML = `
    <strong>Network Error:</strong> Unable to connect to server. Please check your connection and try again.
    <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #f44336; border: none; border-radius: 3px; cursor: pointer;">
      Retry
    </button>
  `;
  
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}

// Initialize page with authentication check
async function initializeAuthenticatedPage(callback) {
  console.log('🚀 Initializing authenticated page...');
  
  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'auth-loading';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;
  loadingDiv.innerHTML = `
    <div>
      <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #00416A; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      <p style="margin-top: 10px; color: #666;">Verifying authentication...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  document.body.appendChild(loadingDiv);
  
  try {
    const userData = await checkAuthStatus();
    
    // Remove loading div
    if (loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
    
    if (userData) {
      console.log('✅ Page initialized with authenticated user');
      
      // Set up universal logout handlers
      setupLogoutHandlers();
      
      // Call the page-specific initialization callback
      if (typeof callback === 'function') {
        callback(userData);
      }
    }
    
  } catch (error) {
    console.error('❌ Page initialization failed:', error);
    
    // Remove loading div
    if (loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
  }
}

// Set up logout button handlers automatically
function setupLogoutHandlers() {
  const logoutButtons = document.querySelectorAll('#logoutBtn, .logout-btn, [data-action="logout"]');
  
  logoutButtons.forEach(btn => {
    // Remove existing listeners to avoid duplicates
    btn.removeEventListener('click', performLogout);
    // Add the logout handler
    btn.addEventListener('click', performLogout);
    
    console.log('🔗 Logout handler attached to button');
  });
}

// Utility function to get current user data
let currentUser = null;

async function getCurrentUser() {
  if (!currentUser) {
    currentUser = await checkAuthStatus();
  }
  return currentUser;
}

// Export functions for use in other scripts
window.AuthHelper = {
  checkAuthStatus,
  authenticatedFetch,
  redirectToLogin,
  performLogout,
  initializeAuthenticatedPage,
  getCurrentUser,
  API_BASE: AUTH_CONFIG.API_BASE
};

console.log('🔐 Auth Helper loaded successfully');
