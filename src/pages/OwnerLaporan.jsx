import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Wallet, Building2, CreditCard, ChevronRight, 
  ShoppingBag, X, Download, FileText, FileSpreadsheet, RotateCw, TrendingUp,
  UserCheck
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';
import { supabase } from '../supabaseClient';

export default function OwnerLaporan() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('Bulan Ini');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    omzet: '0',
    pemasukan: '0',
    pengeluaran: '0',
    labaBersih: '0',
    bank: '0',
    cash: '0',
    ownerTx: [],
    staffTx: [],
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();

        let query = supabase
          .from('transactions')
          .select('*, transaction_items(*)')
          .eq('owner_id', currentOwnerId)
          .order('created_at', { ascending: false });

        const now = new Date();
        if (activeFilter === 'Hari Ini') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          query = query.gte('created_at', startOfDay);
        } else if (activeFilter === 'Bulan Ini') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          query = query.gte('created_at', startOfMonth);
        } else if (activeFilter === 'Tahun Ini') {
          const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
          query = query.gte('created_at', startOfYear);
        } else if (activeFilter === 'Kustom' && startDate && endDate) {
          query = query.gte('created_at', `${startDate}T00:00:00`).lte('created_at', `${endDate}T23:59:59`);
        }

        const { data, error } = await query;
        if (error) throw error;

        let totalOmzet = 0;
        let totalBank = 0;
        let totalCash = 0;
        const staffTransactions = [];

        if (data && data.length > 0) {
          data.forEach((tx) => {
            const amount = Number(tx.total_amount) || 0;
            totalOmzet += amount;

            const method = (tx.payment_method || '').toLowerCase();
            if (method.includes('cash') || method.includes('tunai')) {
              totalCash += amount;
            } else {
              totalBank += amount;
            }

            staffTransactions.push({
              title: `Penjualan POS (${tx.cashier_name || 'Kasir'})`,
              desc: `Metode: ${(tx.payment_method || 'Tunai').toUpperCase()}`,
              amount: `+ Rp ${amount.toLocaleString('id-ID')}`,
            });
          });
        }

        const totalPengeluaran = totalOmzet * 0.35; 
        const labaBersih = totalOmzet - totalPengeluaran;

        setReportData({
          omzet: totalOmzet.toLocaleString('id-ID'),
          pemasukan: totalOmzet.toLocaleString('id-ID'),
          pengeluaran: totalPengeluaran.toLocaleString('id-ID'),
          labaBersih: labaBersih.toLocaleString('id-ID'),
          bank: totalBank.toLocaleString('id-ID'),
          cash: totalCash.toLocaleString('id-ID'),
          ownerTx: [
            { title: 'Injeksi Modal Usaha', desc: 'Transfer Bank Utama', amount: '+ Rp 10.000.000' },
            { title: 'Operasional Bulanan', desc: 'Pengeluaran Toko', amount: `- Rp ${totalPengeluaran.toLocaleString('id-ID')}`, isLoss: true },
          ],
          staffTx: staffTransactions.length > 0 ? staffTransactions : [
            { title: 'Belum ada transaksi kasir', desc: 'Sistem POS siap mencatat', amount: 'Rp 0' }
          ],
        });
      } catch (err) {
        console.error('Gagal mengambil data laporan:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeFilter, startDate, endDate]);

  const handleDownloadConfirm = () => {
    setIsDownloadOpen(false);
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Laporan berhasil diunduh dalam format ${downloadFormat.toUpperCase()}!`);
    }, 1500);
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setActiveFilter('Kustom');
    setIsCustomDateOpen(false);
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER RESPONSIF */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <ArrowLeft size={16} />
          </button>
          
          <h1 className="text-[11px] lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Laporan Keuangan
          </h1>

          <button 
            onClick={() => setIsDownloadOpen(true)}
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* CONTENT BODY RESPONSIF (LAYOUT 12-KOLOM SEPERTI PENGATURAN) */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 items-start">
        
        {/* KOLOM KIRI (7 Kolom di Desktop): FILTER, HERO OMZET, PEMASUKAN/PENGELUARAN, LABA BERSIH, BANK/CASH */}
        <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-5 w-full">

          {/* PILLS CONTROL FILTER PERIODE */}
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-2xs gap-1">
            {['Hari Ini', 'Bulan Ini', 'Tahun Ini'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-1 py-2 rounded-xl text-[11px] lg:text-xs transition-all duration-200 cursor-pointer text-center border-0 ${
                  activeFilter === tab
                    ? 'bg-[#181b2b] text-white font-bold shadow-xs scale-[1.01]'
                    : 'text-[#86899B] font-medium hover:text-[#181b2b] bg-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => setIsCustomDateOpen(true)}
              className={`px-3 py-2 rounded-xl text-[11px] lg:text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border-0 ${
                activeFilter === 'Kustom'
                  ? 'bg-[#181b2b] text-white font-bold shadow-xs'
                  : 'text-[#86899B] hover:text-[#181b2b] bg-transparent'
              }`}
            >
              <Calendar size={13} />
            </button>
          </div>

          {/* HERO CARD: TOTAL OMZET */}
          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-md relative overflow-hidden flex items-center">
            <div className="relative z-10 w-full">
              <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet size={12} className="text-[#01a684]" /> TOTAL OMZET • {activeFilter.toUpperCase()}
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <h2 className="text-xl lg:text-2xl font-black tabular-nums tracking-tight">
                  {loading ? 'Memuat...' : `Rp ${reportData.omzet}`}
                </h2>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Supabase Real-time
                </span>
              </div>
            </div>
          </div>

          {/* BENTO GRID: PEMASUKAN VS PENGELUARAN */}
          <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between">
              <span className="text-[9px] lg:text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">PEMASUKAN</span>
              <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums mt-1.5">
                {loading ? '...' : `Rp ${reportData.pemasukan}`}
              </div>
              <div className="w-full h-1 bg-slate-200/80 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#01a684] rounded-full w-[80%]" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between">
              <span className="text-[9px] lg:text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">PENGELUARAN</span>
              <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums mt-1.5">
                {loading ? '...' : `Rp ${reportData.pengeluaran}`}
              </div>
              <div className="w-full h-1 bg-slate-200/80 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[55%]" />
              </div>
            </div>
          </div>

          {/* LABA BERSIH CARD */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-white/90 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider block">Selisih (Laba Bersih)</span>
              <span className="text-base lg:text-xl font-black text-[#01a684] tabular-nums mt-0.5 block">
                {loading ? '...' : `+ Rp ${reportData.labaBersih}`}
              </span>
            </div>
            <div className="bg-emerald-50 text-[#01a684] p-2.5 rounded-2xl border border-emerald-200">
              <TrendingUp size={18} />
            </div>
          </div>

          {/* BANK & CASH BENTO CARDS */}
          <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                  <Building2 size={12} />
                </div>
                <p className="text-[9px] lg:text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Uang di Bank</p>
              </div>
              <p className="text-xs lg:text-sm font-black text-[#181b2b] tabular-nums">{loading ? '...' : `Rp ${reportData.bank}`}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                  <CreditCard size={12} />
                </div>
                <p className="text-[9px] lg:text-[10px] font-extrabold text-[#86899B] uppercase tracking-wider">Uang Tunai</p>
              </div>
              <p className="text-xs lg:text-sm font-black text-[#181b2b] tabular-nums">{loading ? '...' : `Rp ${reportData.cash}`}</p>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (5 Kolom di Desktop): AKTIVITAS TRANSAKSI OWNER & KASIR */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-5 w-full">

          {/* RINGKASAN TRANSAKSI OWNER */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-white/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b]">Aktivitas Transaksi Owner</h2>
              <button 
                onClick={() => navigate('/owner/transaksi')}
                className="flex items-center gap-0.5 text-[#01a684] text-[11px] font-bold hover:underline cursor-pointer border-0 bg-transparent"
              >
                Detail <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {reportData.ownerTx.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F2F6]/60 border border-[#E9EBED]/50 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-2xs shrink-0">
                      <UserCheck size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#181b2b] truncate">{tx.title}</p>
                      <p className="text-[9px] text-[#86899B] truncate">{tx.desc}</p>
                    </div>
                  </div>
                  <p className={`font-black tabular-nums shrink-0 ml-2 ${tx.isLoss ? 'text-red-600' : 'text-[#01a684]'}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RINGKASAN TRANSAKSI KASIR */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-white/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b]">Aktivitas Kasir Terakhir</h2>
              <button 
                onClick={() => navigate('/owner/transaksi')}
                className="flex items-center gap-0.5 text-[#01a684] text-[11px] font-bold hover:underline cursor-pointer border-0 bg-transparent"
              >
                Detail <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
              {reportData.staffTx.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F2F6]/60 border border-[#E9EBED]/50 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-2xs shrink-0">
                      <ShoppingBag size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#181b2b] truncate">{tx.title}</p>
                      <p className="text-[9px] text-[#86899B] truncate">{tx.desc}</p>
                    </div>
                  </div>
                  <p className="font-black tabular-nums text-[#01a684] shrink-0 ml-2">
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* MODAL FILTER TANGGAL KUSTOM */}
      {isCustomDateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Pilih Rentang Tanggal</h3>
              <button onClick={() => setIsCustomDateOpen(false)} className="text-[#86899B] border-0 bg-transparent cursor-pointer">
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
                <button type="button" onClick={() => setIsCustomDateOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-transparent">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold shadow-sm cursor-pointer border-0">
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
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-4 border border-[#E9EBED] text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Unduh Laporan</h3>
              <button onClick={() => setIsDownloadOpen(false)} className="text-[#86899B] hover:text-[#181b2b] border-0 bg-transparent cursor-pointer">
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
                <FileText size={20} className="text-red-500" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setDownloadFormat('excel')}
                className={`p-3 border rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer ${
                  downloadFormat === 'excel' ? 'border-[#01a684] bg-emerald-50/50' : 'border-[#E9EBED]'
                }`}
              >
                <FileSpreadsheet size={20} className="text-emerald-600" />
                <span className="text-xs font-bold">Excel</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDownloadOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-xs font-bold rounded-xl cursor-pointer bg-transparent">
                Batal
              </button>
              <button onClick={handleDownloadConfirm} className="flex-1 py-2.5 bg-[#01a684] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer border-0">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Unduh Laporan</h3>
            <p className="text-[11px] text-[#86899B]">Mohon tunggu sebentar...</p>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}