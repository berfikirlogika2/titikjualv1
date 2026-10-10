import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Receipt, Tag, Box, User } from 'lucide-react';

export default function CashierBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/cashier-pos', label: 'POS Kasir', icon: Wallet },
    { path: '/cashier/transaksi', label: 'Transaksi', icon: Receipt },
    { path: '/cashier/diskon', label: 'Diskon', icon: Tag },
    { path: '/cashier/stok', label: 'Stok', icon: Box },
    { path: '/cashier/pengaturan', label: 'Pengaturan', icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md bg-white px-3 py-2.5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 flex items-center justify-around border border-[#E9EBED] md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 transition-all duration-300 cursor-pointer border-0 ${
              isActive
                ? 'bg-[#01A684] text-white px-4 py-2.5 rounded-2xl shadow-md font-bold text-xs'
                : 'bg-transparent text-[#86899B] flex-col py-1 px-2 hover:text-[#181b2b]'
            }`}
          >
            <Icon size={isActive ? 18 : 20} />
            <span className={isActive ? 'text-xs' : 'text-[10px] font-medium'}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}