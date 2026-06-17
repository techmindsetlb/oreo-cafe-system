import React, { useState, useEffect } from 'react';
import { tablesAPI } from '../services/api';

const STATION_INFO = {
  table: { icon: 'fa-utensils', label: 'Table', color: '#6366f1' },
  playstation: { icon: 'fa-gamepad', label: 'Playstation', color: '#8b5cf6' },
  pc: { icon: 'fa-desktop', label: 'PC', color: '#06b6d4' },
  billiards: { icon: 'fa-circle', label: 'Billiards', color: '#f59e0b' },
  babyfoot: { icon: 'fa-futbol', label: 'Babyfoot', color: '#22c55e' },
};

function TablesPage() {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', seats: '4', section: 'main', type: 'table', hourly_rate: '0' });

  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    const res = await tablesAPI.getAll();
    setTables(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tablesAPI.create({
        ...form,
        number: parseInt(form.number),
        seats: parseInt(form.seats),
        hourly_rate: parseFloat(form.hourly_rate),
      });
      setShowForm(false);
      setForm({ number: '', seats: '4', section: 'main', type: 'table', hourly_rate: '0' });
      loadTables();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const toggleStatus = async (table) => {
    const nextStatus = table.status === 'available' ? 'occupied' : 'available';
    await tablesAPI.updateStatus(table.id, nextStatus);
    loadTables();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table/station?')) return;
    await tablesAPI.delete(id);
    loadTables();
  };

  const handleStartSession = async (table) => {
    try {
      await tablesAPI.startSession(table.id);
      loadTables();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleEndSession = async (table) => {
    try {
      const res = await tablesAPI.endSession(table.id);
      alert(`Session ended! Duration: ${res.data.elapsed_hours}h — Charge: $${res.data.charge.toFixed(2)}`);
      loadTables();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const getSessionDuration = (sessionStart) => {
    if (!sessionStart) return '';
    const diff = Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const statusColors = { available: '#22c55e', occupied: '#ef4444', reserved: '#f59e0b' };

  // Group by type
  const diningTables = tables.filter(t => t.type === 'table');
  const gamingStations = tables.filter(t => t.type !== 'table');

  return (
    <div className="page">
      <div className="page-header">
        <h2><i className="fa-solid fa-chair"></i> Tables & Stations</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fa-solid fa-plus"></i> Add
        </button>
      </div>

      <div className="tables-legend">
        <span><span className="dot" style={{background: '#22c55e'}}></span> Available</span>
        <span><span className="dot" style={{background: '#ef4444'}}></span> Occupied</span>
        <span><span className="dot" style={{background: '#f59e0b'}}></span> Reserved</span>
      </div>

      {/* Dining Tables */}
      <h3 className="section-title"><i className="fa-solid fa-utensils"></i> Dining Tables</h3>
      <div className="tables-grid">
        {diningTables.map(table => (
          <div key={table.id} className="table-card" style={{ borderColor: statusColors[table.status] }}>
            <div className="table-number">Table {table.number}</div>
            <div className="table-seats"><i className="fa-solid fa-users"></i> {table.seats} seats</div>
            <div className="table-section"><i className="fa-solid fa-layer-group"></i> {table.section}</div>
            <div className={`table-status status-${table.status}`}>{table.status}</div>
            <div className="table-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(table)}>
                {table.status === 'available' ? (
                  <><i className="fa-solid fa-bell"></i> Mark Occupied</>
                ) : (
                  <><i className="fa-solid fa-circle-check"></i> Free Table</>
                )}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(table.id)}>
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gaming Stations */}
      <h3 className="section-title"><i className="fa-solid fa-gamepad"></i> Entertainment Stations</h3>
      <div className="tables-grid">
        {gamingStations.map(station => {
          const info = STATION_INFO[station.type] || STATION_INFO.table;
          const isOccupied = station.status === 'occupied';

          return (
            <div key={station.id} className="table-card station-card" style={{ borderColor: isOccupied ? '#ef4444' : info.color }}>
              <div className="table-number" style={{ color: info.color }}>
                <i className={`fa-solid ${info.icon}`} style={{ marginRight: '8px' }}></i>
                {info.label} #{station.number}
              </div>
              <div className="table-seats">
                <i className="fa-solid fa-dollar-sign"></i> {station.type === 'babyfoot' ? `${station.hourly_rate.toFixed(2)}/session` : `${station.hourly_rate.toFixed(2)}/hr`}
              </div>
              <div className="table-section"><i className="fa-solid fa-layer-group"></i> {station.section}</div>
              <div className={`table-status status-${station.status}`}>
                {isOccupied && station.session_start
                  ? `${station.status} · ${getSessionDuration(station.session_start)}`
                  : station.status
                }
              </div>
              <div className="table-actions">
                {!isOccupied ? (
                  <button className="btn btn-sm btn-primary" onClick={() => handleStartSession(station)}>
                    <i className="fa-solid fa-play"></i> Start Session
                  </button>
                ) : (
                  <button className="btn btn-sm btn-danger" onClick={() => handleEndSession(station)}>
                    <i className="fa-solid fa-stop"></i> End Session
                  </button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(station.id)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><i className="fa-solid fa-circle-plus"></i> Add Table / Station</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fa-solid fa-hashtag"></i> Number</label>
                <input type="number" value={form.number} onChange={e => setForm({...form, number: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-tag"></i> Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="table">Dining Table</option>
                  <option value="playstation">Playstation</option>
                  <option value="pc">PC</option>
                  <option value="billiards">Billiards</option>
                  <option value="babyfoot">Babyfoot</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-users"></i> Seats / Capacity</label>
                <input type="number" value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} />
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-layer-group"></i> Section</label>
                <select value={form.section} onChange={e => setForm({...form, section: e.target.value})}>
                  <option value="main">Main</option>
                  <option value="window">Window</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="vip">VIP</option>
                  <option value="gaming">Gaming</option>
                  <option value="pc-zone">PC Zone</option>
                  <option value="lounge">Lounge</option>
                </select>
              </div>
              {form.type !== 'table' && (
                <div className="form-group">
                  <label><i className="fa-solid fa-dollar-sign"></i> Hourly Rate ($)</label>
                  <input type="number" step="0.5" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-check"></i> Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TablesPage;
