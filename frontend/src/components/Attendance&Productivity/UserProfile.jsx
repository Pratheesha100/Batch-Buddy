import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './NavigationBar';
import { UserCircle, Mail, Phone, GraduationCap, Building, Users } from 'lucide-react';

const UserProfile = () => {
  const location = useLocation();
  const [studentDetails, setStudentDetails] = useState(null);
  const [isListening, setIsListening] = useState(false);

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
    setTimeout(() => setIsListening(false), 3000);
  };

  const ProfileSection = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar 
        studentDetails={studentDetails}
        isListening={isListening}
        startListening={startListening}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {studentDetails ? (
          <>
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
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
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserCircle className="w-6 h-6 mr-2 text-blue-600" />
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
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
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
              <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
              <div className="h-4 w-48 bg-blue-200 rounded"></div>
              <p className="text-gray-500">Loading profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 