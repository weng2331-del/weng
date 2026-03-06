
import React, { useState, useEffect } from 'react';
import { StockItem, Category } from '../types';
import { CATEGORIES } from '../constants';
import Barcode from 'react-barcode';

interface InventoryListProps {
  inventory: StockItem[];
  canEdit: boolean;
  onDelete: (id: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  inventory, 
  canEdit, 
  onDelete,
  searchQuery = '',
  setSearchQuery
}) => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (setSearchQuery) setSearchQuery(val);
  };

  const filteredItems = inventory.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.stockNo.toLowerCase().includes(search.toLowerCase()) ||
                          (item.barcode && item.barcode.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search stock no, item name, barcode..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="relative flex items-center w-full md:w-auto group">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition md:block hidden"></div>
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-2 z-10 w-8 h-8 bg-white shadow-md rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition md:flex hidden"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto w-full md:max-w-[400px] lg:max-w-[600px] pb-2 md:pb-0 scrollbar-hide scroll-smooth relative z-0"
          >
            <button 
              onClick={() => setFilter('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-2 z-10 w-8 h-8 bg-white shadow-md rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition md:flex hidden"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition md:block hidden"></div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <i className="fas fa-box-open text-4xl text-slate-200 mb-4"></i>
          <p className="text-slate-500">No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <i className="fas fa-image text-3xl mb-2"></i>
                    <span className="text-xs uppercase tracking-widest font-bold">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded text-indigo-600 shadow-sm border border-indigo-50">
                    {item.category}
                  </span>
                </div>
                {canEdit && (
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm border border-red-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-500 hover:text-white"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                  <span className="text-sm font-semibold text-indigo-600">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mb-3">{item.stockNo} • {item.itemName}</p>
                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.quantity > 5 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    Stock: {item.quantity}
                  </span>
                  <div className="flex flex-col items-end">
                    {item.barcode && (
                      <div className="scale-[0.4] origin-right -mb-6 -mr-4">
                        <Barcode value={item.barcode} height={40} width={1.5} displayValue={false} />
                      </div>
                    )}
                    <button className="text-xs text-slate-400 hover:text-indigo-600 transition flex items-center gap-1">
                      <i className="fas fa-ellipsis-h"></i>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryList;
