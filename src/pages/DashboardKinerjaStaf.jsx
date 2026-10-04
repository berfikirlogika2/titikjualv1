import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  PackageCheck, 
  Sparkles, 
  ChevronRight, 
  BarChart3, 
  Calendar,
  Filter
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

// Helper Format Rupiah Bertitik
const formatRupiah = (val) => {
  if (!val && val !== 0) return '0';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function DashboardKinerjaStaf() {
  const navigate = useNavigate();

  // State Filter Periode
  const [periode, setPeriode] = useState('bulan-ini'); // 'hari-ini' | 'bulan-ini'
  const [roleFilter, setRoleFilter] = useState('semua'); // 'semua' | 'kasir' | 'kitchen' | 'gudang'

  // Dataset Staf Multi-Role dengan Metrics KPI Spesifik
  const [stafKinerja] = useState([
    {
      id: 1,
      nama: 'Sarah Jenkins',
      role: 'Kasir Utama',
      category: 'kasir',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC54RS-FPhATAoIvMsOPUHlPeEngmQukv9fSI7kmdKSzq9ZmBrorvy6MVB_PaIz9YcrOT97FZre41LyFpchvJzqGR9hMbzMO9oQd52ZlYpOHRUacB4kA-Wo0py1he1XfuG4_SIsyhmfOFydQCF4Vg703vpKeTmNmTflcgwOWMRS0SJQMdas4VRjLoZQ-i5luPAhgqMBoIxfO3A7Ftm0Yv_y28_vAsDnUo58jixO5-qNgl0NsoHTuJXbhA',
      kpiMainLabel: 'Total Omzet Diolah',
      kpiMainValue: 18500000,
      kpiMainUnit: 'Rp',
      kpiSecondaryLabel: 'Total Transaksi',
      kpiSecondaryValue: '412 Tx',
      targetProgress: 92, // %
      scoreRating: 4.9,
      kecepatanKerja: '1.2 mnt / Tx',
      gajiPokok: 3000000,
      bonusKinerja: 450000,
      isEmployeeOfMonth: true,
      achievementBadge: 'Top Revenue'
    },
    {
      id: 2,
      nama: 'Rian Pratama',
      role: 'Head Barista / Kitchen',
      category: 'kitchen',
      avatar: null,
      kpiMainLabel: 'Porsi Disajikan',
      kpiMainValue: 1240,
      kpiMainUnit: 'Porsi',
      kpiSecondaryLabel: 'Waktu Penyajian',
      kpiSecondaryValue: '3.5 mnt / Porsi',
      targetProgress: 88,
      scoreRating: 4.8,
      kecepatanKerja: '3.5 mnt / Porsi',
      gajiPokok: 2800000,
      bonusKinerja: 380000,
      isEmployeeOfMonth: false,
      achievementBadge: 'Fastest Service'
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      role: 'Kasir Shift Sore',
      category: 'kasir',
      avatar: null,
      kpiMainLabel: 'Total Omzet Diolah',
      kpiMainValue: 9200000,
      kpiMainUnit: 'Rp',
      kpiSecondaryLabel: 'Total Transaksi',
      kpiSecondaryValue: '205 Tx',
      targetProgress: 75,
      scoreRating: 4.5,
      kecepatanKerja: '1.8 mnt / Tx',
      gajiPokok: 2500000,
      bonusKinerja: 200000,
      isEmployeeOfMonth: false,
      achievementBadge: 'Consistent'
    },
    {
      id: 4,
      nama: 'Dewi Lestari',
      role: 'Staf Gudang & Stok',
      category: 'gudang',
      avatar: null,
      kpiMainLabel: 'Akurasi Stok Opname',
      kpiMainValue: 99.2,
      kpiMainUnit: '%',
      kpiSecondaryLabel: 'Restock Tepat Waktu',
      kpiSecondaryValue: '48 Batch',
      targetProgress: 98,
      scoreRating: 4.9,
      kecepatanKerja: '0 Selisih Item',
      gajiPokok: 2600000,
      bonusKinerja: 350000,
      isEmployeeOfMonth: false,
      achievementBadge: 'Zero Waste'
    }
  ]);

  // Filter Data Berdasarkan Role
  const filteredStaf = stafKinerja.filter(s => {
    if (roleFilter === 'semua') return true;
    return s.category === roleFilter;
  });

  // Cari Employee of the Month
  const topPerformer = stafKinerja.find(s => s.isEmployeeOfMonth) || stafKinerja[0];

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/95 backdrop-blur-sm px-5 py-4 border-b border-[#E9EBED] flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 text-[#181b2b] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Dashboard Kinerja Tim</h1>
        <div className="w-5" />
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO CARD: EMPLOYEE OF THE MONTH (GAMIFIKASI) */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full text-amber-200 border border-amber-300/30 flex items-center gap-1">
              <Trophy size={12} className="text-amber-300" /> Employee of the Month
            </span>
            <span className="text-[10px] text-amber-100 font-semibold">September 2026</span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative shrink-0">
              {topPerformer.avatar ? (
                <img 
                  src={topPerformer.avatar} 
                  alt={topPerformer.nama} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 text-white font-bold text-xl flex items-center justify-center border-2 border-amber-200">
                  {topPerformer.nama.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-amber-300 text-slate-900 rounded-full p-1 shadow-sm">
                <Sparkles size={14} fill="currentColor" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-bold">{topPerformer.nama}</h2>
              <p className="text-xs text-amber-100 font-medium">{topPerformer.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-bold">
                  Score: ⭐ {topPerformer.scoreRating} / 5.0
                </span>
                <span className="text-[10px] bg-amber-300 text-slate-900 px-2 py-0.5 rounded-lg font-bold">
                  {topPerformer.achievementBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS BENTO OVERVIEW */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#E9EBED] p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#01a684] flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86899B] uppercase">Rata-rata Servis</p>
              <p className="text-sm font-bold text-[#181b2b]">2.4 mnt / Porsi</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9EBED] p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#01a684] flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86899B] uppercase">Total Bonus Kinerja</p>
              <p className="text-sm font-bold text-[#01a684] tabular-nums">Rp {formatRupiah(1380000)}</p>
            </div>
          </div>
        </div>

        {/* TAB FILTER ROLE STAF */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'semua', label: 'Semua Staf' },
            { id: 'kasir', label: 'Kasir' },
            { id: 'kitchen', label: 'Kitchen & Bar' },
            { id: 'gudang', label: 'Gudang' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-[#01a684] text-white shadow-sm'
                  : 'bg-white border border-[#E9EBED] text-[#86899B] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST EVALUASI KINERJA STAF */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[#181b2b]">Evaluasi & Insentif Staf</h3>
            <span className="text-[10px] text-[#86899B] font-semibold">{filteredStaf.length} Orang</span>
          </div>

          <div className="flex flex-col gap-3">
            {filteredStaf.map((staf) => (
              <div key={staf.id} className="bg-white rounded-3xl border border-[#E9EBED] p-4 shadow-sm flex flex-col gap-3">
                
                {/* Header Staf */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {staf.avatar ? (
                      <img className="w-11 h-11 rounded-2xl object-cover border border-[#E9EBED]" src={staf.avatar} alt={staf.nama} />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 text-[#86899B] font-bold flex items-center justify-center text-sm border border-[#E9EBED]">
                        {staf.nama.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#181b2b]">{staf.nama}</h4>
                        <span className="bg-emerald-50 text-[#01a684] text-[9px] font-bold px-1.5 py-0.2 rounded">
                          {staf.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#86899B] font-medium mt-0.5">
                        Rating Kinerja: ⭐ <b>{staf.scoreRating}</b> / 5.0
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg">
                    {staf.achievementBadge}
                  </span>
                </div>

                {/* METRIKS UTAMA SIFATNYA DINAMIS SESUAI ROLE */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-[#F1F2F6] p-2.5 rounded-2xl flex flex-col gap-0.5">
                    <span className="text-[#86899B] font-bold uppercase">{staf.kpiMainLabel}</span>
                    <span className="font-bold text-[#181b2b] text-xs">
                      {staf.kpiMainUnit === 'Rp' ? `Rp ${formatRupiah(staf.kpiMainValue)}` : `${staf.kpiMainValue} ${staf.kpiMainUnit}`}
                    </span>
                  </div>

                  <div className="bg-[#F1F2F6] p-2.5 rounded-2xl flex flex-col gap-0.5">
                    <span className="text-[#86899B] font-bold uppercase">{staf.kpiSecondaryLabel}</span>
                    <span className="font-bold text-[#181b2b] text-xs">
                      {staf.kpiSecondaryValue}
                    </span>
                  </div>
                </div>

                {/* Progress Target KPI */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-[#86899B]">Capaian Target KPI</span>
                    <span className="text-[#181b2b] tabular-nums">{staf.targetProgress}% Selesai</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        staf.targetProgress >= 90 
                          ? 'bg-[#01a684]' 
                          : staf.targetProgress >= 70 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${staf.targetProgress}%` }}
                    />
                  </div>
                </div>

                {/* Ringkasan Total Hak Terima Gaji + Bonus */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E9EBED]/60 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86899B]">Total Hak Terima (Gaji + Bonus)</span>
                    <span className="font-bold text-[#01a684] tabular-nums text-xs">
                      Rp {formatRupiah(staf.gajiPokok + staf.bonusKinerja)}
                    </span>
                  </div>

                  <button 
                    onClick={() => alert(`Laporan Kinerja Rincian ${staf.nama}`)}
                    className="px-3 py-1.5 bg-[#F1F2F6] hover:bg-slate-200 text-[#181b2b] text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    Rincian KPI <ChevronRight size={12} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>

      {/* BOTTOM NAVIGATION */}
      <OwnerBottomNav />

    </div>
  );
}