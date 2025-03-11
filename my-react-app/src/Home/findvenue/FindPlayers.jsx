import React from 'react';
import './FindPlayers.css';

const FindPlayers = () => {
  return (
    <div className="find-players-container">
      <div>
      <div className="location-selector">
        <span className="location-icon">📍</span> Hyderabad
      </div>
      <div className="text-section">
        <h1>FIND VENUES NEARBY</h1>
        <h4 className='parawidth'>
            Discover local sports venues effortlessly and enjoy your favorite activities in top-notch facilities near you!
        </h4>
      </div>
      </div>
      <div className="images-section">
        <img src="Hockey.jpg" alt="Basketball" className="main-image" />
        <div className="sub-images">
          <img src="BatmintonSolo.jpg" alt="Badminton" className="sub-image" />
          <img src="Football.jpeg" alt="Football" className="sub-image" />
        </div>
      </div>
    </div>
  );
};

export default FindPlayers;
