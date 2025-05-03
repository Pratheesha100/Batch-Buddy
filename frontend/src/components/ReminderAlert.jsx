import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reminderApi } from '../services/api';

function ReminderAlert({ reminder, onDismiss }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinueIteration = async () => {
    try {
      setIsProcessing(true);
      
      // Calculate next occurrence based on repeat type
      const nextDate = new Date(reminder.date);
      switch (reminder.repeat) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        default:
          return; // If repeat is 'never', don't create next occurrence
      }

      // Create next reminder
      const nextReminder = {
        ...reminder,
        date: nextDate.toISOString().split('T')[0],
        status: 'pending',
        _id: undefined // Remove _id so a new one is generated
      };

      await reminderApi.createReminder(nextReminder);
      toast.success('Next reminder has been scheduled');
      
      // Dismiss current reminder
      if (onDismiss) {
        onDismiss();
      }
    } catch (error) {
      console.error('Error creating next reminder:', error);
      toast.error('Failed to schedule next reminder');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!reminder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Reminder Alert
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
            reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">{reminder.title}</h3>
          {reminder.description && (
            <p className="text-gray-600">{reminder.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <i className="far fa-calendar mr-2"></i>
              {new Date(reminder.date).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <i className="far fa-clock mr-2"></i>
              {reminder.time}
            </span>
            {reminder.category && (
              <span className="flex items-center">
                <i className="fas fa-tag mr-2"></i>
                {reminder.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onDismiss}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Dismiss
          </button>
          
          {reminder.repeat !== 'never' && (
            <button
              onClick={handleContinueIteration}
              disabled={isProcessing}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-redo mr-2"></i>
                  Continue to Iterate
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReminderAlert;