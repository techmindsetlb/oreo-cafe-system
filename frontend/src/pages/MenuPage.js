import React, { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';

function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', preparation_time: '5', is_available: 1 });
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [catRes, itemsRes] = await Promise.all([menuAPI.getCategories(), menuAPI.getItems()]);
    setCategories(catRes.data);
    setItems(itemsRes.data);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), category_id: form.category_id ? parseInt(form.category_id) : null };
      if (editingItem) {
        await menuAPI.updateItem(editingItem.id, data);
      } else {
        await menuAPI.createItem(data);
      }
      setShowForm(false);
      setEditingItem(null);
      setForm({ name: '', description: '', price: '', category_id: '', preparation_time: '5', is_available: 1 });
      loadData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      await menuAPI.createCategory(catForm);
      setCatForm({ name: '', description: '' });
      loadData();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Delete this ' + type + '?')) return;
    try {
      if (type === 'item') await menuAPI.deleteItem(id);
      else await menuAPI.deleteCategory(id);
      loadData();
    } catch (err) { alert('Error deleting: ' + err.message); }
  };

  const toggleAvailability = async (item) => {
    await menuAPI.updateItem(item.id, { is_available: item.is_available ? 0 : 1 });
    loadData();
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price.toString(), category_id: item.category_id?.toString() || '', preparation_time: item.preparation_time?.toString() || '5', is_available: item.is_available });
    setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2><i className="fa-solid fa-utensils"></i> Menu Management</h2>
        <div className="tab-buttons">
          <button className={activeTab === 'items' ? 'active' : ''} onClick={() => setActiveTab('items')}>
            <i className="fa-solid fa-cookie-bite"></i> Items
          </button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
            <i className="fa-solid fa-tags"></i> Categories
          </button>
        </div>
      </div>

      {activeTab === 'items' && (
        <>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingItem(null); setForm({ name: '', description: '', price: '', category_id: '', preparation_time: '5', is_available: 1 }); }}>
            <i className="fa-solid fa-plus"></i> Add Menu Item
          </button>

          {showForm && (
            <form className="form-card" onSubmit={handleItemSubmit}>
              <h3>{editingItem ? <><i className="fa-solid fa-pen-to-square"></i> Edit Item</> : <><i className="fa-solid fa-circle-plus"></i> Add Item</>}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fa-solid fa-tag"></i> Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label><i className="fa-solid fa-dollar-sign"></i> Price</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fa-solid fa-layer-group"></i> Category</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><i className="fa-regular fa-clock"></i> Prep Time (min)</label>
                  <input type="number" value={form.preparation_time} onChange={e => setForm({...form, preparation_time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-align-left"></i> Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-check"></i> {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Prep Time</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td><span className="role-badge">{item.category_name || '-'}</span></td>
                    <td>${item.price.toFixed(2)}</td>
                    <td><i className="fa-regular fa-clock"></i> {item.preparation_time} min</td>
                    <td>
                      <button className={`status-badge ${item.is_available ? 'active' : 'inactive'}`} onClick={() => toggleAvailability(item)}>
                        {item.is_available ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => startEdit(item)}>
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete('item', item.id)}>
                        <i className="fa-solid fa-trash-can"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <form className="form-card inline-form" onSubmit={handleCatSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label><i className="fa-solid fa-tag"></i> Category Name</label>
                <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label><i className="fa-solid fa-align-left"></i> Description</label>
                <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-plus"></i> Add Category
              </button>
            </div>
          </form>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Sort Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description || '-'}</td>
                    <td>{cat.sort_order}</td>
                    <td className="actions">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete('category', cat.id)}>
                        <i className="fa-solid fa-trash-can"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MenuPage;
