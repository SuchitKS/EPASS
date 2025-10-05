import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './events.css'

const API_BASE = 'https://epass-backend.onrender.com'

function Events() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication
    const userUSN = sessionStorage.getItem('userUSN')
    if (!userUSN) {
      navigate('/')
      return
    }
  }, [navigate])

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
        sessionStorage.clear()
        navigate('/')
      } else {
        alert('Error logging out. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
    }
  }

  const handleCardClick = (path) => {
    navigate(path)
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div className="events-page">
        <div className="logout-container">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <section className="cards">
          <article className="card card--1" onClick={() => handleCardClick('/participants.html')}>
            <div className="card__img"></div>
            <div className="card__img--hover"></div>
            <div className="card__info">
              <h3 className="card__title">Events participated by you</h3>
              <div className="card__icon">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </article>

          <article className="card card--2" onClick={() => handleCardClick('/organisers.html')}>
            <div className="card__img"></div>
            <div className="card__img--hover"></div>
            <div className="card__info">
              <h3 className="card__title">Events organised by you</h3>
              <div className="card__icon">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </article>

          <article className="card card--3" onClick={() => handleCardClick('/volunteers.html')}>
            <div className="card__img"></div>
            <div className="card__img--hover"></div>
            <div className="card__info">
              <h3 className="card__title">Events volunteered by you</h3>
              <div className="card__icon">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
          </article>
        </section>
      </div>
    </>
  )
}

export default Events
