import React, { useState, useEffect } from 'react';
import axios from 'axios';

const years = ['1', '2', '3', '4'];
const semesters = ['1st', '2nd'];
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const emptyDay = (day) => ({ day, slots: [] });
const emptySlot = { subject: '', location: '', startTime: '', endTime: '' };

const TimetableManager = () => {
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1st');
  const [days, setDays] = useState(daysOfWeek.map(emptyDay));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      setMessage('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/timetable?year=${year}&semester=${semester}`,
          { headers: { Authorization: `Bearer ${token}` } });
        if (res.data && res.data.days) {
          setDays(
            daysOfWeek.map(day =>
              res.data.days.find(d => d.day === day) || emptyDay(day)
            )
          );
        } else {
          setDays(daysOfWeek.map(emptyDay));
        }
      } catch (err) {
        setMessage('Failed to load timetable');
        setDays(daysOfWeek.map(emptyDay));
      }
      setLoading(false);
    };
    fetchTimetable();
  }, [year, semester]);

  const handleSlotChange = (dayIdx, slotIdx, field, value) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? {
        ...d,
        slots: d.slots.map((s, j) =>
          j === slotIdx ? { ...s, [field]: value } : s
        )
      } : d
    ));
  };

  const addSlot = (dayIdx) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, slots: [...d.slots, { ...emptySlot }] } : d
    ));
  };

  const removeSlot = (dayIdx, slotIdx) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) } : d
    ));
  };

  const saveTimetable = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/timetable',
        { year, semester, days },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Timetable saved!');
    } catch (err) {
      setMessage('Failed to save timetable');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-10 bg-white rounded-2xl shadow-2xl mb-12 border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">Manage Weekly Timetable</h2>
      <div className="flex flex-wrap gap-8 justify-center items-center mb-12">
        <label className="font-medium text-gray-700 text-lg">Year:
          <select value={year} onChange={e => setYear(e.target.value)} className="ml-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 text-lg">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="font-medium text-gray-700 text-lg">Semester:
          <select value={semester} onChange={e => setSemester(e.target.value)} className="ml-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 text-lg">
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button onClick={saveTimetable} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all text-lg disabled:opacity-60">
          {loading ? 'Saving...' : 'Save Timetable'}
        </button>
        {message && <span className="ml-6 text-green-600 font-semibold animate-pulse text-lg">{message}</span>}
      </div>
      <div className="flex flex-col gap-10">
        {days.map((day, dayIdx) => (
          <div key={day.day} className="bg-gray-50 rounded-xl shadow p-8 flex flex-col border border-gray-200">
            <h3 className="text-2xl font-bold text-blue-600 mb-6 border-b-2 border-gray-200 pb-2">{day.day}</h3>
            {day.slots.map((slot, slotIdx) => (
              <div
                key={slotIdx}
                className="flex flex-col md:flex-row items-center gap-4 mb-5 p-4 rounded bg-white border border-gray-100"
              >
                <input
                  type="text"
                  placeholder="Subject"
                  value={slot.subject}
                  onChange={e => handleSlotChange(dayIdx, slotIdx, 'subject', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 text-base"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={slot.location}
                  onChange={e => handleSlotChange(dayIdx, slotIdx, 'location', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 text-base"
                />
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={e => handleSlotChange(dayIdx, slotIdx, 'startTime', e.target.value)}
                  className="w-32 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 text-base"
                />
                <span className="mx-2 text-gray-400 text-lg">-</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={e => handleSlotChange(dayIdx, slotIdx, 'endTime', e.target.value)}
                  className="w-32 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 text-base"
                />
                <button
                  onClick={() => removeSlot(dayIdx, slotIdx)}
                  className="ml-3 bg-red-50 hover:bg-red-100 text-red-500 px-4 py-2 rounded text-base font-semibold transition-all border border-red-100"
                  style={{ minWidth: 80 }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button onClick={() => addSlot(dayIdx)} className="mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-2 rounded text-base font-semibold transition-all border border-blue-100">Add Slot</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableManager; 