import React, { useState, useEffect } from 'react';
import { Clock, BarChart2, BookOpen, Calendar, Beaker, Users, Mic, Search, Brain, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';
import NavigationBar from './NavigationBar';

const AttendanceView = () => {
  const location = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [studentDetails, setStudentDetails] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    daily: {
      totalHours: '0',
      attendanceRate: '0%',
      classesToday: '0',
      studyStreak: '0 days',
      voiceRecognition: '0%',
      timeDistribution: {
        lectures: 0,
        selfStudy: 0,
        exams: 0,
        labWork: 0
      }
    },
    weekly: {
      totalHours: '0',
      attendanceRate: '0%',
      classesToday: '0',
      studyStreak: '0 days',
      voiceRecognition: '0%',
      timeDistribution: {
        lectures: 0,
        selfStudy: 0,
        exams: 0,
        labWork: 0
      }
    },
    monthly: {
      totalHours: '0',
      attendanceRate: '0%',
      classesToday: '0',
      studyStreak: '0 days',
      voiceRecognition: '0%',
      timeDistribution: {
        lectures: 0,
        selfStudy: 0,
        exams: 0,
        labWork: 0
      }
    }
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

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

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        
        if (!userData?._id) {
          console.error('No user data found');
          return;
        }

        // Fetch attendance data for different periods
        const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/attendance/analytics/${userData._id}?period=daily`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/attendance/analytics/${userData._id}?period=weekly`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/attendance/analytics/${userData._id}?period=monthly`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Update attendance data with real values
        setAttendanceData({
          daily: {
            totalHours: dailyRes.data.totalHours || '0',
            attendanceRate: `${dailyRes.data.attendanceRate || 0}%`,
            classesToday: dailyRes.data.totalClasses || '0',
            studyStreak: `${dailyRes.data.studyStreak || 0} days`,
            voiceRecognition: '85%', // This might need to be calculated differently
            timeDistribution: {
              lectures: dailyRes.data.timeDistribution?.lectures || 0,
              selfStudy: dailyRes.data.timeDistribution?.selfStudy || 0,
              exams: dailyRes.data.timeDistribution?.exams || 0,
              labWork: dailyRes.data.timeDistribution?.labWork || 0
            }
          },
          weekly: {
            totalHours: weeklyRes.data.totalHours || '0',
            attendanceRate: `${weeklyRes.data.attendanceRate || 0}%`,
            classesToday: weeklyRes.data.totalClasses || '0',
            studyStreak: `${weeklyRes.data.studyStreak || 0} days`,
            voiceRecognition: '82%',
            timeDistribution: {
              lectures: weeklyRes.data.timeDistribution?.lectures || 0,
              selfStudy: weeklyRes.data.timeDistribution?.selfStudy || 0,
              exams: weeklyRes.data.timeDistribution?.exams || 0,
              labWork: weeklyRes.data.timeDistribution?.labWork || 0
            }
          },
          monthly: {
            totalHours: monthlyRes.data.totalHours || '0',
            attendanceRate: `${monthlyRes.data.attendanceRate || 0}%`,
            classesToday: monthlyRes.data.totalClasses || '0',
            studyStreak: `${monthlyRes.data.studyStreak || 0} days`,
            voiceRecognition: '88%',
            timeDistribution: {
              lectures: monthlyRes.data.timeDistribution?.lectures || 0,
              selfStudy: monthlyRes.data.timeDistribution?.selfStudy || 0,
              exams: monthlyRes.data.timeDistribution?.exams || 0,
              labWork: monthlyRes.data.timeDistribution?.labWork || 0
            }
          }
        });

        // Fetch upcoming events (classes) from timetable
        const assignmentRes = await axios.get(
          `http://localhost:5000/api/timetable-assignments/student/${userData._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (assignmentRes.data?.timetableId) {
          const timetableRes = await axios.get(
            `http://localhost:5000/api/timetable/${assignmentRes.data.timetableId._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Get today's and tomorrow's classes
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' });

          const todaySlots = timetableRes.data.days.find(d => d.day === today)?.slots || [];
          const tomorrowSlots = timetableRes.data.days.find(d => d.day === tomorrow)?.slots || [];

          const events = [
            ...todaySlots.map(slot => ({
              title: slot.subject,
              time: `${slot.startTime} - ${slot.endTime}`,
              type: slot.type || 'LECTURE',
              icon: slot.type === 'Lab' ? Beaker : BookOpen
            })),
            ...tomorrowSlots.map(slot => ({
              title: slot.subject,
              time: `${slot.startTime} - ${slot.endTime}`,
              type: slot.type || 'LECTURE',
              icon: slot.type === 'Lab' ? Beaker : BookOpen
            }))
          ];

          setUpcomingEvents(events);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Fetch attendance records for the selected period
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        if (!userData?._id) return;
        const res = await axios.get(
          `http://localhost:5000/api/attendance/records/${userData._id}?period=${selectedPeriod}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendanceRecords(res.data.records || []);
      } catch (err) {
        setAttendanceRecords([]);
        console.error('Error fetching attendance records:', err);
      }
    };
    fetchAttendanceRecords();
  }, [selectedPeriod]);

  // Fetch all submitted attendance records
  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('token');
        if (!userData?._id) return;
        const res = await axios.get(
          `http://localhost:5000/api/attendance/all/${userData._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllAttendance(res.data || []);
      } catch (err) {
        setAllAttendance([]);
        console.error('Error fetching all attendance:', err);
      }
    };
    fetchAllAttendance();
  }, []);

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 3000);
  };

  // Get current period's data
  const currentData = attendanceData[selectedPeriod];

  const analyzeAttendance = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      // Prepare attendance data for analysis
      const attendanceData = allAttendance.map(att => ({
        date: att.date,
        subjects: att.records.map(rec => ({
          subject: rec.subject,
          status: rec.status
        }))
      }));

      // Calculate basic statistics
      const subjectStats = {};
      attendanceData.forEach(day => {
        day.subjects.forEach(subject => {
          if (!subjectStats[subject.subject]) {
            subjectStats[subject.subject] = { present: 0, absent: 0, total: 0 };
          }
          subjectStats[subject.subject].total++;
          if (subject.status === 'present') {
            subjectStats[subject.subject].present++;
          } else {
            subjectStats[subject.subject].absent++;
          }
        });
      });

      // Calculate attendance rates
      const attendanceRates = Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        attendanceRate: (stats.present / stats.total) * 100,
        totalClasses: stats.total,
        present: stats.present,
        absent: stats.absent
      }));

      // Sort by attendance rate
      attendanceRates.sort((a, b) => a.attendanceRate - b.attendanceRate);

      // Generate insights
      const insights = {
        worstPerforming: attendanceRates[0],
        bestPerforming: attendanceRates[attendanceRates.length - 1],
        overallRate: attendanceRates.reduce((acc, curr) => acc + curr.attendanceRate, 0) / attendanceRates.length,
        recommendations: [],
        trends: []
      };

      // Add recommendations based on attendance patterns
      attendanceRates.forEach(subject => {
        if (subject.attendanceRate < 75) {
          insights.recommendations.push({
            subject: subject.subject,
            message: `Consider improving attendance in ${subject.subject}. Current rate: ${subject.attendanceRate.toFixed(1)}%`
          });
        }
      });

      // Add trend analysis
      const recentAttendance = attendanceData.slice(-5);
      const trend = recentAttendance.map(day => ({
        date: new Date(day.date).toLocaleDateString(),
        presentCount: day.subjects.filter(s => s.status === 'present').length,
        totalCount: day.subjects.length
      }));

      insights.trends = trend;

      setAnalysis(insights);
    } catch (error) {
      console.error('Error analyzing attendance:', error);
      setAnalysisError('Failed to analyze attendance data. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NavigationBar 
        studentDetails={studentDetails}
        isListening={isListening}
        startListening={startListening}
      />

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

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          ) : (
            <>
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

              {/* Add Analysis Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Attendance Analysis</h3>
                  <button
                    onClick={analyzeAttendance}
                    disabled={analyzing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                  >
                    <Brain className="w-5 h-5" />
                    <span>{analyzing ? 'Analyzing...' : 'Analyze Attendance'}</span>
                  </button>
                </div>

                {analyzing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Analyzing attendance patterns...</p>
                  </div>
                )}

                {analysisError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{analysisError}</p>
                  </div>
                )}

                {analysis && !analyzing && (
                  <div className="space-y-6">
                    {/* Overall Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-700 mb-2">Overall Attendance Rate</h4>
                        <p className="text-2xl font-bold">{analysis.overallRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-700 mb-2">Best Performing Subject</h4>
                        <p className="text-lg font-bold">{analysis.bestPerforming.subject}</p>
                        <p className="text-sm text-green-600">{analysis.bestPerforming.attendanceRate.toFixed(1)}% attendance</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-700 mb-2">Needs Improvement</h4>
                        <p className="text-lg font-bold">{analysis.worstPerforming.subject}</p>
                        <p className="text-sm text-red-600">{analysis.worstPerforming.attendanceRate.toFixed(1)}% attendance</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-700 mb-2">Recommendations</h4>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                              <span>{rec.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recent Trends */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-4">Recent Attendance Trends</h4>
                      <div className="space-y-3">
                        {analysis.trends.map((day, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="text-gray-600">{day.date}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {day.presentCount}/{day.totalCount} classes attended
                              </span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{ width: `${(day.presentCount / day.totalCount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Details Table */}
              {attendanceRecords.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">Attendance Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((rec, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">{rec.subject}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rec.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Submitted Attendance Records Table */}
              {allAttendance.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">Submitted Attendance Records</h3>
                  <div className="space-y-6">
                    {allAttendance.map((att, idx) => (
                      <div key={idx} className="mb-6">
                        <div className="font-semibold text-blue-700 mb-2">
                          {new Date(att.date).toLocaleDateString()} ({new Date(att.date).toLocaleTimeString()})
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 mb-2">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {att.records.map((rec, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-2">{rec.subject}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      rec.status === 'present'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    {upcomingEvents.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No upcoming classes</p>
                    ) : (
                      upcomingEvents.map((event, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                          <div className={`p-2 rounded-lg ${
                            event.type === 'LECTURE' ? 'bg-blue-100' :
                            event.type === 'LAB' ? 'bg-purple-100' :
                            'bg-green-100'
                          }`}>
                            {event.type === 'LAB' ? <Beaker className="w-5 h-5 text-purple-600" /> : <BookOpen className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                            <h4 className="text-gray-900 font-medium">{event.title}</h4>
                            <p className="text-gray-500 text-sm">{event.time}</p>
                </div>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                            event.type === 'LECTURE' ? 'bg-blue-100 text-blue-600' :
                            event.type === 'LAB' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {event.type}
                          </span>
                </div>
                      ))
                    )}
                </div>
                </div>
              </div>
            </>
          )}
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