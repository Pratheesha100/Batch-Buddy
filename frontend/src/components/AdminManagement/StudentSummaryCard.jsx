import React from 'react';
import { User, Users, CalendarDays, UserCheck } from 'lucide-react'; // Example icons
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './adminDash.css'; // Reuse existing styles

// Define colors for breakdown categories (adjust as needed)
const FACULTY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
const BATCH_COLORS = ['#0088FE', '#FF8042']; // Example: Blue for Weekday, Orange for Weekend

const StudentSummaryCard = ({ data, isLoading, error }) => {

  if (isLoading) {
    return <div className="analysis-loading">Loading Student Summary...</div>;
  }

  if (error) {
    return <div className="analysis-error">Error loading summary: {error}</div>;
  }

  if (!data) {
    return null; // Or a placeholder if preferred
  }

  const { totalStudents, byFaculty = [], byBatch = [], addedToday } = data;

  // Prepare data for Faculty Pie chart (optional)
  const facultyChartData = byFaculty.map((item, index) => ({
    name: item._id || 'Unknown', 
    value: item.count,
    fill: FACULTY_COLORS[index % FACULTY_COLORS.length] // Cycle through colors
  }));

  return (
    <div className="admin-stat-card student-summary-card"> {/* Reuse admin-stat-card for base style */}
      <div className="summary-card-content">
        <h3 className="summary-card-title">Student Enrollment</h3>
        <div className="summary-main-stats">
            <div className="summary-total">
                <Users size={24} className="summary-icon total-icon" />
                <span className="summary-value">{totalStudents}</span>
                <span className="summary-label">Total Students</span>
            </div>
            <div className="summary-today">
                 <UserCheck size={20} className="summary-icon today-icon" />
                 <span className="summary-value-small">{addedToday}</span>
                 <span className="summary-label-small">Added Today</span>
            </div>
        </div>

        <div className="summary-breakdown">
          {/* Breakdown by Faculty */}
          <div className="breakdown-section">
            <h4>By Faculty:</h4>
            <ul className="breakdown-list">
              {byFaculty.length > 0 ? (
                byFaculty.map((item, index) => (
                  <li key={`faculty-${index}`}>
                    <span className="dot" style={{ backgroundColor: FACULTY_COLORS[index % FACULTY_COLORS.length] }}></span>
                    {item._id || 'Unknown'}: {item.count}
                  </li>
                ))
              ) : (
                <li>No faculty data</li>
              )}
            </ul>
          </div>

          {/* Breakdown by Batch */}
          <div className="breakdown-section">
            <h4>By Batch:</h4>
            <ul className="breakdown-list">
              {byBatch.length > 0 ? (
                byBatch.map((item, index) => (
                  <li key={`batch-${index}`}>
                    <span className="dot" style={{ backgroundColor: BATCH_COLORS[index % BATCH_COLORS.length] }}></span>
                    {item._id || 'Unknown'}: {item.count}
                  </li>
                ))
              ) : (
                <li>No batch data</li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Optional Faculty Pie Chart */}
        {/* <div className="summary-chart-container">
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie
                data={facultyChartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {facultyChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} students`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
      </div>
    </div>
  );
};

export default StudentSummaryCard; 