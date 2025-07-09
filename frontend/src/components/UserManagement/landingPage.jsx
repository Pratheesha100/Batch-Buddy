import React from 'react';
import { Link } from 'react-router-dom';
import landingImage from '../../assets/landingPage1.png';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 p-6">
      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 mb-12">
        <Link to="/register">
          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg">
            Sign Up
          </button>
        </Link>
        <Link to="/login">
          <button className="px-6 py-2 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200">
            Sign In
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-4">
        <div className="text-center md:text-left md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome To
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Batch Buddy !!!
          </h1>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Batch Buddy makes<br />
            life easier by everything in one<br />
            place ......
          </p>
          <Link to="/get-started">
            <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg text-lg">
              Get Started
            </button>
          </Link>
        </div>

        <div className="md:w-1/2 flex justify-center items-center">
          <img 
            src={landingImage} 
            alt="Landing page illustration" 
            className="w-full max-w-xl object-cover rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
