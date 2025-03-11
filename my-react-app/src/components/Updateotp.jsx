import React, { useState } from 'react';
import './Updatewithotp.css';


const Updateotp = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState(null);

  // Function to display alert messages
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  // Handle OTP form submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/user/sendOTP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((res) => res.json());

    if (response.error) {
      showAlert(response.error, 'error');
    } else {
      showAlert(response.message, 'success');
    }
  };

  // Handle reset password form submission
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert("Passwords don't match", 'error');
      return;
    }

    const response = await fetch('http://localhost:5000/user/resetPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    }).then((res) => res.json());

    if (response.error) {
      showAlert(response.error, 'error');
    } else {
      showAlert(response.message, 'success');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="Updatewithotp-container">
      {alert && <div className={`Updatewithotp-alert ${alert.type}`}>{alert.message}</div>}

      <div className="Updatewithotp-form-container">
        <h2>Get OTP</h2>
        <form onSubmit={handleOtpSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Get OTP</button>
        </form>
      </div>

      <div className="Updatewithotp-form-container">
        <h2>Reset Password</h2>
        <form id="resetPasswordForm" onSubmit={handleResetSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="otp">OTP:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default Updateotp;
