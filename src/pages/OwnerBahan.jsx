import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, SlidersHorizontal, Plus, Package, AlertTriangle, 
  Box, MoreVertical, X, Check, Receipt, User, Calendar, ImageIcon, 
  Trash2, Edit3, Tag, Store, Upload 
} from 'lucide-react';
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

  const [bahanList, setBahanList] = useState(() => {
    const saved = localStorage.getItem('pos_master_bahan');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, nama: 'Biji Kopi Arabika', kategori: 'Minuman & Kopi', stok: 25, satuan: 'kg', hargaBeli: 120000, limitMin: 5 },
      { id: 2, nama: 'Susu Full Cream', kategori: 'Dairy & Susu', stok: 0, satuan: 'Liter', hargaBeli: 22000, limitMin: null },
      { id: 3, nama: 'Gula Aren', kategori: 'Pemanis & Sirup', stok: 10, satuan: 'Liter', hargaBeli: 18000, limitMin: 3 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('pos_master_bahan', JSON.stringify(bahanList));
  }, [bahanList]);

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

  const handleAddBahan = (e) => {
    e.preventDefault();
    if (!formNama || !formStok || !formHargaBeli) return;
    const newBahan = {
      id: Date.now(),
      nama: formNama,
      kategori: formKategori,
      stok: parseFloat(formStok),
      satuan: formSatuan,
      hargaBeli: parseRupiah(formHargaBeli),
      limitMin: formLimitMin !== '' ? parseFloat(formLimitMin) : null,
    };
    setBahanList([newBahan, ...bahanList]);
    setIsModalOpen(false);
    setFormNama(''); setFormStok(''); setFormHargaBeli(''); setFormLimitMin('');
  };

  const handleDeleteBahan = (id) => {
    if (window.confirm('Hapus item ini?')) {
      setBahanList(bahanList.filter(b => b.id !== id));
      setActiveMenuId(null);
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
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 font-sans antialiased relative">
      
      {/* HEADER PRESISI BAKU */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 pt-[env(safe-area-inset-top)]">
        <div className="h-14 flex items-center justify-between relative">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
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

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO CARD INVENTARIS DENGAN ORNAMEN WATERMARK LOGO KASIR PRO */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden min-h-[110px] flex items-center">
          
          {/* ORNAMEN BACKGROUND LOGO KASIR PRO (WATERMARK UTAMA) */}
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-20 text-emerald-300 transform rotate-[-12deg]">
            <svg 
              viewBox="0 0 100 65" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-52 h-52"
            >
              <rect x="5" y="18" width="90" height="35" rx="5" stroke="currentColor" strokeWidth="5"/>
              <path d="M5 58H95" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <rect x="58" y="2" width="22" height="13" rx="3" stroke="currentColor" strokeWidth="3.5"/>
              <path d="M69 15V18" stroke="currentColor" strokeWidth="3.5"/>
              <text x="12" y="42" fill="currentColor" fontSize="18" fontWeight="900" fontFamily="sans-serif">KASIR</text>
              <text x="61" y="11" fill="currentColor" fontSize="7" fontWeight="900" fontFamily="sans-serif">PRO</text>
            </svg>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Box size={12} className="text-[#01a684]" /> STOK & HPP BAHAN
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">Gudang Inventaris</h2>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                Pantau sisa stok bahan baku dan histori pengeluaran belanja staf.
              </p>
            </div>
          </div>
        </div>
        
        {/* TAB NAVIGATION PILLS */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('stok')} 
            className={`flex-1 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'stok' ? 'bg-[#181b2b] text-white font-bold shadow-md' : 'text-[#86899B] font-medium hover:text-[#181b2b]'
            }`}
          >
            <Package size={14} /> Stok Gudang
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')} 
            className={`flex-1 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'riwayat' ? 'bg-[#181b2b] text-white font-bold shadow-md' : 'text-[#86899B] font-medium hover:text-[#181b2b]'
            }`}
          >
            <Receipt size={14} /> Struk Belanja Staf
          </button>
        </div>

        {activeTab === 'stok' && (
          <>
            {/* BENTO CARDS SUMMARY */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Total Item</span>
                <div className="text-3xl font-black text-[#181b2b] tabular-nums mt-2">{bahanList.length}</div>
              </div>
              <div 
                onClick={() => setFilterHanyaKritis(!filterHanyaKritis)} 
                className={`rounded-2xl border p-4 flex flex-col justify-between shadow-sm cursor-pointer transition-all ${
                  filterHanyaKritis ? 'bg-red-500 text-white border-red-500' : 'bg-white/70 backdrop-blur-md text-[#181b2b] border-white/90'
                }`}
              >
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${filterHanyaKritis ? 'text-white' : 'text-red-600'}`}>Stok Kritis (Klik)</span>
                <div className={`text-3xl font-black tabular-nums mt-2 ${filterHanyaKritis ? 'text-white' : 'text-red-600'}`}>{bahanMenipisList.length}</div>
              </div>
            </section>

            {filterHanyaKritis && (
              <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-800">🔍 Menampilkan bahan kritis</span>
                <button onClick={() => setFilterHanyaKritis(false)} className="font-bold text-[#01a684] underline cursor-pointer">Reset</button>
              </div>
            )}

            <section className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86899B]" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari item..." className="w-full bg-white/70 border border-white/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:bg-white" />
              </div>
              <button onClick={() => setIsFilterModalOpen(true)} className="bg-white/70 backdrop-blur-md border border-white/90 rounded-2xl px-3.5 py-2.5 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-white">
                <SlidersHorizontal size={16} className="text-[#01a684]" />
              </button>
            </section>

            <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#01a684] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-xs shadow-sm cursor-pointer hover:opacity-90 transition-all">
              <Plus size={16} /> Tambah Item & Limit Belanja
            </button>

            <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#E9EBED]/50 flex justify-between items-center">
                <h2 className="font-bold text-xs uppercase text-[#181b2b] tracking-wider">Daftar Inventaris & HPP</h2>
                <span className="text-[10px] text-[#01a684] font-bold">{filteredBahan.length} Item</span>
              </div>
              <div className="divide-y divide-[#E9EBED]/50">
                {filteredBahan.map((bahan) => {
                  const isKritis = cekKritis(bahan);
                  return (
                    <div key={bahan.id} className="p-4 flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#181b2b]">{bahan.nama}</h4>
                          <span className="text-[10px] text-[#86899B] bg-slate-100 px-2 py-0.5 rounded-md font-medium">{bahan.kategori}</span>
                        </div>
                        <div className="relative">
                          <button onClick={() => setActiveMenuId(activeMenuId === bahan.id ? null : bahan.id)} className="text-[#86899B] p-1.5 cursor-pointer hover:text-[#181b2b]">
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === bahan.id && (
                            <div className="absolute right-0 top-8 bg-white border border-[#E9EBED] shadow-xl rounded-2xl py-1.5 z-30 w-32 flex flex-col text-xs">
                              <button onClick={() => handleDeleteBahan(bahan.id)} className="px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 font-medium text-red-600">
                                <Trash2 size={13} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 bg-[#F1F2F6]/80 p-3 rounded-2xl text-[11px]">
                        <div>
                          <span className="text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">STOK</span>
                          <span className={`font-bold ${isKritis ? 'text-red-600' : 'text-[#181b2b]'}`}>{bahan.stok} {bahan.satuan}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">LIMIT</span>
                          <span className="font-bold text-[#86899B]">{bahan.limitMin ?? 5}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-[#86899B] font-bold block uppercase tracking-wider">HARGA BELI</span>
                          <span className="font-bold text-[#01a684]">Rp {formatRupiah(bahan.hargaBeli)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'riwayat' && (
          <section className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold text-[#181b2b] uppercase tracking-wider">Struk Belanja Staf</h2>
              <button onClick={() => setIsStrukModalOpen(true)} className="text-[11px] bg-[#01a684] text-white px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 transition-all">
                <Plus size={14} /> Upload Struk
              </button>
            </div>
            {riwayatList.map((r) => (
              <div key={r.id} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-[#181b2b]">
                  <span>{r.namaBahan}</span>
                  <span className="text-[#01a684]">Rp {formatRupiah(r.totalHarga)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#86899B]">
                  <span>{r.pembeli}</span>
                  <button onClick={() => setPreviewStrukUrl(r.strukUrl)} className="text-[#01a684] font-bold underline cursor-pointer">Lihat Struk 🔍</button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Modal Upload Struk Staf */}
      {isStrukModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Upload Nota Belanja</h3>
            <form onSubmit={handleSaveStruk} className="flex flex-col gap-2.5">
              <input type="text" value={formStrukBahan} onChange={(e) => setFormStrukBahan(e.target.value)} placeholder="Nama Bahan" className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" required />
              <input type="text" value={formStrukKuantiti} onChange={(e) => setFormStrukKuantiti(e.target.value)} placeholder="Kuantiti (Cth: 5 Liter)" className="bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none" required />
              <input type="text" value={formStrukTotal} onChange={(e) => setFormStrukTotal(formatRupiah(e.target.value))} placeholder="Total Harga (Rp)" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none" required />
              <label className="border-2 border-dashed border-[#E9EBED] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload size={20} className="text-[#01a684]" />
                <span className="font-bold mt-1 text-[11px] text-[#181b2b]">{isCompressing ? 'Mengompres (<500KB)...' : 'Pilih Foto Struk'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {formStrukPreview && <img src={formStrukPreview} alt="Preview" className="w-full h-20 object-cover rounded-xl" />}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsStrukModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">Batal</button>
                <button type="submit" disabled={isCompressing} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Tambah Bahan Gudang</h3>
            <form onSubmit={handleAddBahan} className="flex flex-col gap-2.5">
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Kelola Kategori</h3>
            <form onSubmit={handleAddKategori} className="flex gap-2">
              <input type="text" value={formKategoriBaru} onChange={(e) => setFormKategoriBaru(e.target.value)} placeholder="Kategori baru..." className="flex-1 bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none" />
              <button type="submit" className="bg-[#01a684] text-white px-3.5 py-2.5 rounded-xl font-bold cursor-pointer shadow-sm">Tambah</button>
            </form>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              {daftarKategori.map(k => (
                <div key={k} className="bg-slate-50 p-2.5 rounded-xl flex justify-between items-center text-xs border border-[#E9EBED]">
                  <span className="font-medium text-[#181b2b]">{k}</span>
                  <button onClick={() => handleDeleteKategori(k)} className="text-red-500 cursor-pointer p-1"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsKategoriModalOpen(false)} className="w-full py-2.5 bg-[#181b2b] text-white rounded-xl font-bold mt-1 cursor-pointer">Selesai</button>
          </div>
        </div>
      )}

      {/* Modal Filter Kategori */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-2 text-xs border border-[#E9EBED]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b] mb-1">Filter Kategori</h3>
            <button onClick={() => { setSelectedKategoriFilter('Semua'); setIsFilterModalOpen(false); }} className="py-2.5 px-3 bg-[#F1F2F6] rounded-xl font-bold text-left cursor-pointer text-[#181b2b]">Semua Kategori</button>
            {daftarKategori.map(k => (
              <button key={k} onClick={() => { setSelectedKategoriFilter(k); setIsFilterModalOpen(false); }} className="py-2.5 px-3 bg-[#F1F2F6] rounded-xl font-bold text-left cursor-pointer text-[#181b2b]">{k}</button>
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