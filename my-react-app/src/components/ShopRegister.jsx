import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ShopRegister.css'; // Ensure this path is correct

const ShopRegister = () => {
  // State variables for form inputs
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State variables for error messages
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  // React Router's useNavigate hook to programmatically navigate
  const navigate = useNavigate();

  // Regex pattern for validating email and password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = async (e) => {
    e.preventDefault();

    // Email validation pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate email
    if (!emailPattern.exec(email)) {
      setEmailError('Enter a valid email');
      return;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!passwordPattern.exec(password)) {
      setPasswordError('Password must be at least 8 characters long, contain a mix of uppercase, lowercase, numeric, and special characters.');
      return;
    } else {
      setPasswordError('');
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
    }

    try {
      // API call to register a new shop
      const res = await fetch('http://localhost:5000/shop/shopregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          email,
          password,
        }),
      });
      const data=await res.json();
      // Handle response
      if (res.ok) {
        alert('Shop registered successfully');
        navigate('/shoplogin');
      } else if(data.message) {
        alert('Invalid Email Address');
      }else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="background-wrapper">
      <div className="logo">
        <a href="/"><span className="highlight">B</span>ox<span className="highlight">P</span>lay</a>
      </div>
      <div className="shoplink">
        <a href="/shoplogin" className="underline">
          <h1>Shop</h1>
        </a>
      </div>
      <div className="register-container">
        <h2 className="center">Shop Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <span className="icon">
              <img src="https://img.icons8.com/ios-filled/20/000000/user.png" alt="Owner Name" />
            </span>
            <input
              type="text"
              placeholder="Owner Name"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <span className="icon">
              <img src="https://img.icons8.com/ios-filled/20/000000/email-open.png" alt="Email" />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span>
              <p className="error-message">{emailError}</p>
            </span>
          </div>
          <div className="input-group">
            <span className="icon">
              <img src="https://img.icons8.com/ios-filled/20/000000/lock.png" alt="Password" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span>
              <p className="error-message">{passwordError}</p>
            </span>
          </div>
          <div className="input-group">
            <span className="icon">
              <img src="https://img.icons8.com/ios-filled/20/000000/lock.png" alt="Confirm Password" />
            </span>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span>
              <p className="error-message">{confirmPasswordError}</p>
            </span>
          </div>
          <button type="submit" className="login-btn">Register Now</button>
          <div className="register-link">
            Already have an account? <Link to="/shoplogin">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopRegister;

