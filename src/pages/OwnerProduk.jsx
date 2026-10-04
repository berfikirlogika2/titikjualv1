import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, AlertTriangle, 
  X, Check, Trash2, Coffee, Edit3, Store, SlidersHorizontal, Settings, Layers, Package,
  TrendingUp, TrendingDown, ShoppingBag, BarChart3, RefreshCw, AlertCircle
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

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

const DEFAULT_10_PRODUK = [
  {
    id: 1,
    nama: 'Caffe Latte Signature',
    kategori: 'Minuman',
    sku: 'SKU-LAT-001',
    tipeStok: 'bahan',
    stokManual: 0,
    stokMin: 5,
    hpp: 12000,
    hargaJual: 22000,
    terjual: 450,
    pakaiVarian: true,
    varian: [
      { id: 101, nama: 'Regular (Hot)', hpp: 8500, hargaJual: 22000 },
      { id: 102, nama: 'Large (Ice)', hpp: 11000, hargaJual: 28000 },
    ],
    resep: [
      { bahanId: 1, nama: 'Biji Kopi Arabika', qty: 0.02 },
      { bahanId: 2, nama: 'Susu Full Cream', qty: 0.15 },
    ],
  },
  {
    id: 2,
    nama: 'Americano Ice',
    kategori: 'Minuman',
    sku: 'SKU-AME-002',
    tipeStok: 'manual',
    stokManual: 50,
    stokMin: 10,
    hpp: 5000,
    hargaJual: 15000,
    terjual: 520,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 3,
    nama: 'Matcha Green Tea Latte',
    kategori: 'Minuman',
    sku: 'SKU-MAT-003',
    tipeStok: 'manual',
    stokManual: 35,
    stokMin: 10,
    hpp: 11000,
    hargaJual: 25000,
    terjual: 380,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 4,
    nama: 'Roti Bakar Coklat Keju',
    kategori: 'Makanan',
    sku: 'SKU-ROT-004',
    tipeStok: 'manual',
    stokManual: 2, // Menipis
    stokMin: 5,
    hpp: 7000,
    hargaJual: 18000,
    terjual: 215,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 5,
    nama: 'Nasi Goreng Spesial',
    kategori: 'Makanan',
    sku: 'SKU-NAS-005',
    tipeStok: 'manual',
    stokManual: 25,
    stokMin: 5,
    hpp: 12000,
    hargaJual: 28000,
    terjual: 310,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 6,
    nama: 'Mie Goreng Telur',
    kategori: 'Makanan',
    sku: 'SKU-MIE-006',
    tipeStok: 'manual',
    stokManual: 3, // Menipis
    stokMin: 5,
    hpp: 8000,
    hargaJual: 18000,
    terjual: 190,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 7,
    nama: 'French Fries',
    kategori: 'Snack & Dessert',
    sku: 'SKU-FRF-007',
    tipeStok: 'manual',
    stokManual: 15,
    stokMin: 5,
    hpp: 6000,
    hargaJual: 15000,
    terjual: 45,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 8,
    nama: 'Pisang Goreng Keju',
    kategori: 'Snack & Dessert',
    sku: 'SKU-PSG-008',
    tipeStok: 'manual',
    stokManual: 8,
    stokMin: 5,
    hpp: 5000,
    hargaJual: 12000,
    terjual: 15,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 9,
    nama: 'Es Teh Manis',
    kategori: 'Minuman',
    sku: 'SKU-TEH-009',
    tipeStok: 'manual',
    stokManual: 100,
    stokMin: 20,
    hpp: 1500,
    hargaJual: 5000,
    terjual: 600,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
  {
    id: 10,
    nama: 'Air Mineral Botol 600ml',
    kategori: 'Barang Retail',
    sku: 'SKU-AIR-010',
    tipeStok: 'manual',
    stokManual: 2, // Menipis
    stokMin: 10,
    hpp: 3000,
    hargaJual: 6000,
    terjual: 8,
    pakaiVarian: false,
    varian: [],
    resep: [],
  },
];

export default function OwnerProduk() {
  const navigate = useNavigate();

  const [masterBahan, setMasterBahan] = useState(() => {
    const saved = localStorage.getItem('pos_master_bahan');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('pos_master_bahan');
      if (saved) setMasterBahan(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const [daftarKategoriProduk, setDaftarKategoriProduk] = useState(() => {
    const saved = localStorage.getItem('pos_kategori_produk');
    if (saved) return JSON.parse(saved);
    return ['Minuman', 'Makanan', 'Snack & Dessert', 'Barang Retail'];
  });

  useEffect(() => {
    localStorage.setItem('pos_kategori_produk', JSON.stringify(daftarKategoriProduk));
  }, [daftarKategoriProduk]);

  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [formKategoriBaru, setFormKategoriBaru] = useState('');
  const [editingKategoriIndex, setEditingKategoriIndex] = useState(null);
  const [editingKategoriText, setEditingKategoriText] = useState('');

  const [produkList, setProdukList] = useState(() => {
    const saved = localStorage.getItem('pos_produk_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          return parsed.map(p => ({ ...p, terjual: p.terjual !== undefined ? p.terjual : Math.floor(Math.random() * 50) }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_10_PRODUK;
  });

  useEffect(() => {
    localStorage.setItem('pos_produk_list', JSON.stringify(produkList));
  }, [produkList]);

  const handleResetDefault10 = () => {
    if (window.confirm('Muat ulang 10 produk sampel bawaan?')) {
      setProdukList(DEFAULT_10_PRODUK);
      localStorage.setItem('pos_produk_list', JSON.stringify(DEFAULT_10_PRODUK));
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('Semua');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  
  // Form State Produk
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState(daftarKategoriProduk[0] || 'Minuman');
  const [formSku, setFormSku] = useState('');
  const [formTipeStok, setFormTipeStok] = useState('bahan');
  const [formStokManual, setFormStokManual] = useState('');
  const [formStokMin, setFormStokMin] = useState('5');
  const [selectedResep, setSelectedResep] = useState([{ bahanId: '', qty: '' }]);
  const [formHpp, setFormHpp] = useState('');
  const [formHargaJual, setFormHargaJual] = useState('');
  const [formPakaiVarian, setFormPakaiVarian] = useState(false);
  const [formVarianList, setFormVarianList] = useState([{ id: Date.now(), nama: '', hpp: '', hargaJual: '' }]);

  // --- LOGIK RANKING & STOK MENIPIS ---
  const sortedByTerjualDesc = [...produkList].sort((a, b) => (b.terjual || 0) - (a.terjual || 0));
  const top5Terlaris = sortedByTerjualDesc.slice(0, 5);
  const maxTerlarisQty = top5Terlaris.length > 0 ? (top5Terlaris[0].terjual || 1) : 1;

  const sortedByTerjualAsc = [...produkList].sort((a, b) => (a.terjual || 0) - (b.terjual || 0));
  const top3KurangMinat = sortedByTerjualAsc.slice(0, 3);
  const maxKurangMinatQty = top3KurangMinat.length > 0 ? Math.max(...top3KurangMinat.map(p => p.terjual || 0), 1) : 1;

  const evaluasiStatusProduk = (produk) => {
    if (produk.tipeStok === 'manual') {
      const isHabis = produk.stokManual <= 0;
      const isMin = produk.stokManual <= (produk.stokMin || 5);
      return { isHabis, isMin, penyebab: isHabis ? 'Stok manual habis' : isMin ? 'Stok manual menipis' : null };
    }
    for (let r of produk.resep) {
      const master = masterBahan.find(mb => mb.id === r.bahanId);
      if (!master || master.stok <= 0) {
        return { isHabis: true, isMin: true, penyebab: `Bahan "${master ? master.nama : 'Bahan'}" kosong di gudang` };
      }
    }
    return { isHabis: false, isMin: false, penyebab: null };
  };

  const daftarStokMenipis = produkList.filter(p => {
    const status = evaluasiStatusProduk(p);
    return status.isHabis || status.isMin;
  });
  // ------------------------------------

  const handleSimulasiPenjualan = (id) => {
    setProdukList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, terjual: (p.terjual || 0) + 1 };
      }
      return p;
    }));
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setActiveProductId(null);
    setFormNama('');
    setFormKategori(daftarKategoriProduk[0] || 'Minuman');
    setFormSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setFormTipeStok('bahan');
    setFormStokManual('');
    setFormStokMin('5');
    setSelectedResep([{ bahanId: '', qty: '' }]);
    setFormHpp('');
    setFormHargaJual('');
    setFormPakaiVarian(false);
    setFormVarianList([{ id: Date.now(), nama: '', hpp: '', hargaJual: '' }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (produk) => {
    setIsEditMode(true);
    setActiveProductId(produk.id);
    setFormNama(produk.nama);
    setFormKategori(produk.kategori);
    setFormSku(produk.sku || `SKU-${produk.id}`);
    setFormTipeStok(produk.tipeStok || 'bahan');
    setFormStokManual(produk.stokManual !== undefined ? produk.stokManual.toString() : '');
    setFormStokMin(produk.stokMin !== undefined ? produk.stokMin.toString() : '5');
    setSelectedResep(produk.resep && produk.resep.length > 0 ? produk.resep.map(r => ({ bahanId: r.bahanId, qty: r.qty })) : [{ bahanId: '', qty: '' }]);
    setFormHpp(produk.hpp ? formatRupiah(produk.hpp) : '');
    setFormHargaJual(produk.hargaJual ? formatRupiah(produk.hargaJual) : '');
    setFormPakaiVarian(produk.pakaiVarian || false);
    setFormVarianList(produk.varian && produk.varian.length > 0 ? produk.varian.map(v => ({ id: v.id || Date.now() + Math.random(), nama: v.nama, hpp: formatRupiah(v.hpp), hargaJual: formatRupiah(v.hargaJual) })) : [{ id: Date.now(), nama: '', hpp: '', hargaJual: '' }]);
    setIsModalOpen(true);
  };

  const handleAddKategori = (e) => {
    e.preventDefault();
    if (!formKategoriBaru.trim()) return;
    if (daftarKategoriProduk.includes(formKategoriBaru)) {
      alert('Kategori sudah ada!');
      return;
    }
    setDaftarKategoriProduk([...daftarKategoriProduk, formKategoriBaru]);
    setFormKategoriBaru('');
  };

  const handleDeleteKategori = (katTarget) => {
    if (daftarKategoriProduk.length <= 1) {
      alert('Minimal harus ada 1 kategori produk!');
      return;
    }
    if (window.confirm(`Hapus kategori "${katTarget}"?`)) {
      setDaftarKategoriProduk(daftarKategoriProduk.filter(k => k !== katTarget));
      if (selectedKategoriFilter === katTarget) setSelectedKategoriFilter('Semua');
      if (formKategori === katTarget) setFormKategori(daftarKategoriProduk[0]);
    }
  };

  const handleStartEditKategori = (index, kat) => {
    setEditingKategoriIndex(index);
    setEditingKategoriText(kat);
  };

  const handleSaveEditKategori = (oldKat) => {
    if (!editingKategoriText.trim()) return;
    const updated = daftarKategoriProduk.map(k => (k === oldKat ? editingKategoriText : k));
    setDaftarKategoriProduk(updated);
    setEditingKategoriIndex(null);
    setEditingKategoriText('');
  };

  const handleAddResepRow = () => setSelectedResep([...selectedResep, { bahanId: '', qty: '' }]);
  const handleResepChange = (i, field, val) => {
    const updated = [...selectedResep];
    updated[i][field] = val;
    setSelectedResep(updated);
  };
  const handleRemoveResepRow = (i) => {
    setSelectedResep(selectedResep.filter((_, idx) => idx !== i));
  };

  const handleAddVarianRow = () => setFormVarianList([...formVarianList, { id: Date.now(), nama: '', hpp: '', hargaJual: '' }]);
  const handleVarianChange = (i, field, val) => {
    const updated = [...formVarianList];
    updated[i][field] = val;
    setFormVarianList(updated);
  };
  const handleRemoveVarianRow = (i) => {
    setFormVarianList(formVarianList.filter((_, idx) => idx !== i));
  };

  const handleSaveProduk = (e) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    let formattedResep = [];
    if (formTipeStok === 'bahan') {
      formattedResep = selectedResep.filter(r => r.bahanId).map(r => {
        const b = masterBahan.find(mb => mb.id === parseInt(r.bahanId));
        return { bahanId: parseInt(r.bahanId), nama: b ? b.nama : 'Bahan', qty: parseFloat(r.qty) || 0 };
      });
    }

    const processedVarian = formPakaiVarian ? formVarianList.map(v => ({
      id: v.id || Date.now(),
      nama: v.nama,
      hpp: parseRupiah(v.hpp),
      hargaJual: parseRupiah(v.hargaJual)
    })) : [];

    if (isEditMode) {
      setProdukList(produkList.map(p => {
        if (p.id === activeProductId) {
          return {
            ...p,
            nama: formNama,
            kategori: formKategori,
            sku: formSku || p.sku,
            tipeStok: formTipeStok,
            stokManual: formTipeStok === 'manual' ? parseFloat(formStokManual) || 0 : 0,
            stokMin: parseFloat(formStokMin) || 5,
            hpp: !formPakaiVarian ? parseRupiah(formHpp) : 0,
            hargaJual: !formPakaiVarian ? parseRupiah(formHargaJual) : 0,
            pakaiVarian: formPakaiVarian,
            varian: processedVarian,
            resep: formattedResep
          };
        }
        return p;
      }));
      alert('Produk berhasil diperbarui!');
    } else {
      const newProduk = {
        id: Date.now(),
        nama: formNama,
        kategori: formKategori,
        sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        tipeStok: formTipeStok,
        stokManual: formTipeStok === 'manual' ? parseFloat(formStokManual) || 0 : 0,
        stokMin: parseFloat(formStokMin) || 5,
        hpp: !formPakaiVarian ? parseRupiah(formHpp) : 0,
        hargaJual: !formPakaiVarian ? parseRupiah(formHargaJual) : 0,
        terjual: 0,
        pakaiVarian: formPakaiVarian,
        varian: processedVarian,
        resep: formattedResep
      };
      setProdukList([newProduk, ...produkList]);
      alert('Menu produk baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduk = (id, nama) => {
    if (window.confirm(`Hapus menu produk "${nama}" dari sistem?`)) {
      setProdukList(produkList.filter(p => p.id !== id));
    }
  };

  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchKat = selectedKategoriFilter === 'Semua' || p.kategori === selectedKategoriFilter;
    return matchSearch && matchKat;
  });

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 font-sans antialiased relative">
      
      {/* HEADER PRESISI */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 pt-[env(safe-area-inset-top)]">
        <div className="h-14 flex items-center justify-between relative">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Produk & Resep
          </h1>

          <div className="flex items-center gap-1">
            <button 
              onClick={handleResetDefault10}
              className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer shrink-0"
              title="Reset 10 Produk Sampel"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setIsKategoriModalOpen(true)} 
              className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
              title="Kelola Kategori"
            >
              <Store size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO BANNER KOTAK PALING ATAS (MENGGABUNGKAN HERO + CHART TOP 5 & TOP 3) */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#181b2b] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col gap-4">
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-10 text-emerald-300 transform rotate-[-12deg]">
            <svg viewBox="0 0 100 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-52 h-52">
              <rect x="5" y="18" width="90" height="35" rx="5" stroke="currentColor" strokeWidth="5"/>
              <path d="M5 58H95" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <rect x="58" y="2" width="22" height="13" rx="3" stroke="currentColor" strokeWidth="3.5"/>
              <path d="M69 15V18" stroke="currentColor" strokeWidth="3.5"/>
            </svg>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Coffee size={12} /> ANALITIK KATALOG & MENU
              </span>
              <h2 className="text-base font-black tracking-tight mt-0.5">Performa Produk Jualan</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-200">
              {produkList.length} Total Menu
            </div>
          </div>

          {/* INTERNAL CHART: TOP 5 TERLARIS DI DALAM BANNER */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <TrendingUp size={14} /> Top 5 Produk Terlaris
              </div>
              <span className="text-[9px] text-slate-300 uppercase">Porsi Terjual</span>
            </div>
            <div className="flex flex-col gap-2 pt-0.5">
              {top5Terlaris.map((p, idx) => {
                const qty = p.terjual || 0;
                const percent = Math.round((qty / maxTerlarisQty) * 100);
                return (
                  <div key={p.id} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                        {idx + 1}. {p.nama}
                      </span>
                      <span className="font-black text-emerald-400 tabular-nums">{qty}</span>
                    </div>
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(percent, 10)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERNAL CHART: TOP 3 KURANG MINAT DI DALAM BANNER */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <TrendingDown size={14} /> Top 3 Kurang Minat
              </div>
              <span className="text-[9px] text-slate-300 uppercase">Porsi Terjual</span>
            </div>
            <div className="flex flex-col gap-2 pt-0.5">
              {top3KurangMinat.map((p, idx) => {
                const qty = p.terjual || 0;
                const percent = Math.round((qty / (maxKurangMinatQty || 1)) * 100);
                return (
                  <div key={p.id} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                        {idx + 1}. {p.nama}
                      </span>
                      <span className="font-black text-rose-400 tabular-nums">{qty}</span>
                    </div>
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(percent, 12)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION: ALERT STOK MENIPIS / HABIS */}
        {daftarStokMenipis.length > 0 && (
          <section className="bg-amber-50 border border-amber-200/80 rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle size={16} className="text-amber-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Perhatian: Produk Stok Menipis ({daftarStokMenipis.length})</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {daftarStokMenipis.map(p => {
                const status = evaluasiStatusProduk(p);
                return (
                  <div key={p.id} className="bg-white px-3 py-2 rounded-2xl border border-amber-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{p.nama}</span>
                      <span className="text-[10px] text-amber-600 font-medium">
                        {status.penyebab} (Sisa: <strong>{p.stokManual}</strong>)
                      </span>
                    </div>
                    <button 
                      onClick={() => handleOpenEditModal(p)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Restock
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SEARCH & FILTER */}
        <section className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86899B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu produk atau SKU..." 
              className="w-full bg-white/70 border border-white/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#181b2b] outline-none shadow-sm focus:bg-white"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-white/70 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl px-3.5 py-2.5 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-white"
          >
            <SlidersHorizontal size={16} className="text-[#01a684]" />
            {selectedKategoriFilter !== 'Semua' && <span className="w-2 h-2 rounded-full bg-[#01a684]" />}
          </button>
        </section>

        <button onClick={handleOpenAddModal} className="w-full bg-[#01a684] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-xs shadow-sm cursor-pointer hover:opacity-90 transition-all">
          <Plus size={16} /> Tambah Menu & Resep Terintegrasi
        </button>

        {/* HEADER DAFTAR PRODUK */}
        <div className="flex justify-between items-end mt-2">
          <h2 className="font-bold text-xs uppercase text-[#181b2b] tracking-wider">Katalog Produk</h2>
          <span className="text-[10px] text-[#86899B] font-bold">{filteredProduk.length} Item Ditampilkan</span>
        </div>

        {/* DAFTAR KARTU PRODUK */}
        <div className="flex flex-col gap-3">
          {filteredProduk.map((produk) => {
            const { isHabis, isMin, penyebab } = evaluasiStatusProduk(produk);
            const margin = !produk.pakaiVarian && produk.hargaJual > 0 ? Math.round(((produk.hargaJual - (produk.hpp || 0)) / produk.hargaJual) * 100) : null;

            return (
              <div key={produk.id} className="bg-white rounded-3xl p-4 border border-[#E9EBED] shadow-sm flex flex-col gap-3 relative">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${isHabis ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-[#01a684]'}`}>
                      <Coffee size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#181b2b]">{produk.nama}</h4>
                        {isHabis && (
                          <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle size={10} /> Habis
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[#86899B] bg-slate-100 px-2 py-0.5 rounded-md font-medium">{produk.kategori}</span>
                        <span className="text-[9px] font-mono text-slate-400">{produk.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleSimulasiPenjualan(produk.id)}
                      className="h-8 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#01a684] flex items-center gap-1 font-bold text-[10px] transition-colors cursor-pointer"
                      title="Simulasi Penjualan (+1)"
                    >
                      <ShoppingBag size={13} /> +Terjual
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(produk)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#01a684] flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Produk"
                    >
                      <Settings size={15} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduk(produk.id, produk.nama)}
                      className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {isHabis && penyebab && (
                  <div className="bg-red-50 text-red-600 text-[10px] px-3 py-1.5 rounded-xl border border-red-200 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Sebab Habis: <strong>{penyebab}</strong>
                  </div>
                )}

                {!produk.pakaiVarian && (
                  <div className="bg-[#F1F2F6]/80 p-3 rounded-2xl grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">HPP (Modal)</span>
                      <span className="font-bold text-slate-700">Rp {formatRupiah(produk.hpp || 0)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Harga Jual</span>
                      <span className="font-bold text-[#01a684]">Rp {formatRupiah(produk.hargaJual || 0)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Est. Margin</span>
                      <span className="font-bold text-indigo-600">{margin !== null ? `${margin}%` : '-'}</span>
                    </div>
                  </div>
                )}

                {produk.pakaiVarian && produk.varian && produk.varian.length > 0 && (
                  <div className="bg-[#F1F2F6]/80 p-3 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Layers size={11} /> Varian & Harga Spesifik ({produk.varian.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {produk.varian.map((v, i) => (
                        <div key={i} className="bg-white border border-[#E9EBED] px-3 py-2 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{v.nama}</span>
                          <div className="flex gap-3 text-[11px]">
                            <span className="text-slate-400">Modal: Rp {formatRupiah(v.hpp)}</span>
                            <span className="font-bold text-[#01a684]">Jual: Rp {formatRupiah(v.hargaJual)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-[#E9EBED]/50 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Package size={13} className="text-slate-400" />
                    {produk.tipeStok === 'bahan' ? (
                      <span>Resep Bahan: <strong>{produk.resep.length} item terhubung</strong></span>
                    ) : (
                      <span>Stok Manual: <strong className={isMin ? 'text-red-600' : 'text-slate-800'}>{produk.stokManual} Unit</strong></span>
                    )}
                  </div>

                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                    Total Terjual: {produk.terjual || 0}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL KATEGORI */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Kelola Kategori Produk</h3>
              <button onClick={() => setIsKategoriModalOpen(false)} className="text-[#86899B] hover:text-[#181b2b]"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddKategori} className="flex gap-2">
              <input type="text" value={formKategoriBaru} onChange={(e) => setFormKategoriBaru(e.target.value)} placeholder="Nama kategori baru..." className="flex-1 bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-[#01a684]" />
              <button type="submit" className="bg-[#01a684] text-white px-3.5 py-2.5 rounded-xl font-bold cursor-pointer shadow-sm">Tambah</button>
            </form>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto mt-1 border-t border-[#E9EBED] pt-2">
              {daftarKategoriProduk.map((kat, idx) => (
                <div key={idx} className="bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold text-[#181b2b] flex justify-between items-center border border-[#E9EBED]">
                  {editingKategoriIndex === idx ? (
                    <div className="flex flex-1 gap-1 mr-2">
                      <input type="text" value={editingKategoriText} onChange={(e) => setEditingKategoriText(e.target.value)} className="flex-1 bg-white border border-[#01a684] rounded-lg px-2 py-1 text-xs outline-none font-bold" />
                      <button type="button" onClick={() => handleSaveEditKategori(kat)} className="text-[#01a684] font-bold px-1">Simpan</button>
                    </div>
                  ) : (
                    <span className="truncate">{kat}</span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    {editingKategoriIndex !== idx && (
                      <button onClick={() => handleStartEditKategori(idx, kat)} className="text-slate-400 hover:text-[#01a684] p-1 cursor-pointer"><Edit3 size={13} /></button>
                    )}
                    <button onClick={() => handleDeleteKategori(kat)} className="text-red-400 hover:text-red-600 p-1 cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsKategoriModalOpen(false)} className="w-full py-2.5 bg-[#181b2b] text-white rounded-xl font-bold mt-1 cursor-pointer">Selesai</button>
          </div>
        </div>
      )}

      {/* MODAL FILTER */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-2 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Filter Kategori</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-[#86899B]"><X size={16} /></button>
            </div>
            <button onClick={() => { setSelectedKategoriFilter('Semua'); setIsFilterModalOpen(false); }} className={`py-2.5 px-3 rounded-xl font-bold text-left cursor-pointer flex justify-between items-center ${selectedKategoriFilter === 'Semua' ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}>
              <span>Semua Kategori</span>{selectedKategoriFilter === 'Semua' && <Check size={14} />}
            </button>
            {daftarKategoriProduk.map(k => (
              <button key={k} onClick={() => { setSelectedKategoriFilter(k); setIsFilterModalOpen(false); }} className={`py-2.5 px-3 rounded-xl font-bold text-left cursor-pointer flex justify-between items-center ${selectedKategoriFilter === k ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}>
                <span>{k}</span>{selectedKategoriFilter === k && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-3 text-xs max-h-[90vh] overflow-y-auto border border-[#E9EBED]">
            <div className="flex justify-between items-center border-b border-[#E9EBED] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">{isEditMode ? 'Edit Pengaturan Menu Produk' : 'Tambah Menu & Resep Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProduk} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b]">Nama Menu Produk</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Kopi Susu Gula Aren" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b]">Kategori</label>
                  <select value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-[#01a684]">
                    {daftarKategoriProduk.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b]">SKU / Barcode</label>
                  <input type="text" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="SKU-001" className="bg-[#F1F2F6] rounded-xl p-2.5 font-mono outline-none focus:ring-2 focus:ring-[#01a684]" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b]">Sumber Pengurangan Stok</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setFormTipeStok('bahan')} className={`py-2 rounded-xl font-bold text-[11px] border cursor-pointer ${formTipeStok === 'bahan' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Resep Bahan Baku</button>
                  <button type="button" onClick={() => setFormTipeStok('manual')} className={`py-2 rounded-xl font-bold text-[11px] border cursor-pointer ${formTipeStok === 'manual' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Stok Manual</button>
                </div>
              </div>
              {formTipeStok === 'bahan' && (
                <div className="flex flex-col gap-2 bg-[#F1F2F6] p-3 rounded-2xl border border-[#E9EBED]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#181b2b]">Pilih Bahan dari Gudang</span>
                    <button type="button" onClick={handleAddResepRow} className="text-[#01a684] font-bold cursor-pointer">+ Bahan</button>
                  </div>
                  {selectedResep.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={item.bahanId} onChange={(e) => handleResepChange(idx, 'bahanId', e.target.value)} className="flex-1 bg-white rounded-xl p-2 text-[11px] border border-[#E9EBED] outline-none" required>
                        <option value="">Pilih Bahan...</option>
                        {masterBahan.map(mb => (<option key={mb.id} value={mb.id}>{mb.nama} (Sisa: {mb.stok} {mb.satuan})</option>))}
                      </select>
                      <input type="number" step="0.01" value={item.qty} onChange={(e) => handleResepChange(idx, 'qty', e.target.value)} placeholder="Qty" className="w-16 bg-white rounded-xl p-2 text-[11px] border border-[#E9EBED] text-center font-bold outline-none" required />
                      {selectedResep.length > 1 && (<button type="button" onClick={() => handleRemoveResepRow(idx)} className="text-red-400 p-1"><Trash2 size={14} /></button>)}
                    </div>
                  ))}
                </div>
              )}
              {formTipeStok === 'manual' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#181b2b]">Stok Awal</label>
                    <input type="number" value={formStokManual} onChange={(e) => setFormStokManual(e.target.value)} placeholder="50" className="bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#181b2b]">Alert Minimum</label>
                    <input type="number" value={formStokMin} onChange={(e) => setFormStokMin(e.target.value)} placeholder="5" className="bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" />
                  </div>
                </div>
              )}
              {!formPakaiVarian && (
                <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-800">Harga HPP (Modal)</label>
                    <input type="text" value={formHpp} onChange={(e) => setFormHpp(formatRupiah(e.target.value))} placeholder="10.000" className="bg-white rounded-xl p-2.5 font-bold outline-none border border-emerald-200" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-800">Harga Jual (Retail)</label>
                    <input type="text" value={formHargaJual} onChange={(e) => setFormHargaJual(formatRupiah(e.target.value))} placeholder="20.000" className="bg-white rounded-xl p-2.5 font-bold text-[#01a684] outline-none border border-emerald-200" />
                  </div>
                </div>
              )}
              <div className="pt-1 border-t border-[#E9EBED]">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-[#E9EBED] cursor-pointer">
                  <input type="checkbox" checked={formPakaiVarian} onChange={(e) => setFormPakaiVarian(e.target.checked)} className="w-4 h-4 accent-[#01a684] rounded cursor-pointer" />
                  <div>
                    <span className="font-bold text-[#181b2b] block">Produk Ini Memiliki Varian</span>
                    <span className="text-[9px] text-slate-400">Atur HPP dan Harga Jual spesifik per varian ukuran/rasa</span>
                  </div>
                </label>
              </div>
              {formPakaiVarian && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-[#E9EBED] flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#01a684] uppercase text-[10px]">Daftar Varian & Harga:</span>
                    <button type="button" onClick={handleAddVarianRow} className="text-[#01a684] font-bold cursor-pointer text-[11px]">+ Varian</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {formVarianList.map((v, idx) => (
                      <div key={v.id || idx} className="bg-white border border-[#E9EBED] p-2.5 rounded-xl flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <input type="text" value={v.nama} onChange={(e) => handleVarianChange(idx, 'nama', e.target.value)} placeholder="Nama Varian" className="flex-1 bg-[#F1F2F6] rounded-xl px-2.5 py-2 text-xs font-bold outline-none" required />
                          {formVarianList.length > 1 && (<button type="button" onClick={() => handleRemoveVarianRow(idx)} className="text-red-400 p-1"><Trash2 size={14} /></button>)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={v.hpp} onChange={(e) => handleVarianChange(idx, 'hpp', formatRupiah(e.target.value))} placeholder="HPP (Modal)" className="bg-[#F1F2F6] rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none" />
                          <input type="text" value={v.hargaJual} onChange={(e) => handleVarianChange(idx, 'hargaJual', formatRupiah(e.target.value))} placeholder="Harga Jual" className="bg-[#F1F2F6] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#01a684] outline-none" required />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm">{isEditMode ? 'Simpan Perubahan' : 'Simpan Menu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}