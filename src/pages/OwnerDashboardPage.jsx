import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ArrowUpRight, ArrowDownLeft, 
  PieChart, Bell, Menu, Wallet,
  LogOut, Edit3, X, Save, Camera
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Bulan');

  const [userProfile, setUserProfile] = useState({
    name: 'Kelly Victor',
    email: 'kelly.victor@kedai.com',
    avatar: null,
  });

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    avatar: userProfile.avatar,
  });

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
      
      {/* HEADER RESPONSIF */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#181b2b] hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-0 bg-transparent">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#01a684] text-white font-bold flex items-center justify-center text-[10px] lg:text-xs shadow-2xs">
                KV
              </div>
              <div>
                <h1 className="text-[11px] lg:text-xs font-bold text-[#181b2b] leading-tight">Kelly Victor</h1>
                <p className="text-[8px] lg:text-[9px] text-[#86899B] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Update 2 min ago
                </p>
              </div>
            </div>
          </div>

          <button className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#181b2b] hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer relative border-0 bg-transparent">
            <Bell size={16} />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 border-2 border-[#F1F2F6]" />
          </button>
        </div>
      </header>

      {/* CONTENT BODY RESPONSIF (UKURAN SAMA DENGAN PENGATURAN) */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 items-start">

        {/* KOLOM KIRI (7 Kolom di Desktop): HERO OMZET & FILTER */}
        <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-5 w-full">

          {/* HERO SECTION: TOTAL OMZET & GRAFIK */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/90 shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  TOTAL OMZET • {activeFilter.toUpperCase()}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h2 className="text-xl lg:text-3xl font-black text-[#181b2b] tracking-tight tabular-nums">
                    Rp {current.omzet}
                  </h2>
                  <span className="text-[9px] lg:text-[10px] font-extrabold text-[#01a684] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                    <TrendingUp size={10} /> {current.growthOmzet}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative h-24 lg:h-32 w-full mt-3">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#181b2b] text-white px-2 py-0.5 rounded-xl text-[9px] font-bold shadow-md flex items-center gap-1 z-10 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#01a684]"></span>
                <span>JUL 24 • <strong className="text-[#01a684]">Rp 15.0M</strong></span>
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

          {/* KARTU BENTO: MASUK VS KELUAR */}
          <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  MASUK • {activeFilter.toUpperCase()}
                </span>
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center">
                  <ArrowDownLeft size={12} />
                </div>
              </div>
              <div>
                <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums">
                  Rp {current.masuk}
                </div>
                <div className="w-full h-1 bg-slate-200/80 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#01a684] rounded-full" style={{ width: current.masukPct }} />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] lg:text-[10px] font-bold text-[#86899B] uppercase tracking-wider">
                  KELUAR • {activeFilter.toUpperCase()}
                </span>
                <div className="w-5 h-5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight size={12} />
                </div>
              </div>
              <div>
                <div className="text-base lg:text-xl font-black text-[#181b2b] tabular-nums">
                  Rp {current.keluar}
                </div>
                <div className="w-full h-1 bg-slate-200/80 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: current.keluarPct }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (5 Kolom di Desktop): SALDO KAS & DONUT CHART */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-5 w-full">

          {/* SALDO KAS (NET BALANCE) */}
          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-md relative overflow-hidden flex items-center">
            <div className="relative z-10 w-full flex justify-between items-start">
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Wallet size={12} className="text-[#01a684]" /> SALDO KAS (NET BALANCE)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-xl lg:text-2xl font-black tabular-nums tracking-tight">
                    Rp {current.saldo}
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-0.5">
                    <TrendingUp size={9} /> {current.growthSaldo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DONUT CHART RINCIAN PENGELUARAN */}
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
                  <path className="text-[#01a684]" strokeDasharray="48, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-600" strokeDasharray="16, 100" strokeDashoffset="-48" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[7px] font-bold text-[#86899B] uppercase">Total</span>
                  <span className="text-[9px] font-black text-[#181b2b] leading-tight">{current.totalKeluarChart}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                {current.breakdown.map((item, idx) => (
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