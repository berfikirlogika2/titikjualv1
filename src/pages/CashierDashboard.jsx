import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CashierDashboard() {
  const navigate = useNavigate();
  const [cashierName, setCashierName] = useState('Kasir');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Ambil data profil user yang sedang login
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setCashierName(profile.full_name);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login-form');
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex flex-col font-sans antialiased">
      
      {/* Top Navbar Kasir */}
      <header className="bg-[#01A684] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
            {cashierName.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-bold">Terminal Kasir POS</h1>
            <p className="text-xs text-emerald-100">Halo, {cashierName} (Kasir)</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer flex items-center gap-1.5"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Keluar</span>
        </button>
      </header>

      {/* Main POS Layout */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Kolom Kiri: Katalog Produk (2 Span) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[#E9EBED] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#181b2b]">Katalog Produk &amp; Menu</h2>
            <span className="text-xs text-[#86899B] bg-[#F1F2F6] px-3 py-1 rounded-full font-medium">Outlet Utama</span>
          </div>

          {/* Grid Produk Contoh */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[600px] pr-1">
            {[
              { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, category: 'Minuman' },
              { id: 2, name: 'Roti Bakar Coklat Keju', price: 15000, category: 'Makanan' },
              { id: 3, name: 'Es Teh Manis', price: 5000, category: 'Minuman' },
              { id: 4, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan' },
              { id: 5, name: 'Dimsum Mentai (4pcs)', price: 20000, category: 'Snack' },
              { id: 6, name: 'Mineral Water 600ml', price: 4000, category: 'Minuman' },
            ].map((prod) => (
              <div 
                key={prod.id}
                onClick={() => setCart([...cart, { ...prod, qty: 1 }])}
                className="bg-[#F1F2F6]/50 hover:bg-[#01A684]/5 border border-[#E9EBED] hover:border-[#01A684] rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-[#86899B] uppercase tracking-wider">{prod.category}</span>
                  <h3 className="text-xs font-bold text-[#181b2b] mt-1 line-clamp-2">{prod.name}</h3>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E9EBED] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#01A684]">Rp {prod.price.toLocaleString('id-ID')}</span>
                  <span className="material-symbols-outlined text-[#01A684] text-[18px]">add_circle</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Keranjang & Pembayaran (1 Span) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E9EBED] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#181b2b] mb-4 pb-2 border-b border-[#E9EBED]">Keranjang Transaksi</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#86899B]">
                <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
                <p className="text-xs">Keranjang masih kosong.<br/>Pilih produk dari katalog di samping.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-[#F1F2F6] p-2.5 rounded-xl">
                    <div>
                      <p className="font-bold text-[#181b2b]">{item.name}</p>
                      <span className="text-[#86899B]">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                    <button 
                      onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bagian Total & Bayar */}
          <div className="pt-4 border-t border-[#E9EBED] mt-4">
            <div className="flex justify-between text-sm font-bold text-[#181b2b] mb-4">
              <span>Total Tagihan:</span>
              <span className="text-[#01A684]">
                Rp {cart.reduce((acc, curr) => acc + curr.price, 0).toLocaleString('id-ID')}
              </span>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={() => {
                alert('Transaksi berhasil diproses!');
                setCart([]);
              }}
              className="w-full py-3.5 bg-[#01A684] hover:bg-[#008769] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-98 cursor-pointer border-0 disabled:opacity-50"
              type="button"
            >
              Proses Pembayaran (Tunai/QRIS)
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default CashierDashboard;