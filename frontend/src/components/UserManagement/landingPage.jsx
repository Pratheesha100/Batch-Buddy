import React from 'react';
import { Link } from 'react-router-dom';
import landingImage from '../../assets/landingPage1.png';
import './landingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navigation Buttons */}
      <div className="nav-buttons">
        <Link to="/register">
          <button className="nav-button">Sign Up</button>
        </Link>
        <Link to="/login">
          <button className="nav-button">Sign In</button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="text-content">
          <h1 className="main-title">Welcome To</h1>
          <h1 className="main-title">Batch Buddy !!!</h1>
          <p className="description">
            Batch Buddy makes<br />
            life easier by everything in one<br />
            place ......
          </p>
          <Link to="/get-started">
            <button className="get-start-btn">Get Start</button>
          </Link>
        </div>

        <div className="image-container">
          <img 
            src={landingImage} 
            alt="Landing page illustration" 
            className="landing-image"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
