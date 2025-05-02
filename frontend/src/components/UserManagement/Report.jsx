import React, { useState, useEffect } from 'react';
import { FaCalendar, FaMoon, FaSun, FaCheckCircle, FaDownload, FaChartBar, FaTasks, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
        fetchTaskData();
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
      doc.setFontSize(20);
      doc.text('Batch Buddy - Task Progress Report', 14, 16);
      doc.setFontSize(12);
      doc.text(`Completion Rate: ${taskStats.completionRate}%`, 14, 28);
      doc.text(`Completed Tasks: ${taskStats.completed}`, 14, 36);
      doc.text(`Total Tasks: ${taskStats.total}`, 14, 44);
      doc.text(`Upcoming: ${taskStats.upcoming} | Ongoing: ${taskStats.ongoing}`, 14, 52);
      doc.text('Completed Tasks:', 14, 64);
      doc.autoTable({
        startY: 68,
        head: [['Title', 'Category', 'Priority', 'Completed Date', 'Description']],
        body: completedTasks.map(task => [
          task.title,
          task.category,
          task.priority,
          formatDate(task.completedAt || task.updatedAt),
          task.description || ''
        ]),
        styles: { fontSize: 10, cellWidth: 'wrap' },
        headStyles: { fillColor: [67, 56, 202] }, // indigo-700
        margin: { left: 14, right: 14 }
      });
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
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-indigo-200 dark:border-indigo-700 gap-4">
        <div className="flex flex-col">
          <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-indigo-200' : 'text-sky-700'}`}>Batch Buddy</h1>
          <p className={`text-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
            {getGreeting()} {(user.studentName || user.name || 'User')} !!
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            <FaDownload /> Download report
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
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
    </div>
  );
};

export default Report; 