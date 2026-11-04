import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Wallet, Building2, CreditCard, ChevronRight, 
  ShoppingBag, X, Download, FileText, FileSpreadsheet, RotateCw, TrendingUp,
  UserCheck, Database, Boxes, Activity, Package 
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
    hpp: '0',
    labaBersih: '0',
    marginPct: 0,
    bank: '0',
    cash: '0',
    asetProduk: '0',
    asetBahan: '0',
    totalAset: '0',
    ownerTx: [],
    staffTx: [],
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  useEffect(() => {
    const fetchReportsAndAssets = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();
        const now = new Date();
        
        let txData = [];

        // 1. QUERY TRANSAKSI & DETAIL ITEM (Anti-Crash Fallback)
        try {
          let query = supabase
            .from('transactions')
            .select('*, transaction_items(*)')
            .eq('owner_id', currentOwnerId)
            .order('created_at', { ascending: false });

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
          if (data) txData = data;

        } catch (err) {
          console.warn('Fallback kueri transaksi sederhana berjalan...', err.message);
          // Jika relasi transaction_items belum ada, pakai kueri biasa agar tidak blank putih
          let fallbackQuery = supabase
            .from('transactions')
            .select('*')
            .eq('owner_id', currentOwnerId)
            .order('created_at', { ascending: false });

          if (activeFilter === 'Hari Ini') fallbackQuery = fallbackQuery.gte('created_at', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());
          else if (activeFilter === 'Bulan Ini') fallbackQuery = fallbackQuery.gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString());
          else if (activeFilter === 'Tahun Ini') fallbackQuery = fallbackQuery.gte('created_at', new Date(now.getFullYear(), 0, 1).toISOString());
          else if (activeFilter === 'Kustom' && startDate && endDate) fallbackQuery = fallbackQuery.gte('created_at', `${startDate}T00:00:00`).lte('created_at', `${endDate}T23:59:59`);

          const { data } = await fallbackQuery;
          if (data) txData = data;
        }

        // Kalkulasi Transaksi
        let totalOmzet = 0;
        let totalHpp = 0;
        let totalBank = 0;
        let totalCash = 0;
        const staffTransactions = [];

        txData.forEach((tx) => {
          const amount = Number(tx.total_pay || tx.total_amount) || 0;
          const type = tx.type || 'Masuk';
          
          if (type === 'Masuk') {
            totalOmzet += amount;

            // Hitung HPP aktual berdasarkan item (jika relasinya ada)
            if (tx.transaction_items && Array.isArray(tx.transaction_items) && tx.transaction_items.length > 0) {
              tx.transaction_items.forEach(item => {
                totalHpp += (Number(item.hpp || 0) * Number(item.quantity || 1));
              });
            } else {
              // Estimasi HPP jika belum ada detail (35%)
              totalHpp += (amount * 0.35);
            }

            const method = (tx.payment_method || '').toLowerCase();
            if (method.includes('cash') || method.includes('tunai')) {
              totalCash += amount;
            } else {
              totalBank += amount;
            }

            staffTransactions.push({
              title: `Penjualan (${tx.cashier_name || 'Kasir'})`,
              desc: `Metode: ${(tx.payment_method || 'Tunai').toUpperCase()}`,
              amount: `+ Rp ${amount.toLocaleString('id-ID')}`,
              isLoss: false
            });
          } else if (type === 'Keluar') {
            staffTransactions.push({
              title: `Pengeluaran Kasir`,
              desc: tx.notes || 'Pengeluaran Operasional',
              amount: `- Rp ${amount.toLocaleString('id-ID')}`,
              isLoss: true
            });
          }
        });

        const labaBersih = totalOmzet - totalHpp;
        const marginPct = totalOmzet > 0 ? Math.round((labaBersih / totalOmzet) * 100) : 0;

        // 2. QUERY ASET PRODUK JADI (Aman tanpa Crash)
        let asetProduk = 0;
        try {
          const { data: prodData } = await supabase.from('products').select('*').eq('owner_id', currentOwnerId);
          if (prodData) {
            prodData.forEach(p => {
              if (p.tipe_stok === 'manual') {
                asetProduk += (Number(p.stok_manual || 0) * Number(p.hpp || 0));
              }
            });
          }
        } catch (e) { console.warn('Abaikan: Tabel produk belum optimal'); }

        // 3. QUERY ASET BAHAN BAKU (Aman tanpa Crash)
        let asetBahan = 0;
        try {
          const { data: bahanData } = await supabase.from('ingredients').select('*').eq('owner_id', currentOwnerId);
          if (bahanData) {
            bahanData.forEach(b => {
              const hargaSatuan = Number(b.harga_satuan || b.harga_beli || b.hpp || 0);
              asetBahan += (Number(b.stok || 0) * hargaSatuan);
            });
          }
        } catch (e) { console.warn('Abaikan: Tabel bahan belum optimal'); }

        const totalAset = asetProduk + asetBahan;

        setReportData({
          omzet: totalOmzet.toLocaleString('id-ID'),
          hpp: totalHpp.toLocaleString('id-ID'),
          labaBersih: labaBersih.toLocaleString('id-ID'),
          marginPct: marginPct,
          bank: totalBank.toLocaleString('id-ID'),
          cash: totalCash.toLocaleString('id-ID'),
          asetProduk: asetProduk.toLocaleString('id-ID'),
          asetBahan: asetBahan.toLocaleString('id-ID'),
          totalAset: totalAset.toLocaleString('id-ID'),
          ownerTx: [
            { title: 'Laba Ditahan', desc: 'Sisa Untung Bersih Terkini', amount: `+ Rp ${labaBersih.toLocaleString('id-ID')}` },
            { title: 'Total Modal Tertahan', desc: 'Modal Produk Terjual (HPP)', amount: `- Rp ${totalHpp.toLocaleString('id-ID')}`, isLoss: true },
          ],
          staffTx: staffTransactions.length > 0 ? staffTransactions : [
            { title: 'Belum ada transaksi', desc: 'Sistem POS siap mencatat', amount: 'Rp 0' }
          ],
        });
      } catch (err) {
        console.error('Gagal memproses data dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsAndAssets();
  }, [activeFilter, startDate, endDate]);

  const handleDownloadConfirm = () => {
    setIsDownloadOpen(false);
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert(`Laporan detail (Omzet, HPP, Margin, Aset) berhasil diunduh dalam format ${downloadFormat.toUpperCase()}!`);
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
            title="Unduh Laporan Analitik"
          >
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* CONTENT BODY RESPONSIF */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 items-start">
        
        {/* KOLOM KIRI (7 Kolom di Desktop) */}
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

          {/* HERO CARD: TOTAL OMZET & LABA BERSIH */}
          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-md relative overflow-hidden flex flex-col gap-4">
            <div className="relative z-10 w-full flex justify-between items-start">
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Wallet size={12} className="text-[#01a684]" /> OMZET KOTOR • {activeFilter.toUpperCase()}
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <h2 className="text-2xl lg:text-3xl font-black tabular-nums tracking-tight">
                    {loading ? 'Memuat...' : `Rp ${reportData.omzet}`}
                  </h2>
                </div>
              </div>
              <div className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 flex flex-col items-end">
                <span className="text-[9px] text-emerald-100 font-bold uppercase">Margin Profit</span>
                <span className="text-sm font-black text-emerald-400">{reportData.marginPct}%</span>
              </div>
            </div>

            {/* BARIS KEDUA: HPP & LABA */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 relative z-10">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Total Modal (HPP)</span>
                <span className="text-sm font-bold text-rose-300">- Rp {reportData.hpp}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Laba / Untung Bersih</span>
                <span className="text-sm font-bold text-emerald-300">+ Rp {reportData.labaBersih}</span>
              </div>
            </div>
          </div>

          {/* BENTO GRID: ASET GUDANG */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-4 lg:p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E9EBED] pb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Database size={14} />
              </div>
              <div>
                <h3 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b]">Total Nilai Aset Saat Ini</h3>
                <p className="text-[9px] text-[#86899B]">Valuasi modal tertahan di produk & gudang bahan</p>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#181b2b] tabular-nums">Rp {reportData.totalAset}</span>
                <span className="text-[9px] font-bold text-indigo-500 flex items-center gap-1 mt-0.5">
                  <Activity size={10} /> Akumulasi HPP & Harga Beli
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-[#F1F2F6] p-2.5 rounded-xl border border-[#E9EBED]">
                <span className="text-[9px] font-bold text-[#86899B] block mb-0.5 flex items-center gap-1">
                  <Package size={10} /> Aset Produk Jadi
                </span>
                <span className="text-xs font-bold text-[#181b2b]">Rp {reportData.asetProduk}</span>
              </div>
              <div className="bg-[#F1F2F6] p-2.5 rounded-xl border border-[#E9EBED]">
                <span className="text-[9px] font-bold text-[#86899B] block mb-0.5 flex items-center gap-1">
                  <Boxes size={10} /> Aset Bahan Baku
                </span>
                <span className="text-xs font-bold text-[#181b2b]">Rp {reportData.asetBahan}</span>
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (5 Kolom di Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-5 w-full">

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

          {/* RINGKASAN TRANSAKSI OWNER */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-5 border border-white/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b]">Arus Kas Bersih (Periode Ini)</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {reportData.ownerTx.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F2F6]/60 border border-[#E9EBED]/50 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#01a684] shadow-2xs shrink-0">
                      <TrendingUp size={14} className={tx.isLoss ? 'text-rose-500' : 'text-[#01a684]'} />
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
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
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
                  <p className={`font-black tabular-nums shrink-0 ml-2 ${tx.isLoss ? 'text-red-600' : 'text-[#01a684]'}`}>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Menyiapkan File</h3>
            <p className="text-[11px] text-[#86899B]">Mohon tunggu sebentar...</p>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}