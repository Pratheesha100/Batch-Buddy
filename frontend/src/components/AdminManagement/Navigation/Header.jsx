import React from "react";
import "./header.css"; 
import notificationIcon from "../../../assets/notification.png"; 

const Header = () => {
  return (
    <div className="admin-header">
      <div className="admin-header-left">
        <h2>Admin Management</h2>
      </div>
      <div className="admin-header-right">
        <img src={notificationIcon} alt="Notifications" className="admin-notification-icon" />
        <img
          src="https://randomuser.me/api/portraits/women/12.jpg"
          alt="User"
          className="admin-user-avatar"
        />
      </div>
    </div>
  );
};

export default Header;
