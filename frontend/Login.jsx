import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './style.css'

const API_BASE = 'https://epass-backend.onrender.com'

function Login() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [signUpData, setSignUpData] = useState({
    name: '',
    usn: '',
    sem: '',
    mobno: '',
    email: '',
    password: ''
  })
  const [signInData, setSignInData] = useState({
    usn: '',
    password: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        sessionStorage.setItem('userUSN', data.userUSN)
        sessionStorage.setItem('userName', data.userName)
        navigate('/events.html')
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
    }
  }

  const showMessage = (text, isError = false) => {
    const existingMessage = document.querySelector('.message')
    if (existingMessage) {
      existingMessage.remove()
    }

    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${isError ? 'error' : 'success'}`
    messageDiv.textContent = text

    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: normal;
      z-index: 10000;
      animation: slideIn 0.3s ease-in-out;
      ${isError ? 'background-color:rgb(225, 108, 95);' : 'background-color:rgb(114, 221, 158);'}
    `

    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style')
      style.id = 'message-styles'
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(messageDiv)

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideIn 0.3s ease-in-out reverse'
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove()
          }
        }, 300)
      }
    }, 5000)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()

    const usn = signInData.usn.trim()
    const password = signInData.password

    if (!usn || !password) {
      showMessage('Please fill in all fields', true)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usn, password })
      })

      const data = await response.json()

      if (data.success) {
        showMessage(`Welcome back, ${data.userName}!`)
        sessionStorage.setItem('userUSN', data.userUSN)
        sessionStorage.setItem('userName', data.userName)

        setTimeout(() => {
          navigate('/events.html')
        }, 1500)
      } else {
        showMessage(data.error, true)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      showMessage('Network error. Please try again.', true)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()

    const { name, usn, sem, mobno, email, password } = signUpData
    const trimmedUsn = usn.trim().toUpperCase()
    const parsedSem = parseInt(sem)

    if (!name || !usn || !sem || !mobno || !email || !password) {
      showMessage('Please fill in all fields', true)
      return
    }

    if (!/^1BM\d{2}[A-Z]{2}\d{3}$/.test(trimmedUsn)) {
      showMessage('Invalid USN format. Example: 1BM23CS101', true)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showMessage('Please enter a valid email address', true)
      return
    }

    if (!/^\d{10}$/.test(mobno)) {
      showMessage('Please enter a valid 10-digit mobile number', true)
      return
    }

    if (parsedSem < 1 || parsedSem > 8) {
      showMessage('Semester must be between 1 and 8', true)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          usn: trimmedUsn,
          sem: parsedSem,
          mobno,
          email,
          password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to sign up. Please try again.', true)
        return
      }

      const data = await response.json()

      if (data.success) {
        showMessage(`Account created successfully! Welcome, ${data.userName}!`)
        sessionStorage.setItem('userUSN', data.userUSN)
        sessionStorage.setItem('userName', data.userName)

        setSignUpData({
          name: '',
          usn: '',
          sem: '',
          mobno: '',
          email: '',
          password: ''
        })

        setTimeout(() => {
          navigate('/events.html')
        }, 2000)
      } else {
        showMessage(data.error, true)
      }
    } catch (error) {
      console.error('Signup network error:', error)
      showMessage('Network error during signup. Please check your connection and try again.', true)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
      />
      <div className={`container${isActive ? ' active' : ''}`}>
        <div className="form-container sign-up">
          <form>
            <h1>Create Account</h1>
            <input
              type="text"
              placeholder="Name"
              value={signUpData.name}
              onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="USN"
              value={signUpData.usn}
              onChange={(e) => setSignUpData({...signUpData, usn: e.target.value})}
            />
            <input
              type="number"
              placeholder="Sem"
              value={signUpData.sem}
              onChange={(e) => setSignUpData({...signUpData, sem: e.target.value})}
            />
            <input
              type="number"
              placeholder="Mobile No"
              value={signUpData.mobno}
              onChange={(e) => setSignUpData({...signUpData, mobno: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email ID"
              value={signUpData.email}
              onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpData.password}
              onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
            />
            <button type="button" onClick={handleSignUp}>Sign Up</button>
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
            <span>or use your email password</span>
            <input
              type="text"
              placeholder="USN"
              value={signInData.usn}
              onChange={(e) => setSignInData({...signInData, usn: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              value={signInData.password}
              onChange={(e) => setSignInData({...signInData, password: e.target.value})}
            />
            <a href="#">Forget Your Password?</a>
            <button type="button" onClick={handleSignIn}>Sign In</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" type="button" onClick={() => setIsActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" type="button" onClick={() => setIsActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
