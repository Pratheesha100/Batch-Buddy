import React, { useState } from "react";
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

  const inputClassName = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";
  const selectClassName = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200";
  const errorClassName = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">BatchBuddy</h2>
          <p className="text-white/80">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="text"
              name="itNumber"
              value={formData.itNumber}
              placeholder="IT Number"
              onChange={handleChange}
              required
              maxLength="10"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.itNumber && <p className="text-red-300 text-sm mt-1">{errors.itNumber}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email Address"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="Phone Number"
              onChange={handleChange}
              required
              maxLength="10"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.phoneNumber && <p className="text-red-300 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <input
              type="text"
              name="year"
              value={formData.year}
              readOnly
              disabled
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
          </div>

          <div>
            <select 
              name="batch" 
              value={formData.batch} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            >
              <option value="" className="bg-gray-800">Select Batch</option>
              <option value="Y1S1" className="bg-gray-800">Y1S1</option>
              <option value="Y1S2" className="bg-gray-800">Y1S2</option>
              <option value="Y2S1" className="bg-gray-800">Y2S1</option>
              <option value="Y2S2" className="bg-gray-800">Y2S2</option>
              <option value="Y3S1" className="bg-gray-800">Y3S1</option>
              <option value="Y3S2" className="bg-gray-800">Y3S2</option>
              <option value="Y4S1" className="bg-gray-800">Y4S1</option>
              <option value="Y4S2" className="bg-gray-800">Y4S2</option>
            </select>
          </div>

          <div>
            <select 
              name="weekType" 
              value={formData.weekType} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            >
              <option value="" className="bg-gray-800">Select Week Type</option>
              <option value="WE" className="bg-gray-800">Weekend</option>
              <option value="WD" className="bg-gray-800">Weekday</option>
            </select>
          </div>

          <div>
            <select 
              name="degree" 
              value={formData.degree} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            >
              <option value="" className="bg-gray-800">Select Degree</option>
              <option value="BScIT" className="bg-gray-800">BSc Honours Specialization in Information Technology</option>
              <option value="BScSE" className="bg-gray-800">BSc Honours Specialization in Software Engineering</option>
              <option value="BScDS" className="bg-gray-800">BSc Honours Specialization in Data Science</option>
              <option value="BScIM" className="bg-gray-800">BSc Honours Specialization in Interactive Media</option>
            </select>
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
            />
            {errors.confirmPassword && <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
              className="h-4 w-4 bg-white/10 border-white/20 rounded focus:ring-blue-400 text-blue-600"
            />
            <label className="ml-2 block text-sm text-white/80">
              I agree to the terms and conditions
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-white-600 text-blue rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-white/80">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
