import React from 'react';
import { Link } from "react-router-dom";
import { Mic, Search } from "lucide-react";

const Navbar = ({ isListening, startListening }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-500 hover:to-indigo-500 transition-all">
              Batch Buddy
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/timetable" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">Time Table</Link>
              <Link to="/attendance" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">Attendance</Link>
              <Link to="/add-reminder" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">Add Reminder</Link>
              <Link to="/profile" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">Profile</Link>
              <Link to="/contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-all">Contact</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm w-48 focus:w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button 
              onClick={startListening}
              className={`text-gray-500 hover:text-blue-600 hover:scale-110 transition-all ${
                isListening ? 'animate-pulse bg-green-400/40' : ''
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-green-400' : 'text-gray-500'}`} />
            </button>
            <Link to="/signin" className="text-gray-500 hover:text-blue-600 text-sm font-medium">Sign In</Link>
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:scale-105">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 