import React, { useEffect, useState, useRef } from 'react';
import VenueCard from './VenueCard';
import Loader from './Loader';
import './Venue.css';

function Venue() {
  const effectRan = useRef(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (effectRan.current === false) {
      const venueload = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/loadvenues`, {
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setVenues(data);
            }
          }
        } catch (error) {
          alert('An error occurred while fetching venues.');
        } finally {
          setLoading(false);
        }
      };

      venueload();
      effectRan.current = true;
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <div className="book-venues">
        <div className="heading">
          <h2 className="heading2">Book Venues</h2>
          <a href="/Book" className="see-all">SEE ALL VENUES</a>
        </div>
        <div className="venues-wrapper">
          <button className="scroll-button left" onClick={scrollLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="venues-container" ref={scrollContainerRef}>
            {venues.slice(0, 6).map((venue, index) => (
              <VenueCard key={index} venue={venue} />
            ))}
          </div>
          <button className="scroll-button right" onClick={scrollRight}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Venue;
