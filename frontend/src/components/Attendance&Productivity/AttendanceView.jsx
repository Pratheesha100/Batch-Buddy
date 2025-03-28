import React, { useState } from 'react';
import { Clock, BarChart2, BookOpen, Calendar, Beaker, Users, Mic, Search } from 'lucide-react';
import { Link } from "react-router-dom";

const AttendanceView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  // Sample data for different periods
  const attendanceData = {
    daily: {
      totalHours: '124.5',
      attendanceRate: '92%',
      classesToday: '4',
      studyStreak: '15 days',
      voiceRecognition: '85%',
      timeDistribution: {
        lectures: 60,
        selfStudy: 20,
        exams: 10,
        labWork: 10
      }
    },
    weekly: {
      totalHours: '32.5',
      attendanceRate: '88%',
      classesToday: '18',
      studyStreak: '2 weeks',
      voiceRecognition: '82%',
      timeDistribution: {
        lectures: 50,
        selfStudy: 30,
        exams: 5,
        labWork: 15
      }
    },
    monthly: {
      totalHours: '148.0',
      attendanceRate: '90%',
      classesToday: '76',
      studyStreak: '1 month',
      voiceRecognition: '88%',
      timeDistribution: {
        lectures: 55,
        selfStudy: 25,
        exams: 12,
        labWork: 8
      }
    }
  };

  // Get current period's data
  const currentData = attendanceData[selectedPeriod];

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
        {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Attendance Overview</h1>
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                  selectedPeriod === 'daily' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPeriod('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                  selectedPeriod === 'weekly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPeriod('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                  selectedPeriod === 'monthly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Hours</p>
                  <h2 className="text-3xl font-bold">{currentData.totalHours}</h2>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Attendance Rate</p>
                  <h2 className="text-3xl font-bold">{currentData.attendanceRate}</h2>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <BarChart2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    {selectedPeriod === 'daily' ? 'Classes Today' : 'Total Classes'}
                  </p>
                  <h2 className="text-3xl font-bold">{currentData.classesToday}</h2>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Study Streak</p>
                  <h2 className="text-3xl font-bold">{currentData.studyStreak}</h2>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Voice Recognition</p>
                  <h2 className="text-3xl font-bold">{currentData.voiceRecognition}</h2>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mic className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Time Distribution and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6">Time Distribution</h3>
            <div className="space-y-6">
              <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Lectures</span>
                    <span className="text-gray-900">{currentData.timeDistribution.lectures}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${currentData.timeDistribution.lectures}%` }}
                    ></div>
                </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Self-Study</span>
                    <span className="text-gray-900">{currentData.timeDistribution.selfStudy}%</span>
              </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${currentData.timeDistribution.selfStudy}%` }}
                    ></div>
                </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Exams</span>
                    <span className="text-gray-900">{currentData.timeDistribution.exams}%</span>
              </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-purple-500 rounded-full" 
                      style={{ width: `${currentData.timeDistribution.exams}%` }}
                    ></div>
                </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Lab Work</span>
                    <span className="text-gray-900">{currentData.timeDistribution.labWork}%</span>
              </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-orange-500 rounded-full" 
                      style={{ width: `${currentData.timeDistribution.labWork}%` }}
                    ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6">Upcoming Events</h3>
            <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-medium">Advanced Mathematics</h4>
                    <p className="text-gray-500 text-sm">Today, 10:00 AM</p>
                </div>
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded">LECTURE</span>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Beaker className="w-5 h-5 text-purple-600" />
              </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-medium">Chemistry Lab</h4>
                    <p className="text-gray-500 text-sm">Today, 2:00 PM</p>
                </div>
                  <span className="bg-purple-100 text-purple-600 text-xs font-medium px-2.5 py-0.5 rounded">LAB</span>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
              </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-medium">Study Group</h4>
                    <p className="text-gray-500 text-sm">Tomorrow, 9:00 AM</p>
                </div>
                  <span className="bg-green-100 text-green-600 text-xs font-medium px-2.5 py-0.5 rounded">GROUP</span>
                </div>
              </div>
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

export default AttendanceView; 