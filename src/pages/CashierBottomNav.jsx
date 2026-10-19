import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Receipt, Tags, Box, Settings } from 'lucide-react';

export default function CashierBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

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
            padding-left: 6rem !important;
          }
        }
      `}</style>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl px-6 py-3 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between border-t border-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors cursor-pointer border-0 bg-transparent ${
                isActive ? 'text-[#01A684] font-bold' : 'text-gray-400 hover:text-[#1A1A1A]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop / Tablet Sidebar Navigation */}
      <nav className="cashier-sidebar-active hidden lg:flex fixed top-0 bottom-0 left-0 w-24 bg-white flex-col justify-start items-center gap-8 pt-8 px-4 border-r border-gray-100 z-50 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.label === 'Transaksi') {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer border-0 shadow-sm ${
                  isActive ? 'bg-[#01A684] text-white shadow-[#01A684]/30' : 'bg-[#01A684] text-white hover:opacity-90'
                }`}
                title="Transaksi"
              >
                <Icon size={22} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-colors cursor-pointer border-0 bg-transparent ${
                isActive ? 'text-[#01A684] font-bold bg-emerald-50' : 'text-gray-400 hover:text-[#1A1A1A]'
              }`}
              title={item.label}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}