import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Calendar, Clock, ChevronRight, BookOpen, Beaker, Users } from "lucide-react";
import { Link } from "react-router-dom";
import axios from 'axios';
import NavigationBar from './NavigationBar';

const TimeTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [startSound, setStartSound] = useState(null);
  const [stopSound, setStopSound] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

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

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const userData = location.state?.user || JSON.parse(localStorage.getItem('userData'));
        if (userData?.studentId) {
          const response = await axios.get(`http://localhost:5000/api/user/student/${userData.studentId}`);
          if (response.data) {
            setStudentDetails(response.data);
          }
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
      }
    };

    fetchStudentDetails();
  }, [location]);

  const startListening = () => {
    setIsListening(true);
    // Add your voice command logic here
    setTimeout(() => setIsListening(false), 3000); // Temporary simulation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar 
        studentDetails={studentDetails}
        isListening={isListening}
        startListening={startListening}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Weekly Schedule</h1>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Export Calendar</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {scheduleData[selectedDay].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        item.type === 'Lecture' ? 'bg-blue-50' :
                        item.type === 'Lab' ? 'bg-green-50' :
                        'bg-purple-50'
                      }`}>
                        {item.type === 'Lecture' ? <BookOpen className="w-6 h-6 text-blue-600" /> :
                         item.type === 'Lab' ? <Beaker className="w-6 h-6 text-green-600" /> :
                         <Users className="w-6 h-6 text-purple-600" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.subject}</h3>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default TimeTable; 