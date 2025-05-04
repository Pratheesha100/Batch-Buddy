import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowLeft, FaGraduationCap, FaBook } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
    confirmPassword: "",
    year: "",
    semester: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
  const semesters = ["Semester 1", "Semester 2"];

  const validateStudentId = (value) => {
    if (!/^[a-zA-Z0-9]{1,10}$/.test(value)) {
      return "Student ID can contain letters and numbers (max 10 characters)";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateYear = (value) => {
    if (!value) {
      return "Please select a year";
    }
    return "";
  };

  const validateSemester = (value) => {
    if (!value) {
      return "Please select a semester";
    }
    return "";
  };

  const checkStudentExists = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/check-student/${studentId}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking student:', error);
      throw new Error('Failed to verify student ID');
    }
  };

  const checkUserLoginExists = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/check-login/${studentId}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking user login:', error);
      throw new Error('Failed to verify user login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate fields as user types
    let error = "";
    switch (name) {
      case "studentId":
        error = validateStudentId(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "year":
        error = validateYear(value);
        break;
      case "semester":
        error = validateSemester(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First check if student exists in students collection
      const studentExists = await checkStudentExists(formData.studentId);
      if (!studentExists) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Student ID not found in the system. Please contact your administrator.',
        });
        setLoading(false);
        return;
      }

      // Then check if user already has a login
      const userLoginExists = await checkUserLoginExists(formData.studentId);
      if (userLoginExists) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An account already exists for this Student ID.',
        });
        setLoading(false);
        return;
      }

      // Validate all fields before submission
      const newErrors = {};
      Object.keys(formData).forEach(key => {
        if (key !== "confirmPassword") {
          let error = "";
          switch (key) {
            case "studentId":
              error = validateStudentId(formData[key]);
              break;
            case "password":
              error = validatePassword(formData[key]);
              break;
            case "year":
              error = validateYear(formData[key]);
              break;
            case "semester":
              error = validateSemester(formData[key]);
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
        const { confirmPassword, ...dataToSend } = formData;
        console.log('Sending registration request:', dataToSend);
        
        const response = await axios.post('http://localhost:5000/api/user/register', dataToSend);
        console.log('Registration response:', response.data);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Welcome to Batch Buddy',
            showConfirmButton: false,
            timer: 1500,
          });
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">BatchBuddy</h2>
          <p className="text-white/80">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                placeholder="Student ID"
                onChange={handleChange}
                required
                maxLength="10"
                className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
              />
            </div>
            {errors.studentId && <p className="text-red-300 text-sm mt-1">{errors.studentId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-white/60" />
                </div>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-blue-600">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.year && <p className="text-red-300 text-sm mt-1">{errors.year}</p>}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="h-5 w-5 text-white/60" />
                </div>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white"
                >
                  <option value="">Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester} className="bg-blue-600">
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
              {errors.semester && <p className="text-red-300 text-sm mt-1">{errors.semester}</p>}
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
              />
            </div>
            {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-white placeholder-white/60"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-white/80 hover:text-white transition-colors duration-200 flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
