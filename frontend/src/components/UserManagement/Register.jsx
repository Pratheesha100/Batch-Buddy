import React, { useState } from "react";
import "./Register.css";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    itNumber: "",
    email: "",
    phoneNumber: "",
    year: "2025",
    batch: "",
    weekType: "",
    degree: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const validateITNumber = (value) => {
    if (!/^[a-zA-Z0-9]{1,10}$/.test(value)) {
      return "IT number can contain letters and numbers (max 10 characters)";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value.endsWith("@gmail.com")) {
      return "Email must end with @gmail.com";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!/^\d{10}$/.test(value)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateAlphanumeric = (value) => {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "Only letters and numbers are allowed";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Validate fields as user types
    let error = "";
    switch (name) {
      case "itNumber":
        error = validateITNumber(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      case "name":
      case "password":
        error = validateAlphanumeric(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== "termsAccepted") {
        let error = "";
        switch (key) {
          case "itNumber":
            error = validateITNumber(formData[key]);
            break;
          case "email":
            error = validateEmail(formData[key]);
            break;
          case "phoneNumber":
            error = validatePhoneNumber(formData[key]);
            break;
          case "name":
          case "password":
            error = validateAlphanumeric(formData[key]);
            break;
          default:
            break;
        }
        if (error) newErrors[key] = error;
      }
    });

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form Submitted", formData);
      // Handle form submission here
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>BatchBuddy</h2>
        <p>Create your account</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <input
            type="text"
            name="itNumber"
            value={formData.itNumber}
            placeholder="IT Number"
            onChange={handleChange}
            required
            maxLength="10"
          />
          {errors.itNumber && <span className="error">{errors.itNumber}</span>}

          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email Address"
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            placeholder="Phone Number"
            onChange={handleChange}
            required
            maxLength="10"
          />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}

          <input
            type="text"
            name="year"
            value={formData.year}
            readOnly
            disabled
          />

          <select name="batch" value={formData.batch} onChange={handleChange} required>
            <option value="">Select Batch</option>
            <option value="Y1S1">Y1S1</option>
            <option value="Y1S2">Y1S2</option>
            <option value="Y2S1">Y2S1</option>
            <option value="Y2S2">Y2S2</option>
            <option value="Y3S1">Y3S1</option>
            <option value="Y3S2">Y3S2</option>
            <option value="Y4S1">Y4S1</option>
            <option value="Y4S2">Y4S2</option>
          </select>

          <select name="weekType" value={formData.weekType} onChange={handleChange} required>
            <option value="">Select Week Type</option>
            <option value="WE">Weekend</option>
            <option value="WD">Weekday</option>
          </select>

          <select name="degree" value={formData.degree} onChange={handleChange} required>
            <option value="">Select Degree</option>
            <option value="BScIT">BSc Honours Specialization in Information Technology</option>
            <option value="BScSE">BSc Honours Specialization in Software Engineering</option>
            <option value="BScDS">BSc Honours Specialization in Data Science</option>
            <option value="BScIM">BSc Honours Specialization in Interactive Media</option>
          </select>

          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

          <label className="terms">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
            I agree to the terms and conditions
          </label>

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
