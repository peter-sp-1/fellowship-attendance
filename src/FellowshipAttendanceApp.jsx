import React, { useState, useEffect } from 'react';
import { QrCode, Users, UserCheck, UserX, Plus, Trash2, RefreshCw, Calendar, BarChart3 } from 'lucide-react';

const API_BASE_URL = "https://attendance-backend-2-7w0e.onrender.com/api";

const FellowshipAttendanceApp = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [newSessionName, setNewSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ total_members: 0, present_count: 0, first_time_count: 0 });

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ✅ Fetch all members
  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  // ✅ Fetch active session
  const fetchActiveSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/active`);
      if (!response.ok) {
        setCurrentSession(null);
        return;
      }
      const data = await response.json();
      setCurrentSession(data);
      if (data._id) fetchSessionStats(data._id); // use _id from MongoDB
    } catch (err) {
      showMessage('Error fetching session', 'error');
    }
  };

  // ✅ Fetch current attendance
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/current`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setAttendance(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  // ✅ Fetch session statistics
  const fetchSessionStats = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/stats`);
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // ✅ Add new member
  const addMember = async () => {
    if (!newMember.name || !newMember.email) {
      showMessage('Name and email are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add member');
      setNewMember({ name: '', email: '', phone: '' });
      showMessage('Member added successfully!', 'success');
      fetchMembers();
      fetchAttendance();
    } catch (err) {
      showMessage(err.message, 'error');
    }
    setLoading(false);
  };

  // ✅ Remove member
  const removeMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete member');
      showMessage('Member deleted successfully', 'success');
      fetchMembers();
      fetchAttendance();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  // ✅ Create new session
  const createNewSession = async () => {
    if (!newSessionName.trim()) {
      showMessage('Session name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSessionName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create session');
      setCurrentSession(data);
      setNewSessionName('');
      showMessage('New session created successfully!', 'success');
      fetchAttendance();
      if (data._id) fetchSessionStats(data._id); // use _id from MongoDB
    } catch (err) {
      showMessage(err.message, 'error');
    }
    setLoading(false);
  };

  // ✅ Load data on mount
  useEffect(() => {
    fetchMembers();
    fetchActiveSession();
    fetchAttendance();
  }, []);

  // ✅ Auto-refresh attendance every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendance();
      if (currentSession?._id) fetchSessionStats(currentSession._id);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentSession]);

  const presentCount = attendance.filter(a => a.is_present).length;
  const absentCount = attendance.length - presentCount;

  // ... rest of your JSX UI code stays the same
};


export default FellowshipAttendanceApp;