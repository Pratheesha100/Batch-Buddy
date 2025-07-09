import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import "./ResetPassword.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLinkSent, setIsLinkSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to send the reset link
    // For now, we'll just simulate the success state
    setIsLinkSent(true);
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <div className="reset-header">
          <FaShieldAlt className="shield-icon" />
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-form">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
          />

          <button type="submit" className="reset-btn">
            <span>✉️</span> Send Reset Link
          </button>

          {isLinkSent && (
            <div className="success-message">
              ✓ Reset link has been sent to your email address. Please check your inbox.
            </div>
          )}

          <Link to="/" className="back-link">
            ← Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword; 