import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Tag, Calendar, Trash2, CheckCircle2, AlertCircle, X, Search, Users, Settings2, BarChart3, TrendingUp, Clock 
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

export default function OwnerDiskon() {
  const navigate = useNavigate();

  const [diskonList, setDiskonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk mode edit atau buat baru
  const [editingId, setEditingId] = useState(null);

  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTipe, setFormTipe] = useState('persen');
  const [formNilai, setFormNilai] = useState('');
  const [formMinBelanja, setFormMinBelanja] = useState('');
  const [formKuota, setFormKuota] = useState('');
  const [formTglMulai, setFormTglMulai] = useState('');
  const [formTglSelesai, setFormTglSelesai] = useState('');

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  const fetchDiskon = async () => {
    setLoading(true);
    try {
      const currentOwnerId = getOwnerId();
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setDiskonList(data);
      }
    } catch (err) {
      console.error('Gagal memuat data diskon:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskon();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormKode('');
    setFormNama('');
    setFormTipe('persen');
    setFormNilai('');
    setFormMinBelanja('');
    setFormKuota('');
    setFormTglMulai('');
    setFormTglSelesai('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormKode(item.kode || '');
    setFormNama(item.nama || '');
    setFormTipe(item.tipe || 'persen');
    setFormNilai(item.tipe === 'nominal' ? formatRupiah(item.nilai) : (item.nilai?.toString() || ''));
    
    const minBelanjaMatch = item.min_maks ? item.min_maks.match(/\d[0-9.]*/) : null;
    setFormMinBelanja(minBelanjaMatch ? minBelanjaMatch[0] : '');

    setFormKuota(item.kuota_maksimal?.toString() || '');
    setFormTglMulai(item.tanggal_mulai || '');
    setFormTglSelesai(item.tanggal_selesai || '');
    setIsModalOpen(true);
  };

  const handleSaveDiskon = async (e) => {
    e.preventDefault();
    if (!formKode || !formNama || !formNilai) return;

    setIsSubmitting(true);
    try {
      const currentOwnerId = getOwnerId();
      
      let periodeText = 'Berlaku Seterusnya';
      if (formTglMulai && formTglSelesai) {
        periodeText = `${formTglMulai} s/d ${formTglSelesai}`;
      } else if (formTglMulai) {
        periodeText = `Mulai ${formTglMulai}`;
      }

      const payload = {
        owner_id: currentOwnerId,
        kode: formKode.toUpperCase(),
        nama: formNama,
        tipe: formTipe,
        nilai: formTipe === 'persen' ? parseFloat(formNilai) || 0 : parseRupiah(formNilai),
        min_maks: formMinBelanja ? `Min. Belanja Rp ${formMinBelanja}` : 'Tanpa Min. Belanja',
        periode: periodeText,
        kuota_maksimal: parseInt(formKuota) || 100,
        tanggal_mulai: formTglMulai || null,
        tanggal_selesai: formTglSelesai || null,
        status: 'aktif'
      };

      if (editingId) {
        const { error } = await supabase
          .from('discounts')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        alert('Voucher diskon berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('discounts')
          .insert([payload]);

        if (error) throw error;
        alert('Voucher diskon berhasil dibuat!');
      }

      setIsModalOpen(false);
      fetchDiskon();
    } catch (err) {
      console.error('Gagal menyimpan diskon:', err.message);
      alert('Gagal menyimpan ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiskon = async (id) => {
    if (window.confirm('Hapus voucher diskon ini dari database?')) {
      try {
        const { error } = await supabase
          .from('discounts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setDiskonList(diskonList.filter(d => d.id !== id));
      } catch (err) {
        console.error('Gagal menghapus diskon:', err.message);
        alert('Gagal menghapus diskon.');
      }
    }
  };

  const filteredDiskon = diskonList.filter(d => 
    d.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDiskonAktif = diskonList.filter(d => d.status === 'aktif').length;
  const totalDiskon = diskonList.length;
  const kuotaKeseluruhan = diskonList.reduce((acc, curr) => acc + (curr.kuota_maksimal || 100), 0);

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER PRESISI */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[220px] text-center">
            Kelola Diskon & Promo
          </h1>

          <button 
            onClick={handleOpenAddModal} 
            className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6">

        {/* HERO CARD DISKON */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 lg:p-8 shadow-lg relative overflow-hidden min-h-[120px] lg:min-h-[150px] flex items-center">
          <div className="relative z-10 w-full">
            <span className="text-[10px] lg:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Tag size={13} className="text-[#01a684]" /> KUPON & VOUCHER PROMO
            </span>
            <h2 className="text-lg lg:text-2xl font-black tracking-tight mt-1">Diskon Penjualan Outlet</h2>
            <p className="text-[11px] lg:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
              Kelola potongan harga otomatis atau voucher berbasis kode unik khusus untuk outlet Anda.
            </p>
          </div>
        </div>

        {/* KOTAK NAVIGASI / ANALYTICS CHART USAGE & MASA BERLAKU (DI BAWAH HERO CARD) */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E9EBED]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#01a684] flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="text-xs lg:text-sm font-bold text-[#181b2b] uppercase tracking-wider">Statistik & Masa Berlaku Diskon</h3>
                <p className="text-[10px] lg:text-xs text-[#86899B]">Ringkasan kuota terpakai dan periode aktif promo outlet</p>
              </div>
            </div>
            <span className="text-[10px] lg:text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#01a684] border border-emerald-200">
              Live Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#F1F2F6]/70 rounded-2xl p-4 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#86899B] tracking-wider">Total Kuota Promosi</span>
                <span className="text-xl lg:text-2xl font-black text-[#181b2b]">{kuotaKeseluruhan} <span className="text-xs font-medium text-[#86899B]">X Pakai</span></span>
                <span className="text-[9px] text-[#01a684] font-semibold flex items-center gap-1">
                  <TrendingUp size={11} /> Alokasi sistem kasir
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#01a684] shadow-xs">
                <Users size={20} />
              </div>
            </div>

            <div className="bg-[#F1F2F6]/70 rounded-2xl p-4 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#86899B] tracking-wider">Voucher Status Aktif</span>
                <span className="text-xl lg:text-2xl font-black text-[#01a684]">{totalDiskonAktif} <span className="text-xs font-medium text-[#86899B]">/ {totalDiskon}</span></span>
                <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-[#01a684]" /> Siap digunakan kasir
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#01a684] shadow-xs">
                <Tag size={20} />
              </div>
            </div>

            <div className="bg-[#F1F2F6]/70 rounded-2xl p-4 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#86899B] tracking-wider">Masa Berlaku Promo</span>
                <span className="text-sm font-bold text-[#181b2b] mt-1">Terjadwal & Fleksibel</span>
                <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock size={11} /> Otomatis kedaluwarsa
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-xs">
                <Calendar size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & ACTION BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86899B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari promo atau kode voucher..." 
              className="w-full bg-white/70 border border-white/90 rounded-2xl pl-10 pr-4 py-3 text-xs lg:text-sm font-medium text-[#181b2b] outline-none focus:bg-white"
            />
          </div>

          <button 
            onClick={handleOpenAddModal} 
            className="bg-[#01a684] text-white rounded-2xl px-5 py-3 flex items-center justify-center gap-2 font-bold text-xs lg:text-sm shadow-sm cursor-pointer hover:opacity-90 transition-all shrink-0"
          >
            <Plus size={16} /> Buat Voucher Diskon Baru
          </button>
        </div>

        {/* DAFTAR DISKON DENGAN TOMBOL GEAR & TRASH */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9EBED]/50 flex justify-between items-center">
            <h2 className="font-bold text-xs lg:text-sm uppercase text-[#181b2b] tracking-wider">Daftar Kupon Promo</h2>
            <span className="text-[10px] lg:text-xs text-[#01a684] font-bold">{filteredDiskon.length} Promo</span>
          </div>

          {loading ? (
            <p className="text-xs text-center text-[#86899B] py-10">Memuat data diskon...</p>
          ) : filteredDiskon.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#86899B]">Belum ada diskon atau promo terdaftar.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {filteredDiskon.map((item) => (
                <div key={item.id} className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-xs flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684]' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Tag size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-[#181b2b] truncate max-w-[120px]">{item.nama}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                            item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684] border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.status === 'aktif' ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />} 
                            {item.status === 'aktif' ? 'Aktif' : 'Berakhir'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#01a684] bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-200/60 mt-1 inline-block">
                          {item.kode}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#01a684]">
                        {item.tipe === 'persen' ? `${item.nilai}%` : `Rp ${formatRupiah(item.nilai)}`}
                      </span>
                      <span className="text-[8px] text-[#86899B] block">Potongan</span>
                    </div>
                  </div>

                  <div className="bg-[#F1F2F6]/70 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[8px] uppercase font-bold text-[#86899B] tracking-wider truncate">{item.min_maks}</span>
                      <span className="text-[9px] text-[#181b2b] font-medium flex items-center gap-1">
                        <Calendar size={11} className="text-[#86899B]" /> {item.periode}
                      </span>
                      {item.kuota_maksimal && (
                        <span className="text-[9px] text-[#86899B] flex items-center gap-1 mt-0.5">
                          <Users size={11} /> Kuota: {item.kuota_maksimal}x pakai
                        </span>
                      )}
                    </div>

                    {/* Tombol Aksi (Gear Edit & Hapus Trash) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        className="text-slate-500 hover:text-[#01a684] p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Edit Diskon"
                      >
                        <Settings2 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDiskon(item.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Hapus Diskon"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODAL TAMBAH / EDIT DISKON */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-xs border border-[#E9EBED] animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">
                {editingId ? 'Edit Voucher Diskon' : 'Buat Diskon Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B] hover:text-[#181b2b] cursor-pointer bg-transparent border-0">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiskon} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kode Voucher / Promo</label>
                <input 
                  type="text" 
                  value={formKode} 
                  onChange={(e) => setFormKode(e.target.value)} 
                  placeholder="Cth: DISKON10" 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-bold uppercase outline-none focus:ring-2 focus:ring-[#01a684]" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Promo</label>
                <input 
                  type="text" 
                  value={formNama} 
                  onChange={(e) => setFormNama(e.target.value)} 
                  placeholder="Cth: Promo Akhir Pekan" 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#01a684]" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tipe Potongan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setFormTipe('persen'); setFormNilai(''); }} 
                    className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'persen' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Persen (%)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setFormTipe('nominal'); setFormNilai(''); }} 
                    className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'nominal' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Rupiah (Rp)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Besar Potongan</label>
                <input 
                  type="text" 
                  value={formNilai} 
                  onChange={(e) => setFormNilai(formTipe === 'nominal' ? formatRupiah(e.target.value) : e.target.value)} 
                  placeholder={formTipe === 'persen' ? '10' : '5.000'} 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Min. Belanja (Opsional)</label>
                <input 
                  type="text" 
                  value={formMinBelanja} 
                  onChange={(e) => setFormMinBelanja(formatRupiah(e.target.value))} 
                  placeholder="50.000" 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Batas Maksimal Penggunaan (Kuota)</label>
                <input 
                  type="number" 
                  value={formKuota} 
                  onChange={(e) => setFormKuota(e.target.value)} 
                  placeholder="Cth: 100 (kali digunakan)" 
                  className="w-full bg-[#F1F2F6] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" 
                />
                <span className="text-[9px] text-[#86899B] mt-1 block">Jika kuota habis terpakai, diskon otomatis tidak berlaku.</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    value={formTglMulai} 
                    onChange={(e) => setFormTglMulai(e.target.value)} 
                    className="w-full bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#01a684]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tanggal Berakhir</label>
                  <input 
                    type="date" 
                    value={formTglSelesai} 
                    onChange={(e) => setFormTglSelesai(e.target.value)} 
                    className="w-full bg-[#F1F2F6] rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-[#01a684]" 
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0 hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Diskon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}