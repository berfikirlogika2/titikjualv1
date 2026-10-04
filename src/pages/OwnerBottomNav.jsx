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
  Settings 
} from 'lucide-react';

export default function OwnerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, path: '/owner-dashboard' },
    { label: 'Laporan', icon: BarChart3, path: '/owner/laporan' },
    { label: 'Pajak', icon: Receipt, path: '/owner/pajak' },
    { label: 'Staf', icon: Users, path: '/owner/staf' },
    { label: 'Diskon', icon: Percent, path: '/owner/diskon' },
    { label: 'Bahan', icon: Boxes, path: '/owner/bahan' },
    { label: 'Produk', icon: Package, path: '/owner/produk' },
    { label: 'Setting', icon: Settings, path: '/owner/pengaturan' },
  ];

  // Mempertahankan posisi scroll persis seperti geseran pengguna saat berpindah halaman
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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/85 backdrop-blur-xl border border-white/60 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-1.5 transition-all duration-300">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-center overflow-x-auto no-scrollbar"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

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
  );
}