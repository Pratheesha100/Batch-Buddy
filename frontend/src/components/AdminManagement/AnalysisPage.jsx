import React, { useState, useEffect, useMemo } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import "./adminDash.css"; 
import { useNavigate } from 'react-router-dom'; 
import { RefreshCw, MessageSquareText, Sparkles, Download } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, 
    BarChart, Bar, Cell, XAxis as BarXAxis, YAxis as BarYAxis, CartesianGrid as BarGrid, Tooltip as BarTooltip, Legend as BarLegend, ResponsiveContainer as BarContainer, Label as BarLabel, 
    PieChart, Pie, Legend, Tooltip as PieTooltip, ResponsiveContainer as PieContainer 
} from 'recharts';
import moment from "moment"; 
import AiChatModal from './AiChatModal.jsx';
import AiResponseParser from './AiResponseParser.jsx';
import AnalysisPageSkeleton from './AnalysisPageSkeleton.jsx';

// Helper function moved from AnalysisResults
const formatWeekLabel = (weekKey) => {
  if (!weekKey || typeof weekKey !== 'string' || !weekKey.includes('-')) return weekKey;
  const startOfWeek = moment(weekKey, 'YYYY-WW').startOf('isoWeek');
  return startOfWeek.format('MMM D');
};

function AnalysisPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true); 
  const [analysisError, setAnalysisError] = useState(null);
  const [participationData, setParticipationData] = useState([]);
  const [isParticipationLoading, setIsParticipationLoading] = useState(true); 
  const [participationError, setParticipationError] = useState(null);
  
  // Add state for Attendance By Day data
  const [attendanceByDayData, setAttendanceByDayData] = useState([]);
  const [isAttendanceByDayLoading, setIsAttendanceByDayLoading] = useState(true);
  const [attendanceByDayError, setAttendanceByDayError] = useState(null);
  
  // State for the initial AI Insights generation
  const [initialAiInsights, setInitialAiInsights] = useState(null); 
  const [isInitialAiLoading, setIsInitialAiLoading] = useState(false);
  const [initialAiError, setInitialAiError] = useState(null);
  
  // State for controlling the chat modal
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Add state for Student Summary data (for Pie Chart)
  const [studentSummaryData, setStudentSummaryData] = useState(null);
  const [isStudentSummaryLoading, setIsStudentSummaryLoading] = useState(true);
  const [studentSummaryError, setStudentSummaryError] = useState(null);

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch data when the component mounts
    const fetchAnalysisData = async () => {
      // Set loading states for all fetches
      setIsAnalysisLoading(true);
      setIsParticipationLoading(true);
      setIsAttendanceByDayLoading(true);
      setIsStudentSummaryLoading(true); // Add new loading state
      setAnalysisError(null);
      setParticipationError(null);
      setAttendanceByDayError(null);
      setStudentSummaryError(null); // Add new error state
      setAnalysisData(null);
      setParticipationData([]);
      setAttendanceByDayData([]);
      setStudentSummaryData(null); // Add new data state

      try {
        // Fetch all data concurrently
        const [analysisRes, participationRes, attendanceByDayRes, studentSummaryRes] = await Promise.all([
          fetch("http://localhost:5000/api/analysis/recommendations"),
          fetch("http://localhost:5000/api/analysis/participation-trends"),
          fetch("http://localhost:5000/api/analysis/attendance-by-day"),
          fetch("http://localhost:5000/api/analysis/student-summary") // Fetch student summary
        ]);

        // Process analysis recommendations
        if (!analysisRes.ok) {
          const errorData = await analysisRes.json();
          throw new Error(`Recommendations Error: ${errorData.message || analysisRes.status}`);
        } else {
          const recommendations = await analysisRes.json();
          setAnalysisData(recommendations);
          setAnalysisError(null);
        }

        // Process participation trends
        if (!participationRes.ok) {
          const errorData = await participationRes.json();
          throw new Error(`Participation Trends Error: ${errorData.message || participationRes.status}`);
        } else {
          const trends = await participationRes.json();
          setParticipationData(trends);
          setParticipationError(null);
        }
        
        // Process attendance by day
        if (!attendanceByDayRes.ok) {
           const errorData = await attendanceByDayRes.json();
           throw new Error(`Attendance By Day Error: ${errorData.message || attendanceByDayRes.status}`);
        } else {
            const byDayData = await attendanceByDayRes.json();
            setAttendanceByDayData(byDayData);
            setAttendanceByDayError(null);
        }
        
        // Process student summary
        if (!studentSummaryRes.ok) {
           const errorData = await studentSummaryRes.json();
           throw new Error(`Student Summary Error: ${errorData.message || studentSummaryRes.status}`);
        } else {
            const summaryData = await studentSummaryRes.json();
            setStudentSummaryData(summaryData);
            setStudentSummaryError(null);
        }

      } catch (e) {
        console.error("Failed to fetch analysis page data:", e);
        // Set specific errors
        if (e.message.includes('Recommendations Error')) setAnalysisError(e.message);
        if (e.message.includes('Participation Trends Error')) setParticipationError(e.message);
        if (e.message.includes('Attendance By Day Error')) setAttendanceByDayError(e.message);
        if (e.message.includes('Student Summary Error')) setStudentSummaryError(e.message); // Add new error check
        // Set general error if the source isn't identified
        if (!analysisError && !participationError && !attendanceByDayError && !studentSummaryError) {
            setAnalysisError("An unexpected error occurred fetching analysis page data.");
        }
      } finally {
        // Set all loading states to false
        setIsAnalysisLoading(false);
        setIsParticipationLoading(false);
        setIsAttendanceByDayLoading(false);
        setIsStudentSummaryLoading(false); // Add new loading state
      }
    };

    fetchAnalysisData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // ChartCard component moved from AnalysisResults
  const ChartCard = ({ title, data, dataKey, xAxisKey, isLoading, error }) => {
    let content;
    if (isLoading) {
      content = <div className="chart-loading">Loading chart data...</div>;
    } else if (error) {
      content = <div className="chart-error">Error loading chart: {error}</div>;
    } else if (!data || data.length === 0) {
      content = <div className="chart-no-data">No data available for this chart.</div>;
    } else {
      const tickFormatter = xAxisKey === 'week' ? formatWeekLabel : undefined;
      const yAxisDomain = dataKey === 'rate' ? [0, 100] : undefined;
      const yAxisLabel = dataKey === 'rate' ? "Participation Rate (%)" : "Value";
      content = (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34c759" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#34c759" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false}/>
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 11 }} 
              tickFormatter={tickFormatter} 
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            >
              <Label value="Week Starting" offset={0} position="insideBottom" style={{ textAnchor: 'middle', fontSize: 12, fill: '#666' }} />
            </XAxis>
            <YAxis 
               dataKey={dataKey} 
               domain={yAxisDomain} 
               tick={{ fontSize: 12 }} 
               width={35}
               axisLine={false}
               tickLine={false}
             >
                <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 12, fill: '#666' }} />
             </YAxis>
            <Tooltip
               formatter={(value, name) => [
                  dataKey === 'rate' ? `${parseFloat(value).toFixed(1)}%` : value,
                  dataKey === 'rate' ? 'Avg. Participation' : name
                ]}
               labelFormatter={(label) => xAxisKey === 'week' ? `Week: ${formatWeekLabel(label)}` : label}
             />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#28a745"
              strokeWidth={2} 
              fillOpacity={1}
              fill="url(#chartGradient)"
              dot={{ stroke: '#28a745', strokeWidth: 1, r: 3, fill: '#28a745'}}
              activeDot={{ 
                  stroke: '#28a745', 
                  strokeWidth: 2, 
                  r: 6, 
                  fill: '#ffffff',
                  filter: 'url(#activeDotShadow)' 
               }} 
            />
            <defs>
              <filter id="activeDotShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
                  <feOffset in="blur" dx="0" dy="0" result="offsetBlur"/>
                  <feFlood floodColor="#28a745" floodOpacity="0.5" result="offsetColor"/>
                  <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlurColored"/>
                  <feMerge>
                    <feMergeNode in="offsetBlurColored" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
              </filter>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <div className="admin-chart-card" style={{ height: '320px' }}>
        <h3>{title}</h3>
        <div className="admin-chart-container">
          {content}
        </div>
      </div>
    );
  };

  // Calculation moved from AnalysisResults
  const overallAverageRate = useMemo(() => {
    if (!participationData || participationData.length === 0) {
      return null;
    }
    let totalPresent = 0;
    let totalPossible = 0;
    participationData.forEach(week => {
      totalPresent += week.present || 0;
      totalPossible += week.total || 0;
    });
    return totalPossible === 0 ? 0 : ((totalPresent / totalPossible) * 100);
  }, [participationData]);

  // Determine loading state for the main content
  const isLoading = isAnalysisLoading || isParticipationLoading || isAttendanceByDayLoading || isStudentSummaryLoading;

  // Prepare data for rendering
  const { bestTimes, weeklyTrends, topModules } = analysisData || {}; 
  const hasRecommendationError = !!analysisError;
  const hasParticipationError = !!participationError;
  const hasAttendanceByDayError = !!attendanceByDayError;
  const hasStudentSummaryError = !!studentSummaryError;

  // Custom colors for bar charts (optional)
  const MODULE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  const DAY_COLORS = ['#e6fcf5', '#fff4e6', '#f3e8ff', '#dfeeff', '#ffebe6', '#f0f0f0', '#e0e0e0'];

  // Simple Bar Chart Component (can be expanded or moved)
  const SimpleBarChartCard = ({ title, data, xKey, yKey, colors, isLoading, error, label }) => {
    let content;
    if (isLoading) {
      content = <div className="chart-loading">Loading...</div>;
    } else if (error) {
      content = <div className="chart-error">Error: {error}</div>;
    } else if (!data || data.length === 0) {
      content = <div className="chart-no-data">No data available.</div>;
    } else {
      content = (
        <BarContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 20 }}>
            <BarGrid strokeDasharray="3 3" vertical={false} />
            <BarXAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} />
            <BarYAxis tick={{ fontSize: 11 }} />
            <BarTooltip formatter={(value) => [`${value.toFixed(1)}${yKey === 'rate' ? '%' : ''}`, label || yKey]}/>
            <Bar dataKey={yKey} >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
            <BarLabel value="Test" position="insideBottom" /> 
          </BarChart>
        </BarContainer>
      );
    }
    return (
      <div className="admin-chart-card" style={{ height: '320px' }}> 
        <h3>{title}</h3>
        <div className="admin-chart-container">
          {content}
        </div>
      </div>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChartCard = ({ title, data, dataKey, nameKey, colors, isLoading, error }) => {
    let content;
    if (isLoading) {
      content = <div className="chart-loading">Loading...</div>;
    } else if (error) {
      content = <div className="chart-error">Error: {error}</div>;
    } else if (!data || data.length === 0) {
      content = <div className="chart-no-data">No data available.</div>;
    } else {
      content = (
        <PieContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                 const RADIAN = Math.PI / 180;
                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                 const x = cx + radius * Math.cos(-midAngle * RADIAN);
                 const y = cy + radius * Math.sin(-midAngle * RADIAN);
                 // Only show label if percent is large enough
                 return percent > 0.05 ? (
                   <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                     {`${(percent * 100).toFixed(0)}%`}
                   </text>
                 ) : null;
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <PieTooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </PieContainer>
      );
    }
    return (
      <div className="admin-chart-card" style={{ height: '320px' }}> 
        <h3>{title}</h3>
        <div className="admin-chart-container">
          {content}
        </div>
      </div>
    );
  };

  // Renamed function for clarity
  const fetchInitialInsights = async () => { 
    setIsInitialAiLoading(true);
    setInitialAiError(null);
    try {
      const response = await fetch("http://localhost:5000/api/analysis/gemini-insights");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
      const data = await response.json();
      setInitialAiInsights(data.insights); // Use the new state variable
    } catch (error) {
      console.error("Failed to fetch initial AI insights:", error);
      setInitialAiError(error.message); // Use the new state variable
    } finally {
      setIsInitialAiLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container"> {/* Reuse container class */}
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        
        {/* AI Insights Button Section (for initial summary) */}
        <div className="admin-page-title-section">
          <div className="title-section-content">
            <h2>Attendance Analysis</h2>
            <p>Comprehensive analytics of student attendance patterns and recommendations</p>
          </div>
          {/* Container for buttons */}
          <div className="title-section-actions">
             <button
                className="ai-insights-button" 
                onClick={fetchInitialInsights}
                disabled={isLoading || isInitialAiLoading}
              >
                {isInitialAiLoading ? (
                  <><RefreshCw size={18} className="icon-spin" /> Generating...</>
                ) : (
                  <><RefreshCw size={18} /> Generate AI Summary</>
                )}
              </button>
          </div>
        </div>
        
        <div className="admin-main-content-containerr"> {/* Reuse container class */}
          {/* Use the new skeleton component when loading */}
           {isLoading ? (
             <AnalysisPageSkeleton />
           ) : (
             // Render actual content when not loading
             <> 
                  {/* Error Handling Section */}
                  {(hasRecommendationError || hasParticipationError || hasAttendanceByDayError || hasStudentSummaryError) && (
                      <div className="analysis-error" style={{ marginBottom: '20px' }}>
                          Error loading some analysis components: 
                          {hasRecommendationError && " Recommendations "}
                          {hasParticipationError && " Participation Trends "}
                          {hasAttendanceByDayError && " Attendance By Day "}
                          {hasStudentSummaryError && " Student Summary "}
                      </div>
                  )}
                  
                  {/* Render recommendation sections (conditionally handles internal errors/loading) */}
                  <div className="analysis-results-container"> 
                    <h2>Attendance Analysis Recommendations</h2>
                    {/* ... Weekly Trend ... */} 
                     <div className="analysis-section">
                       <h3>Weekly Attendance Trend</h3>
                       {isAnalysisLoading ? <Skeleton height={50} /> : analysisError ? <div className="analysis-error">Trend unavailable</div> : 
                           weeklyTrends ? (
                               weeklyTrends.previousWeekRate !== null ? (
                                   <div className="analysis-card weekly-trend">
                                       <p>{weeklyTrends.trend}</p>
                                       <p><strong>Current Week ({weeklyTrends.currentWeek}):</strong> {weeklyTrends.currentWeekRate}%</p>
                                       <p><strong>Previous Week ({weeklyTrends.previousWeek}):</strong> {weeklyTrends.previousWeekRate}%</p>
                                   </div>
                               ) : (
                                   <div className="analysis-card weekly-trend"><p>{weeklyTrends.trend}</p></div>
                               )
                           ) : (
                               <p>Could not calculate weekly trends.</p>
                           )
                       }
                     </div>
                     {/* ... Best Times ... */} 
                     <div className="analysis-section">
                       <h3>Optimal Scheduling Times</h3>
                       <div className="analysis-best-times-grid">
                         <div className="analysis-card">
                           <h4>Best Lecture Times (Top 3)</h4>
                            {isAnalysisLoading ? <Skeleton count={3} /> : analysisError ? <div className="analysis-error">Data unavailable</div> : 
                             bestTimes && bestTimes.bestLectureTimes.length > 0 ? (
                               <ul className="analysis-list">
                                 {bestTimes.bestLectureTimes.map((slot, index) => (
                                   <li key={`lecture-${index}`} className="analysis-list-item">
                                     {slot.day} at {slot.time} (Avg. Attendance: {slot.attendanceRate}%)
                                   </li>
                                 ))}
                               </ul>
                             ) : (
                               <p>No lecture data available.</p>
                             )}
                         </div>
                         <div className="analysis-card">
                           <h4>Best Practical Times (Top 3)</h4>
                            {isAnalysisLoading ? <Skeleton count={3} /> : analysisError ? <div className="analysis-error">Data unavailable</div> : 
                               bestTimes && bestTimes.bestPracticalTimes.length > 0 ? (
                               <ul className="analysis-list">
                                 {bestTimes.bestPracticalTimes.map((slot, index) => (
                                   <li key={`practical-${index}`} className="analysis-list-item">
                                     {slot.day} at {slot.time} (Avg. Attendance: {slot.attendanceRate}%)
                                   </li>
                                 ))}
                               </ul>
                             ) : (
                               <p>No practical data available.</p>
                             )}
                         </div>
                       </div>
                     </div>
                     {/* ... Top Modules ... */} 
                     <div className="analysis-section">
                       <h3>Most Attended Lectures (Top 5)</h3>
                        {isAnalysisLoading ? <Skeleton count={5} /> : analysisError ? <div className="analysis-error">Data unavailable</div> : 
                          topModules && topModules.length > 0 ? (
                             <div className="analysis-card">
                                 <ul className="analysis-list">
                                 {topModules.map((mod, index) => (
                                     <li key={`module-${index}`} className="analysis-list-item">
                                     <strong>{mod.moduleName}</strong> (Lecturer: {mod.lecturerName}) - {mod.attendanceCount} Present
                                     </li>
                                 ))}
                                 </ul>
                             </div>
                         ) : (
                           <p>No lecture attendance data available.</p>
                         )}
                     </div>
                  </div>
                  
                  {/* Grid for Participation Area Chart and Student Pie Chart */}
                  <div className="analysis-row-grid"> 
                      {/* Participation Chart */}
                       <div className="analysis-section analysis-results-container" style={{marginBottom: 0}}>
                            <div className="chart-title-container"> 
                               <h3>Weekly Student Participation Rate (%)</h3>
                               {overallAverageRate !== null && (
                                 <span className="overall-average-rate">
                                   Avg: {overallAverageRate.toFixed(1)}%
                                 </span>
                               )}
                            </div>
                            <ChartCard 
                                title="" 
                                data={participationData}
                                dataKey="rate"
                                xAxisKey="week"
                                isLoading={isParticipationLoading}
                                error={participationError} 
                            />
                        </div>
                       
                       {/* Student Distribution Pie Chart */}
                       <SimplePieChartCard
                         title="Student Distribution by Faculty"
                         data={studentSummaryData?.byFaculty || []}
                         dataKey="count"
                         nameKey="_id" 
                         colors={MODULE_COLORS}
                         isLoading={isStudentSummaryLoading}
                         error={studentSummaryError}
                       />
                   </div>
                   
                   {/* Grid for the two bar charts */}
                   <div className="analysis-charts-grid">
                       {/* Top Modules Bar Chart */}
                        <SimpleBarChartCard
                         title="Top 5 Most Attended Modules"
                         data={topModules?.map(m => ({ name: m.moduleName, value: m.attendanceCount })) || []}
                         xKey="name"
                         yKey="value"
                         colors={MODULE_COLORS}
                         isLoading={isAnalysisLoading} // Reuse analysis loading/error
                         error={analysisError}
                         label="Present Count"
                       />
                       {/* Attendance by Day Bar Chart */}
                        <SimpleBarChartCard
                         title="Average Attendance Rate by Day"
                         data={attendanceByDayData}
                         xKey="day"
                         yKey="rate"
                         colors={DAY_COLORS}
                         isLoading={isAttendanceByDayLoading}
                         error={attendanceByDayError}
                         label="Avg. Rate"
                       />
                   </div>
  
                  {/* Initial AI Insights Section */}
                  <div className="analysis-results-container">
                     <h2>AI Generated Summary</h2>
                      <div className="analysis-section">
                        {isInitialAiLoading ? (
                          <div className="analysis-loading">Generating AI summary...</div>
                        ) : initialAiError ? (
                          <div className="analysis-error">Error generating AI summary: {initialAiError}</div>
                        ) : !initialAiInsights ? (
                           // ... empty state ... 
                          <div className="analysis-card ai-empty-state">
                           <div className="ai-empty-state-content">
                              <RefreshCw size={36} className="ai-empty-icon" />
                              <h3>No AI Summary Generated Yet</h3>
                              <p>Click the "Generate AI Summary" button at the top to get an overview based on the current data.</p>
                           </div>
                         </div>
                        ) : (
                          <div className="analysis-card ai-insights-card"> 
                            <AiResponseParser text={initialAiInsights} />
                          </div>
                        )}
                      </div>
                       {/* Download Button Moved Here */}
                   <div className="download-report-section">
                      <a
                        href="http://localhost:5000/api/admin/analysis"
                        className="download-report-button"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download size={18} /> Download Report
                      </a>
                    </div>
                   </div>
  
                  

                  {/* AI Trigger Section */}
                  <div className="ai-trigger-section">
                     <p>Want to dive deeper or ask specific questions? Chat with our AI assistant!</p>
                       <div className="ai-trigger-button-wrapper">
                          <Sparkles size={22} className="ai-trigger-icon" />
                          <button className="ai-trigger-button" onClick={() => setIsChatModalOpen(true)}>
                            <MessageSquareText size={18} /> Ask AI Assistant
                          </button>
                          <Sparkles size={22} className="ai-trigger-icon" />
                        </div>
                  </div>
              </> 
           )}
        </div>
        <Footer />
      </div>
      
      <AiChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
      />
    </div>
  );
}

export default AnalysisPage; 