import React from 'react';
import './event.css';

const RescheduleTableRowSkeleton = () => (
  <tr>
    <td><div className="skeleton skeleton-cell"></div></td>
    <td><div className="skeleton skeleton-cell short"></div></td>
    <td><div className="skeleton skeleton-cell short"></div></td>
    <td><div className="skeleton skeleton-cell medium"></div></td>
    <td><div className="skeleton skeleton-cell long"></div></td>
    <td><div className="skeleton skeleton-cell medium"></div></td>
    <td><div className="skeleton skeleton-cell medium"></div></td>
    <td><div className="skeleton skeleton-cell short"></div></td>
    <td><div className="skeleton skeleton-cell short"></div></td>
    <td><div className="skeleton skeleton-cell medium"></div></td>
    <td><div className="skeleton skeleton-cell medium"></div></td>
    <td><div className="skeleton skeleton-cell short"></div></td>
    <td><div className="skeleton skeleton-actions-cell"></div></td>
  </tr>
);

// Render multiple skeleton rows for a better loading appearance
const RescheduleTableSkeleton = ({ rows = 5 }) => (
  <>
    {[...Array(rows)].map((_, index) => (
      <RescheduleTableRowSkeleton key={index} />
    ))}
  </>
);

export default RescheduleTableSkeleton; 