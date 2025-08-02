// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [platform, setPlatform] = useState('all');

  const fetchData = async () => {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      sumber: platform
    });
    const res = await fetch(`http://localhost:3000/penjualan?${params}`);
    const json = await res.json();

    const grouped = {};
    const monthlySales = {};
    const yearlySales = {};
    const productSales = {};
    let totalBarang = 0;
    let totalComplete = 0;
    let totalReturn = 0;

    json.forEach(item => {
      const date = new Date(item.tanggal);
      const tanggal = item.tanggal.slice(0, 10);
      const bulan = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const tahun = date.getFullYear();

      // Per tanggal
      if (!grouped[tanggal]) grouped[tanggal] = 0;
      grouped[tanggal] += item.amount;

      // Per bulan
      if (!monthlySales[bulan]) monthlySales[bulan] = { total: 0, qty: 0, complete: 0, return: 0 };
      monthlySales[bulan].total += item.amount;
      monthlySales[bulan].qty += item.qty;
      if (item.status === 'COMPLETED') monthlySales[bulan].complete += 1;
      if (item.status === 'RETURN') monthlySales[bulan].return += 1;

      // Per tahun
      if (!yearlySales[tahun]) yearlySales[tahun] = { total: 0, qty: 0, complete: 0, return: 0 };
      yearlySales[tahun].total += item.amount;
      yearlySales[tahun].qty += item.qty;
      if (item.status === 'COMPLETED') yearlySales[tahun].complete += 1;
      if (item.status === 'RETURN') yearlySales[tahun].return += 1;

      // Barang terjual
      totalBarang += item.qty;
      if (!productSales[item.nama_barang]) productSales[item.nama_barang] = 0;
      productSales[item.nama_barang] += item.qty;

      // Status
      if (item.status === 'COMPLETED') totalComplete++;
      if (item.status === 'RETURN') totalReturn++;
    });

    const chartData = Object.entries(grouped).map(([tanggal, total]) => ({ tanggal, total: total / 1000000 }));
    const monthlyData = Object.entries(monthlySales).map(([bulan, val]) => ({ bulan, ...val, total: val.total / 1000000 }));
    const yearlyData = Object.entries(yearlySales).map(([tahun, val]) => ({ tahun, ...val, total: val.total / 1000000 }));
    const productData = Object.entries(productSales).map(([name, qty]) => ({ name, value: qty })).sort((a, b) => b.value - a.value);

    setData(chartData);
    setSummary({ monthlyData, yearlyData, productData, totalBarang, totalComplete, totalReturn });
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, platform]);

  return (
    <div className="p-6 font-sans text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard Penjualan</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block mb-1">Dari:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 rounded text-black" />
        </div>
        <div>
          <label className="block mb-1">Sampai:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 rounded text-black" />
        </div>
        <div>
          <label className="block mb-1">Platform:</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)} className="p-2 rounded text-black">
            <option value="all">Semua</option>
            <option value="shopee">Shopee</option>
            <option value="tokopedia">Tokopedia</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">Total Penjualan per Hari (juta)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tanggal" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toFixed(2)} jt`} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Total Penjualan (juta)" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="text-xl font-bold mt-10 mb-2">Rekap Penjualan per Bulan</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={summary.monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bulan" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Total (juta)" />
          <Bar dataKey="qty" fill="#82ca9d" name="Qty Terjual" />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="text-xl font-bold mt-10 mb-2">Barang Terlaris</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={summary.productData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {summary.productData?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Statistik Ringkasan</h2>
        <ul className="list-disc pl-6">
          <li>Total Barang Terjual: {summary.totalBarang}</li>
          <li>Status COMPLETED: {summary.totalComplete}</li>
          <li>Status RETURN: {summary.totalReturn}</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
