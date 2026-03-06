
import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Category, UserRole } from '../types';

interface BulkUploadModalProps {
  type: 'inventory' | 'users';
  onClose: () => void;
  onUpload: (data: any[]) => Promise<void>;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ type, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processExcel = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) throw new Error("Worksheet not found");

      const images = worksheet.getImages();
      const imageDataMap: Record<number, Blob> = {};

      // Extract images
      images.forEach((img) => {
        const image = workbook.model.media[Number(img.imageId)];
        if (image && img.range.tl.row) {
          // Store image by row index (0-based)
          // Note: exceljs row index is 0-based in range, but worksheet.getRow is 1-based
          imageDataMap[img.range.tl.row] = new Blob([image.buffer], { type: `image/${image.extension}` });
        }
      });

      const rows: any[] = [];
      const totalRows = worksheet.rowCount - 1; // Exclude header

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        if (!row.getCell(1).value) continue; // Skip empty rows

        let photoUrl = '';
        const imageBlob = imageDataMap[i - 1]; // range.tl.row is 0-based, so row 2 is index 1

        if (imageBlob) {
          const storageRef = ref(storage, `bulk_${type}/${Date.now()}_${i}.${imageBlob.type.split('/')[1]}`);
          await uploadBytes(storageRef, imageBlob);
          photoUrl = await getDownloadURL(storageRef);
        }

        if (type === 'inventory') {
          rows.push({
            stockNo: row.getCell(1).value?.toString() || '',
            name: row.getCell(2).value?.toString() || '',
            itemName: row.getCell(3).value?.toString() || '',
            category: (row.getCell(4).value?.toString() as Category) || 'Men',
            quantity: Number(row.getCell(5).value?.toString()) || 0,
            price: Number(row.getCell(6).value?.toString()) || 0,
            photoUrl,
            createdAt: new Date().toISOString()
          });
        } else {
          rows.push({
            name: row.getCell(1).value?.toString() || '',
            contact: row.getCell(2).value?.toString() || '',
            email: row.getCell(3).value?.toString() || '',
            password: row.getCell(4).value?.toString() || '123456',
            role: (row.getCell(5).value?.toString().toLowerCase() as UserRole) || 'staff',
            photoUrl
          });
        }
        
        setProgress(Math.round(((i - 1) / totalRows) * 100));
      }

      await onUpload(rows);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process excel file");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template');
    
    if (type === 'inventory') {
      sheet.addRow(['Stock No', 'Product Name', 'Brand/Item Ref', 'Category', 'Quantity', 'Price', 'Image (Embed in this cell)']);
      sheet.addRow(['SN001', 'Classic T-Shirt', 'Nike', 'Men', 50, 25.00]);
    } else {
      sheet.addRow(['Name', 'Contact', 'Email', 'Password', 'Role (staff/manager/admin)', 'Image (Embed in this cell)']);
      sheet.addRow(['John Doe', '0123456789', 'john@example.com', 'password123', 'staff']);
    }

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.xlsx`;
      a.click();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-file-excel text-green-600"></i>
            Bulk Upload {type === 'inventory' ? 'Stock' : 'Users'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 flex items-start gap-2">
              <i className="fas fa-info-circle mt-0.5"></i>
              <span>
                Please use our template for best results. You can embed images directly into the last column of the Excel file.
              </span>
            </p>
            <button 
              onClick={downloadTemplate}
              className="mt-3 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <i className="fas fa-download"></i>
              Download Template
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Select Excel File</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden" 
                id="excel-upload"
                disabled={uploading}
              />
              <label 
                htmlFor="excel-upload"
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition ${
                  file ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                <i className={`fas ${file ? 'fa-file-check text-green-500' : 'fa-cloud-upload-alt text-slate-300'} text-3xl mb-2`}></i>
                <span className="text-sm font-medium text-slate-600">
                  {file ? file.name : 'Click to select .xlsx file'}
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Processing Rows...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-white transition"
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            onClick={processExcel}
            disabled={!file || uploading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                Start Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
