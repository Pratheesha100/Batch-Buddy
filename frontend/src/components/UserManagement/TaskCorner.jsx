import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaFilter, FaChartBar, FaTimesCircle, FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle, FaPlay } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const TaskCorner = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'upcoming'
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueTime: '',
    status: 'Pending',
    category: 'Study'
  });
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  });

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
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch tasks based on active tab
  const fetchTasks = async () => {
    try {
      const endpoint = activeTab === 'ongoing' 
        ? 'http://localhost:5000/api/ongoing-tasks'
        : 'http://localhost:5000/api/tasks';
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(response.data);
      setFilteredTasks(response.data);
      console.log('Fetched tasks:', response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch tasks'
      });
    }
  };

  // Fetch task stats based on active tab
  const fetchTaskStats = async () => {
    try {
      const endpoint = activeTab === 'ongoing'
        ? 'http://localhost:5000/api/ongoing-tasks/stats'
        : 'http://localhost:5000/api/tasks/stats';
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTaskStats(response.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch task statistics'
      });
    }
  };

  // Update filtered tasks when filters change
  useEffect(() => {
    if (user) {
      fetchFilteredTasks();
    }
  }, [filters, user]);

  const fetchFilteredTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks/filter', {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Error fetching filtered tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch filtered tasks'
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (activeTab === 'upcoming' && newStatus === 'In Progress') {
        // Find the task details
        const taskToStart = tasks.find(task => task._id === taskId);
        if (!taskToStart) return;

        // Create a new ongoing task
        await axios.post('http://localhost:5000/api/ongoing-tasks', {
          title: taskToStart.title,
          description: taskToStart.description,
          priority: taskToStart.priority,
          category: taskToStart.category,
          dueTime: taskToStart.dueTime,
          userId: user.studentId
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Remove the original task from upcoming
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Refresh both lists
        fetchTasks();
        fetchTaskStats();

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Task started and moved to Ongoing Tasks'
        });
      } else {
        const endpoint = activeTab === 'ongoing'
          ? `http://localhost:5000/api/ongoing-tasks/${taskId}/status`
          : `http://localhost:5000/api/tasks/${taskId}/status`;
        
        const response = await axios.patch(
          endpoint,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setTasks(tasks.map(task =>
          task._id === taskId ? response.data : task
        ));
        setFilteredTasks(filteredTasks.map(task =>
          task._id === taskId ? response.data : task
        ));
        
        fetchTaskStats();
        
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Task marked as ${newStatus}`
        });
      }
    } catch (error) {
      console.error('Error starting task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to start task'
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      const endpoint = activeTab === 'ongoing'
        ? `http://localhost:5000/api/ongoing-tasks/${taskId}`
        : `http://localhost:5000/api/tasks/${taskId}`;
      
      await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setTasks(tasks.filter(task => task._id !== taskId));
          setFilteredTasks(filteredTasks.filter(task => task._id !== taskId));
          fetchTaskStats();
          Swal.fire(
            'Deleted!',
            'Your task has been deleted.',
            'success'
          );
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete task'
      });
    }
  };

  // Handle task update
  const handleUpdateTask = async () => {
    try {
      if (!editingTask || !editingTask._id) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No task selected for update'
        });
        return;
      }

      const endpoint = activeTab === 'ongoing'
        ? `http://localhost:5000/api/ongoing-tasks/${editingTask._id}`
        : `http://localhost:5000/api/tasks/${editingTask._id}`;

      // Prepare the update payload
      const updatePayload = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        dueTime: newTask.dueTime,
        status: newTask.status
      };

      // Add userId only if it's a new task
      if (!editingTask.userId) {
        updatePayload.userId = user.studentId;
      }

      console.log('Updating task with payload:', updatePayload); // Debug log

      const response = await axios.put(
        endpoint,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data); // Debug log

      // Update the tasks state
      setTasks(tasks.map(task =>
        task._id === editingTask._id ? response.data : task
      ));
      setFilteredTasks(filteredTasks.map(task =>
        task._id === editingTask._id ? response.data : task
      ));
      
      // Reset the form
      setEditingTask(null);
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueTime: '',
        status: 'Pending',
        category: 'Study'
      });
      
      // Refresh stats
      fetchTaskStats();
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Task updated successfully'
      });
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error response:', error.response); // Debug log
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update task'
      });
    }
  };

  // Handle task creation
  const handleAddTask = async () => {
    try {
      const endpoint = activeTab === 'ongoing'
        ? 'http://localhost:5000/api/ongoing-tasks'
        : 'http://localhost:5000/api/tasks';

      const response = await axios.post(
        endpoint,
        { ...newTask, userId: user.studentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setTasks([...tasks, response.data]);
      setFilteredTasks([...filteredTasks, response.data]);
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueTime: '',
        status: 'Pending',
        category: 'Study'
      });
      
      fetchTaskStats();
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Task added successfully'
      });
    } catch (error) {
      console.error('Error adding task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add task'
      });
    }
  };

  // Update tasks when tab changes
  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [activeTab]);

  // Handle task edit
  const handleEditTask = (task) => {
    console.log('Editing task:', task); // Debug log
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueTime: new Date(task.dueTime).toISOString().slice(0, 16),
      status: task.status,
      category: task.category
    });
    setShowAddTask(true);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredTasks(items);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pieChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [taskStats.completed, taskStats.inProgress, taskStats.pending],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 1
      }
    ]
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Export Report Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors duration-200 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Export Report
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getGreeting()} {(user.studentName || user.name || user.studentId || 'User')} !!
          </h1>
          <p className="text-gray-600 mb-6">Here's your task overview for today</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800 block">{taskStats.completed}</span>
                <span className="text-gray-600">Completed Tasks</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-full">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800 block">{taskStats.inProgress}</span>
                <span className="text-gray-600">In Progress</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-6 flex items-center gap-4">
              <div className="bg-red-100 p-4 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800 block">{taskStats.pending}</span>
                <span className="text-gray-600">Pending Tasks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('ongoing')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'ongoing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ongoing Tasks
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming Tasks
                </button>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaPlus /> Add Task
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <FaFilter /> Filter
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Study">Study</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {filteredTasks
                      .filter(task => {
                        if (activeTab === 'ongoing') {
                          return task.status === 'In Progress';
                        } else {
                          return task.status === 'Pending';
                        }
                      })
                      .map((task, index) => {
                        console.log('Rendering task:', task); // Debug log
                        return (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-50 rounded-lg p-4 border-2 border-blue-400 shadow-sm hover:shadow-lg hover:border-blue-600 transition-all duration-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {task.priority}
                                      </span>
                                      <span className="text-gray-500 text-sm">
                                        Due: {new Date(task.dueTime).toLocaleString()}
                                      </span>
                                      <span className="text-gray-500 text-sm">
                                        Status: {task.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {activeTab === 'ongoing' && (
                                      <button
                                        onClick={() => handleStatusChange(task._id, 'Completed')}
                                        className="p-2 text-green-600 hover:text-green-700 transition-colors duration-200"
                                        title="Mark as Completed"
                                      >
                                        <FaCheckCircle />
                                      </button>
                                    )}
                                    {activeTab === 'upcoming' && (
                                      <button
                                        onClick={() => handleStatusChange(task._id, 'In Progress')}
                                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                        title="Start Task"
                                      >
                                        <FaPlay />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleEditTask(task)}
                                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task._id)}
                                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Task Dashboard</h3>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <FaChartBar />
              </button>
            </div>

            {showDashboard && (
              <div className="space-y-6">
                <div className="h-64">
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Task Completion Rate</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${taskStats.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    {taskStats.completionRate.toFixed(1)}% completed
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Activity Heatmap</h4>
                  <CalendarHeatmap
                    values={[
                      { date: '2024-03-01', count: 2 },
                      { date: '2024-03-02', count: 5 },
                      { date: '2024-03-03', count: 1 },
                    ]}
                    classForValue={(value) => {
                      if (!value) return 'color-empty';
                      return `color-github-${Math.min(4, value.count)}`;
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {(showAddTask || editingTask) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'Medium',
                      dueTime: '',
                      status: 'Pending',
                      category: 'Study'
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimesCircle />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Study">Study</option>
                      <option value="Project">Project</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button 
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
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

export default TaskCorner; 