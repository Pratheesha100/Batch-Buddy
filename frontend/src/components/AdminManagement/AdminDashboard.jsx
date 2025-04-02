import React, { useState } from "react";
import Nav from "./Navigation/Navbar";
import Header from "./Navigation/Header";
import Footer from "./Navigation/Footer";
import studentIcon from "../../assets/students.png";
import activeIcon from "../../assets/active.png";
import growthIcon from "../../assets/growth.png";
import attendanceIcon from "../../assets/participate.png";
import brainIcon from "../../assets/analyticsBold.png";
import "./adminDash.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="admin-dashboard-container">
      {/* Pass collapse state & setter to Navbar */}
      <Nav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`admin-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="admin-main-content-containerr">
          <div className="admin-main-content-top">
            <div className="admin-greet">
              <h4>Welcome Back!</h4>
            </div>
            <div className="admin-smart-analytics">
              <motion.button
                whileHover={{ scale: 1.05 }} // Animates on hover
                whileTap={{ scale: 0.9 }} // Animates on click
                /*transition={{ type: "spring", stiffness: 300 }}*/
              >
                <img src={brainIcon} alt="Analytics Icon" /> Smart Analytics
              </motion.button>
            </div>
          </div>
          <div className="admin-main-content-stat">
            {/* Stats Cards */}
            <div className="admin-stats-container">
              <StatCard
                icon={studentIcon}
                title="Total Students"
                value="24,500"
                change="+12%"
              />
              <StatCard
                icon={activeIcon}
                title="Active Today"
                value="1,234"
                change="+8%"
              />
              <StatCard
                icon={growthIcon}
                title="Annual Growth"
                value="+4,320"
                change="+15%"
              />
              <StatCard
                icon={attendanceIcon}
                title="Attendance Rate"
                value="89%"
                change="+5%"
              />
            </div>
          </div>
          <div className="admin-main-content-chart">
            <div className="admin-charts-container">
              <ChartCard title="Student Participation Trends" />
              <ChartCard title="Total Students Growth" />
            </div>
          </div>
          <div className="admin-main-content-tasks">
            <div className="admin-progress-container">
              <ProgressCard
                title="Total Tasks"
                value={24}
                percentage={75}
                color="admin-blue"
              />
              <ProgressCard
                title="Completed"
                value={18}
                percentage={65}
                color="admin-green"
              />
              <ProgressCard
                title="Pending"
                value={6}
                percentage={25}
                color="admin-red"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
// Stats Card Component
const StatCard = ({ icon, title, value, change }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        <img src={icon} alt="icon" />
      </div>
      <div className="admin-stat-content">
        <h3>{title}</h3>
        <div className="admin-stat-value">{value}</div>
      </div>
      <div className="admin-stat-change">
        <span className="admin-arrow">↑</span> {change}
      </div>
    </div>
  );
};

const dummyData = [
  { name: "Jan", students: 400 },
  { name: "Feb", students: 300 },
  { name: "Mar", students: 500 },
  { name: "Apr", students: 200 },
  { name: "May", students: 600 },
];
// Chart Placeholder Component
const ChartCard = ({ title }) => (
  <div className="admin-chart-card">
    <h3>{title}</h3>
    <div className="admin-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="students"
            stroke="#1E64F0"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Progress Card Component
const ProgressCard = ({ title, value, percentage, color }) => (
  <div className="admin-progress-card">
    <div className="admin-progress-header">
      <h3>{title}</h3>
      <span className={`admin-progress-value ${color}`}>{value}</span>
    </div>
    <div className="admin-progress-bar">
      <div
        className={`admin-progress-fill ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
    <p className="admin-progress-percentage">{percentage}%</p>
  </div>
);
export default AdminDashboard;
