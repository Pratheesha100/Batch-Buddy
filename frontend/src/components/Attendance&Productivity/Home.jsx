import React, { useState, useEffect } from 'react';
import { Mic, Calendar, Clock, ChevronRight, BookOpen, Beaker, Users, Check, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const BatchBuddy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [startSound, setStartSound] = useState(null);
  const [stopSound, setStopSound] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noTimetable, setNoTimetable] = useState(false);

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

  // Fetch student details and assigned timetable
  useEffect(() => {
    const fetchData = async () => {
      setNoTimetable(false);
      try {
        const userData = location.state?.user || JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        if (!userData?._id) return;

        // Debug: log the _id being used
        console.log('Fetching timetable assignment for user _id:', userData._id);

        // 1. Get the timetable assignment for this student
        const assignmentRes = await axios.get(
          `http://localhost:5000/api/timetable-assignments/student/${userData._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (assignmentRes.data && assignmentRes.data.timetableId) {
          // 2. Get the full timetable using the timetableId
          const timetableRes = await axios.get(
            `http://localhost:5000/api/timetable/${assignmentRes.data.timetableId._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setTimetable(timetableRes.data);
          // Debug: log the timetable days
          console.log('Fetched timetable days:', timetableRes.data.days?.map(d => d.day));
          setLoading(false);
        } else {
          setTimetable(null);
          setNoTimetable(true);
          setLoading(false);
        }

        // Fetch student details (optional, for display)
        if (userData?.studentId) {
          const studentResponse = await axios.get(`http://localhost:5000/api/user/student/${userData.studentId}`);
          if (studentResponse.data) {
            setStudentDetails(studentResponse.data);
          }
        }
      } catch (err) {
        setTimetable(null);
        if (err.response && err.response.status === 404) {
          setNoTimetable(true);
        } else {
          setNoTimetable(false);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // Initialize audio objects
  useEffect(() => {
    // Use reliable sound files
    const startAudio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    const stopAudio = new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3');
    
    startAudio.volume = 0.3;
    stopAudio.volume = 0.3;
    
    setStartSound(startAudio);
    setStopSound(stopAudio);

    return () => {
      startAudio.pause();
      stopAudio.pause();
    };
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Started listening...');
        if (startSound) {
          startSound.currentTime = 0;
          startSound.play().catch(error => console.error('Error playing start sound:', error));
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log('Stopped listening...');
        if (stopSound) {
          stopSound.currentTime = 0;
          stopSound.play().catch(error => console.error('Error playing stop sound:', error));
        }
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Recognized:', transcript);
        setTranscript(transcript);
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (stopSound) {
          stopSound.currentTime = 0;
          stopSound.play().catch(error => console.error('Error playing stop sound:', error));
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.error('Speech recognition not supported');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [startSound, stopSound]);

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
        console.log('Starting speech recognition...');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        speak("Sorry, there was an error starting voice recognition. Please try again.");
      }
    } else {
      speak("Sorry, voice recognition is not supported in your browser.");
    }
  };

  const speak = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => console.log('Started speaking...');
    utterance.onend = () => console.log('Finished speaking...');
    utterance.onerror = (event) => console.error('Speech synthesis error:', event);
    
    window.speechSynthesis.speak(utterance);
  };

  // Move these outside the component for reuse
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getAdjacentDays = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const yesterday = days[(today + 6) % 7];
    const tomorrow = days[(today + 1) % 7];
    return { yesterday, tomorrow };
  };

  const { yesterday, tomorrow } = getAdjacentDays();
  const today = getCurrentDay();
  // Debug: log the day values being used
  console.log('Today:', today, 'Yesterday:', yesterday, 'Tomorrow:', tomorrow);

  // Function to get schedule for a specific day
  const getScheduleForDay = (day) => {
    console.log('Getting schedule for day:', day);
    console.log('Current timetable:', timetable);
    
    if (!timetable || !timetable.days) {
      console.log('No timetable or days found');
      return [];
    }

    const dayObj = timetable.days.find(d => d.day === day);
    console.log('Found day object:', dayObj);
    
    if (!dayObj || !dayObj.slots || dayObj.slots.length === 0) {
      console.log('No slots found for day');
      return [];
    }

    return dayObj.slots.map((slot, index) => ({
      id: index + 1,
      subject: slot.subject,
      time: `${slot.startTime} - ${slot.endTime}`,
      type: slot.type || 'Lecture',
      location: slot.location
    }));
  };

  const handleVoiceCommand = (command) => {
    console.log('Processing command:', command);
    console.log('Current timetable state:', { loading, noTimetable, timetable });
    
    // Normalize the command
    const normalizedCommand = command.trim().toLowerCase().replace(/\s+/g, ' ');

    // Handle attendance marking commands with more flexible matching
    const attendancePatterns = [
      /(mark|record|take).*(attendance|present).*(for|on)?\s*(today|tomorrow|yesterday)?/i,
      /(mark|record|take).*(me|my).*(attendance|present).*(for|on)?\s*(today|tomorrow|yesterday)?/i,
      /(mark|record|take).*(my|me).*(attendance|present).*(for|on)?\s*(today|tomorrow|yesterday)?/i
    ];
    
    const attendanceMatch = attendancePatterns.find(pattern => pattern.test(normalizedCommand));
    if (attendanceMatch) {
      const dayMatch = normalizedCommand.match(/(today|tomorrow|yesterday)/i);
      const attDay = (dayMatch ? dayMatch[0] : 'today').toLowerCase();
      const dayMap = {
        'today': 'Today',
        'tomorrow': 'Tomorrow',
        'yesterday': 'Yesterday'
      };
      const selectedDay = dayMap[attDay];
      if (selectedDay) {
        console.log('Navigating to mark attendance for:', selectedDay);
        speak(`Taking you to mark ${attDay}'s attendance.`);
        setTimeout(() => {
          handleMarkAttendance(selectedDay);
        }, 1500);
        return;
      } else {
        speak("Please specify which day you want to mark attendance for: yesterday, today, or tomorrow.");
        return;
      }
    }

    // Check for timetable/schedule query
    const timeTablePatterns = [
      /(what('| i)?s|show|tell me|read|give me|display|say|speak).*(timetable|time table|schedule).*(today|tomorrow|yesterday)?/i,
      /(my|the).*(timetable|time table|schedule).*(today|tomorrow|yesterday)?/i,
      /(classes|lectures).*(today|tomorrow|yesterday)?/i
    ];

    let day = 'today';
    let matchedPattern = timeTablePatterns.find(pattern => pattern.test(normalizedCommand));
    
    if (matchedPattern) {
      const dayMatch = normalizedCommand.match(/(today|tomorrow|yesterday)/i);
      if (dayMatch) {
        day = dayMatch[0].toLowerCase();
      }
    }

    // If it's a timetable query, read out the schedule
    if (matchedPattern || 
        normalizedCommand.includes('timetable') || 
        normalizedCommand.includes('time table') || 
        normalizedCommand.includes('schedule') ||
        normalizedCommand.includes('classes') ||
        normalizedCommand.includes('lectures')) {
      
      // Get the actual day name from the timetable
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      console.log('Current day name:', dayName);
      
      // Get the schedule for the current day
      const schedule = getScheduleForDay(dayName);
      console.log('Retrieved schedule:', schedule);
      
      if (schedule && schedule.length > 0) {
        const response = `Here's your schedule for ${day}: ` +
          schedule.map((item, index) => {
            const isLast = index === schedule.length - 1;
            const timeStr = item.time.replace(/-/g, ' to ');
            return `${item.subject} from ${timeStr}, which is a ${item.type}${isLast ? '.' : '. Then, '}`;
          }).join('');
        console.log('Speaking response:', response);
        speak(response);
      } else {
        speak(`You have no scheduled classes for ${day}.`);
      }
      return;
    }

    // Default response with suggestions
    speak("I can help you with your timetable or attendance. Try saying 'show my timetable today' or 'mark my attendance for tomorrow'.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
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

      {/* Hero Section - Smaller Version */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 min-h-[60vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMXYxaC0xeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent"></div>
          {/* Animated Grid Lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Floating Orbs with Enhanced Animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse-slow delay-1000 mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow delay-2000 mix-blend-screen"></div>

        {/* Main Content - Compact Structure */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex flex-col items-center text-center">
            {/* AI Voice Assistant Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 mb-4 animate-fade-in hover:bg-white/20 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Now with AI Voice Assistant
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl font-bold leading-tight animate-fade-in max-w-2xl">
              Your Intelligent <br />
              <span className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent animate-gradient">Academic Companion</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg opacity-90 max-w-lg animate-fade-in-delay leading-relaxed mt-4">
              Streamline your academic life with smart scheduling, attendance tracking, and productivity tools designed for modern students.
            </p>
            
            {/* Central Mic Button */}
            <div className="mt-8 mb-4 relative">
              <button 
                onClick={startListening}
                className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
                    : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                }`}
              >
                <div className={`absolute inset-0 rounded-full ${
                  isListening ? 'animate-ping bg-green-400/30' : ''
                }`}></div>
                <div className={`absolute inset-0 rounded-full ${
                  isListening ? 'animate-ping bg-green-400/20 delay-300' : ''
                }`}></div>
                <Mic className={`w-12 h-12 ${isListening ? 'text-white' : 'text-white/90 group-hover:text-white'}`} />
          </button>
              
              {/* Voice Command Instructions */}
              <div className="mt-2 text-white/80 text-sm">
                {isListening ? (
                  <p className="animate-pulse">Listening...</p>
                ) : (
                  <p>Click to speak</p>
                )}
              </div>
            </div>
            
            {/* Voice Command Display */}
            {transcript && (
              <div className="mt-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 text-center animate-fade-in max-w-md">
                <p className="text-sm font-medium">You said:</p>
                <p className="mt-1">{transcript}</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start p-1 hover:border-white/50 transition-colors">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { day: yesterday, label: 'Yesterday' },
            { day: today, label: 'Today' },
            { day: tomorrow, label: 'Tomorrow' }
          ].map(({ day, label }) => (
            <div key={day} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 hover:scale-[1.02]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{label}</h2>
                {label === 'Today' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading schedule...</p>
                  </div>
                ) : noTimetable ? (
                  <div className="text-center py-4 text-gray-500">
                    No timetable assigned yet. Please contact your administrator.
                  </div>
                ) : timetable && timetable.days ? (
                  getScheduleForDay(day).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800">{item.subject}</h3>
                        <p className="text-xs text-gray-500">{item.time}</p>
                        {item.location && (
                          <p className="text-xs text-gray-500 mt-1">Location: {item.location}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No timetable data available.
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleMarkAttendance(label)}
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
