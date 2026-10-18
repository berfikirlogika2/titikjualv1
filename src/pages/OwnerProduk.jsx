import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, AlertTriangle, 
  X, Check, Trash2, Coffee, Edit3, Store, SlidersHorizontal, Settings, Layers, Package,
  TrendingUp, TrendingDown, RefreshCw, AlertCircle, ScanBarcode, Camera 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
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

export default function OwnerProduk() {
  const navigate = useNavigate();

  const [masterBahan, setMasterBahan] = useState([]);
  const [daftarKategoriProduk, setDaftarKategoriProduk] = useState(['Minuman', 'Makanan', 'Snack & Dessert', 'Barang Retail']);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  const fetchMasterBahan = async () => {
    try {
      const currentOwnerId = getOwnerId();
      const { data } = await supabase.from('ingredients').select('*').eq('owner_id', currentOwnerId);
      if (data) {
        setMasterBahan(data.map(item => ({ id: item.id, nama: item.nama, stok: Number(item.stok), satuan: item.satuan || 'kg' })));
      }
    } catch (err) {
      console.error('Gagal mengambil bahan:', err.message);
    }
  };

  const fetchKategoriProduk = async () => {
    try {
      const currentOwnerId = getOwnerId();
      const { data } = await supabase.from('product_categories').select('*').eq('owner_id', currentOwnerId);
      if (data && data.length > 0) {
        setDaftarKategoriProduk(data.map(item => item.nama_kategori));
      }
    } catch (err) {
      console.error('Gagal mengambil kategori:', err.message);
    }
  };

  const fetchProduk = async () => {
    setLoading(true);
    try {
      const currentOwnerId = getOwnerId();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProdukList(data.map(item => ({
          id: item.id,
          nama: item.nama,
          kategori: item.kategori,
          sku: item.sku || '-',
          tipeStok: item.tipe_stok || 'bahan',
          stokManual: Number(item.stok_manual || 0),
          stokMin: Number(item.stok_min || 5),
          hpp: Number(item.hpp || 0),
          hargaJual: Number(item.harga_jual || 0),
          terjual: Number(item.terjual || 0),
          pakaiVarian: Boolean(item.pakai_varian),
          varian: item.varian || [],
          resep: item.resep || []
        })));
      }
    } catch (err) {
      console.error('Gagal memuat produk:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterBahan();
    fetchKategoriProduk();
    fetchProduk();
  }, []);

  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [formKategoriBaru, setFormKategoriBaru] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('Semua');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Kamera & Scanner Barcode HP
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

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
  
  const [formVarianList, setFormVarianList] = useState([
    { 
      id: Date.now(), 
      nama: '', 
      hpp: '', 
      hargaJual: '', 
      resepVarian: [{ bahanId: '', qty: '' }] 
    }
  ]);

  const startCamera = async () => {
    setIsScannerOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Tidak dapat mengakses kamera:', err);
      alert('Gagal mengakses kamera perangkat.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScannerOpen(false);
  };

  const handleCaptureBarcode = () => {
    const mockBarcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
    setFormSku(mockBarcode);
    stopCamera();
    alert(`Berhasil memindai Barcode: ${mockBarcode}`);
  };

  // --- ANALITIK ---
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
    setFormVarianList([{ id: Date.now(), nama: '', hpp: '', hargaJual: '', resepVarian: [{ bahanId: '', qty: '' }] }]);
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
    setFormVarianList(produk.varian && produk.varian.length > 0 ? produk.varian.map(v => ({ 
      id: v.id || Date.now() + Math.random(), 
      nama: v.nama, 
      hpp: formatRupiah(v.hpp), 
      hargaJual: formatRupiah(v.hargaJual),
      resepVarian: v.resepVarian || [{ bahanId: '', qty: '' }]
    })) : [{ id: Date.now(), nama: '', hpp: '', hargaJual: '', resepVarian: [{ bahanId: '', qty: '' }] }]);
    setIsModalOpen(true);
  };

  const handleAddKategori = async (e) => {
    e.preventDefault();
    if (!formKategoriBaru.trim()) return;
    if (daftarKategoriProduk.includes(formKategoriBaru)) {
      alert('Kategori sudah ada!');
      return;
    }
    try {
      const currentOwnerId = getOwnerId();
      const { error } = await supabase.from('product_categories').insert([{ owner_id: currentOwnerId, nama_kategori: formKategoriBaru.trim() }]);
      if (error) throw error;
      setDaftarKategoriProduk([...daftarKategoriProduk, formKategoriBaru.trim()]);
      setFormKategoriBaru('');
    } catch (err) {
      console.error('Gagal tambah kategori:', err.message);
    }
  };

  const handleDeleteKategori = async (katTarget) => {
    if (daftarKategoriProduk.length <= 1) {
      alert('Minimal harus ada 1 kategori produk!');
      return;
    }
    if (window.confirm(`Hapus kategori "${katTarget}"?`)) {
      try {
        const currentOwnerId = getOwnerId();
        const { error } = await supabase.from('product_categories').delete().eq('owner_id', currentOwnerId).eq('nama_kategori', katTarget);
        if (error) throw error;
        setDaftarKategoriProduk(daftarKategoriProduk.filter(k => k !== katTarget));
        if (selectedKategoriFilter === katTarget) setSelectedKategoriFilter('Semua');
        if (formKategori === katTarget) setFormKategori(daftarKategoriProduk[0]);
      } catch (err) {
        console.error('Gagal hapus kategori:', err.message);
      }
    }
  };

  const handleSaveProduk = async (e) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    setIsSubmitting(true);
    try {
      const currentOwnerId = getOwnerId();
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
        owner_id: currentOwnerId,
        nama: formNama,
        kategori: formKategori,
        sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        tipe_stok: formTipeStok,
        stok_manual: formTipeStok === 'manual' ? parseFloat(formStokManual) || 0 : 0,
        stok_min: parseFloat(formStokMin) || 5,
        hpp: !formPakaiVarian ? parseRupiah(formHpp) : 0,
        harga_jual: !formPakaiVarian ? parseRupiah(formHargaJual) : 0,
        pakai_varian: formPakaiVarian,
        varian: processedVarian,
        resep: formattedResep
      };

      if (isEditMode) {
        const { error } = await supabase.from('products').update(payload).eq('id', activeProductId);
        if (error) throw error;
        alert('Produk berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        alert('Menu produk baru berhasil ditambahkan!');
      }

      setIsModalOpen(false);
      fetchProduk();
    } catch (err) {
      console.error('Gagal menyimpan produk:', err.message);
      alert('Gagal menyimpan produk ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduk = async (id, nama) => {
    if (window.confirm(`Hapus menu produk "${nama}" dari sistem?`)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProdukList(produkList.filter(p => p.id !== id));
      } catch (err) {
        console.error('Gagal hapus produk:', err.message);
      }
    }
  };

  const filteredProduk = produkList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchKat = selectedKategoriFilter === 'Semua' || p.kategori === selectedKategoriFilter;
    return matchSearch && matchKat;
  });

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-32 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER COMPACT */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <h1 className="text-[11px] lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Produk & Resep
          </h1>

          <div className="w-8 h-8" />
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="p-3 lg:p-8 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">

        {/* HERO BANNER BERSIH TANPA WATERMARK */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#181b2b] text-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-md relative overflow-hidden flex flex-col gap-3">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[9px] lg:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Coffee size={11} /> ANALITIK KATALOG & MENU
              </span>
              <h2 className="text-sm lg:text-2xl font-black tracking-tight mt-0.5">Performa Produk Jualan</h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] lg:text-xs font-bold text-slate-200">
              {produkList.length} Menu
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* TOP 5 TERLARIS */}
            <div className="bg-white/10 backdrop-blur-md p-2.5 lg:p-4 rounded-xl border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] lg:text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1"><TrendingUp size={13} /> Top 5 Terlaris</span>
                <span>Porsi</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {top5Terlaris.map((p, idx) => {
                  const qty = p.terjual || 0;
                  const percent = Math.round((qty / maxTerlarisQty) * 100);
                  return (
                    <div key={p.id} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[10px] lg:text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[150px] lg:max-w-xs">{idx + 1}. {p.nama}</span>
                        <span className="font-black text-emerald-400 tabular-nums">{qty}</span>
                      </div>
                      <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.max(percent, 10)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOP 3 KURANG MINAT */}
            <div className="bg-white/10 backdrop-blur-md p-2.5 lg:p-4 rounded-xl border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] lg:text-xs text-rose-400 font-bold">
                <span className="flex items-center gap-1"><TrendingDown size={13} /> Top 3 Kurang Minat</span>
                <span>Porsi</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {top3KurangMinat.map((p, idx) => {
                  const qty = p.terjual || 0;
                  const percent = Math.round((qty / (maxKurangMinatQty || 1)) * 100);
                  return (
                    <div key={p.id} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[10px] lg:text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[150px] lg:max-w-xs">{idx + 1}. {p.nama}</span>
                        <span className="font-black text-rose-400 tabular-nums">{qty}</span>
                      </div>
                      <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${Math.max(percent, 12)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ALERT STOK MENIPIS */}
        {daftarStokMenipis.length > 0 && (
          <section className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
              <AlertCircle size={14} className="text-amber-600" />
              <span>Perhatian: Produk Stok Menipis ({daftarStokMenipis.length})</span>
            </div>
            <div className="flex flex-col gap-1">
              {daftarStokMenipis.map(p => {
                const status = evaluasiStatusProduk(p);
                return (
                  <div key={p.id} className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-100 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800">{p.nama}</span>
                      <span className="text-[9px] text-amber-600 block">{status.penyebab} (Sisa: {p.stokManual})</span>
                    </div>
                    <button onClick={() => handleOpenEditModal(p)} className="px-2 py-1 bg-amber-500 text-white rounded-lg font-bold text-[9px] cursor-pointer">Restock</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SEARCH & FILTER */}
        <section className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86899B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu produk atau SKU..." 
              className="w-full bg-white/75 border border-white/90 rounded-xl pl-9 pr-3 py-2 text-[11px] lg:text-xs font-medium outline-none shadow-xs focus:bg-white"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-white/75 backdrop-blur-md border border-white/90 shadow-xs rounded-xl px-3.5 py-2 text-[11px] lg:text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-white shrink-0 text-[#181b2b]"
          >
            <SlidersHorizontal size={14} className="text-[#01a684]" />
            <span>Kategori</span>
            {selectedKategoriFilter !== 'Semua' && <span className="w-1.5 h-1.5 rounded-full bg-[#01a684]" />}
          </button>
        </section>

        <button onClick={handleOpenAddModal} className="w-full bg-[#01a684] text-white rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-[11px] lg:text-xs shadow-xs cursor-pointer hover:opacity-90 transition-all">
          <Plus size={15} /> Tambah Menu & Resep Terintegrasi
        </button>

        {/* HEADER DAFTAR */}
        <div className="flex justify-between items-end mt-1">
          <h2 className="font-bold text-[11px] lg:text-xs uppercase text-[#181b2b] tracking-wider">Katalog Produk</h2>
          <span className="text-[9px] lg:text-[10px] text-[#86899B] font-bold">{filteredProduk.length} Item</span>
        </div>

        {/* GRID KARTU PRODUK */}
        {loading ? (
          <p className="text-xs text-center text-[#86899B] py-8">Memuat katalog produk...</p>
        ) : filteredProduk.length === 0 ? (
          <div className="text-center text-xs text-[#86899B] py-8 bg-white/60 rounded-2xl border border-white/80">Belum ada produk terdaftar di Supabase.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
            {filteredProduk.map((produk) => {
              const { isHabis, isMin, penyebab } = evaluasiStatusProduk(produk);
              const margin = !produk.pakaiVarian && produk.hargaJual > 0 ? Math.round(((produk.hargaJual - (produk.hpp || 0)) / produk.hargaJual) * 100) : null;

              return (
                <div key={produk.id} className="bg-white rounded-xl border border-[#E9EBED] p-2.5 shadow-2xs flex flex-col justify-between gap-2 relative">
                  
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 truncate">
                        <h4 className="text-[11px] font-bold text-[#181b2b] truncate">{produk.nama}</h4>
                        {isHabis && <span className="bg-red-50 text-red-600 text-[8px] font-bold px-1 rounded shrink-0">Habis</span>}
                      </div>
                      <span className="text-[8px] text-[#86899B] bg-slate-100 px-1.5 py-0.2 rounded font-medium mt-0.5 inline-block truncate max-w-[120px]">{produk.kategori}</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button 
                        onClick={() => handleOpenEditModal(produk)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#01a684] flex items-center justify-center cursor-pointer"
                        title="Edit"
                      >
                        <Settings size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduk(produk.id, produk.nama)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {!produk.pakaiVarian && (
                    <div className="bg-[#F1F2F6]/70 p-2 rounded-lg grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-[7px] font-bold text-slate-400 block uppercase">HPP / Jual</span>
                        <span className="font-bold text-slate-700">Rp {formatRupiah(produk.hpp || 0)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] font-bold text-slate-400 block uppercase">Margin</span>
                        <span className="font-bold text-[#01a684]">{margin !== null ? `${margin}%` : '-'}</span>
                      </div>
                    </div>
                  )}

                  {produk.pakaiVarian && produk.varian && produk.varian.length > 0 && (
                    <div className="bg-[#F1F2F6]/70 p-2 rounded-lg flex flex-col gap-1 text-[10px]">
                      <span className="text-[7px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <Layers size={9} /> Varian ({produk.varian.length}):
                      </span>
                      {produk.varian.map((v, i) => (
                        <div key={i} className="flex justify-between items-center bg-white px-2 py-1 rounded border border-[#E9EBED] text-[10px]">
                          <span className="font-bold text-slate-800 truncate max-w-[80px]">{v.nama}</span>
                          <span className="font-bold text-[#01a684]">Rp {formatRupiah(v.hargaJual)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-[#E9EBED]/50 text-[9px]">
                    <span className="text-slate-500 truncate max-w-[100px]">
                      {produk.tipeStok === 'bahan' ? `Resep: ${produk.resep.length} bhn` : `Stok: ${produk.stokManual}`}
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                      Terjual: {produk.terjual || 0}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL FILTER KATEGORI */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-2.5 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Filter Kategori</h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => { setIsFilterModalOpen(false); setIsKategoriModalOpen(true); }}
                  className="w-7 h-7 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-[#E9EBED]"
                  title="Kelola & Tambah Kategori"
                >
                  <Settings size={14} />
                </button>
                <button onClick={() => setIsFilterModalOpen(false)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><X size={15} /></button>
              </div>
            </div>
            <button onClick={() => { setSelectedKategoriFilter('Semua'); setIsFilterModalOpen(false); }} className={`py-2 px-3 rounded-xl font-bold text-left cursor-pointer flex justify-between items-center ${selectedKategoriFilter === 'Semua' ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}>
              <span>Semua Kategori</span>{selectedKategoriFilter === 'Semua' && <Check size={13} />}
            </button>
            {daftarKategoriProduk.map(k => (
              <button key={k} onClick={() => { setSelectedKategoriFilter(k); setIsFilterModalOpen(false); }} className={`py-2 px-3 rounded-xl font-bold text-left cursor-pointer flex justify-between items-center ${selectedKategoriFilter === k ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}>
                <span>{k}</span>{selectedKategoriFilter === k && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL KELOLA KATEGORI */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Kelola Kategori Produk</h3>
              <button onClick={() => setIsKategoriModalOpen(false)} className="text-[#86899B]"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddKategori} className="flex gap-2">
              <input type="text" value={formKategoriBaru} onChange={(e) => setFormKategoriBaru(e.target.value)} placeholder="Nama kategori baru..." className="flex-1 bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none" />
              <button type="submit" className="bg-[#01a684] text-white px-3.5 py-2.5 rounded-xl font-bold cursor-pointer">Tambah</button>
            </form>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {daftarKategoriProduk.map((kat, idx) => (
                <div key={idx} className="bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold text-[#181b2b] flex justify-between items-center border border-[#E9EBED]">
                  <span className="truncate">{kat}</span>
                  <button onClick={() => handleDeleteKategori(kat)} className="text-red-400 hover:text-red-600 p-1 cursor-pointer"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsKategoriModalOpen(false)} className="w-full py-2.5 bg-[#181b2b] text-white rounded-xl font-bold cursor-pointer">Selesai</button>
          </div>
        </div>
      )}

      {/* MODAL KAMERA / SCANNER BARCODE */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl flex flex-col gap-4 text-xs items-center text-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#181b2b]">Scan Barcode Kamera</h3>
            <div className="w-56 h-56 bg-black rounded-2xl border-2 border-[#01a684] flex flex-col items-center justify-center relative overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-bounce top-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="absolute bottom-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full">Posisikan barcode dalam kotak</span>
            </div>
            <div className="flex gap-2 w-full">
              <button type="button" onClick={stopCamera} className="flex-1 py-2.5 border border-[#E9EBED] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
              <button type="button" onClick={handleCaptureBarcode} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer">Ambil Barcode</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PRODUK DENGAN LAYOUT FLEX & FOOTER STATIS (ANTI-NABRAK) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col h-[85vh] max-h-[750px] border border-[#E9EBED] overflow-hidden">
            
            {/* Header Modal (Tetap di atas) */}
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">
                {isEditMode ? 'Edit Pengaturan Menu Produk' : 'Tambah Menu & Resep Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B] cursor-pointer"><X size={18} /></button>
            </div>

            {/* Form Body (Dapat di-scroll secara mandiri) */}
            <form onSubmit={handleSaveProduk} className="flex flex-col flex-1 overflow-y-auto p-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#181b2b]">Nama Menu Produk</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Kopi Susu Gula Aren" className="bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" required />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b]">Kategori</label>
                  <select value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none">
                    {daftarKategoriProduk.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#181b2b]">SKU / Barcode</label>
                  <div className="flex gap-1">
                    <input type="text" value={formSku} onChange={(e) => setFormSku(e.target.value)} placeholder="SKU-001" className="flex-1 bg-[#F1F2F6] rounded-xl p-2.5 font-mono outline-none text-[11px]" />
                    <button 
                      type="button" 
                      onClick={startCamera}
                      className="bg-[#01a684] text-white px-2.5 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90"
                      title="Scan Barcode via Kamera HP"
                    >
                      <Camera size={15} />
                    </button>
                  </div>
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
                    <button type="button" onClick={() => setSelectedResep([...selectedResep, { bahanId: '', qty: '' }])} className="text-[#01a684] font-bold cursor-pointer">+ Bahan</button>
                  </div>
                  {selectedResep.map((item, idx) => {
                    const selectedBahan = masterBahan.find(mb => mb.id === item.bahanId);
                    const satuanBahan = selectedBahan ? selectedBahan.satuan : 'qty';

                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select value={item.bahanId} onChange={(e) => {
                          const updated = [...selectedResep];
                          updated[idx].bahanId = e.target.value;
                          setSelectedResep(updated);
                        }} className="flex-1 bg-white rounded-xl p-2 text-[11px] border border-[#E9EBED] outline-none" required>
                          <option value="">Pilih Bahan...</option>
                          {masterBahan.map(mb => (<option key={mb.id} value={mb.id}>{mb.nama} (Sisa: {mb.stok} {mb.satuan})</option>))}
                        </select>
                        <div className="flex items-center bg-white rounded-xl border border-[#E9EBED] px-2 py-1 w-28">
                          <input type="number" step="any" value={item.qty} onChange={(e) => {
                            const updated = [...selectedResep];
                            updated[idx].qty = e.target.value;
                            setSelectedResep(updated);
                          }} placeholder="0" className="w-14 text-[11px] font-bold outline-none bg-transparent text-center" required />
                          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">{satuanBahan}</span>
                        </div>
                        {selectedResep.length > 1 && (<button type="button" onClick={() => setSelectedResep(selectedResep.filter((_, i) => i !== idx))} className="text-red-400 p-1"><Trash2 size={14} /></button>)}
                      </div>
                    );
                  })}
                </div>
              )}

              {formTipeStok === 'manual' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#181b2b]">Stok Awal</label>
                    <input type="number" value={formStokManual} onChange={(e) => setFormStokManual(e.target.value)} placeholder="50" className="bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#181b2b]">Alert Minimum</label>
                    <input type="number" value={formStokMin} onChange={(e) => setFormStokMin(e.target.value)} placeholder="5" className="bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none" />
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
                    <span className="text-[9px] text-slate-400">Atur HPP, Harga Jual, serta Resep Bahan spesifik per varian</span>
                  </div>
                </label>
              </div>

              {formPakaiVarian && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-[#E9EBED] flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#01a684] uppercase text-[10px]">Daftar Varian & Resep Spesifik:</span>
                    <button type="button" onClick={() => setFormVarianList([...formVarianList, { id: Date.now(), nama: '', hpp: '', hargaJual: '', resepVarian: [{ bahanId: '', qty: '' }] }])} className="text-[#01a684] font-bold cursor-pointer text-[11px]">+ Varian</button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {formVarianList.map((v, vIdx) => (
                      <div key={v.id || vIdx} className="bg-white border border-[#E9EBED] p-3 rounded-2xl flex flex-col gap-2.5 shadow-xs">
                        <div className="flex gap-2 items-center">
                          <input type="text" value={v.nama} onChange={(e) => {
                            const updated = [...formVarianList];
                            updated[vIdx].nama = e.target.value;
                            setFormVarianList(updated);
                          }} placeholder="Nama Varian (Cth: Large / Dingin)" className="flex-1 bg-[#F1F2F6] rounded-xl px-3 py-2 text-xs font-bold outline-none" required />
                          {formVarianList.length > 1 && (<button type="button" onClick={() => setFormVarianList(formVarianList.filter((_, i) => i !== vIdx))} className="text-red-400 p-1"><Trash2 size={14} /></button>)}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={v.hpp} onChange={(e) => {
                            const updated = [...formVarianList];
                            updated[vIdx].hpp = formatRupiah(e.target.value);
                            setFormVarianList(updated);
                          }} placeholder="HPP (Modal)" className="bg-[#F1F2F6] rounded-xl px-2.5 py-2 text-xs font-medium outline-none" />
                          <input type="text" value={v.hargaJual} onChange={(e) => {
                            const updated = [...formVarianList];
                            updated[vIdx].hargaJual = formatRupiah(e.target.value);
                            setFormVarianList(updated);
                          }} placeholder="Harga Jual" className="bg-[#F1F2F6] rounded-xl px-2.5 py-2 text-xs font-bold text-[#01a684] outline-none" required />
                        </div>

                        <div className="bg-[#F1F2F6]/60 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-700">Komposisi Bahan Varian Ini:</span>
                            <button type="button" onClick={() => {
                              const updated = [...formVarianList];
                              updated[vIdx].resepVarian.push({ bahanId: '', qty: '' });
                              setFormVarianList(updated);
                            }} className="text-[#01a684] font-bold">+ Bahan</button>
                          </div>

                          {(v.resepVarian || []).map((rv, rvIdx) => {
                            const selectedBahanV = masterBahan.find(mb => mb.id === rv.bahanId);
                            const satuanBahanV = selectedBahanV ? selectedBahanV.satuan : 'qty';

                            return (
                              <div key={rvIdx} className="flex gap-2 items-center">
                                <select value={rv.bahanId} onChange={(e) => {
                                  const updated = [...formVarianList];
                                  updated[vIdx].resepVarian[rvIdx].bahanId = e.target.value;
                                  setFormVarianList(updated);
                                }} className="flex-1 bg-white rounded-xl p-1.5 text-[10px] border border-[#E9EBED] outline-none" required>
                                  <option value="">Pilih Bahan...</option>
                                  {masterBahan.map(mb => (<option key={mb.id} value={mb.id}>{mb.nama} (Sisa: {mb.stok} {mb.satuan})</option>))}
                                </select>
                                <div className="flex items-center bg-white rounded-xl border border-[#E9EBED] px-2 py-0.5 w-24">
                                  <input type="number" step="any" value={rv.qty} onChange={(e) => {
                                    const updated = [...formVarianList];
                                    updated[vIdx].resepVarian[rvIdx].qty = e.target.value;
                                    setFormVarianList(updated);
                                  }} placeholder="0" className="w-12 text-[10px] font-bold outline-none bg-transparent text-center" required />
                                  <span className="text-[9px] text-slate-400 uppercase font-bold shrink-0">{satuanBahanV}</span>
                                </div>
                                {v.resepVarian.length > 1 && (<button type="button" onClick={() => {
                                  const updated = [...formVarianList];
                                  updated[vIdx].resepVarian = updated[vIdx].resepVarian.filter((_, i) => i !== rvIdx);
                                  setFormVarianList(updated);
                                }} className="text-red-400 p-0.5"><Trash2 size={12} /></button>)}
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer agar konten paling bawah tidak tertutup footer */}
              <div className="h-4 shrink-0" />

              {/* Footer Tombol Aksi (Sticky di bawah form body secara rapi) */}
              <div className="flex gap-2 pt-3 border-t border-[#E9EBED] bg-white shrink-0 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0">{isSubmitting ? 'Menyimpan...' : 'Simpan Menu'}</button>
              </div>
            </form>

          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}