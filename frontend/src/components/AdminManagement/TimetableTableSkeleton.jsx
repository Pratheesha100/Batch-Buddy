import React from 'react';
import './timetable.css'; // Reuse timetable CSS for skeleton styles

const TimetableTableRowSkeleton = () => (
  <tr>
    <td><div className="skeleton skeleton-cell medium"></div></td> {/* Faculty */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* Batch */}
    <td><div className="skeleton skeleton-cell medium"></div></td> {/* Group (Year) */}
    <td><div className="skeleton skeleton-cell long"></div></td>    {/* Module */}
    <td><div className="skeleton skeleton-cell medium"></div></td> {/* Lecturer */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* Location */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* Day */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* Start Time */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* End Time */}
    <td><div className="skeleton skeleton-cell short"></div></td>   {/* Type */}
    <td><div className="skeleton skeleton-actions-cell"></div></td>{/* Actions */}
  </tr>
);

// Render multiple skeleton rows
const TimetableTableSkeleton = ({ rows = 10 }) => (
  <>
    {[...Array(rows)].map((_, index) => (
      <TimetableTableRowSkeleton key={index} />
    ))}
  </>
);

export default TimetableTableSkeleton; 