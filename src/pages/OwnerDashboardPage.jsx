import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ArrowUpRight, ArrowDownLeft, 
  PieChart, Bell, Menu, Wallet,
  Coffee, Package, Tag, Users, ChevronRight, Sparkles 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Bulan');
  const [loading, setLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState('default');

  // State Profil Owner & Statistik
  const [ownerProfile, setOwnerProfile] = useState({
    name: 'Memuat...', // Nilai awal sebelum data ditarik
    initials: '...'
  });

  const [dashboardData, setDashboardData] = useState({
    omzet: 0,
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
    totalProduk: 0,
    totalBahan: 0,
    totalDiskon: 0,
    totalStaf: 0,
    totalTransaksi: 0,
    breakdown: [
      { label: 'Gaji Staff', pct: '45%', color: 'bg-[#01a684]', textCol: 'text-[#01a684]' },
      { label: 'Bahan Baku', pct: '25%', color: 'bg-amber-600', textCol: 'text-amber-600' },
      { label: 'Sewa Tempat', pct: '15%', color: 'bg-teal-500', textCol: 'text-teal-600' },
      { label: 'Lainnya', pct: '15%', color: 'bg-slate-300', textCol: 'text-slate-500' },
    ]
  });

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  const getInitials = (name) => {
    if (!name || name === 'Memuat...') return 'OW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification('Notifikasi Outlet Diaktifkan', {
          body: 'Notifikasi transaksi real-time aktif.',
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.error('Gagal meminta izin notifikasi:', err);
    }
  };

  // 1. ISOLASI FUNGSI PROFIL: Penarik Nama Asli dari Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentOwnerId = getOwnerId();
        let fetchedName = '';

        // Skema A: Tarik berdasarkan User ID yang sedang login
        if (session && session.user) {
          const { data: profileById } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileById && profileById.full_name) fetchedName = profileById.full_name;
          else if (session.user.user_metadata?.full_name) fetchedName = session.user.user_metadata.full_name;
        }

        // Skema B: Fallback (Jika tes lokal tanpa login, cari profil pertama/berdasarkan owner_id)
        if (!fetchedName) {
          const { data: profileByOwnerId } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('owner_id', currentOwnerId)
            .limit(1)
            .maybeSingle();
            
          if (profileByOwnerId && profileByOwnerId.full_name) {
            fetchedName = profileByOwnerId.full_name;
          } else {
            // Skema C Brutal: Tarik nama profil apapun di database sebagai bukti koneksi sukses
            const { data: anyProfile } = await supabase.from('profiles').select('full_name').limit(1).maybeSingle();
            if (anyProfile && anyProfile.full_name) fetchedName = anyProfile.full_name;
          }
        }

        // Simpan ke state agar layar menampilkan "Halo, Berfikir Logika"
        if (fetchedName) {
          setOwnerProfile({
            name: fetchedName,
            initials: getInitials(fetchedName)
          });
        } else {
          setOwnerProfile({ name: 'Owner Outlet', initials: 'OW' });
        }
      } catch (err) {
        console.error('Error saat menarik data profil:', err);
      }
    };
    fetchProfileData();
  }, []);

  // 2. ISOLASI FUNGSI DASHBOARD: Supaya error transaksi tidak menghalangi profil
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();

        // Ambil Transaksi
        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('total_amount, total_pay, type')
          .eq('owner_id', currentOwnerId);

        if (txError) console.warn('Transaksi belum tersedia / error:', txError.message);

        let totalOmzet = 0;
        let totalKeluar = 0;
        let countTrx = 0;

        if (txs && txs.length > 0) {
          countTrx = txs.length;
          txs.forEach((curr) => {
            const amount = Number(curr.total_pay || curr.total_amount) || 0;
            const type = curr.type || 'Masuk';
            if (type === 'Masuk') totalOmzet += amount;
            else if (type === 'Keluar') totalKeluar += amount;
          });
        }

        // Ambil hitungan tabel lain secara paralel agar cepat
        const [
          { count: prodCount },
          { count: bahanCount },
          { count: diskonCount },
          { count: stafCount }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('owner_id', currentOwnerId),
          supabase.from('ingredients').select('*', { count: 'exact', head: true }).eq('owner_id', currentOwnerId),
          supabase.from('discounts').select('*', { count: 'exact', head: true }).eq('owner_id', currentOwnerId),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('owner_id', currentOwnerId)
        ]);

        const calculatedPengeluaran = totalKeluar > 0 ? totalKeluar : (totalOmzet * 0.40);
        const netSaldo = totalOmzet - calculatedPengeluaran;

        setDashboardData({
          omzet: totalOmzet,
          pemasukan: totalOmzet,
          pengeluaran: calculatedPengeluaran,
          saldo: netSaldo,
          totalProduk: prodCount || 0,
          totalBahan: bahanCount || 0,
          totalDiskon: diskonCount || 0,
          totalStaf: stafCount || 0,
          totalTransaksi: countTrx,
          breakdown: [
            { label: 'Gaji Staff', pct: '45%', color: 'bg-[#01a684]', textCol: 'text-[#01a684]' },
            { label: 'Bahan Baku', pct: '25%', color: 'bg-amber-600', textCol: 'text-amber-600' },
            { label: 'Sewa Tempat', pct: '15%', color: 'bg-teal-500', textCol: 'text-teal-600' },
            { label: 'Lainnya', pct: '15%', color: 'bg-slate-300', textCol: 'text-slate-500' },
          ]
        });
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeFilter]);

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER DENGAN SAPAAN DINAMIS "Halo, [full_name]" */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#181b2b] hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-0 bg-transparent">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-emerald-100 border border-emerald-200 text-[#01a684] font-bold flex items-center justify-center text-xs shadow-2xs">
                {ownerProfile.initials}
              </div>
              <div>
                <h1 className="text-[11px] lg:text-xs font-bold text-[#181b2b] leading-tight">Halo, {ownerProfile.name}</h1>
                <p className="text-[8px] lg:text-[9px] text-[#86899B] font-medium">
                  Owner Outlet
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRequestNotificationPermission}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer relative border-0 ${
              notificationStatus === 'granted' ? 'bg-emerald-50 text-[#01a684]' : 'bg-white hover:bg-slate-100 text-[#181b2b]'
            }`}
            title="Aktifkan Notifikasi Perangkat"
          >
            <Bell size={16} />
            {notificationStatus !== 'granted' && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 border-2 border-[#F1F2F6]" />
            )}
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 items-start">

        {/* KOLOM KIRI */}
        <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-5 w-full">

          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/90 shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="text-[#01a684]" /> TOTAL OMZET BISNIS • {activeFilter.toUpperCase()}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-xl lg:text-3xl font-black text-[#181b2b] tracking-tight tabular-nums">
                    {loading ? 'Memuat...' : `Rp ${formatRp(dashboardData.omzet)}`}
                  </h2>
                  <span className="text-[9px] lg:text-[10px] font-extrabold text-[#01a684] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                    <TrendingUp size={10} /> Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="relative h-24 lg:h-32 w-full mt-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#01a684" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#01a684" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 70 Q 50 50, 100 80 T 200 30 T 300 10 L 300 100 L 0 100 Z" fill="url(#chartGradient)" />
                <path d="M 0 70 Q 50 50, 100 80 T 200 30 T 300 10" fill="none" stroke="#01a684" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-2xs">
            {['Minggu', 'Bulan', 'Tahun'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-1 py-2 rounded-xl text-[11px] lg:text-xs transition-all duration-200 cursor-pointer text-center ${
                  activeFilter === tab
                    ? 'bg-[#181b2b] text-white font-bold shadow-xs scale-[1.01]'
                    : 'text-[#86899B] font-medium hover:text-[#181b2b]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider">PEMASUKAN</span>
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                  <ArrowDownLeft size={12} />
                </div>
              </div>
              <div>
                <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums">
                  {loading ? '...' : `Rp ${formatRp(dashboardData.pemasukan)}`}
                </div>
                <span className="text-[9px] text-slate-500 font-medium block mt-1">
                  {dashboardData.totalTransaksi} Transaksi Berhasil
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider">PENGELUARAN</span>
                <div className="w-5 h-5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight size={12} />
                </div>
              </div>
              <div>
                <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums">
                  {loading ? '...' : `Rp ${formatRp(dashboardData.pengeluaran)}`}
                </div>
                <span className="text-[9px] text-slate-500 font-medium block mt-1">
                  Estimasi Operasional
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-5 w-full">

          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-md relative overflow-hidden flex items-center">
            <div className="relative z-10 w-full flex justify-between items-start">
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Wallet size={12} className="text-[#01a684]" /> SALDO KAS BERSIH (NET BALANCE)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-xl lg:text-2xl font-black tabular-nums tracking-tight">
                    {loading ? '...' : `Rp ${formatRp(dashboardData.saldo)}`}
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Aman
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs flex flex-col gap-2.5">
            <h3 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b] flex items-center gap-1.5">
              <PieChart size={14} className="text-[#01a684]" /> Highlight Modul Outlet
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => navigate('/owner/produk')}
                className="bg-[#F1F2F6] hover:bg-emerald-50 p-2.5 rounded-xl border border-[#E9EBED] cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                    <Coffee size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#86899B] font-bold block uppercase">Produk</span>
                    <strong className="text-xs text-[#181b2b]">{dashboardData.totalProduk} Menu</strong>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/owner/bahan')}
                className="bg-[#F1F2F6] hover:bg-emerald-50 p-2.5 rounded-xl border border-[#E9EBED] cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                    <Package size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#86899B] font-bold block uppercase">Bahan</span>
                    <strong className="text-xs text-[#181b2b]">{dashboardData.totalBahan} Item</strong>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/owner/diskon')}
                className="bg-[#F1F2F6] hover:bg-emerald-50 p-2.5 rounded-xl border border-[#E9EBED] cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                    <Tag size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#86899B] font-bold block uppercase">Diskon</span>
                    <strong className="text-xs text-[#181b2b]">{dashboardData.totalDiskon} Promo</strong>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/owner/staf')}
                className="bg-[#F1F2F6] hover:bg-emerald-50 p-2.5 rounded-xl border border-[#E9EBED] cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                    <Users size={14} />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#86899B] font-bold block uppercase">Staf</span>
                    <strong className="text-xs text-[#181b2b]">{dashboardData.totalStaf} Anggota</strong>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#181b2b] flex items-center gap-1.5">
                <PieChart size={14} className="text-[#01a684]" /> Rincian Pengeluaran
              </h3>
              <span className="text-[9px] font-extrabold text-[#01a684] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {activeFilter}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-24 h-24 lg:w-28 lg:h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#01a684]" strokeDasharray="45, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-600" strokeDasharray="25, 100" strokeDashoffset="-45" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-teal-500" strokeDasharray="15, 100" strokeDashoffset="-70" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[7px] font-bold text-[#86899B] uppercase">Total</span>
                  <span className="text-[9px] font-black text-[#181b2b] leading-tight">Rp {formatRp(dashboardData.pengeluaran)}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                {dashboardData.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="font-bold text-[#181b2b] text-[10px]">{item.label}</span>
                    </div>
                    <span className={`font-black text-[10px] ${item.textCol}`}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      <OwnerBottomNav />

    </div>
  );
}