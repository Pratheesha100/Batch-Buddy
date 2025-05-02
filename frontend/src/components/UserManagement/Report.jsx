import React, { useState, useEffect } from 'react';
import { FaCalendar, FaMoon, FaSun, FaCheckCircle, FaDownload } from 'react-icons/fa';
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

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-white' : 'bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-200 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-indigo-200 dark:border-indigo-700 gap-4">
        <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-indigo-200' : 'text-sky-700'}`}>Batch Buddy</h1>
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
      {pdfError && <div className="mb-4 text-red-600 font-semibold text-center">{pdfError}</div>}

      {/* Progress Summary */}
      <div className="mb-8">
        <div className={`rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 ${darkMode ? 'bg-indigo-900/90' : 'bg-white/90 border border-indigo-100'}`}>
          <div className="text-green-500 text-6xl mb-4 md:mb-0">
            <FaCheckCircle />
          </div>
          <div className="flex-1 w-full">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-indigo-100' : 'text-indigo-700'}`}>Task Progress</h2>
            <div className="flex flex-wrap gap-8 mb-4">
              <div>
                <span className={`text-4xl font-extrabold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>{taskStats.completionRate}%</span>
                <span className="block text-base text-gray-600 dark:text-gray-300">Completion Rate</span>
              </div>
              <div>
                <span className={`text-4xl font-extrabold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>{taskStats.completed}</span>
                <span className="block text-base text-gray-600 dark:text-gray-300">Completed Tasks</span>
              </div>
              <div>
                <span className={`text-4xl font-extrabold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>{taskStats.total}</span>
                <span className="block text-base text-gray-600 dark:text-gray-300">Total Tasks</span>
              </div>
            </div>
            <div className="flex gap-8 pt-4 mt-4 border-t border-indigo-200 dark:border-indigo-700">
              <div className="text-center">
                <span className={`text-2xl font-bold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>{taskStats.upcoming}</span>
                <span className="block text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">Upcoming</span>
              </div>
              <div className="text-center">
                <span className={`text-2xl font-bold ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>{taskStats.ongoing}</span>
                <span className="block text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">Ongoing</span>
              </div>
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
          {completedTasks.length === 0 && (
            <div className="col-span-full text-center text-indigo-400 dark:text-indigo-200 py-8 text-lg">No completed tasks in this range.</div>
          )}
          {completedTasks.map(task => (
            <div 
              key={task._id} 
              onClick={() => handleTaskClick(task)}
              className="bg-white/90 dark:bg-indigo-800/80 rounded-xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all border border-indigo-100 dark:border-indigo-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-100 truncate">{task.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.priority.toLowerCase() === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : task.priority.toLowerCase() === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {task.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-xs text-indigo-400 dark:text-indigo-200">Category</span>
                  <span className="text-indigo-700 dark:text-indigo-100 font-medium">{task.category}</span>
                </div>
                <div>
                  <span className="block text-xs text-indigo-400 dark:text-indigo-200">Completed</span>
                  <span className="text-indigo-700 dark:text-indigo-100 font-medium">{formatDate(task.completedAt || task.updatedAt)}</span>
          </div>
            </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-200 pt-4 border-t border-indigo-100 dark:border-indigo-700 min-h-[48px]">
                {task.description}
            </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-indigo-900 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>Task Details</h2>
            <div className="space-y-4">
              <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Title:</span>
                <span className="text-indigo-700 dark:text-indigo-100">{selectedTask.title}</span>
              </div>
              <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Description:</span>
                <span className="text-indigo-700 dark:text-indigo-100">{selectedTask.description}</span>
              </div>
              <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Category:</span>
                <span className="text-indigo-700 dark:text-indigo-100">{selectedTask.category}</span>
              </div>
              <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Priority:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedTask.priority.toLowerCase() === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : selectedTask.priority.toLowerCase() === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Completion Date:</span>
                <span className="text-indigo-700 dark:text-indigo-100">{formatDate(selectedTask.completedAt || selectedTask.updatedAt)}</span>
              </div>
              {selectedTask.notes && (
                <div className="flex gap-4 py-2 border-b border-indigo-100 dark:border-indigo-700">
                  <span className="font-semibold min-w-[120px] text-indigo-400 dark:text-indigo-200">Notes:</span>
                  <span className="text-indigo-700 dark:text-indigo-100">{selectedTask.notes}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg hover:from-sky-600 hover:to-indigo-700 transition-colors"
              >
                Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report; 