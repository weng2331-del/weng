
import React, { useState, useEffect } from 'react';
import { StockItem, User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qInventory = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));
    const unsubInventory = onSnapshot(qInventory, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockItem[];
      setInventory(items);
    });

    const qUsers = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(userList);
      setLoading(false);
    });

    return () => {
      unsubInventory();
      unsubUsers();
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddStock = async (item: Omit<StockItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'inventory'), item);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleUpdateStock = async (id: string, data: Partial<StockItem>) => {
    try {
      const stockRef = doc(db, 'inventory', id);
      await updateDoc(stockRef, data);
    } catch (error) {
      console.error("Error updating stock: ", error);
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      await addDoc(collection(db, 'users'), userData);
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, userData);
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      user={user} 
      inventory={inventory}
      users={users}
      onLogout={handleLogout}
      onAddStock={handleAddStock}
      onDeleteStock={handleDeleteStock}
      onUpdateStock={handleUpdateStock}
      onAddUser={handleAddUser}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
    />
  );
};

export default App;
