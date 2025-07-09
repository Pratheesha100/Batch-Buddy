import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mic } from 'lucide-react';

const NavigationBar = ({ studentDetails, isListening, startListening }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/home" className="text-xl font-bold text-blue-600">Batch Buddy</Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/timetable" className="text-gray-600 hover:text-blue-600 transition-colors">Time Table</Link>
              <Link to="/attendance" className="text-gray-600 hover:text-blue-600 transition-colors">Attendance</Link>
              <Link to="/add-reminder" className="text-gray-600 hover:text-blue-600 transition-colors">Add Reminder</Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {studentDetails && (
              <div className="flex items-center mr-4">
                <div className="text-right mr-4">
                  <p className="text-sm font-semibold text-gray-700">{studentDetails.studentName}</p>
                  <p className="text-xs text-gray-500">{studentDetails.studentId}</p>
                </div>
              </div>
            )}
            <button
              onClick={startListening}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isListening 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/user-profile')}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 