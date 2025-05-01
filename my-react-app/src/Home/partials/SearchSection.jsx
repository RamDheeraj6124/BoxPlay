import React, { useState, useEffect } from 'react';
import './SearchSection.css';
import 'boxicons/css/boxicons.min.css';
import { useNavigate } from 'react-router-dom';

const SearchSection = () => {
    const [isOpen, setIsOpen] = useState(false); // State for sports dropdown hover
    const [query, setQuery] = useState(""); // State for search query
    const [suggestions, setSuggestions] = useState([]); // State for fetched suggestions
    const [isSearchDropdownVisible, setSearchDropdownVisible] = useState(false); // State for search dropdown visibility
    const [sports, setSports] = useState([]); // State for sports fetched from the backend

    const navigate = useNavigate();

    // Fetch sports from the backend
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/getsportslist`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setSports(data || []);
                } else {
                    console.error('Failed to load sports:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching sports:', error);
                alert('An error occurred while fetching sports.');
            }
        };

        fetchSports();
    }, []);

    // Handle search input changes
    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            fetchSuggestions(value);
            setSearchDropdownVisible(true);
        } else {
            setSearchDropdownVisible(false);
        }
    };

    // Fetch suggestions from the backend
    const fetchSuggestions = async (searchText) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/shop/venues?search=${searchText}`);
            const data = await response.json();
            setSuggestions(data.searchShop || []); // Safely set suggestions from backend response
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    // Navigate to the booking page
    const searchpage = (suggestion) => {
        const formattedVenueName = suggestion.shopname.replace(/\s+/g, '-');
        const formattedGroundName = suggestion.groundname.replace(/\s+/g, '-');
        navigate(`/Booking/${formattedVenueName}_${formattedGroundName}`);
    };

    // Navigate to selected sport page
    const handleSportClick = (sportName) => {
        navigate(`/ground/${sportName.replace(/\s+/g, '-')}`);
    };

    return (
        <div className="search-section">
            <div>
                <h1 className="search-heading">
                    Book Top Sports Complexes in Hyderabad Online
                </h1>
            </div>

            <div className="search-input">
                <i className="bx bx-search-alt-2"></i>
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown close on input click
                    placeholder="Search by venue name"
                />
                {isSearchDropdownVisible && suggestions.length > 0 && (
                    <div className="search-dropdown">
                        {suggestions.map((suggestion, index) => (
                            <button 
                                key={index} 
                                onClick={() => searchpage(suggestion)} 
                                className="search-dropdown-item"
                            >
                                <div>
                                    {suggestion.groundname}
                                    <div>
                                        {suggestion.shopname}, {suggestion.address}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div 
                className="dropdown-menu" 
                onMouseEnter={() => setIsOpen(true)} 
                onMouseLeave={() => setIsOpen(false)}
            >
                <button className="dropdown-button">
                    <i className="bx bx-cricket-ball"></i>
                    Select Sport
                </button>
                {isOpen && (
                    <div className="dropdown-content">
                        <div className="dropdown-grid">
                            <button className="dropdown-item" onClick={() => navigate('/Book')}>
                                All Sports
                            </button>
                            {sports.map((sport, index) => (
                                <button 
                                    className="dropdown-item" 
                                    key={index}
                                    onClick={() => handleSportClick(sport.name)}
                                >
                                    {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchSection;
