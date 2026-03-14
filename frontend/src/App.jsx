import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Mail, Link, Clock, X, LogOut, Trash2 } from 'lucide-react';
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

  // Prepare data for Bar Chart (Status)
  const statusData = [
    { name: 'New', count: stats.new, fill: '#58a6ff' },
    { name: 'Contacted', count: stats.contacted, fill: '#f0c33d' },
    { name: 'Converted', count: stats.converted, fill: '#2ea043' }
  ];

  // Prepare data for Pie Chart (Source)
  const sourceRawData = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const COLORS = ['#a371f7', '#58a6ff', '#2ea043', '#f0c33d', '#ff7b72'];
  const sourceData = Object.keys(sourceRawData).map((key, index) => ({
    name: key,
    value: sourceRawData[key],
    fill: COLORS[index % COLORS.length]
  }));

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
        <h1>Nexus CRM</h1>
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
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#58a6ff' }}>{stats.new}</div>
          <div className="stat-label">New Opportunities</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f0c33d' }}>{stats.contacted}</div>
          <div className="stat-label">Currently Contacted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2ea043' }}>{stats.converted}</div>
          <div className="stat-label">Successfully Converted</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Lead Pipeline Status</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#8b949e" tick={{ fill: '#8b949e' }} />
                <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Lead Sources</h3>
          <div style={{ width: '100%', height: 300 }}>
            {sourceData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                No source data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search leads by name or email..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="search-input" 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader"></div>
        ) : filteredLeads.length === 0 ? (
          <div className="empty-state">
            <User size={48} style={{ opacity: 0.5, margin: '0 auto 1rem', display: 'block' }} />
            <h3>No leads found</h3>
            <p>Try adjusting your search or add a new lead.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Source</th>
                <th>Date Added</th>
                <th>Status</th>
                <th>Follow-up Notes</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} /> {lead.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} /> {lead.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Link size={14} /> {lead.source || 'Website'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <Clock size={14} /> {formatDate(lead.createdAt)}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={lead.status}
                      onChange={(e) => handleUpdateLead(lead._id, { status: e.target.value })}
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
                      placeholder="Add an internal note..."
                      onBlur={(e) => {
                        if (e.target.value !== lead.notes) {
                          handleUpdateLead(lead._id, { notes: e.target.value });
                        }
                      }}
                    />
                  </td>
                  <td className="action-col">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1.5rem 0' }}>
              <h2 style={{ margin: 0 }}>Add New Lead</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Source</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  placeholder="Website, Referral, etc."
                />
              </div>
              <div className="form-group">
                <label>Initial Note</label>
                <textarea 
                  className="form-input" 
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="Interested in our enterprise plan..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
