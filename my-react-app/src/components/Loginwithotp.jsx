import React, { useState } from 'react';
import './Loginwithotp.css';

const Loginwithotp = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOtp = (event) => {
        event.preventDefault();
        // Logic to send OTP
        console.log("OTP sent to:", email);
    };

    const handleLogin = async (event) => {
        event.preventDefault();
    
        // Check if both email and OTP are provided
        if (!email || !otp) {
            console.log("Email and OTP are required");
            return;
        }
    
        try {
            // Send the email and OTP to the backend server for verification
            const response = await fetch('http://localhost:5000/user//loginOTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }), // Send email and OTP to the server
            });
    
            const data = await response.json(); // Convert response to JSON
    
            // Check if login was successful
            if (response.ok) {
                console.log("Login successful:", data);
                // Handle successful login here, such as redirecting the user
                // window.location.href = '/dashboard'; // Example redirect after successful login
            } else {
                console.log("Login failed:", data.error);
                // Optionally, display an error message to the user
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong. Please try again later.");
        }
    };
    

    return (
        <div className="Loginwithotp-container">
            <div className="Loginwithotp-form-container">
                <h2>Forget Password</h2>
                <form onSubmit={handleSendOtp}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send OTP</button>
                </form>
            </div>

            <div className="Loginwithotp-form-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="otp">OTP:</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Loginwithotp;
