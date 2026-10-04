import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Tag, Calendar, Trash2, CheckCircle2, AlertCircle, X, Search 
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

export default function OwnerDiskon() {
  const navigate = useNavigate();

  const [diskonList, setDiskonList] = useState([
    {
      id: 1,
      kode: 'PROMO10',
      nama: 'Diskon Member 10%',
      tipe: 'persen',
      nilai: 10,
      minMaks: 'Min. Belanja Rp 50.000',
      periode: '01 Sep - 30 Sep 2026',
      status: 'aktif',
    },
    {
      id: 2,
      kode: 'HEMAT5K',
      nama: 'Potongan Langsung 5rb',
      tipe: 'nominal',
      nilai: 5000,
      minMaks: 'Min. Belanja Rp 30.000',
      periode: '15 Sep - 20 Sep 2026',
      status: 'aktif',
    },
    {
      id: 3,
      kode: 'ULTAH20',
      nama: 'Promo Ulang Tahun 20%',
      tipe: 'persen',
      nilai: 20,
      minMaks: 'Maks. Diskon Rp 15.000',
      periode: '01 Ags - 31 Ags 2026',
      status: 'berakhir',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTipe, setFormTipe] = useState('persen');
  const [formNilai, setFormNilai] = useState('');
  const [formMinBelanja, setFormMinBelanja] = useState('');

  const handleSaveDiskon = (e) => {
    e.preventDefault();
    if (!formKode || !formNama || !formNilai) return;

    const newDiskon = {
      id: Date.now(),
      kode: formKode.toUpperCase(),
      nama: formNama,
      tipe: formTipe,
      nilai: formTipe === 'persen' ? parseFloat(formNilai) || 0 : parseRupiah(formNilai),
      minMaks: formMinBelanja ? `Min. Belanja Rp ${formMinBelanja}` : 'Tanpa Min. Belanja',
      periode: 'Berlaku Seterusnya',
      status: 'aktif',
    };

    setDiskonList([newDiskon, ...diskonList]);
    setIsModalOpen(false);
    setFormKode(''); setFormNama(''); setFormNilai(''); setFormMinBelanja('');
  };

  const handleDeleteDiskon = (id) => {
    if (window.confirm('Hapus voucher diskon ini?')) {
      setDiskonList(diskonList.filter(d => d.id !== id));
    }
  };

  const filteredDiskon = diskonList.filter(d => 
    d.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Kelola Diskon & Promo
          </h1>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO CARD DISKON DENGAN ORNAMEN WATERMARK LOGO KASIR PRO */}
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
                <Tag size={12} className="text-[#01a684]" /> KUPON & VOUCHER PROMO
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">Diskon Penjualan</h2>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                Kelola potongan harga otomatis atau voucher berbasis kode unik.
              </p>
            </div>
          </div>
        </div>

        {/* BENTO GRID SUMMARY */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Voucher Aktif</span>
            <div className="text-3xl font-black text-[#01a684] tabular-nums mt-2">
              {diskonList.filter(d => d.status === 'aktif').length}
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Total Promo</span>
            <div className="text-3xl font-black text-[#181b2b] tabular-nums mt-2">
              {diskonList.length}
            </div>
          </div>
        </section>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86899B]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari promo atau kode voucher..." 
            className="w-full bg-white/70 border border-white/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#181b2b] outline-none focus:bg-white"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full bg-[#01a684] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-xs shadow-sm cursor-pointer hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Buat Voucher Diskon Baru
        </button>

        {/* DAFTAR DISKON LENGKAP */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9EBED]/50 flex justify-between items-center">
            <h2 className="font-bold text-xs uppercase text-[#181b2b] tracking-wider">Daftar Kupon Promo</h2>
            <span className="text-[10px] text-[#01a684] font-bold">{filteredDiskon.length} Promo</span>
          </div>

          <div className="divide-y divide-[#E9EBED]/50">
            {filteredDiskon.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684]' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Tag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#181b2b]">{item.nama}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          item.status === 'aktif' ? 'bg-emerald-50 text-[#01a684] border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.status === 'aktif' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />} 
                          {item.status === 'aktif' ? 'Aktif' : 'Berakhir'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#01a684] bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-200/60 mt-1 inline-block">
                        {item.kode}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#01a684]">
                      {item.tipe === 'persen' ? `${item.nilai}%` : `Rp ${formatRupiah(item.nilai)}`}
                    </span>
                    <span className="text-[9px] text-[#86899B] block">Potongan</span>
                  </div>
                </div>

                <div className="bg-[#F1F2F6]/80 p-3 rounded-2xl flex items-center justify-between text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#86899B] tracking-wider">{item.minMaks}</span>
                    <span className="text-[10px] text-[#181b2b] font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-[#86899B]" /> {item.periode}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDeleteDiskon(item.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* MODAL TAMBAH DISKON */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Buat Diskon Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B] hover:text-[#181b2b]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiskon} className="flex flex-col gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kode Voucher / Promo</label>
                <input type="text" value={formKode} onChange={(e) => setFormKode(e.target.value)} placeholder="Cth: DISKON10" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold uppercase outline-none focus:ring-2 focus:ring-[#01a684]" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Promo</label>
                <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Cth: Promo Akhir Pekan" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-[#01a684]" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Tipe Potongan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setFormTipe('persen'); setFormNilai(''); }} className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'persen' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Persen (%)</button>
                  <button type="button" onClick={() => { setFormTipe('nominal'); setFormNilai(''); }} className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipe === 'nominal' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}>Nominal (Rp)</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Besar Potongan</label>
                <input type="text" value={formNilai} onChange={(e) => setFormNilai(formTipe === 'nominal' ? formatRupiah(e.target.value) : e.target.value)} placeholder={formTipe === 'persen' ? '10' : '5.000'} className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Min. Belanja (Opsional)</label>
                <input type="text" value={formMinBelanja} onChange={(e) => setFormMinBelanja(formatRupiah(e.target.value))} placeholder="50.000" className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-[#01a684]" />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm">Simpan Diskon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}