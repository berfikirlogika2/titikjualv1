import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin Outlet');
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setAdminName(profile.full_name);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login-form');
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex flex-col font-sans antialiased">
      
      {/* Header Admin */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#01A684] flex items-center justify-center font-bold text-white text-lg">
            {adminName.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold">Panel Admin &amp; Stok</h1>
            <p className="text-xs text-slate-400">Halo, {adminName} (Admin)</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer flex items-center gap-1.5"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Keluar</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9EBED]">
            <span className="text-xs font-bold text-[#86899B] uppercase">Total Produk</span>
            <h3 className="text-2xl font-black text-[#181b2b] mt-1">48 Item</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9EBED]">
            <span className="text-xs font-bold text-[#86899B] uppercase">Stok Menipis</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">3 Produk</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E9EBED]">
            <span className="text-xs font-bold text-[#86899B] uppercase">Transaksi Hari Ini</span>
            <h3 className="text-2xl font-black text-[#01A684] mt-1">24 Struk</h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#E9EBED] pb-3">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'inventory' ? 'bg-[#01A684] text-white shadow-sm' : 'bg-white text-[#86899B] hover:text-[#181b2b]'}`}
          >
            Manajemen Inventaris Stok
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'products' ? 'bg-[#01A684] text-white shadow-sm' : 'bg-white text-[#86899B] hover:text-[#181b2b]'}`}
          >
            Katalog &amp; Harga Produk
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E9EBED]">
          {activeTab === 'inventory' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#181b2b]">Daftar Stok Bahan &amp; Barang</h3>
                <button 
                  onClick={() => alert('Fitur tambah stok baru')}
                  className="px-3.5 py-2 bg-[#01A684] hover:bg-[#008769] text-white rounded-xl text-xs font-semibold cursor-pointer border-0"
                >
                  + Tambah Stok Barang
                </button>
              </div>
              <p className="text-xs text-[#86899B]">Kelola persediaan barang masuk dan keluar outlet secara real-time.</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#181b2b]">Pengaturan Katalog Produk</h3>
                <button 
                  onClick={() => alert('Fitur tambah produk baru')}
                  className="px-3.5 py-2 bg-[#01A684] hover:bg-[#008769] text-white rounded-xl text-xs font-semibold cursor-pointer border-0"
                >
                  + Tambah Produk Baru
                </button>
              </div>
              <p className="text-xs text-[#86899B]">Atur nama, kategori, dan harga jual produk kasir.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;