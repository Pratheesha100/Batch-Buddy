import React from 'react';
import { Users } from 'lucide-react'; // Icon for lecturers
import './adminDash.css'; 

// Reuse colors or define specific ones
const FACULTY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

const LecturerSummaryCard = ({ data, isLoading, error }) => {

  if (isLoading) {
    return <div className="analysis-loading">Loading Lecturer Summary...</div>;
  }

  if (error) {
    return <div className="analysis-error">Error loading summary: {error}</div>;
  }

  if (!data) {
    return null; 
  }

  const { totalLecturers, byFaculty = [] } = data;

  return (
    <div className="admin-stat-card lecturer-summary-card"> 
      <div className="summary-card-content">
        <h3 className="summary-card-title">Lecturer Overview</h3>
        <div className="summary-main-stats" style={{ borderBottom: 'none', paddingBottom: '5px'}}> {/* Simplified main stats area */}
            <div className="summary-total">
                <Users size={24} className="summary-icon total-icon" />
                <span className="summary-value">{totalLecturers}</span>
                <span className="summary-label">Total Lecturers</span>
            </div>
        </div>

        <div className="summary-breakdown" style={{ justifyContent: 'flex-start'}}> {/* Single column breakdown */}
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
        </div>
      </div>
    </div>
  );
};

export default LecturerSummaryCard; 