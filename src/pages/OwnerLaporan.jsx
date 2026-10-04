import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Wallet, Building2, CreditCard, ChevronRight, 
  ShoppingBag, X, Download, FileText, FileSpreadsheet, RotateCw, TrendingUp,
  UserCheck, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerLaporan() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('Bulan Ini');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  // State untuk Filter Tanggal Kustom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterDataset = {
    'Hari Ini': {
      omzet: '5.200.000',
      pemasukan: '5.200.000',
      pengeluaran: '1.500.000',
      selisihLabel: 'Selisih (Laba Bersih)',
      selisihValue: '+ Rp 3.700.000',
      bank: 'Rp 3.500.000',
      cash: 'Rp 1.700.000',
      ownerTx: [
        { title: 'Suntikan Modal Owner', desc: 'Kas Bank Utama', amount: '+ Rp 2.000.000' },
        { title: 'Pembelian Stok Kopi', desc: 'Pengeluaran Cash', amount: '- Rp 500.000', isLoss: true },
      ],
      staffTx: [
        { title: 'Penjualan POS (Sarah)', desc: '8x Iced Latte', amount: '+ Rp 240.000' },
        { title: 'Penjualan POS (Budi)', desc: '2x Manual Brew', amount: '+ Rp 100.000' },
      ],
    },
    'Bulan Ini': {
      omzet: '150.000.000',
      pemasukan: '125.400.000',
      pengeluaran: '82.100.000',
      selisihLabel: 'Selisih (Laba Bersih)',
      selisihValue: '+ Rp 43.300.000',
      bank: 'Rp 105.000.000',
      cash: 'Rp 45.000.000',
      ownerTx: [
        { title: 'Injeksi Modal Usaha', desc: 'Transfer Bank BCA', amount: '+ Rp 25.000.000' },
        { title: 'Sewa Tempat & Listrik', desc: 'Operasional Owner', amount: '- Rp 12.000.000', isLoss: true },
      ],
      staffTx: [
        { title: 'Penjualan Retail', desc: 'Transaksi POS Harian', amount: '+ Rp 12.450.000' },
        { title: 'Gaji Staff', desc: 'Operasional Bulanan', amount: '- Rp 45.000.000', isLoss: true },
      ],
    },
    'Tahun Ini': {
      omzet: '1.800.000.000',
      pemasukan: '1.500.000.000',
      pengeluaran: '980.000.000',
      selisihLabel: 'Selisih (Laba Bersih)',
      selisihValue: '+ Rp 520.000.000',
      bank: 'Rp 1.260.000.000',
      cash: 'Rp 540.000.000',
      ownerTx: [
        { title: 'Prive Owner', desc: 'Penarikan Profit', amount: '- Rp 50.000.000', isLoss: true },
        { title: 'Beli Mesin Espresso', desc: 'Investasi Aset', amount: '- Rp 35.000.000', isLoss: true },
      ],
      staffTx: [
        { title: 'Penjualan POS (Sarah)', desc: '4x Americano, 2x Latte', amount: '+ Rp 240.000' },
        { title: 'Penjualan POS (Budi)', desc: '2x V60 Manual Brew', amount: '+ Rp 100.000' },
      ],
    },
  };

  const currentData = filterDataset[activeFilter] || filterDataset['Bulan Ini'];

  const handleDownloadConfirm = () => {
    setIsDownloadOpen(false);
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setActiveFilter('Kustom');
    setIsCustomDateOpen(false);
  };

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
            Laporan Keuangan
          </h1>

          <button 
            onClick={() => setIsDownloadOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">
        
        {/* PILLS CONTROL FILTER PERIODE */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-sm gap-1">
          {['Hari Ini', 'Bulan Ini', 'Tahun Ini'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer text-center ${
                activeFilter === tab
                  ? 'bg-[#181b2b] text-white font-bold shadow-md scale-[1.02]'
                  : 'text-[#86899B] font-medium hover:text-[#181b2b]'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setIsCustomDateOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'Kustom'
                ? 'bg-[#181b2b] text-white font-bold shadow-md'
                : 'text-[#86899B] hover:text-[#181b2b]'
            }`}
          >
            <Calendar size={13} />
          </button>
        </div>

        {/* HERO CARD: TOTAL OMZET DENGAN BACKGROUND ORNAMEN WATERMARK LOGO KASIR PRO */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden min-h-[110px] flex items-center">
          
          {/* ORNAMEN BACKGROUND LOGO KASIR PRO (WATERMARK UTAMA) */}
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-20 text-emerald-300 transform rotate-[-12deg]">
            <svg 
              viewBox="0 0 100 65" 
              fill="none" 
              xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" 
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

          {/* INFORMASI UTAMA OMZET */}
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Wallet size={12} className="text-[#01a684]" /> TOTAL OMZET • {activeFilter.toUpperCase()}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black tabular-nums tracking-tight">
                Rp {currentData.omzet}
              </h2>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-0.5">
                <TrendingUp size={10} /> +12%
              </span>
            </div>
          </div>
        </div>

        {/* BENTO GRID: PEMASUKAN VS PENGELUARAN */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">PEMASUKAN</span>
            <div className="text-lg font-black text-[#181b2b] tabular-nums mt-2">Rp {currentData.pemasukan}</div>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-[#01a684] rounded-full w-[80%]" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">PENGELUARAN</span>
            <div className="text-lg font-black text-[#181b2b] tabular-nums mt-2">Rp {currentData.pengeluaran}</div>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[55%]" />
            </div>
          </div>
        </div>

        {/* LABA BERSIH CARD */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-[#86899B] uppercase tracking-wider block">{currentData.selisihLabel}</span>
            <span className="text-xl font-black text-[#01a684] tabular-nums mt-0.5 block">{currentData.selisihValue}</span>
          </div>
          <div className="bg-emerald-50 text-[#01a684] p-2.5 rounded-2xl border border-emerald-200">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* BANK & CASH BENTO CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                <Building2 size={13} />
              </div>
              <p className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Uang di Bank</p>
            </div>
            <p className="text-sm font-black text-[#181b2b] tabular-nums">{currentData.bank}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                <CreditCard size={13} />
              </div>
              <p className="text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Uang Tunai</p>
            </div>
            <p className="text-sm font-black text-[#181b2b] tabular-nums">{currentData.cash}</p>
          </div>
        </div>

        {/* RINGKASAN TRANSAKSI OWNER (DITAMBAHKAN SESUAI TAMPILAN KASIR) */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Aktivitas Transaksi Owner</h2>
            <button 
              onClick={() => navigate('/owner/transaksi')}
              className="flex items-center gap-1 text-[#01a684] text-xs font-bold hover:underline cursor-pointer"
            >
              Detail <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {(currentData.ownerTx || []).map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#F1F2F6]/60 border border-[#E9EBED]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-sm">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#181b2b]">{tx.title}</p>
                    <p className="text-[10px] text-[#86899B]">{tx.desc}</p>
                  </div>
                </div>
                <p className={`text-xs font-black tabular-nums ${tx.isLoss ? 'text-red-600' : 'text-[#01a684]'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RINGKASAN TRANSAKSI STAFF */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Aktivitas Kasir Terakhir</h2>
            <button 
              onClick={() => navigate('/owner/staf')}
              className="flex items-center gap-1 text-[#01a684] text-xs font-bold hover:underline cursor-pointer"
            >
              Detail <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {currentData.staffTx.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#F1F2F6]/60 border border-[#E9EBED]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-sm">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#181b2b]">{tx.title}</p>
                    <p className="text-[10px] text-[#86899B]">{tx.desc}</p>
                  </div>
                </div>
                <p className={`text-xs font-black tabular-nums ${tx.isLoss ? 'text-red-600' : 'text-[#01a684]'}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL FILTER TANGGAL KUSTOM */}
      {isCustomDateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Pilih Rentang Tanggal</h3>
              <button onClick={() => setIsCustomDateOpen(false)} className="text-[#86899B]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApplyCustomDate} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#86899B] uppercase mb-1">Tanggal Mulai</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-2.5 font-bold outline-none text-[#181b2b]"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#86899B] uppercase mb-1">Tanggal Selesai</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-2.5 font-bold outline-none text-[#181b2b]"
                  required 
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setIsCustomDateOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold shadow-sm cursor-pointer">
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DOWNLOAD */}
      {isDownloadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-4 border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Unduh Laporan</h3>
              <button onClick={() => setIsDownloadOpen(false)} className="text-[#86899B] hover:text-[#181b2b]">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#86899B]">Pilih format dokumen laporan keuangan:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDownloadFormat('pdf')}
                className={`p-3 border rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer ${
                  downloadFormat === 'pdf' ? 'border-[#01a684] bg-emerald-50/50' : 'border-[#E9EBED]'
                }`}
              >
                <FileText size={22} className="text-red-500" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setDownloadFormat('excel')}
                className={`p-3 border rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer ${
                  downloadFormat === 'excel' ? 'border-[#01a684] bg-emerald-50/50' : 'border-[#E9EBED]'
                }`}
              >
                <FileSpreadsheet size={22} className="text-emerald-600" />
                <span className="text-xs font-bold">Excel</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDownloadOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-xs font-bold rounded-xl cursor-pointer">
                Batal
              </button>
              <button onClick={handleDownloadConfirm} className="flex-1 py-2.5 bg-[#01a684] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer">
                Unduh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROGRESS UNDUH */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-[240px] w-full shadow-2xl flex flex-col items-center text-center gap-3 border border-[#E9EBED]">
            <RotateCw size={32} className="text-[#01a684] animate-spin" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Mengunduh File</h3>
            <p className="text-[11px] text-[#86899B]">Mohon tunggu sebentar...</p>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}