import React from 'react';
import './Forgotpassword.css';

const Forgotpassword = () => {
    return (
        <div className="Forgotpassword-container">
            <div className="Forgotpassword-options-container">
                <h2>Login and Password Options</h2>
                <button className="Forgotpassword-button" id="loginBtn">
                    <a href="./login" className="Forgotpassword-button-link">Login</a>
                </button>
                <button className="Forgotpassword-button" id="resetPasswordBtn">
                    <a href="./updatewithotp" className="Forgotpassword-button-link">Reset Password</a>
                </button>
            </div>
        </div>
    );
};

export default Forgotpassword;