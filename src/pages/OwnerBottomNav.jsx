import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Percent, 
  Boxes, 
  Package, 
  Receipt,
  Settings,
  Store,
  LogOut
} from 'lucide-react';

export default function OwnerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  const navItems = [
    { label: 'Dashboard', fullLabel: 'Dashboard Utama', icon: LayoutGrid, path: '/owner-dashboard' },
    { label: 'Laporan', fullLabel: 'Laporan & Analitik', icon: BarChart3, path: '/owner/laporan' },
    { label: 'Pajak', fullLabel: 'Pajak & Biaya', icon: Receipt, path: '/owner/pajak' },
    { label: 'Staf', fullLabel: 'Manajemen Staf', icon: Users, path: '/owner/staf' },
    { label: 'Diskon', fullLabel: 'Diskon & Promo', icon: Percent, path: '/owner/diskon' },
    { label: 'Bahan', fullLabel: 'Gudang Bahan Baku', icon: Boxes, path: '/owner/bahan' },
    { label: 'Produk', fullLabel: 'Katalog Produk & Resep', icon: Package, path: '/owner/produk' },
    { label: 'Setting', fullLabel: 'Pengaturan Sistem', icon: Settings, path: '/owner/pengaturan' },
  ];

  // Mempertahankan posisi scroll persis seperti geseran pengguna saat berpindah halaman (Khusus Mobile)
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('ownerNavScrollPos');
    if (scrollContainerRef.current && savedPosition !== null) {
      scrollContainerRef.current.scrollLeft = parseFloat(savedPosition);
    }
  }, [location.pathname]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem('ownerNavScrollPos', scrollContainerRef.current.scrollLeft);
    }
  };

  return (
    <>
      {/* Injeksi CSS Otomatis: Menggeser dan memperluas konten halaman Owner saat di Tablet (md) & Desktop (lg) */}
      <style>{`
        @media (min-width: 768px) {
          body:has(.owner-sidebar-active) #root > div {
            padding-left: 14rem !important; /* Lebar Sidebar Tablet (w-56 / 224px) */
            padding-bottom: 2rem !important;
          }
          body:has(.owner-sidebar-active) #root > div > header > div,
          body:has(.owner-sidebar-active) #root > div > main {
            max-width: 100% !important;
          }
        }
        @media (min-width: 1024px) {
          body:has(.owner-sidebar-active) #root > div {
            padding-left: 16rem !important; /* Lebar Sidebar Desktop (w-64 / 256px) */
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. MODE MOBILE (< 768px): FLOATING BOTTOM BAR ASLI (TIDAK BERUBAH SAMA SEKALI) */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/85 backdrop-blur-xl border border-white/60 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-1.5 transition-all duration-300">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-center overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center shrink-0 w-[20%] py-2 px-1 rounded-2xl transition-colors duration-200 cursor-pointer select-none ${
                  isActive 
                    ? 'bg-[#01A684] text-white shadow-md shadow-[#01A684]/20 font-bold' 
                    : 'text-[#86899B] hover:text-[#26293A] hover:bg-slate-100/50'
                }`}
              >
                <Icon size={18} />
                <span className={`text-[10px] tracking-tight mt-1 truncate w-full text-center ${isActive ? 'text-white font-semibold' : 'text-[#86899B]'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. MODE TABLET & DESKTOP (>= 768px): SIDEBAR VERTIKAL DI SAMPING KIRI     */}
      {/* ========================================================================= */}
      <aside className="owner-sidebar-active hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-56 lg:w-64 bg-[#181b2b] text-white z-40 border-r border-white/10 shadow-2xl select-none">
        
        {/* Header Identitas Sidebar */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#01A684] flex items-center justify-center text-white shadow-md shadow-[#01A684]/30 shrink-0">
            <Store size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs lg:text-sm font-black tracking-wider uppercase truncate">POS Titik Jual</h2>
            <span className="text-[10px] text-emerald-400 font-bold block truncate">Panel Kontrol Owner</span>
          </div>
        </div>

        {/* Daftar Menu Navigasi Vertikal (Semua 8 Menu Langsung Terlihat Tanpa Perlu Geser) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-1.5">
            Navigasi Modul
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                  isActive 
                    ? 'bg-[#01A684] text-white shadow-md shadow-[#01A684]/25' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white shrink-0' : 'text-emerald-400 shrink-0'} />
                <span className="truncate">{item.fullLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Sidebar: Akses Cepat ke Layar Kasir / Keluar */}
        <div className="p-3.5 border-t border-white/10 bg-black/20 shrink-0 flex flex-col gap-1.5">
          <button
            onClick={() => navigate('/cashier-dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-[#01A684]/20 hover:bg-[#01A684] text-emerald-300 hover:text-white border border-[#01A684]/40 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Store size={14} />
            <span>Ke Layar Kasir</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Keluar Sesi</span>
          </button>
        </div>

      </aside>
    </>
  );
}