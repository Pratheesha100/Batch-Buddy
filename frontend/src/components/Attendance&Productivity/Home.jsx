import React from 'react';
import { Mic, Calendar, Clock, ChevronRight, BookOpen, Beaker, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BatchBuddy = () => {
  const navigate = useNavigate();
  
  const scheduleData = {
    Yesterday: [
      { id: 1, subject: 'Web Development', time: '09:00 AM - 11:00 AM', type: 'Lab' },
      { id: 2, subject: 'Data Structures', time: '01:00 PM - 02:30 PM', type: 'Lecture' },
    ],
    Today: [
      { id: 1, subject: 'Advanced Mathematics', time: '09:00 AM - 10:30 AM', type: 'Lecture' },
      { id: 2, subject: 'Database Systems', time: '11:00 AM - 12:30 PM', type: 'Lab' },
      { id: 3, subject: 'Software Engineering', time: '02:00 PM - 03:30 PM', type: 'Tutorial' },
    ],
    Tomorrow: [
      { id: 1, subject: 'Computer Networks', time: '10:00 AM - 11:30 AM', type: 'Lecture' },
      { id: 2, subject: 'Mobile Development', time: '02:00 PM - 04:00 PM', type: 'Lab' },
    ],
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Lecture':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Lab':
        return <Beaker className="w-5 h-5 text-blue-500" />;
      case 'Tutorial':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleMarkAttendance = (day) => {
    navigate('/mark-attendance', { state: { day } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
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
                <input type="search" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm w-48 focus:w-64 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="text-gray-500 hover:text-blue-600 hover:scale-110 transition-all">
                <Mic className="w-5 h-5" />
              </button>
              <Link to="/signin" className="text-gray-500 hover:text-blue-600 text-sm font-medium">Sign In</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:scale-105">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.05] to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Welcome to Batch Buddy</h1>
          <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto animate-fade-in-delay">
            Your intelligent companion for managing academic schedules, attendance, and reminders
          </p>
          <button className="bg-white/20 hover:bg-white/30 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 mx-auto backdrop-blur-sm hover:shadow-2xl animate-bounce-slow">
            <Mic className="w-10 h-10" />
          </button>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Yesterday', 'Today', 'Tomorrow'].map((day) => (
            <div key={day} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 hover:scale-[1.02]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{day}</h2>
                {day === 'Today' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {scheduleData[day].map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800">{item.subject}</h3>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleMarkAttendance(day)}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                Mark Attendance
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Special */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Special</h2>
          <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-6 py-3 rounded-full text-gray-600 text-sm font-medium transition-all hover:shadow-md">
            <span>View Calendar</span>
            <Calendar className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-t-4 border-red-500 hover:scale-[1.02]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ITPM Evaluation</h3>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>18-03-2024</span>
              </span>
              <span className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-red-500" />
                <span>06:30 PM</span>
              </span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-t-4 border-blue-500 hover:scale-[1.02]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">NDM Lab Test</h3>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>18-03-2024</span>
              </span>
              <span className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>03:00 PM</span>
              </span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-t-4 border-green-500 hover:scale-[1.02]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">DS Viva</h3>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>18-03-2024</span>
              </span>
              <span className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-green-500" />
                <span>--</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
                Batch Buddy
              </h3>
              <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                Your intelligent academic companion for a better learning experience.
                Manage schedules, track attendance, and never miss important deadlines.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">About</Link></li>
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Features</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Connect</h4>
              <ul className="space-y-4">
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Twitter</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">LinkedIn</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">GitHub</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} Batch Buddy. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
                <Link to="/terms" className="hover:text-white transition-all">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-white transition-all">Privacy Policy</Link>
                <Link to="/cookies" className="hover:text-white transition-all">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BatchBuddy;
