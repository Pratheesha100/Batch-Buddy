import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock, FaUser, FaUserShield } from 'react-icons/fa';
import Swal from 'sweetalert2';

const UserLog = () => {
  const navigate = useNavigate();
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
  });
  const [adminFormData, setAdminFormData] = useState({
    email: '',
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
      const response = await axios.post('http://localhost:5000/api/user/login', userFormData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'user');
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          showConfirmButton: false,
          timer: 1500,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading({ ...loading, user: false });
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, admin: true });
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', adminFormData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'admin');
        Swal.fire({
          icon: 'success',
          title: 'Admin Login Successful!',
          showConfirmButton: false,
          timer: 1500,
        });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Admin Login Failed',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading({ ...loading, admin: false });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = 'http://localhost:5000/api/user/google';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Google Login Failed',
        text: 'Failed to initiate Google login',
      });
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
                  <FaEnvelope className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Email address"
                  value={userFormData.email}
                  onChange={handleUserChange}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="user-password"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign in with Google
              </button>
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
                  <FaEnvelope className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  placeholder="Admin Email"
                  value={adminFormData.email}
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
