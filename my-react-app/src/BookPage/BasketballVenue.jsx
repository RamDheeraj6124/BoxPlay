import React, { useState, useEffect } from "react";  
import { useParams } from "react-router-dom";
import './Venue2.css';
import Loader2 from './Loader2'; 
import VenueCard2 from './VenueCard2';  
import Header from "../Home/partials/Header";
import SearchSection from "../Home/partials/SearchSection";

const GroundVenues = () => {
    const { groundName } = useParams();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('http://localhost:5000/shop/loadvenues', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    const gname = groundName.replace(/-/g, ' ');
                    const filteredVenues = data.filter((venue) =>
                        venue.sportname.includes(gname)
                    );
                    setVenues(filteredVenues);
                } else {
                    console.error('Failed to load venues:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching venues:', error);
                alert('An error occurred while fetching venues.');
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, [groundName]);

    if (loading) {
        return <Loader2 />;
    }

    return (
      <div className="venue-section2">
      <Header />
      <SearchSection />
      <div className="venue-section">
        <div className="venue-header2">
          <h2 className="venue-heading2">{groundName.charAt(0).toUpperCase() + groundName.slice(1)} Venues</h2>
        </div>
        <div className="venue-grid2">
                {venues.map((venue, index) => (
                    <VenueCard2 key={index} venue={venue} />
                ))}
        </div>
        </div>
      </div>
    );
};

export default GroundVenues;