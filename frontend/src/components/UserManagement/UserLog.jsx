import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaUserShield } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Configure axios defaults
axios.defaults.withCredentials = true;

const UserLog = () => {
  const navigate = useNavigate();
  const [userFormData, setUserFormData] = useState({
    studentId: '',
    password: '',
  });
  const [adminFormData, setAdminFormData] = useState({
    studentId: '',
    password: '',
  });
  const [loading, setLoading] = useState({
    user: false,
    admin: false
  });

  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminChange = (e) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, user: true });
    try {
      console.log('Sending login request:', userFormData);
      const response = await axios.post('http://localhost:5000/api/user/login', {
        ...userFormData,
        isAdmin: false
      });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          _id: response.data._id,
          studentId: response.data.studentId,
          isAdmin: response.data.isAdmin
        }));
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome to Batch Buddy',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          try {
            console.log('Attempting to navigate to /home with user data:', response.data);
            navigate('/home', { 
              state: { 
                user: {
                  _id: response.data._id,
                  studentId: response.data.studentId,
                  isAdmin: response.data.isAdmin
                }
              } 
            });
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback to window.location if navigation fails
            window.location.href = '/home';
          }
        });
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || error.message || 'An error occurred during login',
      });
    } finally {
      setLoading({ ...loading, user: false });
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, admin: true });
    try {
      console.log('Sending admin login request:', adminFormData);
      const response = await axios.post('http://localhost:5000/api/user/login', {
        ...adminFormData,
        isAdmin: true
      });
      console.log('Admin login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.isAdmin ? 'admin' : 'user');
        Swal.fire({
          icon: 'success',
          title: 'Admin Login Successful!',
          showConfirmButton: false,
          timer: 1500,
        });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Admin Login Failed',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading({ ...loading, admin: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl flex gap-8 items-start">
        {/* User Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-xl shadow-xl"
        >
          <div className="text-center">
            <FaUser className="mx-auto h-12 w-12 text-white/80" />
            <h2 className="mt-4 text-3xl font-bold text-white">
              User Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleUserSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Student ID"
                  value={userFormData.studentId}
                  onChange={handleUserChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Password"
                  value={userFormData.password}
                  onChange={handleUserChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading.user}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading.user ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/reset-password"
                className="text-sm text-white/80 hover:text-white transition-colors duration-200"
              >
                Forgot your password?
              </Link>
              <Link
                to="/register"
                className="text-sm text-white/80 hover:text-white transition-colors duration-200"
              >
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </motion.div>

        {/* Admin Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-xl shadow-xl"
        >
          <div className="text-center">
            <FaUserShield className="mx-auto h-12 w-12 text-white/80" />
            <h2 className="mt-4 text-3xl font-bold text-white">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAdminSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="admin-studentId"
                  name="studentId"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Admin ID"
                  value={adminFormData.studentId}
                  onChange={handleAdminChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Admin Password"
                  value={adminFormData.password}
                  onChange={handleAdminChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading.admin}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading.admin ? 'Signing in...' : 'Admin Sign in'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserLog;
