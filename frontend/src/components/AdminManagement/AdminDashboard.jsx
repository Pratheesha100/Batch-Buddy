import React, { useState, useEffect, useMemo } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import StudentSummaryCard from "./StudentSummaryCard.jsx";
import LecturerSummaryCard from "./LecturerSummaryCard.jsx";
import DegreeSummaryCard from "./DegreeSummaryCard.jsx";
import attendanceIcon from "../../assets/growth.png"
import { ChartNoAxesCombined, Clock, GraduationCap, UserSquare, Award, Calendar as CalendarIcon } from "lucide-react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { Badge, List, ListItem, ListItemText, ListItemIcon, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import "./adminDash.css";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { motion } from "framer-motion";
import moment from 'moment';
import { Activity, Clock as ClockIconLucide, MapPin, MessageSquareText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AiChatModal from './AiChatModal.jsx';

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment());

  const [studentSummaryData, setStudentSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [lecturerSummaryData, setLecturerSummaryData] = useState(null);
  const [isLecturerSummaryLoading, setIsLecturerSummaryLoading] = useState(true);
  const [lecturerSummaryError, setLecturerSummaryError] = useState(null);

  const [degreeSummaryData, setDegreeSummaryData] = useState(null);
  const [isDegreeSummaryLoading, setIsDegreeSummaryLoading] = useState(true);
  const [degreeSummaryError, setDegreeSummaryError] = useState(null);

  const [allEvents, setAllEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [calendarDate, setCalendarDate] = useState(dayjs());

  const [studentGrowthData, setStudentGrowthData] = useState([]);
  const [isGrowthLoading, setIsGrowthLoading] = useState(true);
  const [growthError, setGrowthError] = useState(null);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsSummaryLoading(true);
      setIsLecturerSummaryLoading(true);
      setIsDegreeSummaryLoading(true);
      setIsGrowthLoading(true);
      setSummaryError(null);
      setLecturerSummaryError(null);
      setDegreeSummaryError(null);
      setEventsError(null);
      setGrowthError(null);

      try {
        const [studentRes, lecturerRes, degreeRes, eventsRes, growthRes] = await Promise.all([
          fetch("http://localhost:5000/api/analysis/student-summary"),
          fetch("http://localhost:5000/api/analysis/lecturer-summary"),
          fetch("http://localhost:5000/api/analysis/degree-summary"),
          fetch("http://localhost:5000/api/admin/events"),
          fetch("http://localhost:5000/api/analysis/student-growth-trend")
        ]);

        if (studentRes.ok) {
          setStudentSummaryData(await studentRes.json());
        } else {
          const errorData = await studentRes.json();
          throw new Error(`Student Summary Error: ${errorData.message || studentRes.status}`);
        }

        if (lecturerRes.ok) {
          setLecturerSummaryData(await lecturerRes.json());
        } else {
          const errorData = await lecturerRes.json();
          throw new Error(`Lecturer Summary Error: ${errorData.message || lecturerRes.status}`);
        }

        if (degreeRes.ok) {
          setDegreeSummaryData(await degreeRes.json());
        } else {
          const errorData = await degreeRes.json();
          throw new Error(`Degree Summary Error: ${errorData.message || degreeRes.status}`);
        }

        if (eventsRes.ok) {
          setAllEvents(await eventsRes.json());
        } else {
          const errorData = await eventsRes.json();
          console.error("Failed to fetch events:", errorData.message || eventsRes.status);
          setEventsError(errorData.message || `HTTP error! status: ${eventsRes.status}`);
        }

        if (growthRes.ok) {
          setStudentGrowthData(await growthRes.json());
        } else {
          const errorData = await growthRes.json();
          console.error("Failed to fetch student growth:", errorData.message || growthRes.status);
          setGrowthError(errorData.message || `HTTP error! status: ${growthRes.status}`);
        }

      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        if (e.message.includes('Student Summary')) setSummaryError(e.message);
        else if (e.message.includes('Lecturer Summary')) setLecturerSummaryError(e.message);
        else if (e.message.includes('Degree Summary')) setDegreeSummaryError(e.message);
        else if (e.message.includes('Student Growth')) setGrowthError(e.message);
        else setEventsError(e.message);
      } finally {
        setIsSummaryLoading(false);
        setIsLecturerSummaryLoading(false);
        setIsDegreeSummaryLoading(false);
        setIsGrowthLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const adminUsername = "Anakin";
  const greeting = `Good ${moment().hour() < 12 ? "morning" : moment().hour() < 18 ? "afternoon" : "evening"}`;

  const eventDates = useMemo(() => {
    const dates = new Set();
    allEvents.forEach(event => {
      if (event.eventDate) {
        dates.add(dayjs(event.eventDate).format('YYYY-MM-DD'));
      }
    });
    return dates;
  }, [allEvents]);

  const upcomingEvents = useMemo(() => {
    const selectedDateStart = calendarDate.startOf('day');
    return allEvents
        .filter(event => dayjs(event.eventDate).isSameOrAfter(selectedDateStart, 'day'))
        .sort((a, b) => dayjs(a.eventDate).valueOf() - dayjs(b.eventDate).valueOf());
  }, [allEvents, calendarDate]);

  // Component to render day slots with event indicators
  const DayWithEventIndicator = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateString = day.format('YYYY-MM-DD');
    const hasEvent = eventDates.has(dateString);

    // Get event names for the title (limit to a few)
    const eventTitle = hasEvent 
      ? allEvents
          .filter(event => dayjs(event.eventDate).format('YYYY-MM-DD') === dateString)
          .map(event => event.eventName)
          .slice(0, 2)
          .join('\n')
      : undefined;

    const dayComponent = (
      <div title={eventTitle} className={hasEvent ? 'event-day-wrapper' : ''}> 
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </div>
    );

    return (
      <Badge
        key={props.day.toString()}
        overlap="circular"
        badgeContent={hasEvent ? <span className="event-indicator-dot" /> : undefined}
      >
        {dayComponent}
      </Badge>
    );
  };

  const formatPeriodLabel = (period) => {
    if (!period || typeof period !== 'string' || !period.includes('-')) return period;
    return dayjs(period, 'YYYY-MM').format('MMM YY');
  };

  const annualGrowthValue = useMemo(() => {
    if (!studentGrowthData || studentGrowthData.length < 2) {
      return { value: 'N/A', change: 'N/A' };
    }
    
    const latestMonth = studentGrowthData[studentGrowthData.length - 1];
    const previousMonth = studentGrowthData[studentGrowthData.length - 2];
    
    const difference = latestMonth.students - previousMonth.students;
    let percentageChange = 0;

    if (previousMonth.students !== 0) {
      percentageChange = ((difference / previousMonth.students) * 100);
    }
    
    const valueString = difference >= 0 ? `+${difference}` : `${difference}`;
    const changeString = previousMonth.students === 0 && difference > 0 ? '(New)' : `${percentageChange.toFixed(1)}%`;

    return { value: valueString, change: changeString };

  }, [studentGrowthData]);

  return (
    <div className="admin-dashboard-container">
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-main-content-containerr">
          <div className="admin-main-content-top">
            <div className="admin-greet">
              <h4>{greeting}, {adminUsername}!</h4>
            </div>
            <div className="admin-top-right-controls">
              <div className="admin-smart-analytics">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/analysis')}
                >
                  <ChartNoAxesCombined size={23} />
                  Smart Analytics
                </motion.button>
              </div>
              <div className="admin-current-time">
                <span className="time-label">Current time</span>
                <div className="time-value">
                  <Clock size={20} className="time-icon" />
                  {currentTime.format("h:mm A")}
                </div>
              </div>
            </div>
          </div>
          <div className="admin-simple-stats-container">
            <div className="simple-stat-card students">
              {isSummaryLoading ? (
                <div className="simple-stat-loading">Loading...</div>
              ) : summaryError ? (
                <div className="simple-stat-error">Error</div>
              ) : (
                <>
                  <div className="simple-stat-card-content">
                    <div className="simple-stat-card-title">Students</div>
                    <div className="simple-stat-card-value">{studentSummaryData?.totalStudents || 0}</div>
                  </div>
                  <GraduationCap size={32} className="simple-stat-card-icon" />
                </>
              )}
            </div>

            <div className="simple-stat-card lecturers">
              {isLecturerSummaryLoading ? (
                <div className="simple-stat-loading">Loading...</div>
              ) : lecturerSummaryError ? (
                <div className="simple-stat-error">Error</div>
              ) : (
                <>
                  <div className="simple-stat-card-content">
                    <div className="simple-stat-card-title">Lecturers</div>
                    <div className="simple-stat-card-value">{lecturerSummaryData?.totalLecturers || 0}</div>
                  </div>
                  <UserSquare size={32} className="simple-stat-card-icon" />
                </>
              )}
            </div>

            <div className="simple-stat-card degrees">
              {isDegreeSummaryLoading ? (
                <div className="simple-stat-loading">Loading...</div>
              ) : degreeSummaryError ? (
                <div className="simple-stat-error">Error</div>
              ) : (
                <>
                  <div className="simple-stat-card-content">
                    <div className="simple-stat-card-title">Degrees</div>
                    <div className="simple-stat-card-value">{degreeSummaryData?.totalDegrees || 0}</div>
                  </div>
                  <Award size={32} className="simple-stat-card-icon" />
                </>
              )}
            </div>
          </div>
          <div className="admin-main-content-stat">
            <div className="admin-stats-container">
              <StudentSummaryCard 
                data={studentSummaryData} 
                isLoading={isSummaryLoading} 
                error={summaryError} 
              />
              <LecturerSummaryCard 
                data={lecturerSummaryData} 
                isLoading={isLecturerSummaryLoading} 
                error={lecturerSummaryError} 
              />
              <DegreeSummaryCard 
                data={degreeSummaryData} 
                isLoading={isDegreeSummaryLoading} 
                error={degreeSummaryError} 
              />
              <StatCard
                icon={CalendarIcon}
                title="Monthly Growth"
                value={isGrowthLoading ? '...' : annualGrowthValue.value}
                change={isGrowthLoading ? '' : annualGrowthValue.change}
              />
            </div>
          </div>

          <div className="admin-calendar-chart-section">
            <div className="calendar-events-column">
              <h3 className="section-title">Calendar</h3>
              <div className="admin-calendar-container">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={calendarDate}
                    onChange={(newDate) => setCalendarDate(newDate)}
                    slots={{ day: DayWithEventIndicator }}
                    className="admin-mui-calendar"
                  />
                </LocalizationProvider>
              </div>
              <div className="upcoming-events-container">
                <h4 className="upcoming-events-title">Upcoming Events</h4>
                {eventsError && <p className="error-text">Could not load events.</p>}
                {!eventsError && upcomingEvents.length === 0 && <p className="no-events-text">No upcoming events.</p>}
                {!eventsError && upcomingEvents.length > 0 && (
                  <List dense className="upcoming-events-list">
                    {upcomingEvents.slice(0, 5).map((event, index) => (
                      <Paper 
                        key={event._id} 
                        elevation={1} 
                        className={`event-list-item-paper event-paper-color-${index % 3}`}
                      >
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={<Typography variant="subtitle2" className="event-item-title">{event.eventName}</Typography>}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" className="event-item-detail">
                                  <ClockIconLucide size={12} /> {event.time}
                                </Typography>
                                <Typography component="span" variant="body2" className="event-item-detail">
                                  <MapPin size={12} /> {event.location}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                )}
              </div>
            </div>

            <div className="chart-column">
               <ChartCard
                  title="Total Students Growth"
                  data={studentGrowthData}
                  dataKey="students"
                  xAxisKey="period"
                  isLoading={isGrowthLoading}
                  error={growthError}
                  xAxisLabelFormatter={formatPeriodLabel}
               />
               <div className="ai-trigger-section">
                   <p>Want to dive deeper or ask specific questions about attendance or student data? Chat with our AI assistant!</p>
                   <div className="ai-trigger-button-wrapper">
                      <Sparkles size={22} className="ai-trigger-icon" />
                      <button className="ai-trigger-button" onClick={() => setIsChatModalOpen(true)}>
                        <MessageSquareText size={18} /> Ask AI Assistant
                      </button>
                      <Sparkles size={22} className="ai-trigger-icon" />
                   </div>
                </div>
            </div>
          </div>

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

const StatCard = ({ icon: IconComponentOrPath, title, value, change }) => {
  const isPositive = typeof change === 'string' && change.startsWith('+');
  const isNegative = typeof change === 'string' && change.startsWith('-');
  const arrow = isPositive ? '↑' : isNegative ? '↓' : '' ;
  const changeColor = isPositive ? '#28a745' : isNegative ? '#dc3545' : '#6c757d';

  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        {typeof IconComponentOrPath === 'string' ? (
          <img src={IconComponentOrPath} alt="icon" />
        ) : (
          <IconComponentOrPath size={29} />
        )}
      </div>
      <div className="admin-stat-content">
        <h3>{title}</h3>
        <div className="admin-stat-value">{value}</div>
      </div>
      {change && change !== 'N/A' && (
         <div className="admin-stat-change" style={{ color: changeColor }}>
            {arrow && <span className="admin-arrow" style={{color: changeColor}}>{arrow}</span>}
            {change} 
          </div>
      )}
    </div>
  );
};

const formatWeekLabel = (weekKey) => {
  if (!weekKey || typeof weekKey !== 'string' || !weekKey.includes('-')) return weekKey;
  const startOfWeek = moment(weekKey, 'YYYY-WW').startOf('isoWeek');
  return startOfWeek.format('MMM D');
};

const ChartCard = ({ title, data, dataKey, xAxisKey, isLoading, error, xAxisLabelFormatter }) => {
  let content;

  if (isLoading) {
    content = <div className="chart-loading">Loading chart data...</div>;
  } else if (error) {
    content = <div className="chart-error">Error loading chart: {error}</div>;
  } else if (!data || data.length === 0) {
    content = <div className="chart-no-data">No data available for this chart.</div>;
  } else {
    const tickFormatter = xAxisLabelFormatter || (xAxisKey === 'week' ? formatWeekLabel : undefined);
    const yAxisDomain = dataKey === 'rate' ? [0, 100] : undefined;
    const yAxisLabel = dataKey === 'rate' ? "Participation Rate (%)" : "Value";

    content = (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 11 }}
            tickFormatter={tickFormatter}
            interval="preserveStartEnd"
          >
             <Label value="Period" offset={0} position="insideBottom" style={{ textAnchor: 'middle', fontSize: 12, fill: '#666' }} />
          </XAxis>
          <YAxis
             dataKey={dataKey}
             domain={yAxisDomain}
             tick={{ fontSize: 12 }}
             width={35}
           >
              <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 12, fill: '#666' }} />
           </YAxis>
          <Tooltip
             formatter={(value, name) => [
                dataKey === 'rate' ? `${parseFloat(value).toFixed(1)}%` : value,
                dataKey === 'rate' ? 'Avg. Participation' : (dataKey === 'students' ? 'New Students' : name)
              ]}
             labelFormatter={xAxisLabelFormatter ? (label) => xAxisLabelFormatter(label) : (label) => xAxisKey === 'week' ? `Week: ${formatWeekLabel(label)}` : label}
           />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#1E64F0"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="admin-chart-card">
      <h3>{title}</h3>
      <div className="admin-chart-container">
        {content}
      </div>
    </div>
  );
};

export default AdminDashboard;
