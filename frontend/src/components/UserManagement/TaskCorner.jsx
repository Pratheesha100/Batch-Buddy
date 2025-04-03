import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaFilter, FaChartBar, FaTimesCircle, FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const TaskCorner = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueTime: '',
    status: 'Pending',
    category: 'Study'
  });
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTasks = [
      {
        id: '1',
        title: 'Complete Project Report',
        description: 'Write the final report for the ITPM project',
        priority: 'High',
        dueTime: '2024-03-20T14:00',
        status: 'Pending',
        category: 'Project'
      },
      {
        id: '2',
        title: 'Study for Exam',
        description: 'Review chapters 5-7 for upcoming exam',
        priority: 'High',
        dueTime: '2024-03-21T10:00',
        status: 'In Progress',
        category: 'Study'
      }
    ];
    setTasks(mockTasks);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get upcoming tasks
  const getUpcomingTasks = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    return tasks.filter(task => {
      const dueDate = new Date(task.dueTime);
      return dueDate >= today && dueDate <= threeDaysFromNow && task.status !== 'Completed';
    });
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const dueDate = new Date(task.dueTime);
      return dueDate < today && task.status !== 'Completed';
    });
  };

  // Calculate task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const pending = tasks.filter(task => task.status === 'Pending').length;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total ? (completed / total) * 100 : 0
    };
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  // Handle task addition
  const handleAddTask = () => {
    if (!newTask.title) return;

    const task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      dueTime: '',
      status: 'Pending',
      category: 'Study'
    });
    setShowAddTask(false);
  };

  // Handle task editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask(task);
  };

  // Handle task update
  const handleUpdateTask = () => {
    if (!editingTask) return;

    setTasks(tasks.map(task =>
      task.id === editingTask.id ? { ...newTask, id: task.id } : task
    ));
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      dueTime: '',
      status: 'Pending',
      category: 'Study'
    });
  };

  // Handle task status change
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Handle task deletion
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    return true;
  });

  // Chart data
  const pieChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [getTaskStats().completed, getTaskStats().inProgress, getTaskStats().pending],
      backgroundColor: ['#34a853', '#fbbc05', '#ea4335']
    }]
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
                <span className="text-3xl font-bold text-gray-800 block">{getTaskStats().completed}</span>
                <span className="text-gray-600">Completed Tasks</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-full">
                <FaClock className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800 block">{getTaskStats().inProgress}</span>
                <span className="text-gray-600">In Progress</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-6 flex items-center gap-4">
              <div className="bg-red-100 p-4 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-800 block">{getTaskStats().pending}</span>
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
                      <Draggable key={task.id} draggableId={task.id} index={index}>
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
                                  onClick={() => handleDeleteTask(task.id)}
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
                      style={{ width: `${getTaskStats().completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    {getTaskStats().completionRate.toFixed(1)}% completed
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