import React from "react";
import "./navbar.css";
import { Link, useLocation } from "react-router-dom";
import toggleIconOpen from "../../../assets/baropen.png";
import toggleIconClose from "../../../assets/barclose.png"; 
import logoImage from "../../../assets/logo.png"; 
import dashboardIcon from "../../../assets/dashLine.png";
import timetableIcon from "../../../assets/timetableLine.png";
import eventsIcon from "../../../assets/eventLine.png";
import settingsIcon from "../../../assets/settingLine.png";


function Navbar({ isCollapsed, setIsCollapsed }) {
    const toggleSidebar = () => {
      setIsCollapsed(!isCollapsed);
    };
    return (
      <div className="admin-sidebar-container">
        {/* Sidebar */}
        <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
          {/* Logo & Toggle Button */}
          <div className="admin-top-section">
            <div className={`admin-logo ${isCollapsed ? "hidden" : ""}`}>
              <img src={logoImage} alt="Logo" className="admin-logo-img" />
            </div>
            <button className="admin-menu-btn" onClick={toggleSidebar}>
              <img src={isCollapsed ? toggleIconClose : toggleIconOpen} alt="Toggle" className="admin-icon-img" />
            </button>
          </div>
  
          {/* Navigation Items */}
          <nav className="admin-nav">
            <NavItem to="/dashboard" icon={dashboardIcon} text="Dashboard" isCollapsed={isCollapsed} />
            <NavItem to="/timetable" icon={timetableIcon} text="Timetable" isCollapsed={isCollapsed} />
            <NavItem to="/events" icon={eventsIcon} text="Events" isCollapsed={isCollapsed} />
            <NavItem icon={settingsIcon} text="Settings" isCollapsed={isCollapsed} />
          </nav>
  
          <div className="admin-profile">
            <img
              src="https://randomuser.me/api/portraits/women/12.jpg"
              alt="User"
              className="admin-profile-img"
            />
            {!isCollapsed && <span className="admin-username">John Doe</span>}
          </div>
        </div>
      </div>
    );
  }
  
  /* Reusable Navigation Item */
  function NavItem({ to, icon, text, isCollapsed}) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`admin-nav-link ${isActive ? "active" : ""}`}>
        <div className="admin-nav-item">
          <img src={icon} alt={text} className="admin-icon-img" />
          {!isCollapsed && <span className="admin-text">{text}</span>}
          {isCollapsed && <span className="admin-tooltip">{text}</span>}
        </div>
      </Link>
    );
  }
  
  export default Navbar;
