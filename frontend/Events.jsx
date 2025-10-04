import React from 'react';
import './events.css';

const API_BASE = 'https://epass-backend.onrender.com';

export default function Events() {
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        alert('Error logging out. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <div>
      {/* Logout Button */}
      <div className="logout-container">
        <button id="logoutBtn" className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      <section className="cards">
        <article className="card card--1">
          <div className="card__img"></div>
          <a href="participants.html" className="card_link">
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
          <a href="organisers.html" className="card_link">
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
          <a href="volunteers.html" className="card_link">
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
    </div>
  );
}
