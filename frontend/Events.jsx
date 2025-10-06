import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000
        }}>
          <button 
            id="logoutBtn" 
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              padding: '13px 26px',
              borderRadius: '30px',
              fontFamily: "'Roboto Slab', serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(245, 87, 108, 0.4), 0 0 15px rgba(240, 147, 251, 0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 87, 108, 0.5), 0 0 25px rgba(240, 147, 251, 0.3)'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.4), 0 0 15px rgba(240, 147, 251, 0.2)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <section className="cards">
          <article className="card card--1">
            <div className="card__img"></div>
            <a href="/participants.html" className="card_link">
              <div className="card__img--hover"></div>
            </a>
            <div className="card__info">
              <h3 className="card__title">Events participated by you</h3>
              <div className="card__icon">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </article>

          <article className="card card--2">
            <div className="card__img"></div>
            <a href="/organisers.html" className="card_link">
              <div className="card__img--hover"></div>
            </a>
            <div className="card__info">
              <h3 className="card__title">Events organised by you</h3>
              <div className="card__icon">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </article>

          <article className="card card--3">
            <div className="card__img"></div>
            <a href="/volunteers.html" className="card_link">
              <div className="card__img--hover"></div>
            </a>
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
