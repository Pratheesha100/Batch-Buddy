import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Clock, Shield } from 'lucide-react';
import NavigationBar from './NavigationBar';
import Footer from '../nav_and_Footer/Footer';

const AboutUs = () => {
  const [isListening, setIsListening] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);

  const startListening = () => {
    setIsListening(true);
    // Add your voice command logic here
    setTimeout(() => setIsListening(false), 3000); // Temporary simulation
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavigationBar 
        studentDetails={studentDetails}
        isListening={isListening}
        startListening={startListening}
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.05] to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">About Batch Buddy</h1>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto animate-fade-in-delay">
            Empowering students with intelligent tools for better academic management
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            To revolutionize the way students manage their academic life by providing intelligent, 
            user-friendly tools that enhance productivity and learning outcomes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Student-Centric</h3>
            <p className="text-gray-600">
              Designed specifically for students, with features that address real academic challenges.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Focused Goals</h3>
            <p className="text-gray-600">
              Helping students achieve their academic goals through organized planning and tracking.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Time Management</h3>
            <p className="text-gray-600">
              Efficient tools for managing schedules, attendance, and important deadlines.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Reliable Support</h3>
            <p className="text-gray-600">
              Providing dependable assistance for all your academic management needs.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">John Doe</h3>
              <p className="text-gray-600">Lead Developer</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">Jane Smith</h3>
              <p className="text-gray-600">UI/UX Designer</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">Mike Johnson</h3>
              <p className="text-gray-600">Product Manager</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using Batch Buddy to manage their academic life.
          </p>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full text-lg font-medium transition-all hover:shadow-lg hover:scale-105 inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs; 