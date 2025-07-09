import React from 'react';
import './adminDash.css';

// --- Skeleton Component for Chart Cards ---
const SkeletonChartCard = () => (
  <div className="admin-chart-card" style={{ height: '320px' }}>
    <div className="skeleton skeleton-title"></div>
    <div className="admin-chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton skeleton-chart"></div>
    </div>
  </div>
);

// --- Skeleton Component for Recommendation Cards ---
const SkeletonAnalysisCard = ({ lines = 3 }) => (
   <div className="analysis-card" style={{ marginBottom: '15px' }}>
     <div className="skeleton skeleton-subtitle"></div>
     {[...Array(lines)].map((_, i) => (
       <div key={i} className="skeleton skeleton-text"></div>
     ))}
   </div>
);

// --- Main Skeleton Component ---
function AnalysisPageSkeleton() {
  return (
    <div className="analysis-skeleton">
      {/* Skeleton for Recommendations Section */}
      <div className="analysis-results-container">
        <div className="skeleton skeleton-heading"></div>
        <div className="analysis-section">
          <div className="skeleton skeleton-subtitle"></div>
          <SkeletonAnalysisCard lines={2} />
        </div>
        <div className="analysis-section">
           <div className="skeleton skeleton-subtitle"></div>
           <div className="analysis-best-times-grid">
              <SkeletonAnalysisCard lines={4} />
              <SkeletonAnalysisCard lines={4} />
           </div>
        </div>
         <div className="analysis-section">
           <div className="skeleton skeleton-subtitle"></div>
           <SkeletonAnalysisCard lines={5} />
         </div>
      </div>

      {/* Skeleton for Participation/Pie Chart Row */}
      <div className="analysis-row-grid">
        <SkeletonChartCard />
        <SkeletonChartCard />
      </div>

      {/* Skeleton for Bar Chart Row */}
      <div className="analysis-charts-grid">
         <SkeletonChartCard />
         <SkeletonChartCard />
      </div>

      {/* Skeleton for AI Summary Section */}
      <div className="analysis-results-container">
        <div className="skeleton skeleton-heading"></div>
        <div className="analysis-section">
           <SkeletonAnalysisCard lines={4} />
        </div>
      </div>
      
       {/* Skeleton for AI Trigger Section */}
       <div className="ai-trigger-section">
         <div className="skeleton skeleton-text" style={{ width: '70%', margin: 'auto' }}></div>
         <div className="skeleton skeleton-button" style={{ width: '180px', height: '40px', margin: '20px auto' }}></div>
       </div>
    </div>
  );
}

export default AnalysisPageSkeleton; 