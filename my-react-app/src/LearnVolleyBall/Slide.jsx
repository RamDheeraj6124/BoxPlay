import React from 'react';
import CourtBasics from './CourtBasics';
import Dimensions from './Dimensions';
import Rules from './Rules';
import FindCourt from './FindCourt';
import './Slide.css';

function Slide() {
  return (
    <div className="app-container">
      <header className="app-header1">
        <h1>The Basics of Volleyball</h1>
      </header>
      <main className="app-main">
        <CourtBasics />
        <Dimensions />
        <Rules />
        <FindCourt />
      </main>
      <footer className="app-footer">
        <p>© 2024 Volleyball Guide</p>
      </footer>
    </div>
  );
}

export default Slide;
