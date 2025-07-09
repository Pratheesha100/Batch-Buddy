import React, { useState } from 'react';
import './shared.css'; // Use shared modal styles
import './timetable.css'; // Use timetable table styles if needed

function PreviewModal({ data, onConfirm, onCancel }) {
  const [editedData, setEditedData] = useState(data);

  // Handle potential edits (optional, basic example)
  const handleCellChange = (e, rowIndex, colKey) => {
    const newValue = e.target.value;
    setEditedData(prev => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [colKey]: newValue };
      return newData;
    });
  };

  // Extract headers dynamically from the first row (if data exists)
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content-container" style={{ maxWidth: '90vw', width: 'auto' }}>
        <div className="admin-form-name-container">
          <h2>Preview Extracted Timetable Data</h2>
          <p>Review the extracted data below. Edit if necessary and confirm to save.</p>
        </div>

        <div className="admin-main-timetable-container" style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '20px' }}>
          <table className="admin-timetable preview-table"> {/* Add a class for specific preview styling */}
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map(colKey => (
                    <td key={colKey}>
                       {/* Simple editable input example - enhance as needed */}
                       <input
                         type="text"
                         value={row[colKey] || ''}
                         onChange={(e) => handleCellChange(e, rowIndex, colKey)}
                         className="admin-input preview-input" // Style this input
                       />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {editedData.length === 0 && <p className="text-center">No data extracted or preview available.</p>}
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-save-btn" // Use save style for confirm
            onClick={() => onConfirm(editedData)} // Pass edited data back
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
