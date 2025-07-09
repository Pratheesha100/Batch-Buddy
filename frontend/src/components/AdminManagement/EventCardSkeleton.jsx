import React from 'react';
import './event.css'; // Reuse styles where possible, add specific skeleton styles

const EventCardSkeleton = () => (
  <div className="admin-event-card skeleton-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-date"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
    <div className="skeleton skeleton-faculty"></div>
    <div className="admin-event-details skeleton-details">
      <div className="skeleton skeleton-icon-text"></div>
      <div className="skeleton skeleton-icon-text"></div>
    </div>
    <div className="admin-event-actions skeleton-actions">
      <div className="skeleton skeleton-button"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  </div>
);

export default EventCardSkeleton; 