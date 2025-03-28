import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Users, BookOpen, Beaker, Calendar, Mic } from 'lucide-react';
import './MarkAttendance.css';
import { Link } from 'react-router-dom';

const MarkAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const day = location.state?.day || 'Today';
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Advanced Mathematics', time: '09:00 AM - 10:30 AM', type: 'Lecture', attended: false },
    { id: 2, name: 'Database Systems', time: '11:00 AM - 12:30 PM', type: 'Lab', attended: false },
    { id: 3, name: 'Software Engineering', time: '02:00 PM - 03:30 PM', type: 'Tutorial', attended: false },
  ]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Lecture':
        return <BookOpen size={20} />;
      case 'Lab':
        return <Beaker size={20} />;
      case 'Tutorial':
        return <Users size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Lecture':
        return 'attendance-lecture';
      case 'Lab':
        return 'attendance-lab';
      case 'Tutorial':
        return 'attendance-tutorial';
      default:
        return 'attendance-default';
    }
  };

  const toggleAttendance = (id) => {
    setSubjects(subjects.map(subject =>
      subject.id === id ? { ...subject, attended: !subject.attended } : subject
    ));
  };

  const handleSubmit = () => {
    // Here you would typically send the attendance data to your backend
    console.log('Attendance submitted:', subjects);
    navigate('/attendance');
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 ml-4">Mark Attendance - {day}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        subject.type === 'Lecture' ? 'bg-blue-50' :
                        subject.type === 'Lab' ? 'bg-green-50' :
                        'bg-purple-50'
                      }`}>
                        {getTypeIcon(subject.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{subject.time}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAttendance(subject.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        subject.attended 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {subject.attended ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Total Classes</span>
                  <span className="text-xl font-semibold text-gray-900">{subjects.length}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Marked Present</span>
                  <span className="text-xl font-semibold text-green-600">{subjects.filter(s => s.attended).length}</span>
                </div>
                <div className="flex justify-between items-center pb-4">
                  <span className="text-gray-600">Remaining</span>
                  <span className="text-xl font-semibold text-blue-600">{subjects.filter(s => !s.attended).length}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                Submit Attendance
              </button>
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

export default MarkAttendance; 