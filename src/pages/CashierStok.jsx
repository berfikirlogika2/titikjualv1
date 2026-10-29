import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, PlusCircle, Edit3, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierStok() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('produk');
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProduk: 0, stokMenipis: 0, totalBahan: 0 });

  const [ownerId, setOwnerId] = useState('toko_123');

  // State Modal Edit Stok
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // State Modal Tambah Produk
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Minuman');
  const [prodStock, setProdStock] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [submittingProd, setSubmittingProd] = useState(false);

  // State Modal Tambah Bahan Baku
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState('Bahan Utama');
  const [ingStock, setIngStock] = useState('');
  const [ingUnit, setIngUnit] = useState('Pcs');
  const [submittingIng, setSubmittingIng] = useState(false);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

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

      // 1. Ambil data produk dari Supabase
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      let rawProducts = prodData;
      if (prodError || !rawProducts || rawProducts.length === 0) {
        const { data: prodIndo } = await supabase.from('produk').select('*');
        if (prodIndo) rawProducts = prodIndo;
      }

      // 2. Ambil data bahan baku dari Supabase
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      if (ingError) throw ingError;

      let menipisCount = 0;

      if (rawProducts) {
        const formattedProducts = rawProducts.map((item, idx) => {
          const stock = Number(item.stok_manual ?? item.stock ?? item.stok ?? 10);
          const isMenipis = stock <= 5;
          if (isMenipis) menipisCount++;

          // Parsing Varian jika ada
          let rawVariants = item.varian || item.variants || item.variasi || item.options || [];
          if (typeof rawVariants === 'string') {
            try {
              rawVariants = JSON.parse(rawVariants);
            } catch (e) {
              rawVariants = [];
            }
          }

          const variants = Array.isArray(rawVariants) ? rawVariants.map(v => ({
            name: v.nama || v.name || v.variant_name || 'Varian',
            price: Number(v.hargaJual || v.price || v.harga || v.harga_jual || v.amount || 0)
          })) : [];

          // Ambil harga dasar atau ambil dari harga varian pertama jika harga dasar 0
          let basePrice = Number(item.harga_jual || item.price || item.harga || item.amount || 0);
          if (variants.length > 0 && basePrice === 0) {
            basePrice = variants[0].price;
          }

          // Ambil nama produk dengan fallback yang akurat
          const productName = item.nama || item.name || item.nama_produk || 'Produk Tanpa Nama';
          const productCategory = item.kategori || item.category || 'Umum';

          return {
            id: item.id || idx,
            nama: productName,
            kategori: productCategory,
            stok: stock,
            harga: basePrice,
            status: isMenipis ? 'Menipis' : 'Tersedia'
          };
        });
        setProducts(formattedProducts);
        setStats(prev => ({ ...prev, totalProduk: formattedProducts.length, stokMenipis: menipisCount }));
      }

      if (ingData) {
        const formattedIngredients = ingData.map((item, idx) => {
          const stock = Number(item.stock ?? item.stok_saat_ini ?? item.stok ?? 10);
          const isKritis = stock <= 5;

          return {
            id: item.id || idx,
            nama: item.name || item.nama_bahan || item.nama || 'Bahan Baku',
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveStockEdit = async (e) => {
    e.preventDefault();
    if (!editItem || isNaN(newStockValue)) return;

    setSubmittingEdit(true);
    try {
      const targetTable = editItem.type === 'produk' ? 'products' : 'ingredients';
      const stockField = editItem.type === 'produk' ? 'stock' : 'stock';

      const { error } = await supabase
        .from(targetTable)
        .update({ [stockField]: Number(newStockValue) })
        .eq('id', editItem.id);

      if (error) throw error;

      alert('Stok berhasil diperbarui!');
      setIsEditModalOpen(false);
      setEditItem(null);
      setNewStockValue('');
      fetchData();
    } catch (err) {
      alert('Gagal memperbarui stok: ' + err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    setSubmittingProd(true);
    try {
      const newProd = {
        owner_id: ownerId,
        name: prodName,
        category: prodCategory,
        stock: Number(prodStock) || 0,
        price: Number(prodPrice) || 0,
        image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('products').insert([newProd]);
      if (error) throw error;

      alert('Produk baru berhasil ditambahkan!');
      setIsAddProductModalOpen(false);
      setProdName('');
      setProdStock('');
      setProdPrice('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah produk: ' + err.message);
    } finally {
      setSubmittingProd(false);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!ingName) return;

    setSubmittingIng(true);
    try {
      const newIng = {
        owner_id: ownerId,
        name: ingName,
        category: ingCategory,
        stock: Number(ingStock) || 0,
        unit: ingUnit,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('ingredients').insert([newIng]);
      if (error) throw error;

      alert('Bahan baku baru berhasil ditambahkan!');
      setIsAddIngredientModalOpen(false);
      setIngName('');
      setIngStock('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah bahan baku: ' + err.message);
    } finally {
      setSubmittingIng(false);
    }
  };

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

        <div className="flex items-center gap-1.5 bg-emerald-50 text-[#01A684] px-3 py-1 rounded-full text-xs font-medium mr-3 border border-emerald-200">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Kasir Akses Aktif</span>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          FK
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
              onClick={() => setIsAddProductModalOpen(true)}
              className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-colors cursor-pointer border-0"
            >
              <Plus size={18} /> Tambah Produk
            </button>
            <button 
              onClick={() => setIsAddIngredientModalOpen(true)}
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
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Belum ada data produk untuk owner ini.</td>
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
                            <button 
                              onClick={() => {
                                setEditItem({ id: item.id, nama: item.nama, stok: item.stok, type: 'produk' });
                                setNewStockValue(item.stok);
                                setIsEditModalOpen(true);
                              }} 
                              className="text-[#01A684] hover:opacity-85 cursor-pointer border-0 bg-transparent"
                              title="Edit Stok"
                            >
                              <Edit3 size={16} />
                            </button>
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
                        <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Belum ada data bahan baku untuk owner ini.</td>
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
                            <button 
                              onClick={() => {
                                setEditItem({ id: item.id, nama: item.nama, stok: item.stok, type: 'bahan' });
                                setNewStockValue(item.stok);
                                setIsEditModalOpen(true);
                              }} 
                              className="text-[#01A684] hover:opacity-85 cursor-pointer border-0 bg-transparent"
                              title="Edit Stok Bahan"
                            >
                              <Edit3 size={16} />
                            </button>
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

      {/* MODAL EDIT STOK */}
      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#1A1A1A]">Edit Stok: {editItem.nama}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Jumlah Stok Baru</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#01A684]"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 shadow-sm"
                >
                  {submittingEdit ? 'Menyimpan...' : 'Simpan Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PRODUK */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#1A1A1A]">Tambah Produk Baru</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Nama Produk</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: Kopi Susu Aren"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Kategori</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                >
                  <option value="Minuman">Minuman</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Stok Awal</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: 50"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Harga Jual (Rp)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: 18000"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingProd}
                  className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 shadow-sm"
                >
                  {submittingProd ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BAHAN BAKU */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#1A1A1A]">Tambah Bahan Baku Baru</h3>
              <button onClick={() => setIsAddIngredientModalOpen(false)} className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Nama Bahan Baku</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: Biji Kopi Robusta"
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Kategori</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: Bahan Utama"
                  value={ingCategory}
                  onChange={(e) => setIngCategory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Stok Awal</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  placeholder="Cth: 10"
                  value={ingStock}
                  onChange={(e) => setIngStock(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Satuan</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#01A684]"
                  value={ingUnit}
                  onChange={(e) => setIngUnit(e.target.value)}
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Liter">Liter</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddIngredientModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingIng}
                  className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 shadow-sm"
                >
                  {submittingIng ? 'Menyimpan...' : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CashierBottomNav />

    </div>
  );
}