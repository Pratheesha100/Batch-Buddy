import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaCalendarAlt, FaTasks, FaBell } from 'react-icons/fa';

const Home = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from location state or localStorage
    const userData = location.state?.user || JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setUser(userData);
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-100 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name || 'Student'}!
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <FaUser className="text-blue-500 text-3xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Student ID</h2>
              <p className="text-gray-600">{user?.studentId || 'Not available'}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <FaCalendarAlt className="text-green-500 text-3xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Batch</h2>
              <p className="text-gray-600">{user?.batch || 'Not available'}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <FaTasks className="text-purple-500 text-3xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Department</h2>
              <p className="text-gray-600">{user?.department || 'Not available'}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <FaBell className="text-yellow-500 text-3xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Email</h2>
              <p className="text-gray-600">{user?.email || 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home; 