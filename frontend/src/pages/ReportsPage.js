import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

function ReportsPage() {
  const [period, setPeriod] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadReport(); }, [period, selectedDate]);

  const loadReport = async () => {
    try {
      if (period === 'daily') {
        const res = await reportsAPI.getDaily(selectedDate);
        setDailyData(res.data);
      } else if (period === 'weekly') {
        const res = await reportsAPI.getWeekly();
        setWeeklyData(res.data);
      } else {
        const res = await reportsAPI.getMonthly();
        setMonthlyData(res.data);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page">
      <h2><i className="fa-solid fa-chart-line"></i> Sales Reports</h2>

      <div className="report-tabs">
        <button className={period === 'daily' ? 'active' : ''} onClick={() => setPeriod('daily')}>
          <i className="fa-solid fa-calendar-day"></i> Daily
        </button>
        <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>
          <i className="fa-solid fa-calendar-week"></i> Weekly
        </button>
        <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>
          <i className="fa-solid fa-calendar-days"></i> Monthly
        </button>
      </div>

      {period === 'daily' && dailyData && (
        <div className="report-content">
          <div className="date-picker">
            <label><i className="fa-solid fa-calendar"></i> Date: </label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dailyData.total_orders}</div>
              <div className="stat-label"><i className="fa-solid fa-receipt"></i> Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${dailyData.total_revenue.toFixed(2)}</div>
              <div className="stat-label"><i className="fa-solid fa-sack-dollar"></i> Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dailyData.takeaway_orders}</div>
              <div className="stat-label"><i className="fa-solid fa-bag-shopping"></i> Takeaway</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dailyData.dinein_orders}</div>
              <div className="stat-label"><i className="fa-solid fa-chair"></i> Dine-In</div>
            </div>
          </div>

          {dailyData.popularItems?.length > 0 && (
            <div className="report-section">
              <h3><i className="fa-solid fa-fire"></i> Popular Items</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.popularItems.map((item, i) => (
                    <tr key={i}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.total_quantity}</td>
                      <td>${item.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {period === 'weekly' && weeklyData && (
        <div className="report-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{weeklyData.totalOrders}</div>
              <div className="stat-label"><i className="fa-solid fa-receipt"></i> Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${weeklyData.totalRevenue.toFixed(2)}</div>
              <div className="stat-label"><i className="fa-solid fa-sack-dollar"></i> Revenue</div>
            </div>
          </div>
          <div className="report-section">
            <h3><i className="fa-solid fa-chart-simple"></i> Daily Breakdown</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.dailyBreakdown?.map((day, i) => (
                  <tr key={i}>
                    <td><strong>{day.date}</strong></td>
                    <td>{day.total_orders}</td>
                    <td>${day.total_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {period === 'monthly' && monthlyData && (
        <div className="report-content">
          {monthlyData.topItems?.length > 0 && (
            <div className="report-section">
              <h3><i className="fa-solid fa-ranking-star"></i> Top Items (Last 30 Days)</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.topItems.map((item, i) => (
                    <tr key={i}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.total_quantity}</td>
                      <td>${item.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
