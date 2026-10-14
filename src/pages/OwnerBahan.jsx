import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, SlidersHorizontal, Plus, Package, 
  Box, MoreVertical, X, Check, Receipt, User, Calendar, ImageIcon, 
  Trash2, Edit3, Tag, Store, Upload 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

const formatRupiah = (val) => {
  if (!val) return '';
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

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
};

export default function OwnerBahan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stok');

  const [daftarKategori, setDaftarKategori] = useState([
    'Minuman & Kopi', 'Dairy & Susu', 'Pemanis & Sirup', 'Bahan Makanan', 'Kemasan & Plastik'
  ]);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [formKategoriBaru, setFormKategoriBaru] = useState('');

  const [bahanList, setBahanList] = useState([]);
  const [loadingBahan, setLoadingBahan] = useState(true);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Ambil data bahan dari Supabase berdasarkan owner_id
  const fetchBahan = async () => {
    setLoadingBahan(true);
    try {
      const currentOwnerId = getOwnerId();
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Mapping kolom database ke format frontend
        const formatted = data.map(item => ({
          id: item.id,
          nama: item.nama,
          kategori: item.kategori,
          stok: Number(item.stok),
          satuan: item.satuan,
          hargaBeli: Number(item.harga_beli),
          limitMin: item.limit_min !== null ? Number(item.limit_min) : null
        }));
        setBahanList(formatted);
      }
    } catch (err) {
      console.error('Gagal memuat bahan:', err.message);
    } finally {
      setLoadingBahan(false);
    }
  };

  useEffect(() => {
    fetchBahan();
  }, []);

  const [riwayatList, setRiwayatList] = useState([
    {
      id: 101,
      tanggal: '06 Sep 2026, 14:15',
      namaBahan: 'Susu Full Cream',
      kuantiti: '5 Liter',
      totalHarga: 110000,
      pembeli: 'Sarah Jenkins (Kasir Pagi)',
      strukUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('Semua');
  const [filterHanyaKritis, setFilterHanyaKritis] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState(daftarKategori[0]);
  const [formStok, setFormStok] = useState('');
  const [formSatuan, setFormSatuan] = useState('kg');
  const [formHargaBeli, setFormHargaBeli] = useState('');
  const [formLimitMin, setFormLimitMin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isStrukModalOpen, setIsStrukModalOpen] = useState(false);
  const [formStrukBahan, setFormStrukBahan] = useState('');
  const [formStrukKuantiti, setFormStrukKuantiti] = useState('');
  const [formStrukTotal, setFormStrukTotal] = useState('');
  const [formStrukPreview, setFormStrukPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewStrukUrl, setPreviewStrukUrl] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleAddKategori = (e) => {
    e.preventDefault();
    if (!formKategoriBaru.trim() || daftarKategori.includes(formKategoriBaru)) return;
    setDaftarKategori([...daftarKategori, formKategoriBaru]);
    setFormKategoriBaru('');
  };

  const handleDeleteKategori = (kat) => {
    if (daftarKategori.length <= 1) return alert('Minimal ada 1 kategori!');
    if (window.confirm(`Hapus kategori ${kat}?`)) {
      setDaftarKategori(daftarKategori.filter(k => k !== kat));
      if (selectedKategoriFilter === kat) setSelectedKategoriFilter('Semua');
    }
  };

  const handleAddBahan = async (e) => {
    e.preventDefault();
    if (!formNama || !formStok || !formHargaBeli) return;

    setIsSubmitting(true);
    try {
      const currentOwnerId = getOwnerId();
      const payload = {
        owner_id: currentOwnerId,
        nama: formNama,
        kategori: formKategori,
        stok: parseFloat(formStok),
        satuan: formSatuan,
        harga_beli: parseRupiah(formHargaBeli),
        limit_min: formLimitMin !== '' ? parseFloat(formLimitMin) : 5,
      };

      const { error } = await supabase
        .from('ingredients')
        .insert([payload]);

      if (error) throw error;

      alert('Bahan gudang berhasil ditambahkan!');
      setIsModalOpen(false);
      setFormNama(''); setFormStok(''); setFormHargaBeli(''); setFormLimitMin('');
      fetchBahan();
    } catch (err) {
      console.error('Gagal menyimpan bahan:', err.message);
      alert('Gagal menyimpan ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBahan = async (id) => {
    if (window.confirm('Hapus item bahan ini dari database?')) {
      try {
        const { error } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setBahanList(bahanList.filter(b => b.id !== id));
        setActiveMenuId(null);
      } catch (err) {
        console.error('Gagal menghapus bahan:', err.message);
        alert('Gagal menghapus bahan.');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const compressed = await compressImage(file, 800, 800, 0.7);
    setFormStrukPreview(compressed);
    setIsCompressing(false);
  };

  const handleSaveStruk = (e) => {
    e.preventDefault();
    if (!formStrukBahan || !formStrukTotal || !formStrukPreview) return;
    const newRiwayat = {
      id: Date.now(),
      tanggal: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      namaBahan: formStrukBahan,
      kuantiti: formStrukKuantiti || '1 Pcs',
      totalHarga: parseRupiah(formStrukTotal),
      pembeli: 'Budi Santoso (Kasir Aktif)',
      strukUrl: formStrukPreview,
    };
    setRiwayatList([newRiwayat, ...riwayatList]);
    setIsStrukModalOpen(false);
    setFormStrukBahan(''); setFormStrukKuantiti(''); setFormStrukTotal(''); setFormStrukPreview(null);
  };

  const cekKritis = (item) => item.limitMin !== null ? item.stok <= item.limitMin : item.stok <= 5;
  const bahanMenipisList = bahanList.filter(item => cekKritis(item));

  const filteredBahan = bahanList.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || item.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKat = selectedKategoriFilter === 'Semua' || item.kategori === selectedKategoriFilter;
    const matchKritis = filterHanyaKritis ? cekKritis(item) : true;
    return matchSearch && matchKat && matchKritis;
  });

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER PRESISI BAKU */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Inventaris Bahan
          </h1>

          <button 
            onClick={() => setIsKategoriModalOpen(true)} 
            className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <Store size={18} />
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6">

        {/* HERO CARD INVENTARIS BERSIH TANPA WATERMARK */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 lg:p-8 shadow-lg relative overflow-hidden min-h-[120px] lg:min-h-[150px] flex items-center">
          <div className="relative z-10 w-full">
            <span className="text-[10px] lg:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Box size={13} className="text-[#01a684]" /> STOK & HPP BAHAN BAKU
            </span>
            <h2 className="text-lg lg:text-2xl font-black tracking-tight mt-1">Gudang Inventaris Outlet</h2>
            <p className="text-[11px] lg:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
              Pantau sisa stok bahan baku dan histori pengeluaran belanja staf dengan aman.
            </p>
          </div>
        </div>
        
        {/* TAB NAVIGATION PILLS */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-sm gap-1 max-w-xs mx-auto w-full sm:max-w-md">
          <button 
            onClick={() => setActiveTab('stok')} 
            className={`flex-1 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'stok' ? 'bg-[#181b2b] text-white font-bold shadow-md' : 'text-[#86899B] font-medium hover:text-[#181b2b]'
            }`}
          >
            <Package size={14} /> Stok Gudang
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')} 
            className={`flex-1 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'riwayat' ? 'bg-[#181b2b] text-white font-bold shadow-md' : 'text-[#86899B] font-medium hover:text-[#181b2b]'
            }`}
          >
            <Receipt size={14} /> Struk Belanja Staf
          </button>
        </div>

        {activeTab === 'stok' && (
          <>
            {/* BENTO CARDS SUMMARY */}
            <section className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-6 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] lg:text-xs font-extrabold text-[#86899B] uppercase tracking-wider">Total Item</span>
                <div className="text-2xl lg:text-4xl font-black text-[#181b2b] tabular-nums mt-2">{bahanList.length}</div>
              </div>
              <div 
                onClick={() => setFilterHanyaKritis(!filterHanyaKritis)} 
                className={`rounded-2xl lg:rounded-3xl border p-4 lg:p-6 flex flex-col justify-between shadow-sm cursor-pointer transition-all ${
                  filterHanyaKritis ? 'bg-red-500 text-white border-red-500' : 'bg-white/70 backdrop-blur-md text-[#181b2b] border-white/90'
                }`}
              >
                <span className={`text-[10px] lg:text-xs font-extrabold uppercase tracking-wider ${filterHanyaKritis ? 'text-white' : 'text-red-600'}`}>Stok Kritis (Klik)</span>
                <div className={`text-2xl lg:text-4xl font-black tabular-nums mt-2 ${filterHanyaKritis ? 'text-white' : 'text-red-600'}`}>{bahanMenipisList.length}</div>
              </div>
            </section>

            {filterHanyaKritis && (
              <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-800">🔍 Menampilkan bahan dengan status stok kritis</span>
                <button onClick={() => setFilterHanyaKritis(false)} className="font-bold text-[#01a684] underline cursor-pointer">Reset</button>
              </div>
            )}

            <section className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86899B]" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari item bahan..." className="w-full bg-white/70 border border-white/90 rounded-2xl pl-10 pr-4 py-3 text-xs lg:text-sm font-medium outline-none focus:bg-white" />
              </div>
              <button onClick={() => setIsFilterModalOpen(true)} className="bg-white/70 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white shrink-0">
                <SlidersHorizontal size={16} className="text-[#01a684]" /> Filter Kategori
              </button>
            </section>

            <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#01a684] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-xs lg:text-sm shadow-sm cursor-pointer hover:opacity-90 transition-all">
              <Plus size={16} /> Tambah Item & Limit Belanja
            </button>

            {/* DAFTAR BAHAN: 3 KOTAK SEJAJAR KE SAMPING (GRID 3 KOLOM) */}
            <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 overflow-hidden shadow-sm p-4 lg:p-6">
              <div className="pb-4 mb-4 border-b border-[#E9EBED]/50 flex justify-between items-center">
                <h2 className="font-bold text-xs lg:text-sm uppercase text-[#181b2b] tracking-wider">Daftar Inventaris & HPP</h2>
                <span className="text-[10px] lg:text-xs text-[#01a684] font-bold">{filteredBahan.length} Item</span>
              </div>

              {loadingBahan ? (
                <p className="text-xs text-center text-[#86899B] py-10">Memuat data gudang...</p>
              ) : filteredBahan.length === 0 ? (
                <div className="text-center text-xs text-[#86899B] py-10">Belum ada data bahan baku terdaftar.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {filteredBahan.map((bahan) => {
                    const isKritis = cekKritis(bahan);
                    return (
                      <div key={bahan.id} className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-xs flex flex-col justify-between gap-3 relative">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs lg:text-sm font-bold text-[#181b2b] truncate">{bahan.nama}</h4>
                            <span className="text-[9px] lg:text-[10px] text-[#86899B] bg-slate-100 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">{bahan.kategori}</span>
                          </div>
                          <div className="relative shrink-0">
                            <button onClick={() => setActiveMenuId(activeMenuId === bahan.id ? null : bahan.id)} className="text-[#86899B] p-1.5 cursor-pointer hover:text-[#181b2b]">
                              <MoreVertical size={16} />
                            </button>
                            {activeMenuId === bahan.id && (
                              <div className="absolute right-0 top-8 bg-white border border-[#E9EBED] shadow-xl rounded-2xl py-1.5 z-30 w-32 flex flex-col text-xs">
                                <button onClick={() => handleDeleteBahan(bahan.id)} className="px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 font-medium text-red-600 cursor-pointer border-0 bg-transparent">
                                  <Trash2 size={13} /> Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-[#F1F2F6]/70 p-3 rounded-xl text-[11px]">
                          <div>
                            <span className="text-[8px] lg:text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">STOK</span>
                            <span className={`font-bold text-xs ${isKritis ? 'text-red-600' : 'text-[#181b2b]'}`}>{bahan.stok} {bahan.satuan}</span>
                          </div>
                          <div>
                            <span className="text-[8px] lg:text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">LIMIT</span>
                            <span className="font-bold text-xs text-[#86899B]">{bahan.limitMin ?? 5}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] lg:text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">BELI</span>
                            <span className="font-bold text-xs text-[#01a684]">Rp {formatRupiah(bahan.hargaBeli)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'riwayat' && (
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs lg:text-sm font-bold text-[#181b2b] uppercase tracking-wider">Struk Belanja Staf</h2>
              <button onClick={() => setIsStrukModalOpen(true)} className="text-xs bg-[#01a684] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shadow-sm">
                <Plus size={14} /> Upload Struk
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riwayatList.map((r) => (
                <div key={r.id} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-4 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex justify-between text-xs lg:text-sm font-bold text-[#181b2b]">
                    <span>{r.namaBahan}</span>
                    <span className="text-[#01a684]">Rp {formatRupiah(r.totalHarga)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#86899B]">
                    <span>{r.pembeli}</span>
                    <button onClick={() => setPreviewStrukUrl(r.strukUrl)} className="text-[#01a684] font-bold underline cursor-pointer">Lihat Struk 🔍</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal Upload Struk Staf */}
      {isStrukModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Upload Nota Belanja</h3>
            <form onSubmit={handleSaveStruk} className="flex flex-col gap-3">
              <input type="text" value={formStrukBahan} onChange={(e) => setFormStrukBahan(e.target.value)} placeholder="Nama Bahan" className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" required />
              <input type="text" value={formStrukKuantiti} onChange={(e) => setFormStrukKuantiti(e.target.value)} placeholder="Kuantiti (Cth: 5 Liter)" className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" required />
              <input type="text" value={formStrukTotal} onChange={(e) => setFormStrukTotal(formatRupiah(e.target.value))} placeholder="Total Harga (Rp)" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none" required />
              <label className="border-2 border-dashed border-[#E9EBED] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload size={20} className="text-[#01a684]" />
                <span className="font-bold mt-1 text-[11px] text-[#181b2b]">{isCompressing ? 'Mengompres (<500KB)...' : 'Pilih Foto Struk'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {formStrukPreview && <img src={formStrukPreview} alt="Preview" className="w-full h-24 object-cover rounded-xl" />}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsStrukModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
                <button type="submit" disabled={isCompressing} className="flex-1 py-3 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm border-0">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Tambah Bahan Gudang</h3>
            <form onSubmit={handleAddBahan} className="flex flex-col gap-3">
              <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Nama Bahan" className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" required />
              <select value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none">
                {daftarKategori.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={formStok} onChange={(e) => setFormStok(e.target.value)} placeholder="Stok" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none" required />
                <select value={formSatuan} onChange={(e) => setFormSatuan(e.target.value)} className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none">
                  <option value="kg">kg</option><option value="Liter">Liter</option><option value="Pcs">Pcs</option><option value="Pack">Pack</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={formLimitMin} onChange={(e) => setFormLimitMin(e.target.value)} placeholder="Limit Min (Opt)" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none" />
                <input type="text" value={formHargaBeli} onChange={(e) => setFormHargaBeli(formatRupiah(e.target.value))} placeholder="Harga Beli" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none" required />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Kelola Kategori</h3>
            <form onSubmit={handleAddKategori} className="flex gap-2">
              <input type="text" value={formKategoriBaru} onChange={(e) => setFormKategoriBaru(e.target.value)} placeholder="Kategori baru..." className="flex-1 bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" />
              <button type="submit" className="bg-[#01a684] text-white px-4 py-3 rounded-xl font-bold cursor-pointer shadow-sm border-0">Tambah</button>
            </form>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {daftarKategori.map(k => (
                <div key={k} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs border border-[#E9EBED]">
                  <span className="font-medium text-[#181b2b]">{k}</span>
                  <button onClick={() => handleDeleteKategori(k)} className="text-red-500 cursor-pointer p-1"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsKategoriModalOpen(false)} className="w-full py-3 bg-[#181b2b] text-white rounded-xl font-bold mt-1 cursor-pointer border-0">Selesai</button>
          </div>
        </div>
      )}

      {/* Modal Filter Kategori */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-2 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b] mb-1">Filter Kategori</h3>
            <button onClick={() => { setSelectedKategoriFilter('Semua'); setIsFilterModalOpen(false); }} className="py-3 px-4 bg-[#F1F2F6] rounded-xl font-bold text-left cursor-pointer text-[#181b2b]">Semua Kategori</button>
            {daftarKategori.map(k => (
              <button key={k} onClick={() => { setSelectedKategoriFilter(k); setIsFilterModalOpen(false); }} className="py-3 px-4 bg-[#F1F2F6] rounded-xl font-bold text-left cursor-pointer text-[#181b2b]">{k}</button>
            ))}
          </div>
        </div>
      )}

      {previewStrukUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewStrukUrl(null)}>
          <img src={previewStrukUrl} alt="Struk" className="max-w-sm w-full rounded-2xl cursor-pointer shadow-2xl" />
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}