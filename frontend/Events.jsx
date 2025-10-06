import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './events.css'

const API_BASE = 'https://epass-backend.onrender.com'

function Events() {
  const navigate = useNavigate()

  // Reset body styles to prevent conflicts from login page
  useEffect(() => {
    document.body.style.display = ''
    document.body.style.alignItems = ''
    document.body.style.justifyContent = ''
    document.body.style.overflow = ''
  }, [])

  useEffect(() => {
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout)
    }

    return () => {
      if (logoutBtn) {
        logoutBtn.removeEventListener('click', handleLogout)
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        navigate('/')
      } else {
        alert('Error logging out. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }

  return (
    <>
      <div className="events-page">
        <div className="logout-container">
        <button id="logoutBtn" className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      <section className="cards">
        <article className="card card--1">
          <div className="card__img"></div>
          <Link to="/participants" className="card_link">
            <div className="card__img--hover"></div>
          </Link>
          <div className="card__info">
            <h3 className="card__title">Events participated by you</h3>
            <div className="card__icon">
              <i className="fa-solid fa-plus"></i>
            </div>
          </div>
        </article>

        <article className="card card--2">
          <div className="card__img"></div>
          <Link to="/organisers" className="card_link">
            <div className="card__img--hover"></div>
          </Link>
          <div className="card__info">
            <h3 className="card__title">Events organised by you</h3>
            <div className="card__icon">
              <i className="fa-solid fa-plus"></i>
            </div>
          </div>
        </article>

        <article className="card card--3">
          <div className="card__img"></div>
          <Link to="/volunteers" className="card_link">
            <div className="card__img--hover"></div>
          <Link>
          <div className="card__info">
            <h3 className="card__title">Events volunteered by you</h3>
            <div className="card__icon">
              <i className="fa-solid fa-plus"></i>
            </div>
          </div>
        </article>
      </section>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </div>
    </>
  )
}

export default Events





