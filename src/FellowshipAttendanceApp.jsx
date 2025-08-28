import React, { useState, useEffect } from 'react';
import { QrCode, Users, UserCheck, UserX, Plus, Trash2, RefreshCw, Calendar, BarChart3 } from 'lucide-react';


const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-vercel-app.vercel.app/api'
  : 'http://localhost:5000/api';

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

  // Show message helper
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Fetch all members
  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        showMessage('Failed to fetch members', 'error');
      }
    } catch (error) {
      showMessage('Error connecting to server', 'error');
    }
  };

  // Fetch active session
  const fetchActiveSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/active`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data);
        if (data.id) {
          fetchSessionStats(data.id);
        }
      } else {
        setCurrentSession(null);
      }
    } catch (error) {
      showMessage('Error fetching session', 'error');
    }
  };

  // Fetch current attendance
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/current`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
      } else {
        showMessage('Failed to fetch attendance', 'error');
      }
    } catch (error) {
      showMessage('Error fetching attendance', 'error');
    }
  };

  // Fetch session statistics
  const fetchSessionStats = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Add new member
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
        body: JSON.stringify(newMember)
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewMember({ name: '', email: '', phone: '' });
        showMessage('Member added successfully!', 'success');
        fetchMembers();
        fetchAttendance();
      } else {
        showMessage(data.error, 'error');
      }
    } catch (error) {
      showMessage('Error adding member', 'error');
    }
    setLoading(false);
  };

  // Remove member
  const removeMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('Member deleted successfully', 'success');
        fetchMembers();
        fetchAttendance();
      } else {
        showMessage('Failed to delete member', 'error');
      }
    } catch (error) {
      showMessage('Error deleting member', 'error');
    }
  };

  // Create new session
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
        body: JSON.stringify({ name: newSessionName.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCurrentSession(data);
        setNewSessionName('');
        showMessage('New session created successfully!', 'success');
        fetchAttendance();
        if (data.sessionId) {
          fetchSessionStats(data.sessionId);
        }
      } else {
        showMessage(data.error, 'error');
      }
    } catch (error) {
      showMessage('Error creating session', 'error');
    }
    setLoading(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchMembers();
    fetchActiveSession();
    fetchAttendance();
  }, []);

  // Auto-refresh attendance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendance();
      if (currentSession?.sessionId) {
        fetchSessionStats(currentSession.sessionId);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const presentCount = attendance.filter(a => a.is_present).length;
  const absentCount = attendance.length - presentCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Fellowship Attendance</h1>
                <p className="text-gray-600">
                  {currentSession ? currentSession.session_name : 'No Active Session'} - {new Date().toDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-600">
                  <UserCheck className="w-5 h-5" />
                  <span className="font-semibold">{presentCount} Present</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-red-600">
                  <UserX className="w-5 h-5" />
                  <span className="font-semibold">{absentCount} Absent</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-semibold">{stats.first_time_count} First-Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 font-medium ${activeTab === 'attendance' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Attendance Status
            </button>
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`px-6 py-3 font-medium ${activeTab === 'qrcode' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              QR Code & Session
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium ${activeTab === 'members' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Manage Members
            </button>
          </div>
        </div>

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Live Attendance Status</h2>
                <button
                  onClick={() => {
                    fetchAttendance();
                    if (currentSession?.sessionId) fetchSessionStats(currentSession.sessionId);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              
              <div className="grid gap-3">
                {attendance.map(member => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      member.is_present 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {member.is_present ? (
                        <UserCheck className="w-6 h-6 text-green-600" />
                      ) : (
                        <UserX className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {member.name}
                          {member.is_first_time && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              First Time!
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {member.scan_time && (
                        <span className="text-sm text-gray-600">
                          {new Date(member.scan_time).toLocaleTimeString()}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.is_present 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.is_present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {attendance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No members found. Add members in the "Manage Members" tab.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qrcode' && (
          <div className="space-y-6">
            {/* Session Creation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Session Management</h2>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Session Name
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., Sunday Service, Bible Study, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={createNewSession}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  <Calendar className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create New Session'}
                </button>
              </div>
            </div>

            {/* Current Session QR Code */}
            {currentSession && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Current Session QR Code</h2>
                <div className="text-center">
                  <div className="inline-block p-6 bg-gray-50 rounded-lg mb-4">
                    {currentSession.qrCodeImage ? (
                      <img
                        src={currentSession.qrCodeImage}
                        alt="Session QR Code"
                        className="mx-auto mb-4"
                        style={{ maxWidth: '300px', height: 'auto' }}
                      />
                    ) : (
                      <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg mx-auto mb-4">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <p className="text-lg font-medium text-gray-800 mb-2">
                      {currentSession.session_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {new Date(currentSession.session_date).toDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-left max-w-md mx-auto">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Instructions for Members:</h3>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Open your phone's camera or QR scanner app</li>
                        <li>2. Point your camera at this QR code</li>
                        <li>3. Tap the link that appears</li>
                        <li>4. Select your name and mark attendance</li>
                        <li>5. New members can add themselves directly!</li>
                      </ol>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Scan URL:</h3>
                      <p className="text-sm text-green-700 font-mono break-all">
                        {currentSession.qr_data || currentSession.qrData}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentSession && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center py-8">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Session</h3>
                  <p className="text-gray-600">Create a new session to generate a QR code for attendance.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Members</h2>
            
            {/* Add New Member */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Add New Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({...prev, name: e.target.value}))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({...prev, email: e.target.value}))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({...prev, phone: e.target.value}))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={addMember}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    {member.phone && <p className="text-sm text-gray-600">{member.phone}</p>}
                    {member.first_scan_date && (
                      <p className="text-xs text-green-600">
                        First attended: {new Date(member.first_scan_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {members.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>No members added yet. Add your first member above!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FellowshipAttendanceApp;