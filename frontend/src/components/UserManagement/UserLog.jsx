import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaLock } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Configure axios defaults
axios.defaults.withCredentials = true;

const UserLog = () => {
  const navigate = useNavigate();
  const [userFormData, setUserFormData] = useState({
    studentId: '',
    password: '',
  });
  const [loading, setLoading] = useState({ user: false });

  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, user: true });
    try {
      // Check for admin credentials
      if (userFormData.studentId === 'admin123' && userFormData.password === 'admin123') {
        Swal.fire({
          icon: 'success',
          title: 'Admin Login Successful!',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          navigate('/simulate-admin');
        });
        return;
      }
      // Normal student login
      const response = await axios.post('http://localhost:5000/api/user/login', {
        ...userFormData,
        isAdmin: false
      });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data));
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome to Batch Buddy',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          try {
            navigate('/home', { state: { user: response.data } });
          } catch (navError) {
            window.location.href = '/home';
          }
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || error.message || 'An error occurred during login',
      });
    } finally {
      setLoading({ ...loading, user: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 opacity-90" />
      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md mx-auto p-10 rounded-3xl shadow-2xl bg-white/20 backdrop-blur-2xl border border-white/30"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-400 to-indigo-500 p-4 rounded-full shadow-lg mb-4">
            <FaUser className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-white drop-shadow mb-2 tracking-tight">Welcome Back!</h2>
          <p className="text-blue-100 text-base font-medium mb-2">Sign in to your Batch Buddy account</p>
        </div>
        <form className="space-y-6" onSubmit={handleUserSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-blue-300" />
              </span>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                className="block w-full rounded-xl border-none py-3 pl-10 pr-4 bg-white/60 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-400 focus:bg-white/90 transition-all text-base shadow-sm"
                placeholder="Student ID "
                value={userFormData.studentId}
                onChange={handleUserChange}
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-blue-300" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border-none py-3 pl-10 pr-4 bg-white/60 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-400 focus:bg-white/90 transition-all text-base shadow-sm"
                placeholder="Password"
                value={userFormData.password}
                onChange={handleUserChange}
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading.user}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading.user ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="flex items-center justify-between mt-4">
            <Link
              to="/reset-password"
              className="text-sm text-blue-100 hover:text-white transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            <Link
              to="/register"
              className="text-sm text-blue-100 hover:text-white transition-colors duration-200"
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </motion.div>
      {/* Optional: Add animated background shapes or particles here for extra flair */}
      <style>{`
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 6s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default UserLog;
