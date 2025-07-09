import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './NavigationBar';
import { UserCircle, Mail, Phone, GraduationCap, Building, Users, Palette, Sun, Moon, ChevronDown } from 'lucide-react';

// Theme configurations moved outside component
const themes = {
  light: {
    name: 'Light',
    background: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    shadow: 'shadow-sm hover:shadow-md',
    gradient: 'from-blue-600 to-indigo-600',
    icon: <Sun className="w-5 h-5" />,
  },
  orange: {
    name: 'Orange',
    background: 'bg-orange-50',
    card: 'bg-orange-100',
    text: 'text-orange-900',
    textSecondary: 'text-orange-700',
    shadow: 'shadow-md hover:shadow-lg',
    gradient: 'from-orange-500 to-orange-700',
    icon: <Sun className="w-5 h-5 text-orange-600" />,
  },
  pink: {
    name: 'Pink',
    background: 'bg-pink-50',
    card: 'bg-pink-100',
    text: 'text-pink-900',
    textSecondary: 'text-pink-700',
    shadow: 'shadow-md hover:shadow-lg',
    gradient: 'from-pink-500 to-pink-700',
    icon: <Palette className="w-5 h-5 text-pink-600" />,
  },
  gray: {
    name: 'Gray',
    background: 'bg-gray-100',
    card: 'bg-gray-200',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    shadow: 'shadow-md hover:shadow-lg',
    gradient: 'from-gray-500 to-gray-700',
    icon: <Moon className="w-5 h-5 text-gray-600" />,
  },
};

const UserProfile = () => {
  const location = useLocation();
  const [studentDetails, setStudentDetails] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // Default to light theme

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

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

  const handleThemeChange = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('userTheme', newTheme);
      setIsThemeOpen(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 3000);
  };

  const ProfileSection = ({ icon: Icon, label, value }) => {
    const currentTheme = themes[theme] || themes.light;
    return (
      <div className={`flex items-center space-x-3 p-4 ${currentTheme.card} rounded-lg ${currentTheme.shadow} transition-shadow`}>
        <div className="flex-shrink-0">
          <Icon className={`w-6 h-6 ${theme === 'gray' ? 'text-gray-600' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${currentTheme.textSecondary}`}>{label}</p>
          <p className={`text-lg font-semibold ${currentTheme.text}`}>{value || 'Not provided'}</p>
        </div>
      </div>
    );
  };

  const currentTheme = themes[theme] || themes.light;

  if (!currentTheme) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <NavigationBar 
        studentDetails={studentDetails}
        isListening={isListening}
        startListening={startListening}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {studentDetails ? (
          <>
            {/* Theme Selector */}
            <div className="mb-6 flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 ${currentTheme.card} rounded-lg ${currentTheme.shadow} transition-all duration-200 hover:scale-105`}
                >
                  {currentTheme.icon}
                  <span className={`font-medium ${currentTheme.text}`}>{currentTheme.name}</span>
                  <ChevronDown className={`w-4 h-4 ${currentTheme.textSecondary} transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
                </button>
                {isThemeOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {Object.entries(themes).map(([themeKey, themeData]) => (
                      <button
                        key={themeKey}
                        onClick={() => handleThemeChange(themeKey)}
                        className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ${
                          theme === themeKey ? 'bg-gray-100' : ''
                        }`}
                      >
                        {themeData.icon}
                        <span className={`font-medium ${themeData.text}`}>{themeData.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Header */}
            <div className={`bg-gradient-to-r ${currentTheme.gradient} rounded-2xl shadow-xl p-8 mb-8`}>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className={`w-24 h-24 ${currentTheme.card} rounded-full flex items-center justify-center`}>
                    <UserCircle className={`w-16 h-16 ${theme === 'gray' ? 'text-gray-600' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold text-white mb-2`}>
                    {studentDetails.studentName}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Student ID: {studentDetails.studentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className={`${currentTheme.card} rounded-2xl shadow-lg p-6 space-y-6`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6 flex items-center`}>
                  <UserCircle className={`w-6 h-6 mr-2 ${theme === 'gray' ? 'text-gray-600' : 'text-blue-600'}`} />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <ProfileSection 
                    icon={UserCircle}
                    label="Full Name"
                    value={studentDetails.studentName}
                  />
                  <ProfileSection 
                    icon={Mail}
                    label="Email"
                    value={studentDetails.email}
                  />
                  <ProfileSection 
                    icon={Phone}
                    label="Contact Number"
                    value={studentDetails.contactNumber}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className={`${currentTheme.card} rounded-2xl shadow-lg p-6 space-y-6`}>
                <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6 flex items-center`}>
                  <GraduationCap className={`w-6 h-6 mr-2 ${theme === 'gray' ? 'text-gray-600' : 'text-blue-600'}`} />
                  Academic Information
                </h2>
                <div className="space-y-4">
                  <ProfileSection 
                    icon={GraduationCap}
                    label="Degree"
                    value={studentDetails.degree?.degreeName}
                  />
                  <ProfileSection 
                    icon={Building}
                    label="Faculty"
                    value={studentDetails.faculty?.facultyName}
                  />
                  <ProfileSection 
                    icon={Users}
                    label="Batch"
                    value={studentDetails.batch?.batchType}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className={`w-16 h-16 ${currentTheme.card} rounded-full`}></div>
              <div className={`h-4 w-48 ${currentTheme.card} rounded`}></div>
              <p className={currentTheme.textSecondary}>Loading profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 