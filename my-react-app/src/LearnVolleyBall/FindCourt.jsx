import React from 'react';
import './FindCourt.css';

const FindCourt = () => {
  return (
    <section className="find-court">
      <h2>Find a Volleyball Court Near You</h2>
      <p>
        The thrill of spiking, serving, and diving for the ball on a volleyball court is unmatched. 
        To find a volleyball court near you, download the Playo app, which allows you to search for nearby courts, their prices, and dimensions.
      </p>
      <a href="https://playo.co/" target="_blank" rel="noreferrer" className="download-app">
        Download Playo App
      </a>
    </section>
  );
};

export default FindCourt;
