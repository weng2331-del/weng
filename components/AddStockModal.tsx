
import React, { useState } from 'react';
import { StockItem, Category } from '../types';
import { CATEGORIES } from '../constants';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import BarcodeScanner from './BarcodeScanner';

interface AddStockModalProps {
  onClose: () => void;
  onAdd: (item: Omit<StockItem, 'id'>) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onAdd }) => {
  const [stockNo, setStockNo] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<Category>('Men');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    let finalPhotoUrl = photoUrl;

    try {
      if (selectedFile) {
        const storageRef = ref(storage, `inventory/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      const newItem: Omit<StockItem, 'id'> = {
        stockNo,
        barcode,
        name,
        itemName,
        category,
        quantity,
        price,
        photoUrl: finalPhotoUrl,
        createdAt: new Date().toISOString()
      };
      
      onAdd(newItem);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <h2 className="text-xl font-bold text-indigo-900">New Inventory Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stock No</label>
                <input required value={stockNo} onChange={e => setStockNo(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="SKU-001" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Barcode (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    value={barcode} 
                    onChange={e => setBarcode(e.target.value)} 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Scan or enter barcode" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition"
                    title="Scan Barcode"
                  >
                    <i className="fas fa-barcode"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Premium Cotton Shirt" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Brand/Item Ref</label>
                <input required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Levis / SL-2024" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                  <input type="number" required value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Photo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100 transition relative">
                  {photoUrl ? (
                    <div className="relative group w-full h-32">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-contain" />
                      <button 
                        type="button" 
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i>
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to 2MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="px-10 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : 'Add to Inventory'}
            </button>
          </div>
        </form>
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

export default AddStockModal;
