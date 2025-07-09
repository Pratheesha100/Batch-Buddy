import React from 'react';
import { BookOpenCheck } from 'lucide-react'; // Example icon for degrees
import './adminDash.css'; 

// Reuse colors or define specific ones
const FACULTY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

const DegreeSummaryCard = ({ data, isLoading, error }) => {

  if (isLoading) {
    return <div className="analysis-loading">Loading Degree Summary...</div>;
  }

  if (error) {
    return <div className="analysis-error">Error loading summary: {error}</div>;
  }

  if (!data) {
    return null; 
  }

  const { totalDegrees, byFaculty = [] } = data;

  return (
    <div className="admin-stat-card degree-summary-card"> 
      <div className="summary-card-content">
        <h3 className="summary-card-title">Degree Programs</h3>
        <div className="summary-main-stats" style={{ borderBottom: 'none', paddingBottom: '5px'}}> 
            <div className="summary-total">
                <BookOpenCheck size={24} className="summary-icon total-icon" />
                <span className="summary-value">{totalDegrees}</span>
                <span className="summary-label">Total Degrees</span>
            </div>
        </div>

        <div className="summary-breakdown" style={{ justifyContent: 'flex-start'}}>
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

export default DegreeSummaryCard; 