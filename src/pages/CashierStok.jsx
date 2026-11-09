import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, PlusCircle, X, Camera, Trash2, Settings, Layers, Search, SlidersHorizontal, Check } from 'lucide-react';
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

const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 300;
      const MAX_HEIGHT = 300;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      callback(dataUrl);
    };
  };
};

export default function CashierStok() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('produk');
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProduk: 0, stokMenipis: 0, totalBahan: 0 });

  const [ownerId, setOwnerId] = useState('toko_123');
  const [masterBahan, setMasterBahan] = useState([]);
  const [daftarKategoriProduk, setDaftarKategoriProduk] = useState(['Minuman', 'Makanan', 'Snack & Dessert', 'Barang Retail']);

  // State Modal Tambah Produk Baru (Persis seperti Owner Produk)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState('Minuman');
  const [formSku, setFormSku] = useState('');
  const [formTipeStok, setFormTipeStok] = useState('manual');
  const [formStokManual, setFormStokManual] = useState('');
  const [formStokMin, setFormStokMin] = useState('5');
  const [selectedResep, setSelectedResep] = useState([{ bahanId: '', qty: '' }]);
  const [formHpp, setFormHpp] = useState('');
  const [formHargaJual, setFormHargaJual] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formPakaiVarian, setFormPakaiVarian] = useState(false);
  const [formVarianList, setFormVarianList] = useState([
    { id: Date.now(), nama: '', hpp: '', hargaJual: '', resepVarian: [{ bahanId: '', qty: '' }] }
  ]);
  const [submittingProd, setSubmittingProd] = useState(false);

  // State Modal Tambah Bahan Baku Baru (Persis seperti Owner Bahan)
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
  const [formBahanNama, setFormBahanNama] = useState('');
  const [formBahanKategori, setFormBahanKategori] = useState('Bahan Utama');
  const [formBahanStok, setFormBahanStok] = useState('');
  const [formBahanSatuan, setFormBahanSatuan] = useState('kg');
  const [formBahanHargaBeli, setFormBahanHargaBeli] = useState('');
  const [formBahanLimitMin, setFormBahanLimitMin] = useState('5');
  const [submittingIng, setSubmittingIng] = useState(false);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Selalu me-refresh data saat halaman dibuka / tab aktif
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
        setMasterBahan(ingData.map(item => ({ id: item.id, nama: item.nama || item.name, stok: Number(item.stok || item.stock), satuan: item.satuan || item.unit || 'kg' })));
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

  // Handler Tambah Produk Baru oleh Kasir
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    setSubmittingProd(true);
    try {
      let formattedResep = [];
      if (formTipeStok === 'bahan') {
        formattedResep = selectedResep.filter(r => r.bahanId).map(r => {
          const b = masterBahan.find(mb => mb.id === r.bahanId);
          return { bahanId: r.bahanId, nama: b ? b.nama : 'Bahan', satuan: b ? b.satuan : 'kg', qty: parseFloat(r.qty) || 0 };
        });
      }

      const processedVarian = formPakaiVarian ? formVarianList.map(v => ({
        id: v.id || Date.now(),
        nama: v.nama,
        hpp: parseRupiah(v.hpp),
        hargaJual: parseRupiah(v.hargaJual),
        resepVarian: (v.resepVarian || []).filter(rv => rv.bahanId).map(rv => {
          const b = masterBahan.find(mb => mb.id === rv.bahanId);
          return { bahanId: rv.bahanId, nama: b ? b.nama : 'Bahan', satuan: b ? b.satuan : 'kg', qty: parseFloat(rv.qty) || 0 };
        })
      })) : [];

      const payload = {
        owner_id: ownerId,
        nama: formNama,
        kategori: formKategori,
        sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        tipe_stok: formTipeStok,
        stok_manual: formTipeStok === 'manual' ? (parseFloat(formStokManual) || 0) : 0,
        stok_min: parseFloat(formStokMin) || 5,
        hpp: !formPakaiVarian ? parseRupiah(formHpp) : 0,
        harga_jual: !formPakaiVarian ? parseRupiah(formHargaJual) : 0,
        pakai_varian: formPakaiVarian,
        varian: processedVarian,
        resep: formattedResep
      };

      if (formFoto && formFoto.trim() !== '') {
        payload.image_url = formFoto;
        payload.foto = formFoto;
      }

      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;

      alert('Menu produk baru berhasil ditambahkan dan otomatis terupdate!');
      setIsAddProductModalOpen(false);
      setFormNama('');
      setFormStokManual('');
      setFormHpp('');
      setFormHargaJual('');
      setFormFoto('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah produk: ' + err.message);
    } finally {
      setSubmittingProd(false);
    }
  };

  // Handler Tambah Bahan Baku Baru oleh Kasir
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!formBahanNama.trim() || !formBahanStok || !formBahanHargaBeli) return;

    setSubmittingIng(true);
    try {
      const payload = {
        owner_id: ownerId,
        nama: formBahanNama,
        kategori: formBahanKategori,
        stok: parseFloat(formBahanStok) || 0,
        satuan: formBahanSatuan,
        harga_beli: parseRupiah(formBahanHargaBeli),
        limit_min: parseFloat(formBahanLimitMin) || 5,
      };

      const { error } = await supabase.from('ingredients').insert([payload]);
      if (error) throw error;

      alert('Bahan baku baru berhasil ditambahkan dan stok terupdate!');
      setIsAddIngredientModalOpen(false);
      setFormBahanNama('');
      setFormBahanStok('');
      setFormBahanHargaBeli('');
      fetchData();
    } catch (err) {
      alert('Gagal menambah bahan baku: ' + err.message);
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
            <span>Kasir Akses Tambah</span>
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

          {/* Action Buttons (Hanya menambah data baru, tidak mengedit stok lama) */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              onClick={() => setIsAddProductModalOpen(true)}
              className="flex-1 bg-[#01A684] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-colors cursor-pointer border-0"
            >
              <Plus size={18} /> Tambah Produk Baru
            </button>
            <button 
              onClick={() => setIsAddIngredientModalOpen(true)}
              className="flex-1 bg-white border border-[#01A684] text-[#01A684] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <PlusCircle size={18} /> Tambah Bahan Baku Baru
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
          {/* TAB 1: DAFTAR PRODUK (View Only untuk Stok, Bisa Tambah) */}
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

          {/* TAB 2: BAHAN BAKU (View Only untuk Stok, Bisa Tambah) */}
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

      {/* MODAL TAMBAH PRODUK BARU (Persis standar Owner Produk) */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col h-[85vh] max-h-[750px] border border-[#E9EBED] overflow-hidden">
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Tambah Menu Produk Baru</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-[#86899B] border-0 bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col flex-1 overflow-y-auto p-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b] text-xs">Nama Menu Produk</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Kopi Susu Gula Aren" className="bg-[#F1F2F6] rounded-xl border border-[#E9EBED] p-3 font-bold outline-none text-xs" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b] text-xs">Foto Produk (Opsional)</label>
                <div className="flex items-center gap-3 bg-[#F1F2F6] p-2.5 rounded-xl border border-[#E9EBED]">
                  {formFoto ? (
                    <img src={formFoto} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-300" />
                  ) : (
                    <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                      <Camera size={20} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        compressImage(e.target.files[0], (compressedBase64) => setFormFoto(compressedBase64));
                      }
                    }}
                    className="text-[10px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#01a684] file:text-white file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b] text-xs">Kategori</label>
                  <select value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="bg-[#F1F2F6] rounded-xl p-2.5 border border-[#E9EBED] font-medium outline-none text-xs">
                    {daftarKategoriProduk.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b] text-xs">SKU / Barcode</label>
                  <input type="text" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="SKU-001" className="bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-2.5 font-mono outline-none text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-emerald-800 text-xs">Harga HPP (Modal)</label>
                  <input type="text" value={formHpp} onChange={(e) => setFormHpp(formatRupiah(e.target.value))} placeholder="10.000" className="bg-white rounded-xl p-2.5 font-bold outline-none border border-emerald-200 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-emerald-800 text-xs">Harga Jual (Retail)</label>
                  <input type="text" value={formHargaJual} onChange={(e) => setFormHargaJual(formatRupiah(e.target.value))} placeholder="20.000" className="bg-white rounded-xl p-2.5 font-bold text-[#01a684] outline-none border border-emerald-200 text-xs" required />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b] text-xs">Stok Awal</label>
                <input type="number" value={formStokManual} onChange={(e) => setFormStokManual(e.target.value)} placeholder="50" className="bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-2.5 font-bold outline-none text-xs" required />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E9EBED] bg-white shrink-0 mt-auto">
                <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white text-xs">Batal</button>
                <button type="submit" disabled={submittingProd} className="flex-1 py-3 bg-[#01a684] border-0 text-white rounded-xl font-bold cursor-pointer shadow-sm text-xs">{submittingProd ? 'Menyimpan...' : 'Simpan Produk'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BAHAN BAKU BARU (Persis standar Owner Bahan) */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#181b2b]">Tambah Bahan Baku Baru</h3>
              <button onClick={() => setIsAddIngredientModalOpen(false)} className="text-[#86899B] border-0 bg-transparent cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleAddIngredient} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Bahan Baku</label>
                <input type="text" value={formBahanNama} onChange={(e) => setFormBahanNama(e.target.value)} placeholder="Cth: Biji Kopi Arabika" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kategori</label>
                <input type="text" value={formBahanKategori} onChange={(e) => setFormBahanKategori(e.target.value)} placeholder="Cth: Bahan Utama" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Stok Awal</label>
                  <input type="number" step="any" value={formBahanStok} onChange={(e) => setFormBahanStok(e.target.value)} placeholder="0" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Satuan</label>
                  <select value={formBahanSatuan} onChange={(e) => setFormBahanSatuan(e.target.value)} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs">
                    <option value="kg">kg</option><option value="Liter">Liter</option><option value="Pcs">Pcs</option><option value="Pack">Pack</option><option value="Gram">Gram</option><option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Total Harga Beli (Rp)</label>
                <input type="text" value={formBahanHargaBeli} onChange={(e) => setFormBahanHargaBeli(formatRupiah(e.target.value))} placeholder="50.000" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Limit Min (Peringatan)</label>
                <input type="number" step="any" value={formBahanLimitMin} onChange={(e) => setFormBahanLimitMin(e.target.value)} placeholder="5" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsAddIngredientModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white text-xs">Batal</button>
                <button type="submit" disabled={submittingIng} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0 text-xs">{submittingIng ? 'Menyimpan...' : 'Simpan Bahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CashierBottomNav />
    </div>
  );
}