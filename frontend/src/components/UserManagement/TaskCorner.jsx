import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaFilter, FaChartBar, FaTimesCircle, FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './TaskCorner.css';

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
    <div className="task-corner">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{getGreeting()}, User!</h1>
          <p>Here's your task overview for today</p>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon completed">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-value">{getTaskStats().completed}</span>
                <span className="stat-label">Completed Tasks</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon in-progress">
                <FaClock />
              </div>
              <div className="stat-info">
                <span className="stat-value">{getTaskStats().inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending">
                <FaExclamationTriangle />
              </div>
              <div className="stat-info">
                <span className="stat-value">{getTaskStats().pending}</span>
                <span className="stat-label">Pending Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Upcoming Tasks */}
        <div className="upcoming-tasks">
          <h3>Upcoming Tasks</h3>
          <div className="upcoming-list">
            {getUpcomingTasks().map(task => (
              <div key={task.id} className="upcoming-task">
                <div className="upcoming-task-info">
                  <h4>{task.title}</h4>
                  <p>Due: {new Date(task.dueTime).toLocaleString()}</p>
                </div>
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Warning */}
        {getOverdueTasks().length > 0 && (
          <div className="overdue-warning">
            <FaExclamationTriangle />
            You have {getOverdueTasks().length} overdue task(s)
          </div>
        )}

        {/* Task Header */}
        <div className="task-header">
          <h2>My Tasks</h2>
          <div className="task-actions">
            <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
            <button className="dashboard-btn" onClick={() => setShowDashboard(!showDashboard)}>
              <FaChartBar /> Dashboard
            </button>
            <button className="add-task-btn" onClick={() => setShowAddTask(true)}>
              <FaPlus /> Add Task
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <h3>Overall Progress</h3>
            <span className="progress-percentage">
              {Math.round(getTaskStats().completionRate)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getTaskStats().completionRate}%` }}
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="Study">Study</option>
              <option value="Project">Project</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
        )}

        {/* Dashboard */}
        {showDashboard && (
          <div className="dashboard">
            <div className="chart-container">
              <h3>Task Distribution</h3>
              <Pie data={pieChartData} />
            </div>
            <div className="heatmap-container">
              <h3>Activity Heatmap</h3>
              <CalendarHeatmap
                values={[
                  { date: '2024-03-01', count: 2 },
                  { date: '2024-03-02', count: 1 },
                  { date: '2024-03-03', count: 3 },
                ]}
              />
            </div>
          </div>
        )}

        {/* Task List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                className="task-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredTasks.length === 0 ? (
                  <div className="empty-state">
                    <h3>No tasks found</h3>
                    <p>Add some tasks to get started!</p>
                    <button onClick={() => setShowAddTask(true)}>Add Task</button>
                  </div>
                ) : (
                  filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          className={`task-card ${task.priority.toLowerCase()}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="task-header">
                            <h3>{task.title}</h3>
                            <div className="task-actions">
                              <button 
                                className="update-btn"
                                onClick={() => handleEditTask(task)}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </div>
                          <p className="task-description">{task.description}</p>
                          <div className="task-meta">
                            <span className="task-category">{task.category}</span>
                            <span>Due: {new Date(task.dueTime).toLocaleString()}</span>
                          </div>
                          <div className="task-actions">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add/Edit Task Modal */}
        {(showAddTask || editingTask) && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
                <button className="close-btn" onClick={() => {
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
                }}>
                  <FaTimesCircle />
                </button>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                >
                  <option value="Study">Study</option>
                  <option value="Project">Project</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Time</label>
                <input
                  type="datetime-local"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
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
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCorner; 