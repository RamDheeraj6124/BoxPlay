import React from 'react';
import './Rules.css';

const Rules = () => {
  return (
    <section className="volleyball-rules">
      <h2>Volleyball Rules and Scoring</h2>
      <ul>
        <li>Each squad must consist of six players (three in the front row, three in the rear).</li>
        <li>The ball must be served from behind the end line.</li>
        <li>A player cannot hit the ball twice in succession.</li>
        <li>The game uses rally scoring and is played to 25 points.</li>
        <li>The team must win by a two-point margin.</li>
        <li>Players cannot carry, palm, or toss the ball.</li>
      </ul>
    </section>
  );
};

export default Rules;
