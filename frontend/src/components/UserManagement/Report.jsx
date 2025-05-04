import React, { useState, useEffect } from 'react';
import { FaCalendar, FaMoon, FaSun, FaCheckCircle, FaDownload, FaChartBar, FaTasks, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    total: 0,
    completionRate: 0,
    upcoming: 0,
    ongoing: 0
  });
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    end: new Date()
  });
  const [darkMode, setDarkMode] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          navigate('/login');
          return;
        }
        setUser(userData);
        await fetchTaskData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch task statistics and completed tasks
  const fetchTaskData = async () => {
    try {
      // Fetch upcoming tasks
      const upcomingResponse = await axios.get('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch ongoing tasks
      const ongoingResponse = await axios.get('http://localhost:5000/api/ongoing-tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Calculate statistics
      const upcomingTasks = upcomingResponse.data.length;
      const ongoingTasks = ongoingResponse.data.length;
      const completedTasks = ongoingResponse.data.filter(task => task.status === 'Completed').length;
      const totalTasks = upcomingTasks + ongoingTasks;

      // Calculate completion rate
      const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

      setTaskStats({
        completed: completedTasks,
        total: totalTasks,
        completionRate: completionRate,
        upcoming: upcomingTasks,
        ongoing: ongoingTasks
      });

      // Fetch completed tasks for the list
      const completedResponse = await axios.get('http://localhost:5000/api/ongoing-tasks', {
        params: {
          status: 'Completed',
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCompletedTasks(completedResponse.data);
    } catch (error) {
      console.error('Error fetching task data:', error);
    }
  };

  // Update data when date range changes
  useEffect(() => {
    if (user) {
      fetchTaskData();
    }
  }, [dateRange, user]);

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle task selection
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // PDF Download
  const handleDownloadPDF = () => {
    setPdfError("");
    try {
      const doc = new jsPDF();
      
      // Add logo or header image if available
      // doc.addImage(logo, 'PNG', 10, 10, 30, 30);
      
      // Set font styles
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      
      // Title
      doc.setTextColor(67, 56, 202); // indigo-700
      doc.text('Batch Buddy - Task Progress Report', 105, 20, { align: 'center' });
      
      // User info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated for: ${user?.studentName || user?.name || 'User'}`, 20, 35);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Summary section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(67, 56, 202);
      doc.text('Performance Summary', 20, 65);
      
      // Summary table
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.autoTable({
        startY: 75,
        head: [['Metric', 'Value']],
        body: [
          ['Completion Rate', `${taskStats.completionRate}%`],
          ['Completed Tasks', taskStats.completed],
          ['Total Tasks', taskStats.total],
          ['Active Tasks', taskStats.ongoing + taskStats.upcoming]
        ],
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          halign: 'left'
        },
        headStyles: { 
          fillColor: [67, 56, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246]
        },
        margin: { left: 20, right: 20 }
      });

      // Tasks section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(67, 56, 202);
      doc.text('Completed Tasks', 20, doc.autoTable.previous.finalY + 20);
      
      // Tasks table
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 30,
        head: [['Title', 'Category', 'Priority', 'Completed Date', 'Description']],
        body: completedTasks.map(task => [
          task.title,
          task.category,
          task.priority,
          formatDate(task.completedAt || task.updatedAt),
          task.description?.substring(0, 50) + (task.description?.length > 50 ? '...' : '')
        ]),
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          halign: 'left'
        },
        headStyles: { 
          fillColor: [67, 56, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [243, 244, 246]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 45 }
        },
        margin: { left: 20, right: 20 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
        doc.text(
          'Generated by Batch Buddy',
          20,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save('batch-buddy-report.pdf');
    } catch (err) {
      setPdfError("Failed to generate PDF. Please try again or check your browser's download settings.");
      console.error(err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-white' : 'bg-white text-gray-900'}`}>
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
                <Link to="/task-corner" className="text-gray-600 hover:text-blue-600 transition-colors">Task Corner</Link>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center mr-4">
                  <div className="text-right mr-4">
                    <p className="text-sm font-semibold text-gray-700">{user.studentName || user.name || user.studentId}</p>
                    <p className="text-xs text-gray-500">{user.studentId}</p>
                  </div>
                </div>
              )}
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

      <div className="p-4 md:p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-indigo-200 dark:border-indigo-700 gap-4">
              <div className="flex flex-col">
                <h1 className={`text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient`}>
                  Batch Buddy
                </h1>
                <p className={`text-xl mt-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
                  {getGreeting()}, <span className="font-semibold">{user?.studentName || user?.name || 'User'}</span>
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <FaDownload /> Download report
                </button>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors duration-300"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-600" />}
                </button>
              </div>
            </div>

            {pdfError && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg text-center font-semibold">
                {pdfError}
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-full">
                    <FaCheckCircle className="text-indigo-600 dark:text-indigo-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Completion Rate</h3>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{taskStats.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <FaTasks className="text-green-600 dark:text-green-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Completed Tasks</h3>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{taskStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <FaChartBar className="text-blue-600 dark:text-blue-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Total Tasks</h3>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{taskStats.total}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full">
                    <FaCalendar className="text-pink-600 dark:text-pink-300 text-2xl" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Active Tasks</h3>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{taskStats.ongoing + taskStats.upcoming}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Tasks Section */}
            <div className={`rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-700'}`}>Completed Tasks</h2>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-800 px-4 py-2 rounded-lg">
                  <FaCalendar className="text-indigo-600 dark:text-indigo-300" />
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
                  />
                  <span className="text-indigo-600 dark:text-indigo-300">to</span>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTasks.length === 0 ? (
                  <div className="col-span-full text-center text-indigo-400 dark:text-indigo-200 py-8 text-lg">
                    No completed tasks in this range.
                  </div>
                ) : (
                  completedTasks.map(task => (
                    <div 
                      key={task._id} 
                      onClick={() => handleTaskClick(task)}
                      className={`bg-white dark:bg-white rounded-xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all border border-gray-200 dark:border-gray-700 ${
                        darkMode ? 'hover:bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-indigo-300' : 'text-gray-600'}`}>
                        {task.description?.substring(0, 100)}{task.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${darkMode ? 'text-indigo-300' : 'text-gray-500'}`}>
                          {formatDate(task.completedAt || task.updatedAt)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          darkMode ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Task Modal */}
            {showTaskModal && selectedTask && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className={`rounded-2xl shadow-2xl p-8 max-w-2xl w-full ${darkMode ? 'bg-indigo-900' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-indigo-100' : 'text-indigo-800'}`}>{selectedTask.title}</h3>
                    <button
                      onClick={() => setShowTaskModal(false)}
                      className={`p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors`}
                    >
                      <FaTimesCircle className={`text-xl ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Description</h4>
                      <p className={`${darkMode ? 'text-indigo-200' : 'text-gray-700'}`}>{selectedTask.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Priority</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedTask.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                          {selectedTask.priority}
                        </span>
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Category</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {selectedTask.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Completed On</h4>
                      <p className={`${darkMode ? 'text-indigo-200' : 'text-gray-700'}`}>
                        {formatDate(selectedTask.completedAt || selectedTask.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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

export default Report; 