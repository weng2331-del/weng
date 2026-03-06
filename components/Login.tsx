
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Check if user already exists based on contact
      const q = query(collection(db, 'users'), where('contact', '==', contact));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('A user with this contact already exists.');
        setLoading(false);
        return;
      }

      const newUser: User = { name, contact, email, password, role: 'staff' };
      await addDoc(collection(db, 'users'), newUser);
      
      setError('Account created! Login using the last 6 digits of your contact.');
      setIsSignup(false);
      setLoginIdentifier(contact.slice(-6));
    } catch (err) {
      console.error("Signup error:", err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      
      let foundUser: User | null = null;
      querySnapshot.forEach((doc) => {
        const u = doc.data() as User;
        const contactPin = u.contact.slice(-6);
        if (contactPin === loginIdentifier && u.password === loginPassword) {
          foundUser = u;
        }
      });

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('Invalid Last 6 Digits or Password');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'permission-denied') {
        setError('Connection error: Please try again in a moment.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'staff' | 'manager' | 'admin') => {
    const demoUsers: Record<string, User> = {
      admin: { name: 'Demo Admin', contact: '0000000001', email: 'admin@demo.com', role: 'admin', password: 'password' },
      manager: { name: 'Demo Manager', contact: '0000000002', email: 'manager@demo.com', role: 'manager', password: 'password' },
      staff: { name: 'Demo Staff', contact: '0000000003', email: 'staff@demo.com', role: 'staff', password: 'password' }
    };
    onLogin(demoUsers[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-indigo-600 text-white text-center">
          <h1 className="text-3xl font-bold">OmniStock</h1>
          <p className="text-indigo-100 mt-2">Professional Inventory Management</p>
        </div>
        
        <div className="p-8">
          <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 rounded-md transition ${!isSignup ? 'bg-white shadow-sm text-indigo-600 font-semibold' : 'text-slate-500'}`}
              onClick={() => { setIsSignup(false); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 rounded-md transition ${isSignup ? 'bg-white shadow-sm text-indigo-600 font-semibold' : 'text-slate-500'}`}
              onClick={() => { setIsSignup(true); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            <button 
              onClick={() => handleDemoLogin('admin')}
              className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              Demo Admin
            </button>
            <button 
              onClick={() => handleDemoLogin('manager')}
              className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition"
            >
              Demo Manager
            </button>
            <button 
              onClick={() => handleDemoLogin('staff')}
              className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100 rounded-lg hover:bg-green-600 hover:text-white transition"
            >
              Demo Staff
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or use credentials</span></div>
          </div>

          {!isSignup && (
            <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-indigo-800">
                <div>Admin: <strong>000001</strong></div>
                <div>Manager: <strong>000002</strong></div>
                <div>Staff: <strong>000003</strong></div>
                <div>Password: <strong>password</strong></div>
              </div>
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 text-sm rounded-lg border ${error.includes('created') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {error}
            </div>
          )}

          {isSignup ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input type="tel" required value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="e.g. 0123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <input 
                    type={showSignupPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
                  >
                    <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last 6 Digits of Contact</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required 
                  value={loginIdentifier} 
                  onChange={(e) => setLoginIdentifier(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                  placeholder="456789" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    required 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
                  >
                    <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Sign In
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Username is the last 6 digits of your contact number.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
