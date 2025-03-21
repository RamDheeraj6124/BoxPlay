import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const VerifyShopMode = () => {
    const [username, setUsername] = useState(null);
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [verifyShops, setVerifyShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [isVerifyShopModalOpen, setIsVerifyShopModalOpen] = useState(false);
    const [sportTypes, setSportTypes] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:5000/admin/checksession', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                    setUsers(data.details.users);
                    setShops(data.details.shops);
                    console.log(data.details.shops);

                    const filteredVerifyShops = data.details.shops.filter(shop =>
                        shop.availablesports.some(sport => sport.appliedforverification && !sport.verify)
                    );
                    setVerifyShops(filteredVerifyShops);
                    
                    // Fetch sport types if shops are available
                    if (data.details.shops.length > 0) {
                        fetchSportTypes();
                    }
                } else {
                    navigate('/login');
                    setUsername(null);
                }
            } catch (error) {
                console.error("Session check error:", error);
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);

    const fetchSportTypes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sports', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const sports = await response.json();
                const sportsMap = {};
                
                sports.forEach(sport => {
                    sportsMap[sport._id] = sport;
                });
                
                setSportTypes(sportsMap);
            }
        } catch (error) {
            console.error("Error fetching sports:", error);
        }
    };

    const openVerifyShopModal = (shop) => {
        setSelectedShop(shop);
        setIsVerifyShopModalOpen(true);
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closeVerifyShopModal = () => {
        setIsVerifyShopModalOpen(false);
        setSelectedShop(null);
        // Restore body scrolling when modal is closed
        document.body.style.overflow = 'auto';
    };

    const handleShopChange = (e, index) => {
        const updatedSports = selectedShop.availablesports.map((sport, i) => {
            if (i === index) {
                return { ...sport, verify: e.target.checked };
            }
            return sport;
        });
        setSelectedShop({ ...selectedShop, availablesports: updatedSports });
    };

    const adminVerify = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:5000/admin/adminverify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shopId: selectedShop._id,
                    availablesports: selectedShop.availablesports
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const updatedShopFromDB = await response.json();
                console.log("Updated Shop:", updatedShopFromDB);
                closeVerifyShopModal();

                setShops(prevShops =>
                    prevShops.map(shop => shop._id === updatedShopFromDB._id ? updatedShopFromDB : shop)
                );
                window.location.reload();
            } else {
                console.error("Failed to update shop.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getSurfaceTypeLabel = (type) => {
        const labels = {
            'Grass': 'Natural Grass',
            'Turf': 'Artificial Turf',
            'Clay': 'Clay Court',
            'Hard': 'Hard Court',
            'Synthetic': 'Synthetic Surface'
        };
        
        return labels[type] || type;
    };
    
    const formatTime = (time) => {
        // If time is already in 12-hour format with AM/PM, return as is
        if (time.includes('AM') || time.includes('PM')) {
            return time;
        }
        
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    if (!username) {
        return <div className="login-message">You must be logged in as an admin to view this page.</div>;
    }

    return (
        <div className="admin-dashboard">
            <h2 id="ad-verify-shops-title">Shops Applied for Verification</h2>
            {verifyShops.length > 0 ? (
                <ul id="ad-verify-shops-list">
                    {verifyShops.map(shop => (
                        <li key={shop._id} id={`ad-shop-${shop._id}`} onClick={() => openVerifyShopModal(shop)}>
                            <p><strong>Shop Name:</strong> {shop.shopname}</p>
                            <p><strong>Owner:</strong> {shop.owner}</p>
                            <p><strong>Email:</strong> {shop.email}</p>
                            <p><strong>Grounds Waiting:</strong> {shop.availablesports.filter(
                                sport => sport.appliedforverification && !sport.verify
                            ).length}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No shops are currently waiting for verification.</p>
            )}

            {isVerifyShopModalOpen && selectedShop && (
                <div id="shop-modal" className="modal" onClick={(e) => {
                    if (e.target.className === 'modal') closeVerifyShopModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Verify Shop Grounds</h2>
                            <span className="close" onClick={closeVerifyShopModal}>&times;</span>
                        </div>

                        <form onSubmit={adminVerify}>
                            <div className="shop-details">
                                <p>
                                    <strong>Shop Name:</strong>
                                    <span>{selectedShop.shopname}</span>
                                </p>
                                <p>
                                    <strong>Shop Owner:</strong>
                                    <span>{selectedShop.owner}</span>
                                </p>
                                <p>
                                    <strong>Shop Email:</strong>
                                    <span>{selectedShop.email}</span>
                                </p>
                                <p>
                                    <strong>Address:</strong>
                                    <span>{selectedShop.address}</span>
                                </p>
                                <p>
                                    <strong>Contact:</strong>
                                    <span>{selectedShop.contact}</span>
                                </p>
                            </div>

                            <h2 className="grounds-section-header">Grounds Awaiting Verification</h2>
                            <div className="grounds-container">
                                {selectedShop.availablesports
                                    .filter(sport => sport.appliedforverification)
                                    .map((sport, index) => {
                                        const sportInfo = sportTypes[sport.sport] || {};
                                        return (
                                            <div key={index} className="sport-verification-section">
                                                <p className="ground-name">
                                                    <strong>Ground Name:</strong>
                                                    <span>{sport.groundname}</span>
                                                </p>
                                                
                                                <div className="ground-image-container">
                                                    {sport.getimage ? (
                                                        <img 
                                                            src={sport.getimage} 
                                                            alt={sport.groundname} 
                                                            className="ground-image" 
                                                        />
                                                    ) : (
                                                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f0f0f0'}}>
                                                            No Image Available
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="ground-details">
                                                    <h3>Ground Details</h3>
                                                    
                                                    <div className="detail-row">
                                                        <div className="detail-label">Sport Type:</div>
                                                        <div className="detail-value">{sportInfo.name || 'Unknown'}</div>
                                                    </div>
                                                    
                                                    <div className="detail-row">
                                                        <div className="detail-label">Price per Hour:</div>
                                                        <div className="detail-value">₹{sport.priceperhour}</div>
                                                    </div>
                                                    
                                                    <div className="detail-row">
                                                        <div className="detail-label">Max Players:</div>
                                                        <div className="detail-value">{sport.maxplayers.join(' - ')}</div>
                                                    </div>
                                                    
                                                    {sport.grounddimensions && (
                                                        <div className="detail-row">
                                                            <div className="detail-label">Dimensions:</div>
                                                            <div className="detail-value">
                                                                {sport.grounddimensions.length}m × {sport.grounddimensions.width}m
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="detail-row">
                                                        <div className="detail-label">Surface Type:</div>
                                                        <div className="detail-value">{getSurfaceTypeLabel(sport.surfacetype)}</div>
                                                    </div>
                                                    
                                                    {sport.facilities && sport.facilities.length > 0 && (
                                                        <div className="detail-row">
                                                            <div className="detail-label">Facilities:</div>
                                                            <div className="detail-value">{sport.facilities.join(', ')}</div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="detail-row">
                                                        <div className="detail-label">Status:</div>
                                                        <div className="detail-value">{sport.status}</div>
                                                    </div>
                                                    
                                                    {sport.availability && sport.availability.length > 0 && (
                                                        <div className="detail-row">
                                                            <div className="detail-label">Open on:</div>
                                                            <div className="detail-value">
                                                                {sport.availability.map(a => a.day).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="verify-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id={`verify-${index}`}
                                                        checked={sport.verify}
                                                        onChange={(e) => handleShopChange(e, index)}
                                                    />
                                                    <label htmlFor={`verify-${index}`}>Verify this ground</label>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-button">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyShopMode;