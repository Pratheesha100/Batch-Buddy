import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './SimulateAdmin.css';

const SimulateAdmin = () => {
  const [groupedStudents, setGroupedStudents] = useState({});
  const [timetables, setTimetables] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }

        // Fetch students
        const studentsResponse = await axios.get('http://localhost:5000/api/simulate/students', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch timetables
        const timetablesResponse = await axios.get('http://localhost:5000/api/timetable-assignments/timetables', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch assignments
        const assignmentsResponse = await axios.get('http://localhost:5000/api/timetable-assignments/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (studentsResponse.data) {
          setGroupedStudents(studentsResponse.data);
        }
        if (timetablesResponse.data) {
          setTimetables(timetablesResponse.data);
        }
        if (assignmentsResponse.data) {
          const assignmentsMap = {};
          assignmentsResponse.data.forEach(assignment => {
            assignmentsMap[assignment.studentId._id] = assignment.timetableId;
          });
          setAssignments(assignmentsMap);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          navigate('/login');
        } else {
          setError('Failed to fetch data');
          toast.error('Failed to fetch data');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAssignTimetable = async (studentId, timetableId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Assigning timetable:', { studentId, timetableId });
      await axios.post('http://localhost:5000/api/timetable-assignments/assign',
        { studentId, timetableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update assignments state
      setAssignments(prev => ({
        ...prev,
        [studentId]: timetableId
      }));

      toast.success('Timetable assigned successfully');
    } catch (error) {
      console.error('Error assigning timetable:', error);
      toast.error('Failed to assign timetable');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const years = Object.keys(groupedStudents).sort((a, b) => b - a);

  return (
    <div className="simulate-admin-container">
      <h2>Registered Students</h2>
      {years.length === 0 ? (
        <div className="no-students">No students found</div>
      ) : (
        years.map((year) => (
          <div key={year} className="year-section">
            <h3 className="year-header">Year {year}</h3>
            {Object.keys(groupedStudents[year]).map((semester) => (
              <div key={semester} className="semester-section">
                <h4 className="semester-header">Semester {semester}</h4>
                <div className="students-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Year</th>
                        <th>Semester</th>
                        <th>Registration Date</th>
                        <th>Admin Status</th>
                        <th>Assigned Timetable</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStudents[year][semester].map((user) => (
                        <tr key={user._id}>
                          <td>{user.studentId}</td>
                          <td>{user.studentDetails?.studentName || 'N/A'}</td>
                          <td>{user.year || user.studentDetails?.year || 'N/A'}</td>
                          <td>{user.semester || user.studentDetails?.semester || 'N/A'}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                          <td>
                            {assignments[user._id] ? (
                              `Year ${assignments[user._id].year}, Semester ${assignments[user._id].semester}`
                            ) : (
                              'Not Assigned'
                            )}
                          </td>
                          <td>
                            <select
                              className="timetable-select"
                              onChange={(e) => handleAssignTimetable(user._id, e.target.value)}
                              value={assignments[user._id]?._id || ''}
                            >
                              <option value="">Select Timetable</option>
                              {timetables.map((timetable) => (
                                <option key={timetable._id} value={timetable._id}>
                                  Year {timetable.year}, Semester {timetable.semester}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default SimulateAdmin; 