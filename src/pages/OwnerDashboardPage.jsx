import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ArrowUpRight, ArrowDownLeft, 
  PieChart, Bell, Menu, Wallet, ShieldCheck
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';
import { supabase } from '../supabaseClient';

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Bulan');

  // State untuk Profil User Asli dari Supabase & Status Langganan
  const [userProfile, setUserProfile] = useState({
    name: 'Owner Titik Jual',
    email: 'owner@titikjual.com',
    plan: 'Growth Plan',
  });

  // Ambil data profil & paket dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchOwnerProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, subscription_plan')
            .eq('id', user.id)
            .single();

          if (profile) {
            let planName = 'Paket Growth';
            if (profile.subscription_plan === 'free_trial') planName = 'Uji Coba 2 Minggu';
            else if (profile.subscription_plan === 'starter') planName = 'Paket Starter';
            else if (profile.subscription_plan === 'enterprise') planName = 'Pro Enterprise';

            setUserProfile({
              name: profile.full_name || user.email.split('@')[0],
              email: profile.email || user.email,
              plan: planName,
            });
          }
        }
      } catch (err) {
        console.error('Gagal memuat profil owner:', err);
      }
    };

    fetchOwnerProfile();
  }, []);

  // Dummy Dataset Berdasarkan Filter
  const filterData = {
    Minggu: {
      omzet: '37.500.000',
      growthOmzet: '+5%',
      masuk: '31.2M',
      keluar: '20.5M',
      masukPct: '75%',
      keluarPct: '50%',
      saldo: '17.000.000',
      growthSaldo: '+8%',
      totalKeluarChart: 'Rp 20.5M',
      breakdown: [
        { label: 'Gaji Staff', pct: '45%', color: 'bg-emerald-500', textCol: 'text-emerald-600' },
        { label: 'Bahan Baku', pct: '25%', color: 'bg-amber-500', textCol: 'text-amber-600' },
        { label: 'Sewa Tempat', pct: '15%', color: 'bg-teal-500', textCol: 'text-teal-600' },
        { label: 'Lainnya', pct: '15%', color: 'bg-slate-300', textCol: 'text-slate-500' },
      ]
    },
    Bulan: {
      omzet: '150.000.000',
      growthOmzet: '+9%',
      masuk: '125.4M',
      keluar: '82.1M',
      masukPct: '80%',
      keluarPct: '55%',
      saldo: '67.900.000',
      growthSaldo: '+12%',
      totalKeluarChart: 'Rp 82.1M',
      breakdown: [
        { label: 'Gaji Staff', pct: '48%', color: 'bg-[#01a684]', textCol: 'text-[#01a684]' },
        { label: 'Bahan Baku', pct: '16%', color: 'bg-amber-600', textCol: 'text-amber-600' },
        { label: 'Sewa Tempat', pct: '13%', color: 'bg-teal-500', textCol: 'text-teal-600' },
        { label: 'Lainnya', pct: '23%', color: 'bg-slate-300', textCol: 'text-slate-500' },
      ]
    },
    Tahun: {
      omzet: '1.800.000.000',
      growthOmzet: '+18%',
      masuk: '1.500M',
      keluar: '980M',
      masukPct: '85%',
      keluarPct: '60%',
      saldo: '820.000.000',
      growthSaldo: '+15%',
      totalKeluarChart: 'Rp 980M',
      breakdown: [
        { label: 'Gaji Staff', pct: '50%', color: 'bg-[#01a684]', textCol: 'text-[#01a684]' },
        { label: 'Bahan Baku', pct: '20%', color: 'bg-amber-600', textCol: 'text-amber-600' },
        { label: 'Sewa Tempat', pct: '10%', color: 'bg-teal-500', textCol: 'text-teal-600' },
        { label: 'Lainnya', pct: '20%', color: 'bg-slate-300', textCol: 'text-slate-500' },
      ]
    }
  };

  const current = filterData[activeFilter];

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER: RESPONSIF (TETAP RAPI DI HP, MENYESUAIKAN DI TABLET/DESKTOP) */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between max-w-md lg:max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <button className="w-9 h-9 flex items-center justify-center text-[#181b2b] hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#01a684] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xs lg:text-sm font-bold text-[#181b2b] leading-tight">{userProfile.name}</h1>
                <p className="text-[9px] lg:text-[10px] text-[#86899B] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {userProfile.plan} • Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-[#01a684] border border-emerald-200">
              <ShieldCheck size={14} /> Langganan Aktif
            </span>
            <button className="w-9 h-9 flex items-center justify-center text-[#181b2b] hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer relative">
              <Bell size={18} />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 border-2 border-[#F1F2F6]" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT BODY: 
          - Di Mode HP / Potrait: Tetap max-w-md dengan susunan vertikal murni persis seperti aslinya.
          - Di Mode Tablet / Desktop (lg:): Berubah otomatis menjadi max-w-7xl dengan 2 kolom grid yang profesional. */}
      <main className="p-5 max-w-md lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-5">

        {/* ========================================================= */}
        {/* KOLOM KIRI & TENGAH (UTAMA DI DESKTOP, URUTAN ATAS DI HP)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* HERO SECTION: TOTAL OMZET & GRAFIK */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  TOTAL OMZET • {activeFilter.toUpperCase()}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h2 className="text-2xl lg:text-3xl font-black text-[#181b2b] tracking-tight tabular-nums">
                    Rp {current.omzet}
                  </h2>
                  <span className="text-[10px] font-extrabold text-[#01a684] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                    <TrendingUp size={11} /> {current.growthOmzet}
                  </span>
                </div>
              </div>
            </div>

            {/* SIMULASI VISUAL GRAFIK PENJUALAN */}
            <div className="relative h-28 lg:h-36 w-full mt-3">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#181b2b] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-1.5 z-10 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#01a684]"></span>
                <span>PERFORMA • <strong className="text-[#01a684]">OPTIMAL</strong></span>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#01a684" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#01a684" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 70 Q 50 50, 100 80 T 200 30 T 300 10 L 300 100 L 0 100 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 0 70 Q 50 50, 100 80 T 200 30 T 300 10"
                  fill="none"
                  stroke="#01a684"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* FILTER PERIODE */}
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 flex shadow-sm">
            {['Minggu', 'Bulan', 'Tahun'].map((tab) => (
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
          </div>

          {/* KARTU BENTO: MASUK VS KELUAR */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Uang Masuk */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  MASUK • {activeFilter.toUpperCase()}
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                  <ArrowDownLeft size={14} />
                </div>
              </div>
              
              <div>
                <div className="text-xl font-black text-[#181b2b] tabular-nums">
                  Rp {current.masuk}
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-[#01a684] rounded-full transition-all duration-500" 
                    style={{ width: current.masukPct }} 
                  />
                </div>
              </div>
            </div>

            {/* Uang Keluar */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-rose-200 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  KELUAR • {activeFilter.toUpperCase()}
                </span>
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight size={14} />
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-[#181b2b] tabular-nums">
                  Rp {current.keluar}
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: current.keluarPct }} 
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN (SIDEBAR DESKTOP / BAWAH DI HP)                 */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-4">

          {/* HERO CARD: SALDO KAS (BERSIH TANPA WATERMARK BRAND LAIN) */}
          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden min-h-[110px] flex items-center">
            <div className="relative z-10 w-full flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Wallet size={12} className="text-[#01a684]" /> SALDO KAS (NET BALANCE)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black tabular-nums tracking-tight">
                    Rp {current.saldo}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-0.5">
                    <TrendingUp size={10} /> {current.growthSaldo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DONUT CHART RINCIAN PENGELUARAN */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] flex items-center gap-1.5">
                <PieChart size={15} className="text-[#01a684]" /> Rincian Pengeluaran
              </h3>
              <span className="text-[10px] font-extrabold text-[#01a684] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {activeFilter}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#01a684]"
                    strokeDasharray="48, 100"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-600"
                    strokeDasharray="16, 100"
                    strokeDashoffset="-48"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[8px] font-bold text-[#86899B] uppercase">Total</span>
                  <span className="text-[10px] font-black text-[#181b2b] leading-tight">{current.totalKeluarChart}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {current.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-bold text-[#181b2b] text-[11px]">{item.label}</span>
                    </div>
                    <span className={`font-black text-[11px] ${item.textCol}`}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* BOTTOM NAV */}
      <OwnerBottomNav />

    </div>
  );
}