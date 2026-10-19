import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Receipt, Tags, Box, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CashierBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Daftar navigasi kasir yang disinkronkan ke seluruh halaman kasir
  const navItems = [
    { label: 'POS Kasir', icon: Wallet, path: '/kasir' },
    { label: 'Transaksi', icon: Receipt, path: '/kasir/transaksi' },
    { label: 'Diskon', icon: Tags, path: '/kasir/diskon' },
    { label: 'Stok', icon: Box, path: '/kasir/stok' },
    { label: 'Pengaturan', icon: Settings, path: '/kasir/pengaturan' },
  ];

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          body:has(.cashier-sidebar-active) #root > div {
            padding-left: ${isSidebarOpen ? '6rem' : '0rem'} !important;
            transition: padding-left 0.3s ease;
          }
        }
      `}</style>

      {/* MOBILE BOTTOM NAVIGATION: Terkunci di bawah dengan slide horizontal */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-50 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar border-t border-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-[68px] h-12 rounded-2xl transition-all cursor-pointer border-0 shrink-0 ${
                isActive ? 'bg-[#01A684] text-white shadow-sm font-bold' : 'bg-transparent text-gray-400 hover:text-[#1A1A1A]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TABLET & DESKTOP SIDEBAR: Di sebelah kiri layar dengan fitur Hide & Pop-up */}
      <div className={`cashier-sidebar-active hidden lg:flex fixed top-0 bottom-0 left-0 z-50 transition-all duration-300 ${isSidebarOpen ? 'w-24' : 'w-0 overflow-hidden'}`}>
        <nav className="w-24 bg-white flex flex-col justify-start items-center gap-6 pt-8 px-4 border-r border-gray-100 shadow-sm h-full relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer border-0 shadow-xs ${
                  isActive 
                    ? 'bg-[#01A684] text-white shadow-[#01A684]/30 font-bold' 
                    : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-[#01A684]'
                }`}
                title={item.label}
              >
                <Icon size={22} />
                <span className="text-[9px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tombol Toggle Hide / Pop-up Sidebar Desktop */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`hidden lg:flex fixed top-6 z-50 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center text-gray-600 hover:bg-gray-50 transition-all cursor-pointer ${
          isSidebarOpen ? 'left-[88px]' : 'left-4'
        }`}
        title={isSidebarOpen ? 'Sembunyikan Navigasi' : 'Tampilkan Navigasi'}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </>
  );
}