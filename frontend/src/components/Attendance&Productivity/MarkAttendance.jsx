import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Users, BookOpen, Beaker, Calendar, Mic, Check, X, User } from 'lucide-react';
import axios from 'axios';

import { Link } from 'react-router-dom';

const MarkAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(location.state?.day || 'Today');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [startSound, setStartSound] = useState(null);
  const [stopSound, setStopSound] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize audio objects
  useEffect(() => {
    const startAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    const stopAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
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

  const handleMarkPresent = () => {
    // Mark all subjects as present
    setSubjects(subjects.map(subject => ({
      ...subject,
      attended: true
    })));
    speak(`Marked all subjects as present for ${selectedDay.toLowerCase()}`);
  };

  const handleMarkAbsent = () => {
    // Mark all subjects as absent
    setSubjects(subjects.map(subject => ({
      ...subject,
      attended: false
    })));
    speak(`Marked all subjects as absent for ${selectedDay.toLowerCase()}`);
  };

  const handleVoiceCommand = (command) => {
    console.log('Processing command:', command);
    
    // Handle submit attendance command
    if (command.includes('submit') && command.includes('attendance')) {
      speak("Submitting your attendance and taking you to the attendance view.");
      handleSubmit();
      return;
    }

    // Handle attendance marking commands
    const attendanceMatch = command.match(/(?:mark|set|record).*(?:me|attendance).*(?:as)?\s*(present|absent)/i);
    
    if (attendanceMatch) {
      const status = attendanceMatch[1].toLowerCase();
      if (status === 'present') {
        // Mark all subjects as present
        setSubjects(subjects.map(subject => ({
          ...subject,
          attended: true
        })));
        speak(`Marked all subjects as present for ${selectedDay.toLowerCase()}`);
      } else if (status === 'absent') {
        // Mark all subjects as absent
        setSubjects(subjects.map(subject => ({
          ...subject,
          attended: false
        })));
        speak(`Marked all subjects as absent for ${selectedDay.toLowerCase()}`);
      }
      return;
    }

    // Handle individual subject attendance
    const subjectMatch = command.match(/(?:mark|set|record).*(?:me|attendance).*(?:as)?\s*(present|absent).*(?:for|in)?\s*([a-zA-Z\s]+)/i);
    if (subjectMatch) {
      const status = subjectMatch[1].toLowerCase();
      const subjectName = subjectMatch[2].trim();
      const subject = subjects.find(s => 
        s.name.toLowerCase().includes(subjectName.toLowerCase())
      );
      
      if (subject) {
        if (status === 'present') {
          setSubjects(subjects.map(s => 
            s.id === subject.id ? { ...s, attended: true } : s
          ));
          speak(`Marked you as present for ${subject.name}`);
        } else if (status === 'absent') {
          setSubjects(subjects.map(s => 
            s.id === subject.id ? { ...s, attended: false } : s
          ));
          speak(`Marked you as absent for ${subject.name}`);
        }
      } else {
        speak(`Sorry, I couldn't find a subject matching "${subjectName}". Available subjects are: ${subjects.map(s => s.name).join(', ')}`);
      }
      return;
    }

    // Handle navigation commands
    if (command.includes('go back') || command.includes('back to home')) {
      speak("Navigating back to home page.");
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    // Default response
    speak("I didn't quite catch that. You can say 'Mark me as present' or 'Mark me as absent' to mark your attendance. You can also specify a subject like 'Mark me as present for Advanced Mathematics'. To submit attendance, say 'Submit attendance'");
  };

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

  const handleSubmit = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = localStorage.getItem('token');
      
      if (!userData?._id) {
        speak("Please log in to submit attendance.");
        return;
      }

      // Prepare attendance records
      const records = subjects.map(subject => ({
        subject: subject.name,
        status: subject.attended ? 'present' : 'absent',
        time: subject.time,
        type: subject.type
      }));

      // Get the date for the selected day
      const dayLabel = location.state?.day || 'Today';
      const today = new Date();
      let date;
      
      switch(dayLabel) {
        case 'Yesterday':
          date = new Date(today.setDate(today.getDate() - 1));
          break;
        case 'Tomorrow':
          date = new Date(today.setDate(today.getDate() + 1));
          break;
        default:
          date = new Date();
      }

      // Submit attendance to backend
      const response = await axios.post(
        'http://localhost:5000/api/attendance/submit',
        {
          date: date.toISOString(),
          records
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        speak("Attendance submitted successfully!");
        // Navigate to attendance view
    navigate('/attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      speak("Sorry, there was an error submitting your attendance. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        if (!userData?._id) return;

        // Get timetable assignment
        const assignmentRes = await axios.get(
          `http://localhost:5000/api/timetable-assignments/student/${userData._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (assignmentRes.data && assignmentRes.data.timetableId) {
          // Get full timetable
          const timetableRes = await axios.get(
            `http://localhost:5000/api/timetable/${assignmentRes.data.timetableId._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setTimetable(timetableRes.data);

          // Find the slots for the selected day
          const dayLabel = location.state?.day || 'Today';
          const daysMap = {
            'Today': new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            'Tomorrow': new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
            'Yesterday': new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
          };
          const realDay = daysMap[dayLabel] || dayLabel;
          const dayObj = timetableRes.data.days.find(d => d.day === realDay);
          if (dayObj) {
            setSubjects(dayObj.slots.map((slot, idx) => ({
              id: idx + 1,
              name: slot.subject,
              time: `${slot.startTime} - ${slot.endTime}`,
              type: slot.type || 'Lecture',
              attended: false,
            })));
          } else {
            setSubjects([]);
          }
        } else {
          setSubjects([]);
        }
      } catch (err) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [location.state?.day]);

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
          <h1 className="text-2xl font-bold text-gray-900 ml-4">Mark Attendance - {selectedDay}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading schedule...</div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No classes scheduled for this day.
                </div>
              ) : (
                subjects.map((subject) => (
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
                ))
              )}
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