import React, { useState } from 'react';
import { FaDownload, FaSearch, FaCalendar, FaMoon, FaSun } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './Report.css';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report = () => {
  // State management
  const [viewMode, setViewMode] = useState('daily');
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [filters, setFilters] = useState({
    lectures: true,
    presentations: true,
    exams: true,
    assignments: true,
    meetings: true
  });
  const [sortBy, setSortBy] = useState({ field: 'date', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  // Dummy data for demonstration
  const events = [
    { id: 1, title: 'Web Development Lecture', type: 'lecture', date: '2024-03-20', time: '09:00', duration: 2, priority: 'high' },
    { id: 2, title: 'Database Systems Exam', type: 'exam', date: '2024-03-21', time: '14:00', duration: 3, priority: 'high' },
    { id: 3, title: 'Project Presentation', type: 'presentation', date: '2024-03-22', time: '11:00', duration: 1, priority: 'medium' },
    { id: 4, title: 'Assignment Submission', type: 'assignment', date: '2024-03-23', time: '16:00', duration: 1, priority: 'high' },
    { id: 5, title: 'Team Meeting', type: 'meeting', date: '2024-03-24', time: '15:00', duration: 1, priority: 'low' },
  ];

  // Chart data
  const pieChartData = {
    labels: ['Lectures', 'Presentations', 'Exams', 'Assignments', 'Meetings'],
    datasets: [{
      data: [30, 15, 20, 25, 10],
      backgroundColor: [
        '#4A90E2',
        '#50E3C2',
        '#F5A623',
        '#D0021B',
        '#9013FE'
      ]
    }]
  };

  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [6, 8, 7, 5, 9, 4, 3],
      backgroundColor: '#4A90E2'
    }, {
      label: 'Free Time',
      data: [4, 2, 3, 5, 1, 6, 7],
      backgroundColor: '#50E3C2'
    }]
  };

  // Calendar heatmap data
  const heatmapData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(2024, 0, i),
    count: Math.floor(Math.random() * 5)
  }));

  // Filter and sort events
  const filteredEvents = events
    .filter(event => filters[event.type])
    .filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy.field === 'date') {
        return sortBy.direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return sortBy.direction === 'asc'
        ? a[sortBy.field].localeCompare(b[sortBy.field])
        : b[sortBy.field].localeCompare(a[sortBy.field]);
    });

  // Export handlers
  const handleExport = (format) => {
    setShowExportModal(true);
    // Simulate export process
    setTimeout(() => {
      setShowExportModal(false);
      alert(`Report exported successfully in ${format.toUpperCase()} format!`);
    }, 1500);
  };

  // Toggle handlers
  const toggleFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.body.classList.toggle('dark-mode');
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className={`report-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Report Generation</h2>
          <button onClick={toggleSidebar} className="toggle-sidebar">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        <div className="sidebar-content">
          <div className="view-controls">
            <h3>View Mode</h3>
            <div className="view-buttons">
              <button 
                className={viewMode === 'daily' ? 'active' : ''}
                onClick={() => setViewMode('daily')}
              >
                Daily
              </button>
              <button 
                className={viewMode === 'weekly' ? 'active' : ''}
                onClick={() => setViewMode('weekly')}
              >
                Weekly
              </button>
              <button 
                className={viewMode === 'monthly' ? 'active' : ''}
                onClick={() => setViewMode('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="filter-controls">
            <h3>Filters</h3>
            {Object.entries(filters).map(([type, enabled]) => (
              <label key={type} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleFilter(type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
          <div className="theme-toggle">
            <button onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="date-range">
            <FaCalendar />
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
            />
          </div>
          <button 
            className="export-button"
            onClick={() => setShowExportModal(true)}
          >
            <FaDownload /> Export Report
          </button>
        </div>

        <div className="content-grid">
          {/* Schedule Table */}
          <div className="schedule-table">
            <h2>Schedule Overview</h2>
            <table>
              <thead>
                <tr>
                  <th onClick={() => setSortBy({ field: 'date', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}>
                    Date
                  </th>
                  <th onClick={() => setSortBy({ field: 'time', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}>
                    Time
                  </th>
                  <th onClick={() => setSortBy({ field: 'title', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}>
                    Event
                  </th>
                  <th onClick={() => setSortBy({ field: 'type', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}>
                    Type
                  </th>
                  <th onClick={() => setSortBy({ field: 'priority', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}>
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id} className={`event-${event.type}`}>
                    <td>{event.date}</td>
                    <td>{event.time}</td>
                    <td>{event.title}</td>
                    <td>{event.type}</td>
                    <td>{event.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analytics Section */}
          <div className="analytics-section">
            <div className="chart-container">
              <h3>Event Distribution</h3>
              <Pie data={pieChartData} />
            </div>
            <div className="chart-container">
              <h3>Study Hours vs Free Time</h3>
              <Bar data={barChartData} />
            </div>
            <div className="chart-container">
              <h3>Activity Heatmap</h3>
              <CalendarHeatmap
                values={heatmapData}
                classForValue={value => {
                  if (!value) return 'color-empty';
                  return `color-scale-${value.count}`;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Export Report</h2>
            <div className="export-options">
              <button onClick={() => handleExport('csv')}>CSV</button>
              <button onClick={() => handleExport('ics')}>iCalendar</button>
              <button onClick={() => handleExport('pdf')}>PDF</button>
            </div>
            <button className="close-modal" onClick={() => setShowExportModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report; 