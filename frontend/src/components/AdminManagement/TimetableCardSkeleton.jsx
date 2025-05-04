import React from 'react';
import './timetable.css';

const SkeletonCard = () => (
    <div className="admin-card skeleton-card">
        <div className="admin-card-text">
            <div className="skeleton skeleton-text skeleton-title"></div>
            <div className="skeleton skeleton-text skeleton-value"></div>
        </div>
        <div className="admin-card-icon skeleton skeleton-icon"></div>
    </div>
);

// Render multiple card skeletons
const TimetableCardSkeleton = ({ count = 4 }) => (
    <>
        {[...Array(count)].map((_, index) => (
            <SkeletonCard key={index} />
        ))}
    </>
);

export default TimetableCardSkeleton; 