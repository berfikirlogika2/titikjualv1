import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, PlusCircle, X, Edit3, Check, Search, SlidersHorizontal, Trash2, Camera, Layers, Coffee } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

const formatRupiah = (val) => {
  if (!val && val !== 0) return '';
  const numberString = val.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
};

const parseRupiah = (str) => {
  if (!str) return 0;
  return parseInt(str.toString().replace(/\./g, ''), 10) || 0;
};

export default function CashierStok() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('produk');
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProduk: 0, stokMenipis: 0, totalBahan: 0 });

  const [ownerId, setOwnerId] = useState('toko_123');

  // State Modal Penambahan Stok Produk (Dropdown dari produk yang sudah ada)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tambahStokProduk, setTambahStokProduk] = useState('');
  const [submittingProd, setSubmittingProd] = useState(false);

  // State Modal Penambahan Stok Bahan Baku (Dropdown dari bahan yang sudah ada)
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [tambahStokBahan, setTambahStokBahan] = useState('');
  const [submittingIng, setSubmittingIng] = useState(false);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Selalu me-refresh data secara otomatis (Real-time sync)
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let currentOwnerId = 'toko_123';
      if (session && session.user) {
        currentOwnerId = session.user.user_metadata?.owner_id || localStorage.getItem('owner_id') || session.user.id;
      } else {
        currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
      }
      setOwnerId(currentOwnerId);

      // 1. Ambil data produk
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      // 2. Ambil data bahan baku
      const { data: ingData } = await supabase
        .from('ingredients')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      let menipisCount = 0;

      if (prodData) {
        const formattedProducts = prodData.map((item, idx) => {
          const stock = Number(item.stok_manual ?? item.stok ?? item.stock ?? 10);
          const isMenipis = stock <= (item.stok_min || 5);
          if (isMenipis) menipisCount++;

          return {
            id: item.id || idx,
            nama: item.nama || item.name || 'Produk Tanpa Nama',
            kategori: item.kategori || item.category || 'Umum',
            stok: stock,
            harga: Number(item.harga_jual || item.price || 0),
            status: isMenipis ? 'Menipis' : 'Tersedia'
          };
        });
        setProducts(formattedProducts);
        setStats(prev => ({ ...prev, totalProduk: formattedProducts.length, stokMenipis: menipisCount }));
      }

      if (ingData) {
        const formattedIngredients = ingData.map((item, idx) => {
          const stock = Number(item.stok ?? item.stock ?? 10);
          const limit = item.limit_min !== null ? Number(item.limit_min) : 5;
          const isKritis = stock <= limit;

          return {
            id: item.id || idx,
            nama: item.nama || item.name || 'Bahan Baku',
            kategori: item.kategori || item.category || 'Bahan Utama',
            stok: stock,
            satuan: item.satuan || item.unit || 'kg',
            status: isKritis ? 'Kritis' : 'Aman'
          };
        });
        setIngredients(formattedIngredients);
        setStats(prev => ({ ...prev, totalBahan: formattedIngredients.length }));
      }

    } catch (err) {
      console.error('Gagal memuat data stok:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler Tambah Stok Produk yang Sudah Ada (Update stok_manual / stock)
  const handleUpdateProductStock = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !tambahStokProduk) return;

    setSubmittingProd(true);
    try {
      // Cari produk yang dipilih untuk mengetahui stok lama
      const targetProd = products.find(p => p.id === selectedProductId);
      if (!targetProd) throw new Error('Produk tidak ditemukan');

      const stokBaru = Number(targetProd.stok) + Number(tambahStokProduk);

      const { error } = await supabase
        .from('products')
        .update({ stok_manual: stokBaru, stock: stokBaru })
        .eq('id', selectedProductId);

      if (error) throw error;

      alert(`Stok produk "${targetProd.nama}" berhasil ditambah sebanyak ${tambahStokProduk}!`);
      setIsAddProductModalOpen(false);
      setSelectedProductId('');
      setTambahStokProduk('');
      fetchData();
    } catch (err) {
      alert('Gagal memperbarui stok produk: ' + err.message);
    } finally {
      setSubmittingProd(false);
    }
  };

  // Handler Tambah Stok Bahan Baku yang Sudah Ada (Update stok)
  const handleUpdateIngredientStock = async (e) => {
    e.preventDefault();
    if (!selectedIngredientId || !tambahStokBahan) return;

    setSubmittingIng(true);
    try {
      const targetIng = ingredients.find(i => i.id === selectedIngredientId);
      if (!targetIng) throw new Error('Bahan baku tidak ditemukan');

      const stokBaru = Number(targetIng.stok) + Number(tambahStokBahan);

      const { error } = await supabase
        .from('ingredients')
        .update({ stok: stokBaru, stock: stokBaru })
        .eq('id', selectedIngredientId);

      if (error) throw error;

      alert(`Stok bahan "${targetIng.nama}" berhasil ditambah sebanyak ${tambahStokBahan} ${targetIng.satuan}!`);
      setIsAddIngredientModalOpen(false);
      setSelectedIngredientId('');
      setTambahStokBahan('');
      fetchData();
    } catch (err) {
      alert('Gagal memperbarui stok bahan: ' + err.message);
    } finally {
      setSubmittingIng(false);
    }
  };

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[120px] lg:pb-12">
      
      {/* MainHeader */}
      <header className="sticky pt-6 pb-4 px-4 md:px-8 lg:px-12 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90 border-b border-gray-200/50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0 shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-sm md:text-base font-semibold flex-1 px-4 truncate text-center">Manajemen Stok &amp; Katalog</h1>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-[#01A684] px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200">
            <span>Kasir Akses Stok</span>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684] shrink-0">
            FK
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-4 mt-4">
        
        <div>
          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4 shadow-xs">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col pr-4 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Total Produk</span>
                <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-[#1A1A1A] tabular-nums">{stats.totalProduk}</h2>
              </div>
              <div className="flex flex-col px-4 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Stok Menipis</span>
                <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-red-500 tabular-nums">{stats.stokMenipis}</h2>
              </div>
              <div className="flex flex-col pl-4">
                <span className="text-xs text-gray-500 block mb-1">Bahan Baku</span>
                <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-[#1A1A1A] tabular-nums">{stats.totalBahan}</h2>
              </div>
            </div>
          </div>

          {/* Action Buttons (Memilih produk/bahan yang sudah ada untuk ditambah stoknya) */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              onClick={() => setIsAddProductModalOpen(true)}
              className="flex-1 bg-[#01A684] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-colors cursor-pointer border-0"
            >
              <Plus size={18} /> Tambah Stok Produk
            </button>
            <button 
              onClick={() => setIsAddIngredientModalOpen(true)}
              className="flex-1 bg-white border border-[#01A684] text-[#01A684] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <PlusCircle size={18} /> Tambah Stok Bahan Baku
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="bg-gray-100 p-1.5 rounded-xl flex mb-4">
            <button
              onClick={() => setActiveTab('produk')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'produk' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-gray-500 bg-transparent hover:text-[#1A1A1A]'
              }`}
            >
              Daftar Produk
            </button>
            <button
              onClick={() => setActiveTab('bahan')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer border-0 ${
                activeTab === 'bahan' ? 'bg-white shadow-xs text-[#1A1A1A]' : 'text-gray-500 bg-transparent hover:text-[#1A1A1A]'
              }`}
            >
              Bahan Baku
            </button>
          </div>
        </div>

        <div>
          {/* TAB 1: DAFTAR PRODUK */}
          {activeTab === 'produk' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500">
                      <th className="p-4 font-medium">Nama Produk</th>
                      <th className="p-4 font-medium">Kategori</th>
                      <th className="p-4 font-medium">Stok Tersedia</th>
                      <th className="p-4 font-medium">Harga Jual</th>
                      <th className="p-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-gray-500">Memuat data produk...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-gray-500">Belum ada data produk.</td>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                              item.status === 'Tersedia' ? 'bg-[#E6F6F3] text-[#01A684]' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BAHAN BAKU */}
          {activeTab === 'bahan' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500">
                      <th className="p-4 font-medium">Nama Bahan</th>
                      <th className="p-4 font-medium">Kategori</th>
                      <th className="p-4 font-medium">Stok Saat Ini</th>
                      <th className="p-4 font-medium">Satuan</th>
                      <th className="p-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-gray-500">Memuat data bahan baku...</td>
                      </tr>
                    ) : ingredients.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-gray-500">Belum ada data bahan baku.</td>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                              item.status === 'Aman' ? 'bg-[#E6F6F3] text-[#01A684]' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* MODAL PILIH PRODUK & TAMBAH STOK (Dropdown dari produk yang sudah ada) */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl flex flex-col p-6 border border-[#E9EBED]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#181b2b]">Tambah Stok Produk</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-[#86899B] border-0 bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateProductStock} className="flex flex-col gap-3">
              <div>
                <label className="font-bold text-[#181b2b] text-xs block mb-1">Pilih Nama Produk</label>
                <select 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)} 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-semibold outline-none text-xs border border-gray-200" 
                  required
                >
                  <option value="">-- Pilih Produk Yang Sudah Ada --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} (Stok Saat Ini: {p.stok})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#181b2b] text-xs block mb-1">Jumlah Tambahan Stok</label>
                <input 
                  type="number" 
                  value={tambahStokProduk} 
                  onChange={(e) => setTambahStokProduk(e.target.value)} 
                  placeholder="Cth: 20" 
                  className="w-full bg-[#F1F2F6] border border-gray-200 rounded-xl p-3 font-bold outline-none text-xs" 
                  required 
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E9EBED] mt-2">
                <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white text-xs">Batal</button>
                <button type="submit" disabled={submittingProd} className="flex-1 py-3 bg-[#01a684] border-0 text-white rounded-xl font-bold cursor-pointer shadow-sm text-xs">{submittingProd ? 'Menyimpan...' : 'Tambah Stok'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PILIH BAHAN & TAMBAH STOK (Dropdown dari bahan yang sudah ada) */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl flex flex-col p-6 border border-[#E9EBED]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#181b2b]">Tambah Stok Bahan Baku</h3>
              <button onClick={() => setIsAddIngredientModalOpen(false)} className="text-[#86899B] border-0 bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateIngredientStock} className="flex flex-col gap-3">
              <div>
                <label className="font-bold text-[#181b2b] text-xs block mb-1">Pilih Nama Bahan Baku</label>
                <select 
                  value={selectedIngredientId} 
                  onChange={(e) => setSelectedIngredientId(e.target.value)} 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-semibold outline-none text-xs border border-gray-200" 
                  required
                >
                  <option value="">-- Pilih Bahan Yang Sudah Ada --</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.nama} (Stok: {i.stok} {i.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#181b2b] text-xs block mb-1">Jumlah Tambahan Stok</label>
                <input 
                  type="number" 
                  step="any" 
                  value={tambahStokBahan} 
                  onChange={(e) => setTambahStokBahan(e.target.value)} 
                  placeholder="Cth: 5" 
                  className="w-full bg-[#F1F2F6] border border-gray-200 rounded-xl p-3 font-bold outline-none text-xs" 
                  required 
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E9EBED] mt-2">
                <button type="button" onClick={() => setIsAddIngredientModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white text-xs">Batal</button>
                <button type="submit" disabled={submittingIng} className="flex-1 py-3 bg-[#01a684] border-0 text-white rounded-xl font-bold cursor-pointer shadow-sm text-xs">{submittingIng ? 'Menyimpan...' : 'Tambah Stok'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CashierBottomNav />
    </div>
  );
}