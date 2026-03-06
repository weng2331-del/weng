
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import RegisterUserModal from './RegisterUserModal';
import BulkUploadModal from './BulkUploadModal';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, userData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.contact.includes(search)
  );

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowRegisterModal(true);
  };

  const handleCloseModal = () => {
    setShowRegisterModal(false);
    setEditingUser(undefined);
  };

  const handleBulkUpload = async (data: any[]) => {
    for (const userData of data) {
      await onAddUser(userData);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowBulkUpload(true)}
            className="flex-1 md:flex-none px-4 py-2 text-green-600 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-file-excel"></i>
            Bulk Upload
          </button>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <i className="fas fa-user-plus"></i>
            {currentUser.role === 'manager' ? 'Register Staff' : 'Register User'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{u.contact}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                        u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition"
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => u.id && onDeleteUser(u.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition"
                        title="Delete User"
                        disabled={u.id === currentUser.id}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRegisterModal && (
        <RegisterUserModal 
          onClose={handleCloseModal}
          onSave={onAddUser}
          onUpdate={onUpdateUser}
          currentUserRole={currentUser.role as UserRole}
          editUser={editingUser}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal 
          type="users"
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
        />
      )}
    </div>
  );
};

export default UserManagement;
