import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, SlidersHorizontal, Plus, Package, 
  Box, MoreVertical, X, Check, Trash2, Edit3, Tag, Store, Settings2, AlertTriangle, CheckCircle2, Settings 
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

export default function OwnerBahan() {
  const navigate = useNavigate();

  const [daftarKategori, setDaftarKategori] = useState([]);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [formKategoriBaru, setFormKategoriBaru] = useState('');

  const [bahanList, setBahanList] = useState([]);
  const [loadingBahan, setLoadingBahan] = useState(true);

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  const fetchKategori = async () => {
    try {
      const currentOwnerId = getOwnerId();
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('owner_id', currentOwnerId);

      if (error) throw error;
      if (data && data.length > 0) {
        setDaftarKategori(data.map(item => item.nama_kategori));
      } else {
        const defaultCats = ['Minuman & Kopi', 'Dairy & Susu', 'Pemanis & Sirup', 'Bahan Makanan', 'Kemasan & Plastik'];
        setDaftarKategori(defaultCats);
        for (let cat of defaultCats) {
          await supabase.from('ingredient_categories').insert([{ owner_id: currentOwnerId, nama_kategori: cat }]);
        }
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err.message);
      setDaftarKategori(['Minuman & Kopi', 'Dairy & Susu', 'Pemanis & Sirup', 'Bahan Makanan']);
    }
  };

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
        const formatted = data.map(item => ({
          id: item.id,
          nama: item.nama,
          kategori: item.kategori,
          stok: Number(item.stok),
          satuan: item.satuan,
          hargaBeli: Number(item.harga_beli),
          limitMin: item.limit_min !== null ? Number(item.limit_min) : 5
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
    fetchKategori();
    fetchBahan();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState('Semua');
  const [filterHanyaKritis, setFilterHanyaKritis] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState('');
  const [formStok, setFormStok] = useState('');
  const [formSatuan, setFormSatuan] = useState('kg');
  const [formHargaBeli, setFormHargaBeli] = useState('');
  const [formLimitMin, setFormLimitMin] = useState('');
  
  const [formStokTambahan, setFormStokTambahan] = useState('');
  const [formHargaBeliTambahan, setFormHargaBeliTambahan] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormNama('');
    setFormKategori(daftarKategori[0] || '');
    setFormStok('');
    setFormSatuan('kg');
    setFormHargaBeli('');
    setFormLimitMin('');
    setFormStokTambahan('');
    setFormHargaBeliTambahan('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormNama(item.nama || '');
    setFormKategori(item.kategori || daftarKategori[0]);
    setFormStok(item.stok?.toString() || '');
    setFormSatuan(item.satuan || 'kg');
    setFormHargaBeli(formatRupiah(item.hargaBeli));
    setFormLimitMin(item.limitMin?.toString() || '');
    setFormStokTambahan('');
    setFormHargaBeliTambahan('');
    setIsModalOpen(true);
  };

  const handleAddKategori = async (e) => {
    e.preventDefault();
    if (!formKategoriBaru.trim() || daftarKategori.includes(formKategoriBaru)) return;
    
    try {
      const currentOwnerId = getOwnerId();
      const { error } = await supabase
        .from('ingredient_categories')
        .insert([{ owner_id: currentOwnerId, nama_kategori: formKategoriBaru.trim() }]);

      if (error) throw error;

      setDaftarKategori([...daftarKategori, formKategoriBaru.trim()]);
      setFormKategoriBaru('');
      alert('Kategori baru berhasil ditambahkan!');
    } catch (err) {
      console.error('Gagal menambah kategori:', err.message);
      alert('Gagal menambah kategori ke database.');
    }
  };

  const handleDeleteKategori = async (kat) => {
    if (daftarKategori.length <= 1) return alert('Minimal harus ada 1 kategori!');
    if (window.confirm(`Hapus kategori ${kat}?`)) {
      try {
        const currentOwnerId = getOwnerId();
        const { error } = await supabase
          .from('ingredient_categories')
          .delete()
          .eq('owner_id', currentOwnerId)
          .eq('nama_kategori', kat);

        if (error) throw error;

        setDaftarKategori(daftarKategori.filter(k => k !== kat));
        if (selectedKategoriFilter === kat) setSelectedKategoriFilter('Semua');
        alert('Kategori berhasil dihapus!');
      } catch (err) {
        console.error('Gagal menghapus kategori:', err.message);
        alert('Gagal menghapus kategori.');
      }
    }
  };

  const handleSaveBahan = async (e) => {
    e.preventDefault();
    if (!formNama || !formStok || !formHargaBeli) return;

    setIsSubmitting(true);
    try {
      const currentOwnerId = getOwnerId();

      let finalStok = parseFloat(formStok) || 0;
      let finalHargaBeli = parseRupiah(formHargaBeli);

      if (editingId) {
        const stokAdd = parseFloat(formStokTambahan) || 0;
        const hargaAdd = parseRupiah(formHargaBeliTambahan);

        const bahanLama = bahanList.find(b => b.id === editingId);
        const stokTersediaLama = bahanLama ? bahanLama.stok : 0;
        const totalHargaLama = (bahanLama ? bahanLama.hargaBeli : 0);

        if (stokAdd > 0 && hargaAdd > 0) {
          finalStok = stokTersediaLama + stokAdd;
          finalHargaBeli = totalHargaLama + hargaAdd;
        } else {
          finalStok = stokTersediaLama;
        }
      }

      const payload = {
        owner_id: currentOwnerId,
        nama: formNama,
        kategori: formKategori || daftarKategori[0],
        stok: finalStok,
        satuan: formSatuan,
        harga_beli: finalHargaBeli,
        limit_min: formLimitMin !== '' ? parseFloat(formLimitMin) : 5,
      };

      if (editingId) {
        const { error } = await supabase
          .from('ingredients')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        alert('Bahan baku dan stok berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert([payload]);

        if (error) throw error;
        alert('Bahan baku berhasil ditambahkan!');
      }

      setIsModalOpen(false);
      fetchBahan();
    } catch (err) {
      console.error('Gagal menyimpan bahan:', err.message);
      alert('Gagal menyimpan ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBahan = async (id) => {
    if (window.confirm('Hapus item bahan baku ini dari database?')) {
      try {
        const { error } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setBahanList(bahanList.filter(b => b.id !== id));
      } catch (err) {
        console.error('Gagal menghapus bahan:', err.message);
        alert('Gagal menghapus bahan.');
      }
    }
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
            Inventaris Bahan Baku
          </h1>

          <div className="w-8 h-8" />
        </div>
      </header>

      {/* MAIN CONTAINER RESPONSIF */}
      <main className="p-3 lg:p-8 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">

        {/* HERO BANNER BERSIH TANPA WATERMARK */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#181b2b] text-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-md relative overflow-hidden flex flex-col gap-2">
          <span className="text-[9px] lg:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Box size={11} /> STOK & HPP BAHAN BAKU OUTLET
          </span>
          <h2 className="text-sm lg:text-2xl font-black tracking-tight">Gudang Bahan Baku</h2>
          <p className="text-[10px] lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            Pantau sisa stok bahan baku dan HPP secara real-time yang terintegrasi langsung dengan sistem kasir.
          </p>
        </div>

        {/* BENTO SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-4">
          <div className="bg-white/75 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-3 lg:p-6 flex flex-col justify-between shadow-xs">
            <span className="text-[9px] lg:text-xs font-extrabold text-[#86899B] uppercase tracking-wider">Total Item Bahan Baku</span>
            <div className="text-xl lg:text-3xl font-black text-[#181b2b] tabular-nums mt-1">{bahanList.length}</div>
          </div>

          <div 
            onClick={() => setFilterHanyaKritis(!filterHanyaKritis)} 
            className={`rounded-2xl lg:rounded-3xl border p-3 lg:p-6 flex flex-col justify-between shadow-xs cursor-pointer transition-all ${
              filterHanyaKritis ? 'bg-red-500 text-white border-red-500' : 'bg-white/75 backdrop-blur-md text-[#181b2b] border-white/90'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-[9px] lg:text-xs font-extrabold uppercase tracking-wider ${filterHanyaKritis ? 'text-white' : 'text-red-600'}`}>
                3 Bahan Teratas Kritis (Klik Filter)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${filterHanyaKritis ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}>
                {bahanMenipisList.length} Kritis
              </span>
            </div>
            
            <div className="mt-2 flex flex-col gap-1">
              {bahanMenipisList.length === 0 ? (
                <span className="text-[11px] text-slate-500 font-medium">Semua stok bahan aman mencukupi.</span>
              ) : (
                bahanMenipisList.slice(0, 3).map((item, idx) => (
                  <div key={item.id} className={`text-[11px] font-bold flex justify-between items-center ${filterHanyaKritis ? 'text-white' : 'text-[#181b2b]'}`}>
                    <span>{idx + 1}. {item.nama}</span>
                    <span className="text-red-600 bg-white/90 px-1.5 py-0.2 rounded text-[9px]">{item.stok} {item.satuan}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {filterHanyaKritis && (
          <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-2xl flex justify-between items-center text-xs">
            <span className="font-semibold text-amber-800 text-[11px]">🔍 Menampilkan bahan dengan status stok kritis</span>
            <button onClick={() => setFilterHanyaKritis(false)} className="font-bold text-[#01a684] underline cursor-pointer">Reset</button>
          </div>
        )}

        {/* SEARCH & FILTER */}
        <section className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86899B]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari bahan baku..." className="w-full bg-white/75 border border-white/90 rounded-xl pl-9 pr-3 py-2 text-[11px] lg:text-xs font-medium outline-none shadow-xs focus:bg-white" />
          </div>
          <button onClick={() => setIsFilterModalOpen(true)} className="bg-white/75 backdrop-blur-md border border-white/90 rounded-xl px-3.5 py-2 text-[11px] lg:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white shrink-0 text-[#181b2b] shadow-xs">
            <SlidersHorizontal size={14} className="text-[#01a684]" />
            <span>Kategori</span>
          </button>
        </section>

        <button onClick={handleOpenAddModal} className="w-full bg-[#01a684] text-white rounded-xl py-3 flex items-center justify-center gap-1.5 font-bold text-[11px] lg:text-xs shadow-xs cursor-pointer hover:opacity-90 transition-all">
          <Plus size={15} /> Tambah Bahan Baku
        </button>

        {/* DAFTAR BAHAN BAKU: 3-4 KOLOM DI MOBILE, GRID LUAS DI TABLET/DESKTOP */}
        <section className="bg-white/75 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 overflow-hidden shadow-xs p-3 lg:p-6">
          <div className="pb-3 mb-3 border-b border-[#E9EBED]/50 flex justify-between items-center">
            <h2 className="font-bold text-[11px] lg:text-xs uppercase text-[#181b2b] tracking-wider">Daftar Bahan Baku & HPP</h2>
            <span className="text-[10px] lg:text-xs text-[#01a684] font-bold">{filteredBahan.length} Bahan</span>
          </div>

          {loadingBahan ? (
            <p className="text-xs text-center text-[#86899B] py-8">Memuat data bahan baku...</p>
          ) : filteredBahan.length === 0 ? (
            <div className="text-center text-xs text-[#86899B] py-8">Belum ada data bahan baku terdaftar.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
              {filteredBahan.map((bahan) => {
                const isKritis = cekKritis(bahan);
                return (
                  <div key={bahan.id} className="bg-white rounded-xl border border-[#E9EBED] p-2.5 shadow-2xs flex flex-col justify-between gap-2 relative">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-[#181b2b] truncate leading-tight">{bahan.nama}</h4>
                        <span className="text-[8px] text-[#86899B] bg-slate-100 px-1.5 py-0.2 rounded font-medium mt-0.5 inline-block truncate max-w-[100px]">{bahan.kategori}</span>
                      </div>
                      
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button 
                          onClick={() => handleOpenEditModal(bahan)}
                          className="text-slate-500 hover:text-[#01a684] p-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer border-0 bg-transparent"
                          title="Edit & Restock"
                        >
                          <Settings2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBahan(bahan.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#F1F2F6]/70 p-2 rounded-lg grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-[7px] text-[#86899B] font-bold block uppercase">Stok</span>
                        <span className={`font-bold text-[11px] ${isKritis ? 'text-red-600' : 'text-[#181b2b]'}`}>{bahan.stok} {bahan.satuan}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] text-[#86899B] font-bold block uppercase">Beli</span>
                        <span className="font-bold text-[11px] text-[#01a684]">Rp {formatRupiah(bahan.hargaBeli)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* MODAL TAMBAH / EDIT & RESTOCK BAHAN BAKU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-3 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">
              {editingId ? 'Edit & Restock Bahan Baku' : 'Tambah Bahan Baku Baru'}
            </h3>
            
            <form onSubmit={handleSaveBahan} className="flex flex-col gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Bahan Baku</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Biji Kopi Arabika" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kategori</label>
                <select value={formKategori} onChange={(e) => setFormKategori(e.target.value)} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs">
                  {daftarKategori.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {!editingId ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Stok Awal</label>
                      <input type="number" step="any" value={formStok} onChange={(e) => setFormStok(e.target.value)} placeholder="0" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Satuan</label>
                      <select value={formSatuan} onChange={(e) => setFormSatuan(e.target.value)} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs">
                        <option value="kg">kg</option><option value="Liter">Liter</option><option value="Pcs">Pcs</option><option value="Pack">Pack</option><option value="Gram">Gram</option><option value="ml">ml</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Harga Beli (Sesuai Total Stok Awal)</label>
                    <input type="text" value={formHargaBeli} onChange={(e) => setFormHargaBeli(formatRupiah(e.target.value))} placeholder="50.000" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" required />
                    <span className="text-[9px] text-[#86899B] mt-1 block">Masukkan total pengeluaran untuk pembelian keseluruhan stok awal tersebut.</span>
                  </div>
                </>
              ) : (
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#01a684]">Menu Restock (Tambah Stok):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#86899B] mb-1">Stok Tambahan</label>
                      <input type="number" step="any" value={formStokTambahan} onChange={(e) => setFormStokTambahan(e.target.value)} placeholder="Cth: 10" className="w-full bg-white rounded-xl p-2 font-bold outline-none border border-emerald-200 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-[#86899B] mb-1">Harga Beli Tambahan</label>
                      <input type="text" value={formHargaBeliTambahan} onChange={(e) => setFormHargaBeliTambahan(formatRupiah(e.target.value))} placeholder="Cth: 50.000" className="w-full bg-white rounded-xl p-2 font-bold outline-none border border-emerald-200 text-xs" />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500">Stok baru otomatis diakumulasikan ke stok tersedia, dan harga beli baru ditambahkan ke total harga beli bahan.</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Limit Min (Peringatan)</label>
                <input type="number" step="any" value={formLimitMin} onChange={(e) => setFormLimitMin(e.target.value)} placeholder="5" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            {daftarKategori.map(k => (
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
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">Kelola Kategori Bahan</h3>
              <button onClick={() => setIsKategoriModalOpen(false)} className="text-[#86899B]"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddKategori} className="flex gap-2">
              <input type="text" value={formKategoriBaru} onChange={(e) => setFormKategoriBaru(e.target.value)} placeholder="Tambah kategori baru..." className="flex-1 bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" />
              <button type="submit" className="bg-[#01a684] text-white px-3.5 py-2.5 rounded-xl font-bold cursor-pointer shadow-sm border-0">Tambah</button>
            </form>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {daftarKategori.map(k => (
                <div key={k} className="bg-slate-50 p-2.5 rounded-xl flex justify-between items-center text-xs border border-[#E9EBED]">
                  <span className="font-medium text-[#181b2b]">{k}</span>
                  <button onClick={() => handleDeleteKategori(k)} className="text-red-500 cursor-pointer p-1 border-0 bg-transparent" title="Hapus Kategori"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsKategoriModalOpen(false)} className="w-full py-2.5 bg-[#181b2b] text-white rounded-xl font-bold mt-1 cursor-pointer border-0">Selesai</button>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}