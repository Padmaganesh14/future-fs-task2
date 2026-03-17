import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Mail, Link, Clock, X, LogOut, Trash2, PieChart as PieChartIcon, BarChart3, Users, Target, Activity, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Login from './Login';
import Signup from './Signup';

const API_URL = 'http://localhost:5000';

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', source: 'Website', notes: '' });
  const [currentView, setCurrentView] = useState(localStorage.getItem('adminToken') ? 'dashboard' : 'login');

  const adminEmail = localStorage.getItem('adminEmail') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setCurrentView('login');
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(`${API_URL}/delete-lead/${id}`);
        setLeads(leads.filter(lead => lead._id !== id));
      } catch (err) {
        console.error("Error deleting lead:", err);
      }
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/leads`);
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/update-lead/${id}`, updates);
      setLeads(leads.map(lead => lead._id === id ? { ...lead, ...updates } : lead));
    } catch (err) {
      console.error("Error updating lead:", err);
      fetchLeads();  
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/add-lead`, newLead);
      setIsModalOpen(false);
      setNewLead({ name: '', email: '', source: 'Website', notes: '' });
      fetchLeads();
    } catch (err) {
      console.error("Error adding lead:", err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  const statusData = [
    { name: 'New', count: stats.new, fill: '#00d2ff' },
    { name: 'Contacted', count: stats.contacted, fill: '#d29922' },
    { name: 'Converted', count: stats.converted, fill: '#3fb950' }
  ];

  const sourceRawData = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const NEON_COLORS = ['#9d50bb', '#00d2ff', '#3fb950', '#d29922', '#f85149'];
  const sourceData = Object.keys(sourceRawData).map((key, index) => ({
    name: key,
    value: sourceRawData[key],
    fill: NEON_COLORS[index % NEON_COLORS.length]
  }));

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (currentView === 'login') {
    return <Login onLoginSuccess={() => setCurrentView('dashboard')} onSwitchToSignup={() => setCurrentView('signup')} />;
  }

  if (currentView === 'signup') {
    return <Signup onSignupSuccess={() => setCurrentView('dashboard')} onSwitchToLogin={() => setCurrentView('login')} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1><Activity size={28} /> Nexus CRM</h1>
        <div className="header-actions">
          <span className="admin-email">{adminEmail}</span>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add New Lead
          </button>
          <button className="btn btn-cancel" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label"><Users size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Total Leads</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Target size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> New Opportunities</div>
          <div className="stat-value" style={{ color: 'var(--neon-blue)' }}>{stats.new}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Activity size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Contacted</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.contacted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><CheckCircle2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Converted</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.converted}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><BarChart3 size={20} color="var(--neon-blue)" /> Lead Pipeline Status</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3><PieChartIcon size={20} color="var(--neon-purple)" /> Lead Sources</h3>
          <div style={{ width: '100%', height: 400 }}>
            {sourceData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(8px)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                No source data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div className="search-container">
          <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search leads by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="status-filter" 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><div className="loader"></div></div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
            <h3>No leads found</h3>
            <p>Try adjusting your search or add a new lead.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Source</th>
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <User size={14} color="var(--neon-blue)" /> {lead.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
                      <Mail size={12} /> {lead.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link size={12} /> {lead.source || 'Website'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={12} /> {formatDate(lead.createdAt)}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={lead.status}
                      onChange={(e) => handleUpdateLead(lead._id, { status: e.target.value })}
                      style={{ 
                        borderColor: lead.status === 'new' ? 'var(--neon-blue)' : 
                                    lead.status === 'contacted' ? 'var(--warning)' : 'var(--success)',
                        color: lead.status === 'new' ? 'var(--neon-blue)' : 
                               lead.status === 'contacted' ? 'var(--warning)' : 'var(--success)'
                      }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                  <td>
                    <textarea 
                      className="notes-input"
                      defaultValue={lead.notes || ''}
                      placeholder="Add note..."
                      onBlur={(e) => {
                        if (e.target.value !== lead.notes) {
                          handleUpdateLead(lead._id, { notes: e.target.value });
                        }
                      }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteLead(lead._id)}
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Plus size={24} color="var(--neon-blue)" /> Add New Lead
            </h2>
            
            <form onSubmit={handleAddLead}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="e.g. John Wick"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="john@nexus.com"
                />
              </div>
              <div className="form-group">
                <label>Source</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  placeholder="Website, LinkedIn, Meta, etc."
                />
              </div>
              <div className="form-group">
                <label>Initial Insights</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '100px', resize: 'none' }}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="What are they looking for?"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="btn btn-cancel" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 2, justifyContent: 'center' }}>Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
