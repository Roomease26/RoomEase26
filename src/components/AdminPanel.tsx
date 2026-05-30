import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Home, CreditCard, Trash2, Shield, Search, 
  MapPin, Filter, Calendar, Activity, IndianRupee,
  CheckCircle2, XCircle, ArrowUpRight
} from 'lucide-react';
import { Listing, UserProfile, City } from '../types';
import { userService, listingService, paymentService } from '../services/dataService';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'listings' | 'payments'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [u, p] = await Promise.all([
          userService.getAllUsers(),
          paymentService.getAllPayments(),
        ]);
        setUsers(u);
        setPayments(p);
      } catch (err) {
        console.error('Admin Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Listings are usually synced via App.tsx but we can also listen here or use passed ones
    const unsubListings = listingService.listenToListings(setListings);
    return () => unsubListings();
  }, []);

  const stats = useMemo(() => {
    const totalPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const activeUsers = users.filter(u => u.paymentExpiry && new Date(u.paymentExpiry) > new Date()).length;
    
    return {
      totalUsers: users.length,
      totalListings: listings.length,
      totalPayments,
      activeUsers,
      totalRevenue: totalPayments / 100 // assuming paisa if from gateway, but here we store as INR
    };
  }, [users, listings, payments]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.phone.includes(searchTerm);
      const isActive = u.paymentExpiry && new Date(u.paymentExpiry) > new Date();
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Active' && isActive) || 
        (statusFilter === 'Expired' && !isActive);
      
      // City search is tricky as it's multiple cities in unlockedCities
      const hasCity = cityFilter === 'All' || (u.unlockedCities && Object.keys(u.unlockedCities).includes(cityFilter));
      
      return matchesSearch && matchesStatus && hasCity;
    });
  }, [users, searchTerm, statusFilter, cityFilter]);

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             l.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === 'All' || l.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [listings, searchTerm, cityFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      {/* Sidebar/Header hybrid for mobile */}
      <div className="bg-[#1A1F36] text-white p-6 rounded-b-[40px] shadow-lg mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                ADMIN DASHBOARD
              </h1>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">RoomEase Platform Controls</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Activity className="w-5 h-5 text-green-400 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="Users" value={stats.totalUsers} subValue={`${stats.activeUsers} Active`} color="blue" />
            <StatCard icon={<Home />} label="Listings" value={stats.totalListings} subValue="Live Rooms" color="indigo" />
            <StatCard icon={<IndianRupee />} label="Payments" value={`₹${stats.totalPayments}`} subValue="Total Value" color="emerald" />
            <StatCard icon={<ArrowUpRight />} label="Growth" value="+12%" subValue="This Month" color="amber" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-8 no-scrollbar">
          {[
            { id: 'dashboard', label: 'Overview', icon: <Activity /> },
            { id: 'users', label: 'Customers', icon: <Users /> },
            { id: 'listings', label: 'Inventory', icon: <Home /> },
            { id: 'payments', label: 'Transactions', icon: <CreditCard /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-bold text-sm transition-all whitespace-nowrap shadow-sm ${
                activeTab === tab.id 
                ? 'bg-[#1A1F36] text-white' 
                : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Filters */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search phone, area, city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 border-none rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Cities</option>
              <option value="Bramhapuri">Bramhapuri</option>
              <option value="Gadchiroli">Gadchiroli</option>
              <option value="Chandrapur">Chandrapur</option>
              <option value="Nagpur">Nagpur</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active Subscription</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-4">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[38px] shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  RECENT ACTIVITY
                </h3>
                <div className="space-y-6">
                  {payments.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">New Payment Received</p>
                        <p className="text-xs text-slate-500 font-medium">User: {p.userId.slice(-5)} unlocked {p.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">₹{p.amount}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[38px] shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  TOP CITIES
                </h3>
                <div className="space-y-6">
                  {['Bramhapuri'].map((city, i) => {
                    const count = listings.filter(l => l.city === city).length;
                    const percent = Math.round((count / (listings.length || 1)) * 100);
                    return (
                      <div key={city} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-700">{city}</span>
                          <span className="text-slate-400 font-black">{count} listings ({percent}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border-4 border-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1F36] text-white">
                    <tr>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Phone Number</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Selected City</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Expiry Date</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((u) => {
                      const isActive = u.paymentExpiry && new Date(u.paymentExpiry) > new Date();
                      const cities = u.unlockedCities ? Object.keys(u.unlockedCities).join(', ') : 'None';
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-bold text-slate-900">{u.phone}</td>
                          <td className="px-8 py-6 text-sm text-slate-500 font-medium">{cities}</td>
                          <td className="px-8 py-6">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 rounded-full text-xs font-black uppercase">
                                <XCircle className="w-3 h-3" />
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                            {u.paymentExpiry ? new Date(u.paymentExpiry).toLocaleDateString() : '--'}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((l) => (
                <div key={l.id} className="bg-white p-6 rounded-[38px] shadow-sm flex gap-6 hover:shadow-md transition-shadow">
                  <img src={l.photos[0]} alt="" className="w-24 h-24 rounded-3xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                        {l.city}
                      </span>
                      <button className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-black text-slate-900 truncate">{l.area}</p>
                    <p className="text-xs text-slate-400 font-medium truncate mb-4">{l.address}</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{l.availability.status}</span>
                      <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  subValue: string,
  color: 'blue' | 'indigo' | 'emerald' | 'amber'
}) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/5">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</p>
      <p className="text-[11px] font-bold text-white/70">{subValue}</p>
    </div>
  );
}
