
import React, { useState, useEffect } from 'react';
import { StockItem, StockActionType } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface StockActionModalProps {
  inventory: StockItem[];
  onClose: () => void;
  onAction: (itemId: string, type: StockActionType, quantity: number) => void;
}

const StockActionModal: React.FC<StockActionModalProps> = ({ inventory, onClose, onAction }) => {
  const [barcode, setBarcode] = useState('');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [type, setType] = useState<StockActionType>('in');
  const [quantity, setQuantity] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (barcode) {
      const item = inventory.find(i => i.barcode === barcode || i.stockNo === barcode);
      if (item) {
        setSelectedItem(item);
        setError('');
      } else {
        setSelectedItem(null);
        setError('Product not found for this barcode/SKU');
      }
    }
  }, [barcode, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      if (type === 'out' && selectedItem.quantity < quantity) {
        setError('Insufficient stock for this action');
        return;
      }
      onAction(selectedItem.id, type, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-auto animate-scale-in overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Stock In / Stock Out</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Scan or Enter Barcode/SKU</label>
            <div className="flex gap-2">
              <input 
                value={barcode} 
                onChange={e => setBarcode(e.target.value)} 
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Barcode or Stock No" 
              />
              <button 
                type="button"
                onClick={() => setShowScanner(true)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition"
              >
                <i className="fas fa-barcode"></i>
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {selectedItem && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                {selectedItem.photoUrl ? (
                  <img src={selectedItem.photoUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-image text-slate-200 text-xl"></i>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selectedItem.name}</h3>
                <p className="text-xs text-slate-500">{selectedItem.stockNo} • Current: {selectedItem.quantity}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setType('in')}
                className={`py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${type === 'in' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <i className="fas fa-arrow-down"></i>
                Stock In
              </button>
              <button 
                type="button"
                onClick={() => setType('out')}
                className={`py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${type === 'out' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <i className="fas fa-arrow-up"></i>
                Stock Out
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1" 
                required 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value))} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>

            <button 
              type="submit"
              disabled={!selectedItem}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              Confirm Action
            </button>
          </form>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner 
          onScan={(code) => {
            setBarcode(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default StockActionModal;
