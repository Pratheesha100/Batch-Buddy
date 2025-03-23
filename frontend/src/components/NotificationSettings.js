import React, { useState } from 'react';
import '../styles/NotificationSettings.css';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailAlerts: true,
    voiceAlerts: false,
    defaultReminderTime: '10',
    repeatNotification: 'Once',
    notificationType: 'Pop-up'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  const handleReset = () => {
    setSettings({
      pushNotifications: true,
      emailAlerts: true,
      voiceAlerts: false,
      defaultReminderTime: '10',
      repeatNotification: 'Once',
      notificationType: 'Pop-up'
    });
  };

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h1>Notification Settings</h1>
        <p>Customize your reminders and alerts for lectures, exams, and deadlines.</p>
      </div>

      <div className="settings-section">
        <h2>Notification Types</h2>
        <div className="toggle-group">
          <div className="toggle-item">
            <span>Push Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <span>Email Alerts</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="toggle-item">
            <span>Voice Alerts</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.voiceAlerts}
                onChange={() => handleToggle('voiceAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Reminder Preferences</h2>
        <div className="preferences-group">
          <div className="preference-item">
            <label>Default Reminder Time</label>
            <select
              name="defaultReminderTime"
              value={settings.defaultReminderTime}
              onChange={handleChange}
            >
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
            </select>
          </div>

          <div className="preference-item">
            <label>Repeat Notification</label>
            <select
              name="repeatNotification"
              value={settings.repeatNotification}
              onChange={handleChange}
            >
              <option value="Once">Once</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="preference-item">
            <label>Notification Type</label>
            <select
              name="notificationType"
              value={settings.notificationType}
              onChange={handleChange}
            >
              <option value="Pop-up">Pop-up</option>
              <option value="Sound Alert">Sound Alert</option>
              <option value="Text-to-Speech">Text-to-Speech</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSave}>Save Settings</button>
        <button className="reset-btn" onClick={handleReset}>Reset to Default</button>
      </div>
    </div>
  );
};

export default NotificationSettings; 