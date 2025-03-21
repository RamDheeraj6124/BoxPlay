import React, { useState, useEffect, useCallback } from 'react';
import './FindPlayers.css';

const FindPlayers = () => {
  const images = [
    { src: '/Hockey.jpg', alt: 'Hockey' },
    { src: '/BatmintonSolo.jpg', alt: 'Badminton' },
    { src: '/FootballPlay.png', alt: 'Football' },
    {src: '/SachinCricket.jpg', alt: 'Basketball'},
    {src: '/Baskeball.jpg', alt: 'Cricket'},
    {src: '/Volleyball.jpg', alt: 'Volleyball'},
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSlideEnabled, setIsAutoSlideEnabled] = useState(true);

  useEffect(() => {
    let intervalId;
    if (isAutoSlideEnabled && images.length > 1) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoSlideEnabled, images.length]);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentIndex(index);
    setIsAutoSlideEnabled(true);
  }, []);

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
      <div className="slider-container">
  {images.map((image, index) => (
    <img
      key={image.src}
      src={image.src}
      alt={image.alt}
      className={`main-image ${index === currentIndex ? 'active' : ''}`}
    />
  ))}
</div>
<div className="thumbnail-navigation">
  {images.map((image, index) => (
    <img
      key={image.src}
      src={image.src}
      alt={image.alt}
      className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
      onClick={() => handleThumbnailClick(index)}
    />
  ))}
</div>
      </div>
    </div>
  );
};

export default FindPlayers;