import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAdjust, setShowAdjust] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', min_quantity: '10', cost_per_unit: '0' });
  const [adjustValue, setAdjustValue] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [invRes, lowRes] = await Promise.all([inventoryAPI.getAll(), inventoryAPI.getLowStock()]);
    setInventory(invRes.data);
    setLowStock(lowRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, quantity: parseFloat(form.quantity), min_quantity: parseFloat(form.min_quantity), cost_per_unit: parseFloat(form.cost_per_unit) };
      await inventoryAPI.create(data);
      setShowForm(false);
      setForm({ name: '', quantity: '', unit: '', min_quantity: '10', cost_per_unit: '0' });
      loadData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleAdjust = async (id) => {
    try {
      await inventoryAPI.adjust(id, { adjustment: adjustValue });
      setShowAdjust(null);
      setAdjustValue(0);
      loadData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await inventoryAPI.delete(id);
    loadData();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2><i className="fa-solid fa-boxes-stacked"></i> Inventory Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fa-solid fa-plus"></i> Add Item
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning">
          <strong><i className="fa-solid fa-triangle-exclamation"></i> Low Stock Alert:</strong> {lowStock.map(i => i.name).join(', ')}
        </div>
      )}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3><i className="fa-solid fa-circle-plus"></i> Add Inventory Item</h3>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-tag"></i> Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-cubes"></i> Quantity</label>
              <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-scale-balanced"></i> Unit</label>
              <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="kg, liters, pieces" required />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-triangle-exclamation"></i> Min Quantity</label>
              <input type="number" step="0.01" value={form.min_quantity} onChange={e => setForm({...form, min_quantity: e.target.value})} />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-dollar-sign"></i> Cost/Unit</label>
              <input type="number" step="0.01" value={form.cost_per_unit} onChange={e => setForm({...form, cost_per_unit: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-check"></i> Add Item
            </button>
          </div>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Min</th>
              <th>Cost/Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.min_quantity}</td>
                <td>${item.cost_per_unit.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${item.quantity <= item.min_quantity ? 'low' : 'ok'}`}>
                    {item.quantity <= item.min_quantity ? 'Low' : 'OK'}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => { setShowAdjust(item.id); setAdjustValue(0); }}>
                    <i className="fa-solid fa-sliders"></i> Adjust
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdjust && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><i className="fa-solid fa-sliders"></i> Adjust Stock</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              Enter positive to add, negative to remove.
            </p>
            <input type="number" step="0.01" value={adjustValue} onChange={e => setAdjustValue(parseFloat(e.target.value))} />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdjust(null)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
              <button className="btn btn-primary" onClick={() => handleAdjust(showAdjust)}>
                <i className="fa-solid fa-check"></i> Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
