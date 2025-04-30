import React, { useState } from 'react';

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    defaultReminderTime: '15',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    weekendNotifications: true,
    defaultPriority: 'Medium',
    categories: ['Work', 'Personal', 'Health', 'Shopping', 'Bills'],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuietHoursChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      quietHours: {
        ...prevSettings.quietHours,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      workingHours: {
        ...prevSettings.workingHours,
        [name]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would typically save the settings to your backend
    console.log('Saving settings:', settings);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        </div>

        <div className="p-6 space-y-8">
          {/* General Notifications Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              General Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-3 text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-3 text-sm text-gray-700">
                  Push Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="soundEnabled"
                  name="soundEnabled"
                  checked={settings.soundEnabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="soundEnabled" className="ml-3 text-sm text-gray-700">
                  Sound Notifications
                </label>
              </div>
            </div>
          </section>

          {/* Timing Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Timing Preferences
            </h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="defaultReminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Reminder Time
                </label>
                <select
                  id="defaultReminderTime"
                  name="defaultReminderTime"
                  value={settings.defaultReminderTime}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Working Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="workStart" className="block text-sm text-gray-600">Start</label>
                    <input
                      type="time"
                      id="workStart"
                      name="start"
                      value={settings.workingHours.start}
                      onChange={handleWorkingHoursChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="workEnd" className="block text-sm text-gray-600">End</label>
                    <input
                      type="time"
                      id="workEnd"
                      name="end"
                      value={settings.workingHours.end}
                      onChange={handleWorkingHoursChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="quietHoursEnabled"
                    name="enabled"
                    checked={settings.quietHours.enabled}
                    onChange={handleQuietHoursChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="quietHoursEnabled" className="ml-3 text-sm font-medium text-gray-700">
                    Enable Quiet Hours
                  </label>
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-7">
                    <div>
                      <label htmlFor="quietStart" className="block text-sm text-gray-600">Start</label>
                      <input
                        type="time"
                        id="quietStart"
                        name="start"
                        value={settings.quietHours.start}
                        onChange={handleQuietHoursChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="quietEnd" className="block text-sm text-gray-600">End</label>
                      <input
                        type="time"
                        id="quietEnd"
                        name="end"
                        value={settings.quietHours.end}
                        onChange={handleQuietHoursChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Additional Settings Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Additional Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weekendNotifications"
                  name="weekendNotifications"
                  checked={settings.weekendNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="weekendNotifications" className="ml-3 text-sm text-gray-700">
                  Enable Weekend Notifications
                </label>
              </div>

              <div>
                <label htmlFor="defaultPriority" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Priority
                </label>
                <select
                  id="defaultPriority"
                  name="defaultPriority"
                  value={settings.defaultPriority}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings; 