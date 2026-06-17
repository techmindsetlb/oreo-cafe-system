import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({ status: '', order_type: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = async () => {
    const params = {};
    if (filter.status) params.status = filter.status;
    if (filter.order_type) params.order_type = filter.order_type;
    const res = await ordersAPI.getAll(params);
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    await ordersAPI.updateStatus(id, status);
    loadOrders();
    if (selectedOrder?.id === id) {
      const res = await ordersAPI.getOne(id);
      setSelectedOrder(res.data);
    }
  };

  const viewOrder = async (id) => {
    const res = await ordersAPI.getOne(id);
    setSelectedOrder(res.data);
  };

  const statusColors = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#22c55e', completed: '#6b7280', cancelled: '#ef4444' };

  return (
    <div className="page">
      <h2><i className="fa-solid fa-receipt"></i> Orders</h2>

      <div className="filters">
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filter.order_type} onChange={e => setFilter({...filter, order_type: e.target.value})}>
          <option value="">All Types</option>
          <option value="takeaway">Takeaway</option>
          <option value="dine-in">Dine-In</option>
        </select>
      </div>

      <div className="orders-layout">
        <div className="orders-list">
          {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-circle-info"></i> No orders found</p> : orders.map(order => (
            <div key={order.id} className="order-card" onClick={() => viewOrder(order.id)}>
              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-type-badge">
                  {order.order_type === 'dine-in' ? <><i className="fa-solid fa-chair"></i> Dine-In</> : <><i className="fa-solid fa-bag-shopping"></i> Takeaway</>}
                </span>
              </div>
              <div className="order-info">
                {order.table_number && <span>Table {order.table_number}</span>}
                <span className="order-time"><i className="fa-regular fa-clock"></i> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="order-total">${order.total.toFixed(2)}</div>
              <span className="status-badge" style={{background: statusColors[order.status], color: '#fff', borderColor: 'transparent'}}>{order.status}</span>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="order-detail">
            <h3>Order #{selectedOrder.id}</h3>
            <div className="detail-row"><span>Type:</span><span>{selectedOrder.order_type}</span></div>
            {selectedOrder.table_number && <div className="detail-row"><span>Table:</span><span>Table {selectedOrder.table_number}</span></div>}
            <div className="detail-row"><span>Employee:</span><span>{selectedOrder.employee_name}</span></div>
            <div className="detail-row"><span>Time:</span><span>{new Date(selectedOrder.created_at).toLocaleString()}</span></div>

            <h4><i className="fa-solid fa-list-check"></i> Ordered Items</h4>
            <div className="order-items">
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="order-item-row">
                  <span><strong>{item.quantity}x</strong> {item.item_name}</span>
                  <span>${item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="detail-row"><span>Subtotal:</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
              <div className="detail-row"><span>Tax:</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
              {selectedOrder.discount > 0 && <div className="detail-row"><span>Discount:</span><span>-${selectedOrder.discount.toFixed(2)}</span></div>}
              <div className="detail-row total"><span>Total:</span><span>${selectedOrder.total.toFixed(2)}</span></div>
              {selectedOrder.payment_method && (
                <div className="detail-row" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                  <span>Payment Method:</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    <i className="fa-solid fa-credit-card"></i> {selectedOrder.payment_method}
                  </span>
                </div>
              )}
            </div>

            <div className="status-actions">
              {selectedOrder.status === 'pending' && (
                <button className="btn btn-primary" onClick={() => updateStatus(selectedOrder.id, 'preparing')}>
                  <i className="fa-solid fa-fire-burner"></i> Start Preparing
                </button>
              )}
              {selectedOrder.status === 'preparing' && (
                <button className="btn btn-primary" onClick={() => updateStatus(selectedOrder.id, 'ready')}>
                  <i className="fa-solid fa-bell"></i> Mark Ready
                </button>
              )}
              {selectedOrder.status === 'ready' && (
                <button className="btn btn-primary" onClick={() => updateStatus(selectedOrder.id, 'completed')}>
                  <i className="fa-solid fa-circle-check"></i> Complete
                </button>
              )}
              {['pending', 'preparing'].includes(selectedOrder.status) && (
                <button className="btn btn-danger" onClick={() => updateStatus(selectedOrder.id, 'cancelled')}>
                  <i className="fa-solid fa-ban"></i> Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
