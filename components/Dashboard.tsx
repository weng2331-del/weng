
import React, { useState } from 'react';
import { User, StockItem } from '../types';
import Navbar from './Navbar';
import InventoryList from './InventoryList';
import Reports from './Reports';
import AddStockModal from './AddStockModal';
import UserManagement from './UserManagement';
import StockActionModal from './StockActionModal';
import BarcodeScanner from './BarcodeScanner';
import BulkUploadModal from './BulkUploadModal';
import { StockActionType } from '../types';

interface DashboardProps {
  user: User;
  inventory: StockItem[];
  users: User[];
  onLogout: () => void;
  onAddStock: (item: Omit<StockItem, 'id'>) => void;
  onDeleteStock: (id: string) => void;
  onUpdateStock: (id: string, data: Partial<StockItem>) => void;
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, userData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  inventory, 
  users,
  onLogout,
  onAddStock,
  onDeleteStock,
  onUpdateStock,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports' | 'users'>('inventory');
  const [showAddStock, setShowAddStock] = useState(false);
  const [showStockAction, setShowStockAction] = useState(false);
  const [showGlobalScanner, setShowGlobalScanner] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = user.role === 'admin' || user.role === 'manager';

  const handleStockAction = (itemId: string, type: StockActionType, quantity: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const newQuantity = type === 'in' ? item.quantity + quantity : item.quantity - quantity;
      onUpdateStock(itemId, { quantity: newQuantity });
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    for (const item of data) {
      await onAddStock(item);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar 
        userName={user.name} 
        userRole={user.role}
        onLogout={onLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'inventory' ? 'Inventory Catalog' : 
               activeTab === 'reports' ? 'Performance Reports' : 'User Management'}
            </h2>
            <p className="text-slate-500">Welcome back, {user.name} <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider ml-1 px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100">{user.role}</span></p>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  // The data is already live via onSnapshot, but this provides visual feedback
                  const btn = document.getElementById('refresh-btn');
                  if (btn) {
                    btn.classList.add('animate-spin');
                    setTimeout(() => btn.classList.remove('animate-spin'), 1000);
                  }
                }}
                className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
                title="Refresh Data"
              >
                <i id="refresh-btn" className="fas fa-sync-alt"></i>
              </button>

              <button 
                onClick={() => setShowGlobalScanner(true)}
                className="p-2.5 text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition shadow-sm"
                title="Quick Scan"
              >
                <i className="fas fa-expand text-lg"></i>
              </button>
              
              <button 
                onClick={() => setShowStockAction(true)}
                className="px-4 py-2 text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2"
              >
                <i className="fas fa-exchange-alt"></i>
                Stock In/Out
              </button>

              {canEdit && (
                <>
                  <button 
                    onClick={() => setShowBulkUpload(true)}
                    className="px-4 py-2 text-green-600 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center gap-2"
                  >
                    <i className="fas fa-file-excel"></i>
                    Bulk Upload
                  </button>
                  <button 
                    onClick={() => setShowAddStock(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add Stock
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {activeTab === 'inventory' ? (
          <InventoryList 
            inventory={inventory} 
            canEdit={canEdit} 
            onDelete={onDeleteStock}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : activeTab === 'reports' ? (
          <Reports inventory={inventory} />
        ) : (
          <UserManagement 
            users={users}
            currentUser={user}
            onAddUser={onAddUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
          />
        )}
      </main>

      {showAddStock && (
        <AddStockModal 
          onClose={() => setShowAddStock(false)}
          onAdd={onAddStock}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal 
          type="inventory"
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
        />
      )}

      {showStockAction && (
        <StockActionModal 
          inventory={inventory}
          onClose={() => setShowStockAction(false)}
          onAction={handleStockAction}
        />
      )}

      {showGlobalScanner && (
        <BarcodeScanner 
          onScan={(code) => {
            setSearchQuery(code);
            setShowGlobalScanner(false);
            setActiveTab('inventory');
          }}
          onClose={() => setShowGlobalScanner(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
