import React, { useEffect, useState } from 'react';
import './CricketSlide.css';

const CricketSlide = () => {
  const [visibleSections, setVisibleSections] = useState({
    rules: false,
    findGround: false,
    dimensions: false,
    basics: false,
  });

  useEffect(() => {
    const timers = [];

    // Function to show each section with a delay
    const showSection = (section, delay) => {
      timers.push(
        setTimeout(() => {
          setVisibleSections((prev) => ({ ...prev, [section]: true }));
        }, delay)
      );
    };

    showSection('rules', 0);        // Show rules immediately
    showSection('findGround', 2000); // Show find ground after 2 seconds
    showSection('dimensions', 4000); // Show dimensions after 4 seconds
    showSection('basics', 6000);     // Show basics after 6 seconds

    return () => {
      // Clean up timers on component unmount
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="cricket-container">
      <header className="cricket-header">
        <h1>Cricket Basics & Rules</h1>
      </header>
      
      {visibleSections.rules && (
        <section className="cricket-rules">
          <h2>Cricket Rules</h2>
          <ul>
            <li>Each team consists of 11 players.</li>
            <li>Each team bats for a set number of overs, usually 50 in ODI and 20 in T20.</li>
            <li>The objective is to score as many runs as possible while restricting the opposition.</li>
            <li>Batsmen can be dismissed in several ways: bowled, caught, leg before wicket (LBW), run out, and more.</li>
          </ul>
        </section>
      )}

      {visibleSections.findGround && (
        <section className="find-cricket-ground">
          <h2>Find Cricket Grounds Nearby</h2>
          <p>Looking for a place to play cricket? Explore our list of nearby cricket grounds and book your time!</p>
        </section>
      )}

      {visibleSections.dimensions && (
        <section className="cricket-dimensions">
          <h2>Cricket Ground Dimensions</h2>
          <ul>
            <li>The pitch is 22 yards (20.12 meters) long and 10 feet (3.05 meters) wide.</li>
            <li>The boundary lines should be 65-90 meters from the pitch.</li>
            <li>Stumps are 28 inches tall with bails on top.</li>
          </ul>
        </section>
      )}

      {visibleSections.basics && (
        <section className="cricket-basics">
          <h2>Cricket Basics</h2>
          <p>Cricket is a bat-and-ball game played between two teams. A team wins by either scoring more runs or by dismissing all opposition batsmen within their given overs.</p>
        </section>
      )}

      <footer className="cricket-footer">
        <p>&copy; 2024 Cricket Central. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default CricketSlide;
