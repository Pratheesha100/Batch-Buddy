import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    return <div className="text-center py-12 text-lg text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  }

  const years = Object.keys(groupedStudents).sort((a, b) => b - a);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-2xl mb-12 border border-gray-100 mt-10">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">Registered Students</h2>
      {years.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-lg">No students found</div>
      ) : (
        years.map((year) => (
          <div key={year} className="mb-10 bg-gray-50 rounded-xl shadow p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-blue-600 mb-6 border-b-2 border-gray-200 pb-2">Year {year}</h3>
            {Object.keys(groupedStudents[year]).map((semester) => (
              <div key={semester} className="mb-8">
                <h4 className="text-xl font-semibold text-indigo-700 mb-4">Semester {semester}</h4>
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Student ID</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Name</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Year</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Semester</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Registration Date</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Admin Status</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Assigned Timetable</th>
                        <th className="px-4 py-3 bg-blue-50 text-blue-800 font-semibold text-sm border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedStudents[year][semester].map((user) => (
                        <tr key={user._id} className="hover:bg-blue-50 transition-all">
                          <td className="px-4 py-3 border-b text-gray-700">{user.studentId}</td>
                          <td className="px-4 py-3 border-b text-gray-700">{user.studentDetails?.studentName || 'N/A'}</td>
                          <td className="px-4 py-3 border-b text-gray-700">{user.year || user.studentDetails?.year || 'N/A'}</td>
                          <td className="px-4 py-3 border-b text-gray-700">{user.semester || user.studentDetails?.semester || 'N/A'}</td>
                          <td className="px-4 py-3 border-b text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 border-b text-gray-700">{user.isAdmin ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-3 border-b text-gray-700">
                            {assignments[user._id] ? (
                              `Year ${assignments[user._id].year}, Semester ${assignments[user._id].semester}`
                            ) : (
                              <span className="text-red-500">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 border-b">
                            <select
                              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 text-sm"
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