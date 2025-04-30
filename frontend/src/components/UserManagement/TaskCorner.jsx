import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaFilter, FaChartBar, FaTimesCircle, FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import axios from 'axios';
import Swal from 'sweetalert2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const TaskCorner = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  // Fetch tasks and stats on component mount
  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, []);

  // Update filtered tasks when filters change
  useEffect(() => {
    fetchFilteredTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch tasks'
      });
    }
  };

  const fetchTaskStats = async () => {
    try {
      const response = await axios.get('/api/tasks/stats');
      setTaskStats(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch task statistics'
      });
    }
  };

  const fetchFilteredTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/filter', {
        params: filters
      });
      setFilteredTasks(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch filtered tasks'
      });
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await axios.post('/api/tasks', newTask);
      setTasks([...tasks, response.data]);
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add task'
      });
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await axios.put(`/api/tasks/${editingTask.id}`, newTask);
    setTasks(tasks.map(task =>
        task._id === editingTask.id ? response.data : task
    ));
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
      fetchTaskStats();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Task updated successfully'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task'
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
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
          await axios.delete(`/api/tasks/${taskId}`);
          setTasks(tasks.filter(task => task._id !== taskId));
          fetchTaskStats();
          Swal.fire(
            'Deleted!',
            'Your task has been deleted.',
            'success'
          );
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete task'
      });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueTime: task.dueTime,
      status: task.status,
      category: task.category
    });
    setShowAddTask(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(`/api/tasks/${taskId}/status`, {
        status: newStatus
      });
    setTasks(tasks.map(task =>
        task._id === taskId ? response.data : task
    ));
      fetchTaskStats();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task status'
      });
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{getGreeting()}, User!</h1>
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

      {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tasks */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h3>
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
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
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
                                </div>
                              </div>
                              <div className="flex gap-2">
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
                    ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
          </div>

          {/* Dashboard Section */}
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
      </div>

        {/* Add/Edit Task Modal */}
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
  );
};

export default TaskCorner; 