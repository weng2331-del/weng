
import React, { useState, useEffect, useMemo } from 'react';
import { StockItem, Category } from '../types';
import { CATEGORIES, ShareIcon } from '../constants';
import { generateInventoryInsight } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Detect if the app is running within the Android Studio WebView wrapper
const AndroidBridge = (window as any).AndroidBridge;

interface ReportsProps {
  inventory: StockItem[];
}

type PeriodType = 'daily' | 'monthly' | 'yearly';

const Reports: React.FC<ReportsProps> = ({ inventory }) => {
  const [insight, setInsight] = useState<string>('Analyzing your data with AI...');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const filteredInventory = useMemo(() => {
    const date = new Date(selectedDate);
    return inventory.filter(item => {
      const itemDate = new Date(item.createdAt);
      if (period === 'daily') {
        return itemDate.toDateString() === date.toDateString();
      } else if (period === 'monthly') {
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      } else {
        return itemDate.getFullYear() === date.getFullYear();
      }
    });
  }, [inventory, period, selectedDate]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      
      const summary = filteredInventory.length > 0 
        ? filteredInventory.map(i => ({
            name: i.name,
            qty: i.quantity,
            price: i.price,
            cat: i.category
          })).slice(0, 15)
        : "No data available yet.";

      const res = await generateInventoryInsight(summary);
      setInsight(res || (filteredInventory.length > 0 ? "Inventory levels look optimal for this period." : "Start adding inventory to get personalized insights."));
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [filteredInventory]);

  const handleRefreshInsight = async () => {
    setLoadingInsight(true);
    const summary = filteredInventory.length > 0 
      ? filteredInventory.map(i => ({
          name: i.name,
          qty: i.quantity,
          price: i.price,
          cat: i.category
        })).slice(0, 15)
      : "No data available yet.";
      
    const res = await generateInventoryInsight(summary);
    setInsight(res || (filteredInventory.length > 0 ? "Inventory levels look optimal." : "Start adding inventory to get personalized insights."));
    setLoadingInsight(false);
  };

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: filteredInventory.filter(i => i.category === cat).reduce((sum, i) => sum + i.quantity, 0),
      totalValue: filteredInventory.filter(i => i.category === cat).reduce((sum, i) => sum + (i.price * i.quantity), 0)
    })).filter(d => d.value > 0);
  }, [filteredInventory]);

  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalStock = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

  const getReportTitle = () => {
    const date = new Date(selectedDate);
    if (period === 'daily') return `Daily Report - ${date.toLocaleDateString()}`;
    if (period === 'monthly') return `Monthly Report - ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    return `Yearly Report - ${date.getFullYear()}`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = getReportTitle();
    
    doc.setFontSize(18);
    doc.text("OmniStock Inventory Report", 14, 22);
    doc.setFontSize(12);
    doc.text(title, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Total Items: ${totalStock} | Total Value: $${totalValue.toFixed(2)}`, 14, 46);

    const tableData = filteredInventory.map(item => [
      item.stockNo,
      item.name,
      item.itemName,
      item.category,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['Stock No', 'Product Name', 'Brand/Ref', 'Category', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillStyle: [99, 102, 241] }
    });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    if (AndroidBridge) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        AndroidBridge.shareReport(base64data, "PDF");
      };
      reader.readAsDataURL(pdfBlob);
    } else {
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleExportExcel = () => {
    const title = getReportTitle();
    const worksheetData = filteredInventory.map(item => ({
      'Stock No': item.stockNo,
      'Product Name': item.name,
      'Brand/Item Ref': item.itemName,
      'Category': item.category,
      'Quantity': item.quantity,
      'Price': item.price,
      'Total Value': item.price * item.quantity,
      'Created At': new Date(item.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    
    if (AndroidBridge) {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        AndroidBridge.shareReport(base64data, "Excel");
      };
      reader.readAsDataURL(blob);
    } else {
      XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `OmniStock ${getReportTitle()}\n---\nTotal Items: ${totalStock}\nTotal Value: $${totalValue.toFixed(2)}\nAI Insight: ${insight}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OmniStock Inventory Report',
          text: shareText,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else if (AndroidBridge) {
      AndroidBridge.shareReport(shareText, "Summary");
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4">
      {/* Controls Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['daily', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${
                period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type={period === 'daily' ? 'date' : period === 'monthly' ? 'month' : 'number'}
            value={period === 'yearly' ? new Date(selectedDate).getFullYear() : selectedDate.substring(0, period === 'monthly' ? 7 : 10)}
            onChange={(e) => {
              if (period === 'yearly') {
                const year = e.target.value;
                setSelectedDate(`${year}-01-01`);
              } else {
                setSelectedDate(e.target.value);
              }
            }}
            className="flex-1 md:w-48 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition border border-slate-200" title="Print Report">
              <i className="fas fa-print"></i>
            </button>
            <button onClick={handleExportPDF} className="p-2.5 bg-slate-50 text-red-600 rounded-xl hover:bg-red-50 transition border border-slate-200" title="Export PDF">
              <i className="fas fa-file-pdf"></i>
            </button>
            <button onClick={handleExportExcel} className="p-2.5 bg-slate-50 text-green-600 rounded-xl hover:bg-green-50 transition border border-slate-200" title="Export Excel">
              <i className="fas fa-file-excel"></i>
            </button>
            <button onClick={handleShare} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md">
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <i className="fas fa-boxes-stacked text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items</p>
            <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <i className="fas fa-dollar-sign text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Inventory Value</p>
            <p className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <i className="fas fa-tags text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Categories</p>
            <p className="text-2xl font-bold text-slate-800">{categoryData.length}</p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-brain text-8xl"></i>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-300"></span>
              </span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Smart AI Insight</h3>
            </div>
            <button 
              onClick={handleRefreshInsight}
              disabled={loadingInsight}
              className="text-indigo-300 hover:text-white transition disabled:opacity-30"
              title="Refresh Insights"
            >
              <i className={`fas fa-sync-alt ${loadingInsight ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
          <div className={`text-lg font-medium leading-relaxed italic transition-opacity duration-500 ${loadingInsight ? 'opacity-50' : 'opacity-100'}`}>
            {loadingInsight ? "Analyzing Inventory..." : insight}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-500"></i>
            Stock Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-indigo-500"></i>
            Financial Summary
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="totalValue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-list text-indigo-500"></i>
            {getReportTitle()}
          </h3>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {filteredInventory.length} Items Listed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock No</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Brand/Ref</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Qty</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No records found for this period.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.stockNo}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.itemName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-600">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredInventory.length > 0 && (
              <tfoot className="bg-slate-50/50 font-bold border-t border-slate-100">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-slate-500">Grand Total</td>
                  <td className="px-6 py-4 text-center text-slate-800">{totalStock}</td>
                  <td></td>
                  <td className="px-6 py-4 text-right text-indigo-600 text-lg">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* Print-only footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>OmniStock Inventory Management System</p>
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Reports;
