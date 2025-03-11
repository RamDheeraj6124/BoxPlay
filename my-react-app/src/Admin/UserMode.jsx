import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const UserMode = () => {
    const [username, setUsername] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
                
            } else {
                navigate('/login');
                setUsername(null);
            }
        };

        checkSession();
    }, [navigate]);

    const openUserModal = (user) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUser(null);
    };

    const deleteuser = async (e,userid) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/admin/deleteuser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userid
                }),
                credentials: 'include'
            });
            if (response.ok) {
                window.location.reload();

            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (!username) {
        return <div className="login-message">You must be logged in as an admin to view this page.</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1 id="ad-dashboard-title">Welcome, {username}</h1>

            <h2 id="ad-users-title">Users</h2>
            <ul id="ad-users-list">
                {users.map(user => (
                    <li key={user._id} id={`ad-user-${user._id}`} onClick={() => openUserModal(user)}>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                    </li>
                ))}
            </ul>

            {isUserModalOpen && selectedUser && (
                <div id="user-modal" className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeUserModal}>&times;</span>
                        <h2>Edit User Details</h2>
                            <div className="user-details">
                           <p><strong>User Name:</strong>{selectedUser.user}</p>
                           <p><strong>User Email:</strong>{selectedUser.email}</p>
                           <p><strong>User Contact:</strong>{selectedUser.contact}</p>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button" onClick={(e) => deleteuser(e,selectedUser._id)}>Delete User</button>
                            </div>
                    </div>
                </div>
            )}

        </div>
    )

}
export default UserMode;