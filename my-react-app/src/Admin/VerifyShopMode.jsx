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

    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const response = await fetch('http://localhost:5000/admin/checksession', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUsername(data.username);
                setUsers(data.details.users);
                setShops(data.details.shops);

                const filteredVerifyShops = data.details.shops.filter(shop =>
                    shop.availablesports.some(sport => sport.appliedforverification && !sport.verify)
                );
                setVerifyShops(filteredVerifyShops);
            } else {
                navigate('/login');
                setUsername(null);
            }
        };

        checkSession();
    }, [navigate]);




    const openVerifyShopModal = (shop) => {
        setSelectedShop(shop);
        setIsVerifyShopModalOpen(true);
    };

    const closeVerifyShopModal = () => {
        setIsVerifyShopModalOpen(false);
        setSelectedShop(null);
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
            console.log(selectedShop.availablesports)
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


    if (!username) {
        return <div className="login-message">You must be logged in as an admin to view this page.</div>;
    }

    return(
        <div className="admin-dashboard">
        <h2 id="ad-verify-shops-title">Shops Applied for Verification</h2>
        <ul id="ad-verify-shops-list">
            {verifyShops.map(shop => (
                <li key={shop._id} id={`ad-shop-${shop._id}`} onClick={() => openVerifyShopModal(shop)}>
                    <p>Shop Name: {shop.shopname}</p>
                    <p>Shop Owner: {shop.owner}</p>
                    <p>Shop Email: {shop.email}</p>
                </li>
            ))}
        </ul>

        {isVerifyShopModalOpen && selectedShop && (
                <div id="shop-modal" className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeVerifyShopModal}>&times;</span>
                        <h2>Verify Shop Grounds</h2>
                        <form onSubmit={adminVerify}>
                            <div className="shop-details">
                                <p><strong>Shop Name:</strong> {selectedShop.shopname}</p>
                                <p><strong>Shop Owner:</strong> {selectedShop.owner}</p>
                                <p><strong>Shop Email:</strong> {selectedShop.email}</p>
                                <p><strong>Address:</strong> {selectedShop.address}</p>
                                <p><strong>Contact:</strong> {selectedShop.contact}</p>
                            </div>
                            <h2>Grounds Awaiting Verification</h2>
                            {selectedShop.availablesports.map((sport, index) => (
                                sport.appliedforverification ? (
                                    <div key={index} className="sport-verification-section">
                                        <p><strong>Ground Name:</strong> {sport.groundname}</p>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={sport.verify}
                                                onChange={(e) => handleShopChange(e, index)}
                                            />
                                            Verify
                                        </label>
                                    </div>
                                ) : null
                            ))}
                            <div className="form-actions">
                                <button type="submit" className="submit-button">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VerifyShopMode;