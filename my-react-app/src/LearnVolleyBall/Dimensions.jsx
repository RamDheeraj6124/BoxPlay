import React from 'react';
import './Dimensions.css';

const Dimensions = () => {
  return (
    <section className="court-dimensions">
      <h2>Dimensions of Volleyball Court</h2>
      
      <h3>Indoor Volleyball</h3>
      <ul>
        <li>Dimensions: 18 m long by 9 m wide</li>
        <li>Free zone: 3 m wide, at least 7 m high</li>
        <li>Line markings: 5 cm wide lines</li>
        <li>Zones: Front, service, substitution, libero replacement, penalty areas</li>
        <li>Net height: 2.43 m (men), 2.24 m (women)</li>
      </ul>

      <h3>Beach Volleyball</h3>
      <ul>
        <li>Dimensions: 16 m x 8 m with 3 m safety zone</li>
        <li>Surface: Level sand</li>
        <li>No center line</li>
        <li>Net height: 2.43 m (men), 2.24 m (women)</li>
      </ul>

      <h3>Sitting Volleyball</h3>
      <ul>
        <li>Dimensions: 10 m x 6 m</li>
      </ul>

      <h3>Nine-man Volleyball</h3>
      <ul>
        <li>Dimensions: 33 ft long by 33 ft wide</li>
        <li>Net height: 7 ft, 8.5 in</li>
      </ul>
    </section>
  );
};

export default Dimensions;
