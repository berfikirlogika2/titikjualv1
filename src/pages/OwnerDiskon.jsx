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
      
      {/* HEADER RESPONSIF */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <h1 className="text-[11px] lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Kelola Diskon & Promo
          </h1>

          <button 
            onClick={handleOpenAddModal} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER RESPONSIF */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">

        {/* HERO CARD DISKON */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-md relative overflow-hidden flex flex-col gap-2">
          <span className="text-[9px] lg:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Tag size={11} /> KUPON & VOUCHER PROMO
          </span>
          <h2 className="text-sm lg:text-2xl font-black tracking-tight">Diskon Penjualan Outlet</h2>
          <p className="text-[10px] lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            Kelola potongan harga otomatis atau voucher berbasis kode unik khusus untuk outlet Anda.
          </p>
        </div>

        {/* ANALYTICS & STATISTIK */}
        <section className="bg-white/75 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#E9EBED]/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#01a684] flex items-center justify-center shrink-0">
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 className="text-[11px] lg:text-xs font-bold text-[#181b2b] uppercase tracking-wider">Statistik & Masa Berlaku Diskon</h3>
                <p className="text-[9px] lg:text-[10px] text-[#86899B]">Ringkasan kuota terpakai dan periode aktif promo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="bg-[#F1F2F6]/70 rounded-2xl p-3.5 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-[#86899B] tracking-wider">Total Kuota Promosi</span>
                <span className="text-lg lg:text-2xl font-black text-[#181b2b]">{kuotaKeseluruhan} <span className="text-[11px] font-medium text-[#86899B]">X Pakai</span></span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-2xs">
                <Users size={17} />
              </div>
            </div>

            <div className="bg-[#F1F2F6]/70 rounded-2xl p-3.5 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-[#86899B] tracking-wider">Voucher Status Aktif</span>
                <span className="text-lg lg:text-2xl font-black text-[#01a684]">{totalDiskonAktif} <span className="text-[11px] font-medium text-[#86899B]">/ {totalDiskon}</span></span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-2xs">
                <Tag size={17} />
              </div>
            </div>

            <div className="bg-[#F1F2F6]/70 rounded-2xl p-3.5 flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-[#86899B] tracking-wider">Masa Berlaku Promo</span>
                <span className="text-xs font-bold text-[#181b2b] mt-0.5">Terjadwal & Fleksibel</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-2xs">
                <Calendar size={17} />
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & ACTION BAR */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86899B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari promo atau kode voucher..." 
              className="w-full bg-white/75 border border-white/90 rounded-xl pl-9 pr-3 py-2 text-[11px] lg:text-xs font-medium text-[#181b2b] outline-none shadow-xs focus:bg-white"
            />
          </div>

          <button 
            onClick={handleOpenAddModal} 
            className="bg-[#01a684] text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 font-bold text-[11px] lg:text-xs shadow-xs cursor-pointer hover:opacity-90 transition-all shrink-0"
          >
            <Plus size={15} /> Buat Voucher
          </button>
        </div>

        {/* DAFTAR DISKON: GRID RESPONSIF */}
        <section className="bg-white/75 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 overflow-hidden shadow-xs p-3 lg:p-6">
          <div className="pb-3 mb-3 border-b border-[#E9EBED]/50 flex justify-between items-center">
            <h2 className="font-bold text-[11px] lg:text-xs uppercase text-[#181b2b] tracking-wider">Daftar Kupon Promo</h2>
            <span className="text-[10px] lg:text-xs text-[#01a684] font-bold">{filteredDiskon.length} Promo</span>
          </div>

          {loading ? (
            <p className="text-xs text-center text-[#86899B] py-8">Memuat data diskon...</p>
          ) : filteredDiskon.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#86899B]">Belum ada diskon atau promo terdaftar.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-3">
              {filteredDiskon.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-[#E9EBED] p-3 shadow-2xs flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684]' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Tag size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 truncate">
                          <h4 className="text-[11px] font-bold text-[#181b2b] truncate">{item.nama}</h4>
                          <span className={`text-[8px] font-bold px-1 rounded shrink-0 ${
                            item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684]' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.status === 'aktif' ? 'Aktif' : 'Berakhir'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#01a684] bg-emerald-50/60 px-1.5 py-0.2 rounded border border-emerald-200/60 mt-0.5 inline-block">
                          {item.kode}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#01a684]">
                        {item.tipe === 'persen' ? `${item.nilai}%` : `Rp ${formatRupiah(item.nilai)}`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F1F2F6]/70 p-2 rounded-lg flex items-center justify-between text-[10px]">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[7px] uppercase font-bold text-[#86899B] tracking-wider truncate">{item.min_maks}</span>
                      <span className="text-[9px] text-[#181b2b] font-medium truncate">{item.periode}</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        className="text-slate-500 hover:text-[#01a684] p-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Edit"
                      >
                        <Settings2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDiskon(item.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODAL TAMBAH / EDIT DISKON (DENGAN FOOTER STATIS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col h-[85vh] max-h-[750px] border border-[#E9EBED] overflow-hidden text-xs">
            
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-xs lg:text-sm uppercase tracking-wider text-[#181b2b]">
                {editingId ? 'Edit Voucher Diskon' : 'Buat Diskon Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B] cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDiskon} className="flex flex-col flex-1 overflow-y-auto p-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kode Voucher / Promo</label>
                <input type="text" value={formKode} onChange={(e) => setFormKode(e.target.value)} placeholder="Cth: DISKON10" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold uppercase outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Promo</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Promo Akhir Pekan" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tipe Potongan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setFormTipe('persen'); setFormNilai(''); }} className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'persen' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Persen (%)</button>
                  <button type="button" onClick={() => { setFormTipe('nominal'); setFormNilai(''); }} className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'nominal' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Rupiah (Rp)</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Besar Potongan</label>
                <input type="text" value={formNilai} onChange={(e) => setFormNilai(formTipe === 'nominal' ? formatRupiah(e.target.value) : e.target.value)} placeholder={formTipe === 'persen' ? '10' : '5.000'} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Min. Belanja (Opsional)</label>
                <input type="text" value={formMinBelanja} onChange={(e) => setFormMinBelanja(formatRupiah(e.target.value))} placeholder="50.000" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Batas Maksimal Penggunaan (Kuota)</label>
                <input type="number" value={formKuota} onChange={(e) => setFormKuota(e.target.value)} placeholder="Cth: 100" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tanggal Mulai</label>
                  <input type="date" value={formTglMulai} onChange={(e) => setFormTglMulai(e.target.value)} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tanggal Berakhir</label>
                  <input type="date" value={formTglSelesai} onChange={(e) => setFormTglSelesai(e.target.value)} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none text-xs" />
                </div>
              </div>

              <div className="h-4 shrink-0" />

              <div className="flex gap-2 pt-3 border-t border-[#E9EBED] bg-white shrink-0 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm border-0">{isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Diskon')}</button>
              </div>
            </form>

          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}