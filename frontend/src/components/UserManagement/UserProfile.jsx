import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaCamera, FaCog, FaPalette, FaLock, FaSave, FaSpinner, FaEdit, FaTimes, FaMoon, FaSun } from 'react-icons/fa';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const themes = [
    { 
      id: 'default', 
      name: 'Default', 
      colors: { 
        primary: 'from-blue-500 to-blue-600',
        secondary: 'bg-white/10',
        text: 'text-white',
        textSecondary: 'text-white/80',
        border: 'border-white/20',
        input: 'bg-white/10',
        button: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'bg-white/10 hover:bg-white/20'
      } 
    },
    { 
      id: 'dark', 
      name: 'Dark Mode', 
      colors: { 
        primary: 'from-gray-900 to-gray-800',
        secondary: 'bg-gray-800/50',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        border: 'border-gray-700',
        input: 'bg-gray-800/50',
        button: 'bg-gray-700 hover:bg-gray-600',
        buttonSecondary: 'bg-gray-800/50 hover:bg-gray-700/50'
      } 
    },
    { 
      id: 'light', 
      name: 'Light Mode', 
      colors: { 
        primary: 'from-gray-100 to-white',
        secondary: 'bg-white/80',
        text: 'text-gray-800',
        textSecondary: 'text-gray-600',
        border: 'border-gray-200',
        input: 'bg-white/80',
        button: 'bg-blue-500 hover:bg-blue-600',
        buttonSecondary: 'bg-gray-100 hover:bg-gray-200'
      } 
    },
    { 
      id: 'ocean', 
      name: 'Ocean', 
      colors: { 
        primary: 'from-blue-600 to-cyan-500',
        secondary: 'bg-cyan-500/10',
        text: 'text-white',
        textSecondary: 'text-cyan-100',
        border: 'border-cyan-400/20',
        input: 'bg-cyan-500/10',
        button: 'bg-cyan-600 hover:bg-cyan-700',
        buttonSecondary: 'bg-cyan-500/10 hover:bg-cyan-500/20'
      } 
    },
    { 
      id: 'forest', 
      name: 'Forest', 
      colors: { 
        primary: 'from-green-600 to-emerald-500',
        secondary: 'bg-emerald-500/10',
        text: 'text-white',
        textSecondary: 'text-emerald-100',
        border: 'border-emerald-400/20',
        input: 'bg-emerald-500/10',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        buttonSecondary: 'bg-emerald-500/10 hover:bg-emerald-500/20'
      } 
    },
    { 
      id: 'sunset', 
      name: 'Sunset', 
      colors: { 
        primary: 'from-orange-500 to-red-500',
        secondary: 'bg-red-500/10',
        text: 'text-white',
        textSecondary: 'text-red-100',
        border: 'border-red-400/20',
        input: 'bg-red-500/10',
        button: 'bg-red-600 hover:bg-red-700',
        buttonSecondary: 'bg-red-500/10 hover:bg-red-500/20'
      } 
    }
  ];

  const [profile, setProfile] = useState(() => {
    const savedTheme = localStorage.getItem('userTheme') || 'default';
    return {
      name: 'John Doe',
      itNumber: 'IT12345678',
      email: 'john.doe@gmail.com',
      phoneNumber: '1234567890',
      year: '2025',
      batch: 'Y1S1',
      weekType: 'WD',
      degree: 'BScIT',
      theme: savedTheme
    };
  });

  const currentTheme = themes.find(t => t.id === profile.theme) || themes[0];

  useEffect(() => {
    localStorage.setItem('userTheme', profile.theme);
  }, [profile.theme]);

  const validateITNumber = (value) => {
    if (!/^[a-zA-Z0-9]{1,10}$/.test(value)) {
      return "IT number can contain letters and numbers (max 10 characters)";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value.endsWith("@gmail.com")) {
      return "Email must end with @gmail.com";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!/^\d{10}$/.test(value)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateAlphanumeric = (value) => {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "Only letters and numbers are allowed";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));

    let error = "";
    switch (name) {
      case "itNumber":
        error = validateITNumber(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      case "name":
        error = validateAlphanumeric(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSaveChanges = async () => {
    const newErrors = {};
    Object.keys(profile).forEach(key => {
      if (key !== "theme") {
        let error = "";
        switch (key) {
          case "itNumber":
            error = validateITNumber(profile[key]);
            break;
          case "email":
            error = validateEmail(profile[key]);
            break;
          case "phoneNumber":
            error = validatePhoneNumber(profile[key]);
            break;
          case "name":
            error = validateAlphanumeric(profile[key]);
            break;
          default:
            break;
        }
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleThemeChange = (themeId) => {
    setProfile(prev => ({ ...prev, theme: themeId }));
    setShowThemeModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please upload an image file" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setErrors(prev => ({ ...prev, image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.colors.primary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-4xl mx-auto ${currentTheme.colors.secondary} backdrop-blur-sm rounded-2xl shadow-xl p-8`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="relative group cursor-pointer mb-4 md:mb-0" onClick={isEditing ? handleProfilePictureClick : null}>
            <div className={`w-32 h-32 rounded-full ${currentTheme.colors.secondary} flex items-center justify-center overflow-hidden`}>
            {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <FaUser className={`w-16 h-16 ${currentTheme.colors.textSecondary}`} />
            )}
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaCamera className="w-8 h-8 text-white" />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className={`text-3xl font-bold ${currentTheme.colors.text} mb-2`}>Profile Settings</h2>
            <p className={currentTheme.colors.textSecondary}>Manage your account information and preferences</p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 ${currentTheme.colors.button} ${currentTheme.colors.text} rounded-lg transition-colors duration-200`}
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 ${currentTheme.colors.button} ${currentTheme.colors.text} rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 ${currentTheme.colors.buttonSecondary} ${currentTheme.colors.text} rounded-lg transition-colors duration-200`}
            >
              <FaCog className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${currentTheme.colors.text} mb-4`}>Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-${currentTheme.colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              />
                {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>IT Number</label>
              <input
                type="text"
                name="itNumber"
                value={profile.itNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                maxLength="10"
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-${currentTheme.colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              />
                {errors.itNumber && <p className="mt-1 text-red-400 text-sm">{errors.itNumber}</p>}
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-${currentTheme.colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              />
                {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                maxLength="10"
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} placeholder-${currentTheme.colors.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              />
                {errors.phoneNumber && <p className="mt-1 text-red-400 text-sm">{errors.phoneNumber}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className={`text-xl font-semibold ${currentTheme.colors.text} mb-4`}>Academic Information</h3>
            <div className="space-y-4">
              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Year</label>
              <input
                type="text"
                name="year"
                value={profile.year}
                disabled
                  className={`w-full px-4 py-2 ${currentTheme.colors.textSecondary} cursor-not-allowed`}
              />
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Batch</label>
              <select
                name="batch"
                value={profile.batch}
                onChange={handleInputChange}
                disabled={!isEditing}
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              >
                <option value="Y1S1">Y1S1</option>
                <option value="Y1S2">Y1S2</option>
                <option value="Y2S1">Y2S1</option>
                <option value="Y2S2">Y2S2</option>
                <option value="Y3S1">Y3S1</option>
                <option value="Y3S2">Y3S2</option>
                <option value="Y4S1">Y4S1</option>
                <option value="Y4S2">Y4S2</option>
              </select>
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Week Type</label>
              <select
                name="weekType"
                value={profile.weekType}
                onChange={handleInputChange}
                disabled={!isEditing}
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              >
                <option value="WE">Weekend</option>
                <option value="WD">Weekday</option>
              </select>
            </div>

              <div>
                <label className={`block ${currentTheme.colors.textSecondary} mb-2`}>Degree</label>
              <select
                name="degree"
                value={profile.degree}
                onChange={handleInputChange}
                disabled={!isEditing}
                  className={`w-full px-4 py-2 ${currentTheme.colors.input} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              >
                <option value="BScIT">BSc Honours Specialization in Information Technology</option>
                <option value="BScSE">BSc Honours Specialization in Software Engineering</option>
                <option value="BScDS">BSc Honours Specialization in Data Science</option>
                <option value="BScIM">BSc Honours Specialization in Interactive Media</option>
              </select>
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                <FaTimes />
              </button>
            </div>
              <div className="space-y-4">
                <button
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                <FaPalette /> Change Theme
              </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                <FaLock /> Change Password
              </button>
              </div>
            </div>
          </div>
        )}

        {showThemeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Choose Theme</h3>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                      profile.theme === theme.id ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 opacity-90"
                      style={{
                        background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                        '--tw-gradient-from': theme.colors.primary.split(' ')[1],
                        '--tw-gradient-to': theme.colors.primary.split(' ')[3]
                      }}
                    />
                    <div className="relative z-10 flex items-center justify-center gap-2 text-white font-medium">
                      {theme.id === 'dark' ? <FaMoon className="text-lg" /> : theme.id === 'light' ? <FaSun className="text-lg" /> : <FaPalette className="text-lg" />}
                      <span className="text-white drop-shadow-md">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
                <div>
                  <label className="block text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
