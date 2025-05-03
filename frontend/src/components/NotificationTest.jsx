import React, { useState } from 'react';
import notificationService from '../services/notificationService';

function NotificationTest() {
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    try {
      const results = await notificationService.testAll();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        error: 'Failed to run tests: ' + error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Notifications</h1>
            
            <button
              onClick={runTests}
              disabled={isTesting}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isTesting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Testing...
                </>
              ) : (
                <>
                  <i className="fas fa-vial mr-2"></i>
                  Run Tests
                </>
              )}
            </button>

            {testResults && (
              <div className="mt-8 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
                  
                  {testResults.error ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{testResults.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <i className="fas fa-volume-up text-blue-500 mr-3"></i>
                          <span className="text-gray-900">Sound Notification</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          testResults.sound.includes('working') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResults.sound}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <i className="fas fa-envelope text-blue-500 mr-3"></i>
                          <span className="text-gray-900">Email Notification</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          testResults.email.includes('working') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResults.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <i className="fas fa-bell text-blue-500 mr-3"></i>
                          <span className="text-gray-900">Push Notification</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          testResults.push.includes('working') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResults.push}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationTest; 