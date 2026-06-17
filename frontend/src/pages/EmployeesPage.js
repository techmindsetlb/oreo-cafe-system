import React, { useState, useEffect } from 'react';
import { employeesAPI } from '../services/api';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier', phone: '' });

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    const res = await employeesAPI.getAll();
    setEmployees(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const data = { name: form.name, email: form.email, role: form.role, phone: form.phone };
        await employeesAPI.update(editing.id, data);
      } else {
        await employeesAPI.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', email: '', password: '', role: 'cashier', phone: '' });
      loadEmployees();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const startEdit = (emp) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, password: '', role: emp.role, phone: emp.phone || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await employeesAPI.delete(id);
    loadEmployees();
  };

  const toggleActive = async (emp) => {
    await employeesAPI.update(emp.id, { is_active: emp.is_active ? 0 : 1 });
    loadEmployees();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2><i className="fa-solid fa-users-gear"></i> Employee Management</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', email: '', password: '', role: 'cashier', phone: '' }); }}>
          <i className="fa-solid fa-user-plus"></i> Add Employee
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editing ? <><i className="fa-solid fa-user-pen"></i> Edit Employee</> : <><i className="fa-solid fa-user-plus"></i> Add Employee</>}</h3>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fa-solid fa-user"></i> Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-envelope"></i> Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            {!editing && (
              <div className="form-group">
                <label><i className="fa-solid fa-key"></i> Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
            )}
            <div className="form-group">
              <label><i className="fa-solid fa-user-shield"></i> Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="cashier">Cashier</option>
                <option value="kitchen">Kitchen</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label><i className="fa-solid fa-phone"></i> Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-check"></i> {editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td><strong>{emp.name}</strong></td>
                <td>{emp.email}</td>
                <td><span className="role-badge">{emp.role}</span></td>
                <td>{emp.phone || '-'}</td>
                <td>
                  <button className={`status-badge ${emp.is_active ? 'active' : 'inactive'}`} onClick={() => toggleActive(emp)}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => startEdit(emp)}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp.id)}>
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeesPage;
