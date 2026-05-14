import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Home, CreditCard, Trash2, Shield, Search } from 'lucide-react';
import { Listing, UserProfile } from '../types';

interface Props {
  users: UserProfile[];
  listings: Listing[];
  payments: any[];
  onDeleteListing: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export default function AdminPanel({ users, listings, payments, onDeleteListing, onDeleteUser }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'payments'>('users');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500">Manage RoomEase platform</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'listings' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            Listings
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payments
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {activeTab === 'users' && (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.uid} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{user.phone}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{user.role}</p>
                  </div>
                  <button 
                    onClick={() => onDeleteUser(user.uid)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="divide-y">
              {listings.map((listing) => (
                <div key={listing.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={listing.photos[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-900">{listing.area}, {listing.city}</p>
                      <p className="text-xs text-slate-500">{listing.address.slice(0, 30)}...</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteListing(listing.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="divide-y">
              {payments.map((payment, i) => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">₹{payment.amount}</p>
                    <p className="text-xs text-slate-500">User: {payment.userPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600 uppercase">Success</p>
                    <p className="text-[10px] text-slate-400">{new Date(payment.timestamp).toLocaleDateString()}</p>
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
