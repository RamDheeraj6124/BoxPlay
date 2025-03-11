import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const QueryMode = () => {
    const [queries, setQueries] = useState(null);
    const [username, setUsername] = useState(null);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const response = await fetch('http://localhost:5000/admin/checksession', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUsername(data.username);
                const queries=data.details.queries.filter(q => q.replied===false)
                console.log(data.details.queries)
                setQueries(queries);
            } else {
                navigate('/login');
                setUsername(null);
            }
        };

        checkSession();
    }, [navigate]);

    const openQueryModal = (query) => {
        setSelectedQuery(query);
        setReplyMessage(`Replying to your query, ${query.message}`);
        setIsQueryModalOpen(true);
    };

    const closeQueryModal = () => {
        setIsQueryModalOpen(false);
        setSelectedQuery(null);
        setReplyMessage('');
    };

    const sendReply = async (e, queryId) => {
        e.preventDefault();

        const response = await fetch(`http://localhost:5000/admin/sendreply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                queryId,
                reply: replyMessage,
            }),
        });

        if (response.ok) {
            alert('Reply sent successfully');
            closeQueryModal();
        } else {
            alert('Failed to send reply');
        }
    };

    if (!username) {
        return <div className="login-message">You must be logged in as an admin to view this page.</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1 id="ad-dashboard-title">Welcome, {username}</h1>

            <h2 id="ad-users-title">User Queries</h2>
            {queries && (
                <ul id="ad-users-list">
                    {queries.map((query) => (
                        <li
                            key={query._id}
                            id={`ad-user-${query._id}`}
                            onClick={() => openQueryModal(query)}
                        >
                            <p>Username: {query.name}</p>
                            <p>Email: {query.email}</p>
                            <p>Mobile: {query.mobile}</p>
                            <p>Message: {query.message}</p>
                        </li>
                    ))}
                </ul>
            )}
            {isQueryModalOpen && selectedQuery && (
                <div id="query-modal" className="modal">
                    <div className="query-modal-content">
                        <span className="query-close" onClick={closeQueryModal}>
                            &times;
                        </span>
                        <h2>Send Reply to Query</h2>
                        <form onSubmit={(e) => sendReply(e, selectedQuery._id)}>
                            <div className="query-details">
                                <label>To: {selectedQuery.email}</label>
                                <label>Reg: Your Query Sent to us</label>
                                <label>Reply</label>
                                <textarea
                                    name="reply"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="query-form-actions">
                                <button type="submit" className="submit-button">
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueryMode;
