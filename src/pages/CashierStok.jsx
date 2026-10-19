import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, PlusCircle, Edit3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierStok() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('produk');
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProduk: 0, stokMenipis: 0, totalBahan: 0 });

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();

        // 1. Ambil data produk dari Supabase
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .order('created_at', { ascending: false });

        if (prodError) throw prodError;

        // 2. Ambil data bahan baku dari Supabase
        const { data: ingData, error: ingError } = await supabase
          .from('ingredients')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .order('created_at', { ascending: false });

        if (ingError) throw ingError;

        let menipisCount = 0;

        if (prodData) {
          const formattedProducts = prodData.map((item, idx) => {
            const stock = Number(item.stock ?? item.stok ?? 10);
            const isMenipis = stock <= 5;
            if (isMenipis) menipisCount++;

            return {
              id: item.id || idx,
              nama: item.name || item.nama_produk || 'Produk Tanpa Nama',
              kategori: item.category || item.kategori || 'Umum',
              stok: stock,
              harga: Number(item.price ?? item.harga_jual ?? 0),
              status: isMenipis ? 'Menipis' : 'Tersedia'
            };
          });
          setProducts(formattedProducts);
          setStats(prev => ({ ...prev, totalProduk: formattedProducts.length, stokMenipis: menipisCount }));
        }

        if (ingData) {
          const formattedIngredients = ingData.map((item, idx) => {
            const stock = Number(item.stock ?? item.stok_saat_ini ?? 10);
            const isKritis = stock <= 5;

            return {
              id: item.id || idx,
              nama: item.name || item.nama_bahan || 'Bahan Baku',
              kategori: item.category || item.kategori || 'Bahan Utama',
              stok: stock,
              satuan: item.unit || item.satuan || 'Pcs',
              status: isKritis ? 'Kritis' : 'Aman'
            };
          });
          setIngredients(formattedIngredients);
          setStats(prev => ({ ...prev, totalBahan: formattedIngredients.length }));
        }

      } catch (err) {
        console.error('Gagal mengambil data stok dari Supabase:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[160px] lg:pb-12 lg:pl-24 lg:pr-8">
      
      {/* MainHeader */}
      <header className="pt-8 pb-4 px-6 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-lg font-semibold flex-1 px-2 truncate text-center">Manajemen Stok</h1>

        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium mr-3">
          <span className="material-symbols-outlined text-sm">person</span>
          <span>Kasir (Edit Akses)</span>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          KP
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8">
        
        <div className="px-6 pt-4 pb-2">
          
          {/* Summary Card */}
          <div className="bg-white rounded-[20px] p-[24px] border border-gray-100 mb-4 shadow-xs">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col pr-4 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Total Produk</span>
                <h2 className="font-bold text-lg text-[#1A1A1A] tabular-nums">{stats.totalProduk}</h2>
              </div>
              <div className="flex flex-col px-4 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Stok Menipis</span>
                <h2 className="font-bold text-lg text-red-500 tabular-nums">{stats.stokMenipis}</h2>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-xs text-gray-500 block mb-1">Bahan Baku</span>
                <h2 className="font-bold text-lg text-[#1A1A1A] tabular-nums">{stats.totalBahan}</h2>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => alert('Fitur tambah produk oleh kasir')}
              className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-colors cursor-pointer border-0"
            >
              <Plus size={18} /> Tambah Produk
            </button>
            <button 
              onClick={() => alert('Fitur tambah bahan oleh kasir')}
              className="flex-1 bg-white border border-[#01A684] text-[#01A684] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <PlusCircle size={18} /> Tambah Bahan
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
            <button
              onClick={() => setActiveTab('produk')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'produk' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-gray-500 bg-transparent hover:text-[#1A1A1A]'
              }`}
            >
              Daftar Produk
            </button>
            <button
              onClick={() => setActiveTab('bahan')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'bahan' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-gray-500 bg-transparent hover:text-[#1A1A1A]'
              }`}
            >
              Bahan Baku
            </button>
          </div>

        </div>

        <div className="px-6 mt-2 mb-20">
          
          {/* TAB 1: DAFTAR PRODUK */}
          {activeTab === 'produk' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500">
                      <th className="p-4 font-medium">Nama Produk</th>
                      <th className="p-4 font-medium">Kategori</th>
                      <th className="p-4 font-medium">Stok</th>
                      <th className="p-4 font-medium">Harga Jual</th>
                      <th className="p-4 font-medium text-right">Status</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Memuat data produk dari Supabase...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Belum ada data produk untuk owner ini[cite: 10].</td>
                      </tr>
                    ) : (
                      products.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-[#1A1A1A] font-medium text-xs">{item.nama}</td>
                          <td className="p-4 text-gray-500 text-xs">{item.kategori}</td>
                          <td className={`p-4 font-bold text-xs tabular-nums ${item.stok <= 5 ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                            {item.stok}
                          </td>
                          <td className="p-4 text-[#1A1A1A] text-xs tabular-nums">Rp {formatRp(item.harga)}</td>
                          <td className="p-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === 'Tersedia' ? 'bg-[#E6F6F3] text-[#01A684]' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => alert(`Edit stok untuk ${item.nama}`)} className="text-[#01A684] hover:opacity-85 cursor-pointer border-0 bg-transparent">
                              <Edit3 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">Menampilkan {products.length} data produk</span>
                <div className="flex gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#01A684] text-white text-xs font-bold border-0">1</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BAHAN BAKU */}
          {activeTab === 'bahan' && (
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500">
                      <th className="p-4 font-medium">Nama Bahan</th>
                      <th className="p-4 font-medium">Kategori</th>
                      <th className="p-4 font-medium">Stok Saat Ini</th>
                      <th className="p-4 font-medium">Satuan</th>
                      <th className="p-4 font-medium text-right">Status</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Memuat data bahan baku dari Supabase...</td>
                      </tr>
                    ) : ingredients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Belum ada data bahan baku untuk owner ini[cite: 10].</td>
                      </tr>
                    ) : (
                      ingredients.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-[#1A1A1A] font-medium text-xs">{item.nama}</td>
                          <td className="p-4 text-gray-500 text-xs">{item.kategori}</td>
                          <td className={`p-4 font-bold text-xs tabular-nums ${item.stok <= 5 ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                            {item.stok}
                          </td>
                          <td className="p-4 text-gray-500 text-xs">{item.satuan}</td>
                          <td className="p-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === 'Aman' ? 'bg-[#E6F6F3] text-[#01A684]' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => alert(`Edit stok bahan ${item.nama}`)} className="text-[#01A684] hover:opacity-85 cursor-pointer border-0 bg-transparent">
                              <Edit3 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">Menampilkan {ingredients.length} data bahan</span>
                <div className="flex gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#01A684] text-white text-xs font-bold border-0">1</button>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      <CashierBottomNav />

    </div>
  );
}