import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { BookOpen, Beaker, Users, Clock, Calendar, Download, Mic } from 'lucide-react';
import './TimeTable.css';

const TimeTable = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const scheduleData = {
    Monday: [
      { time: '09:00 AM - 10:30 AM', subject: 'Advanced Mathematics', type: 'Lecture', room: 'Hall A-1', lecturer: 'Dr. Smith' },
      { time: '11:00 AM - 12:30 PM', subject: 'Database Systems', type: 'Lab', room: 'Lab 2B', lecturer: 'Ms. Johnson' },
      { time: '02:00 PM - 03:30 PM', subject: 'Software Engineering', type: 'Tutorial', room: 'Room 405', lecturer: 'Prof. Davis' },
    ],
    Tuesday: [
      { time: '09:00 AM - 11:00 AM', subject: 'Web Development', type: 'Lab', room: 'Lab 3A', lecturer: 'Mr. Wilson' },
      { time: '01:00 PM - 02:30 PM', subject: 'Data Structures', type: 'Lecture', room: 'Hall B-2', lecturer: 'Dr. Brown' },
    ],
    Wednesday: [
      { time: '10:00 AM - 11:30 AM', subject: 'Computer Networks', type: 'Lecture', room: 'Hall A-2', lecturer: 'Dr. Taylor' },
      { time: '02:00 PM - 04:00 PM', subject: 'Mobile Development', type: 'Lab', room: 'Lab 1C', lecturer: 'Ms. Anderson' },
    ],
    Thursday: [
      { time: '09:00 AM - 10:30 AM', subject: 'Artificial Intelligence', type: 'Lecture', room: 'Hall B-1', lecturer: 'Prof. White' },
      { time: '11:00 AM - 12:30 PM', subject: 'Operating Systems', type: 'Tutorial', room: 'Room 302', lecturer: 'Dr. Lee' },
    ],
    Friday: [
      { time: '09:00 AM - 11:00 AM', subject: 'Software Testing', type: 'Lab', room: 'Lab 2A', lecturer: 'Mr. Clark' },
      { time: '02:00 PM - 03:30 PM', subject: 'Cloud Computing', type: 'Lecture', room: 'Hall A-3', lecturer: 'Dr. Martin' },
    ],
    Saturday: [
      { time: '10:00 AM - 11:30 AM', subject: 'Project Management', type: 'Seminar', room: 'Hall C-1', lecturer: 'Prof. Adams' },
    ],
    Sunday: [],
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Lecture':
        return <BookOpen size={20} />;
      case 'Lab':
        return <Beaker size={20} />;
      case 'Tutorial':
        return <Users size={20} />;
      case 'Seminar':
        return <Users size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Lecture':
        return 'bg-blue-100 text-blue-600';
      case 'Lab':
        return 'bg-purple-100 text-purple-600';
      case 'Tutorial':
        return 'bg-green-100 text-green-600';
      case 'Seminar':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
              <p className="text-gray-600">View and manage your class schedule</p>
            </div>
            <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-600 text-sm font-medium transition-all hover:shadow-md">
              <Download className="w-5 h-5" />
              <span>Export Calendar</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex space-x-1 p-2">
                {days.map((day) => (
                  <button
                    key={day}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {scheduleData[selectedDay].length > 0 ? (
                <div className="space-y-4">
                  {scheduleData[selectedDay].map((session, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getTypeColor(session.type)}`}>
                          {getTypeIcon(session.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{session.subject}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {session.time}
                            </span>
                            <span className="text-sm text-gray-500">
                              Room {session.room}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">{session.lecturer}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(session.type)}`}>
                              {session.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Scheduled</h3>
                  <p className="text-gray-500">There are no classes scheduled for {selectedDay}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative mt-16">
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

export default TimeTable; 