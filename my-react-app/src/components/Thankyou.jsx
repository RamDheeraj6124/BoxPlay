import React, { useEffect } from 'react';
import './Thankyou.css';

const Thankyou = () => {
    useEffect(() => {
        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            window.location.href = "/";
        }, 3000);

        // Cleanup the timer
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="thankyou-container">
            <div className="thankyou-message">
                <h1>Thank you for Submitting your review!</h1>
                <p>You will be redirected shortly.</p>
            </div>
        </div>
    );
};

export default Thankyou;
