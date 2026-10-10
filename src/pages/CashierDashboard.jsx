import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, Plus, Minus, LogOut, User, 
  Wallet, Receipt, Tag, Box, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// Komponen Navigasi Bawah Kasir (Pill Active State)
function CashierBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/cashier-pos', label: 'POS Kasir', icon: Wallet },
    { path: '/owner/transaksi', label: 'Transaksi', icon: Receipt },
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

export default function CashierDashboard() {
  const navigate = useNavigate();

  // State Kasir & Shift
  const [cashierName, setCashierName] = useState('Budi Santoso');
  const [ownerId, setOwnerId] = useState('');
  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [initialCash, setInitialCash] = useState('150.000');
  const [actualCash, setActualCash] = useState('1.050.000');

  // State Modal Drawer & Popups
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'tutup-shift', 'catatan', 'sukses'
  
  // State Produk & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Katalog Produk
  const products = [
    { id: 1, name: 'Burger Spesial', price: 45000, category: 'Makanan', stock: 15, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Kentang Goreng', price: 20000, category: 'Makanan', stock: 25, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Salad Sehat', price: 35000, category: 'Makanan', stock: 0, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Es Kopi Susu', price: 18000, category: 'Minuman', stock: 40, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80' },
    { id: 5, name: 'Donut Coklat', price: 12000, category: 'Snack', stock: 10, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80' },
    { id: 6, name: 'Jus Jeruk', price: 15000, category: 'Minuman', stock: 20, img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&auto=format&fit=crop&q=80' },
  ];

  // State Keranjang Belanja
  const [cart, setCart] = useState([
    { id: 4, name: 'Es Kopi Susu', price: 18000, quantity: 2 }
  ]);

  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data sesi kasir dari Supabase
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCashierName(session.user.user_metadata?.full_name || 'Budi Santoso');
        setOwnerId(session.user.user_metadata?.owner_id || session.user.id);
      }
    };
    fetchSession();
  }, []);

  // Tambah produk ke keranjang
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Ubah kuantitas item
  const updateQuantity = (id, delta) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Kalkulasi Total
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = 0;
  const totalAmount = subtotal + tax;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter produk
  const filteredProducts = products.filter((prod) => {
    const matchCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
    const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Proses Checkout & Kirim ke Supabase
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      const orderId = `CS-TRX-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Simpan ke tabel `transactions`
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            order_id: orderId,
            owner_id: ownerId || currentUserId,
            actor_id: currentUserId,
            actor_name: cashierName,
            role: 'kasir',
            type: 'Masuk',
            description: `Penjualan POS`,
            subtotal: subtotal,
            tax: tax,
            service: 0,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            helper_name: 'Siska (Barista)',
            payment_status: 'success'
          }
        ])
        .select()
        .single();

      if (txError) throw txError;

      // 2. Simpan item ke `transaction_items`
      const itemsPayload = cart.map((item) => ({
        transaction_id: txData.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      setActiveModal('sukses');
      setCart([]);
    } catch (err) {
      console.error('Gagal checkout:', err.message);
      alert('Terjadi kesalahan saat memproses transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F1F2F6] text-[#181b2b] font-sans min-h-screen flex flex-col relative pb-[160px] md:pb-24 lg:pb-0 md:pl-[104px] lg:pr-80">
      
      {/* Overlay Sidebar Mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setIsDrawerOpen(false)}></div>
      )}

      {/* Sidebar Drawer Mobile */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col md:hidden`}>
        <div className="p-6 border-b border-[#E9EBED] flex items-center justify-between">
          <h2 className="font-bold text-lg text-[#181b2b]">Menu Kasir</h2>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#86899B]" onClick={() => setIsDrawerOpen(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
              <img alt="Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#181b2b]">{cashierName}</p>
              <p className="text-xs text-[#86899B]">Kasir Reguler</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-[#E9EBED] mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-[#86899B] uppercase tracking-wide">Status Shift</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${isShiftOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isShiftOpen ? 'TERBUKA' : 'TERTUTUP'}
                </span>
              </div>
              <button 
                onClick={() => { setIsDrawerOpen(false); setActiveModal('tutup-shift'); }}
                className="w-full bg-white border border-[#E9EBED] text-[#181b2b] py-2.5 rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
              >
                <i className="fa-solid fa-lock text-[#86899B] mr-2"></i> Tutup Shift
              </button>
            </div>

            <button onClick={() => { setIsDrawerOpen(false); setActiveModal('catatan'); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition-colors text-left border-0 bg-transparent cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <span className="font-medium text-sm text-[#181b2b]">Buat Catatan &amp; Pengeluaran</span>
              </div>
              <i className="fa-solid fa-chevron-right text-xs text-slate-300"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Left Sidebar Navigation for Desktop */}
      <nav className="hidden md:flex bg-white h-[calc(100vh-32px)] w-20 fixed left-4 top-4 rounded-xl border border-[#E9EBED] flex-col py-6 items-center gap-6 z-50 shadow-md">
        <div className="flex items-center justify-center h-12 w-full">
          <div className="w-10 h-10 bg-[#01A684] text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
            K
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full px-2">
          <button className="flex items-center justify-center w-full h-12 rounded-lg bg-[#01A684] text-white border-0 cursor-pointer" title="POS Kasir">
            <span className="material-symbols-outlined text-2xl">point_of_sale</span>
          </button>
          <button onClick={() => navigate('/owner/transaksi')} className="flex items-center justify-center w-full h-12 rounded-lg text-[#86899B] hover:text-[#01A684] hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer" title="Transaksi">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </button>
        </div>
      </nav>

      {/* Right Sidebar Order Summary for Desktop */}
      <aside className="hidden lg:flex w-80 bg-white border-l border-[#E9EBED] flex-col h-full fixed right-0 top-0 z-40 shadow-xl">
        <div className="p-6 pb-4 border-b border-[#E9EBED] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#181b2b]">Pesanan Saat Ini</h2>
            <span className="text-xs text-[#86899B]">{totalItems} Item</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-grow overflow-y-auto px-6 pt-4 pb-32 flex flex-col gap-4">
          {cart.length === 0 ? (
            <p className="text-xs text-[#86899B] text-center py-10">Belum ada item di pesanan.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 items-start pb-4 border-b border-[#E9EBED] border-dashed">
                <div className="flex-grow">
                  <h4 className="text-xs font-bold text-[#181b2b] leading-tight mb-1">{item.name}</h4>
                  <span className="text-[10px] text-[#86899B] block mb-2">Rp {item.price.toLocaleString('id-ID')}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 text-[#181b2b] border-0 cursor-pointer">
                      <i className="fa-solid fa-minus text-[8px]"></i>
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-[#01A684] text-white border-0 cursor-pointer">
                      <i className="fa-solid fa-plus text-[8px]"></i>
                    </button>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#181b2b]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))
          )}
        </div>

        {/* Summary & Payment Desktop */}
        <div className="p-6 bg-white border-t border-[#E9EBED] mt-auto flex flex-col gap-4 absolute bottom-0 left-0 right-0">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#86899B]">Sub Total</span>
            <span className="font-medium text-[#181b2b]">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center border-t border-[#E9EBED] border-dashed pt-3 mt-1">
            <span className="text-base font-bold text-[#181b2b]">Total Akhir</span>
            <span className="text-lg font-bold text-[#01A684]">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-[#01A684] disabled:opacity-50 text-white py-4 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'} <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </aside>

      {/* Header Utama */}
      <header className="pt-6 md:pt-8 pb-4 px-6 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-background/90 sticky">
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#181b2b] md:hidden cursor-pointer border-0" onClick={() => setIsDrawerOpen(true)}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <button className="hidden md:flex w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm text-[#181b2b] mr-2 cursor-pointer border-0" onClick={() => setIsDrawerOpen(true)}>
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <h1 className="text-lg font-bold flex-1 px-4 truncate text-[#181b2b]">Bang Jago POS Kasir</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-[#E9EBED]">
          <img alt="Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
        </div>
      </header>

      {/* SearchBar */}
      <div className="px-6 pb-2 max-w-4xl mx-auto w-full">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#86899B]"></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-[#E9EBED] shadow-sm focus:ring-2 focus:ring-[#01A684] focus:outline-none text-sm text-[#181b2b]" 
            placeholder="Cari Produk..." 
          />
        </div>
      </div>

      {/* CategoryFilters */}
      <div className="px-6 py-2 max-w-4xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {['Semua', 'Makanan', 'Minuman', 'Snack'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-sm cursor-pointer border-0 ${
                selectedCategory === cat ? 'bg-[#01A684] text-white' : 'bg-white border border-[#E9EBED] text-[#86899B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ProductGrid */}
      <main className="w-full max-w-4xl mx-auto h-full">
        <div className="px-6 pt-2 pb-24 md:pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const inCart = cart.find(i => i.id === prod.id);
              return (
                <div key={prod.id} className="bg-white rounded-2xl p-3 border border-[#E9EBED] shadow-sm flex flex-col hover:shadow-md transition-shadow relative">
                  {inCart && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#01A684] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                      {inCart.quantity}
                    </div>
                  )}
                  <div className="aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden">
                    <img alt={prod.name} className={`w-full h-full object-cover ${prod.stock === 0 ? 'opacity-60' : ''}`} src={prod.img} />
                    {prod.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Habis</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate text-[#181b2b]">{prod.name}</h3>
                  <span className="text-[#01A684] font-bold text-sm mb-3">Rp {prod.price.toLocaleString('id-ID')}</span>
                  
                  {prod.stock === 0 ? (
                    <button className="mt-auto w-full bg-slate-100 text-[#86899B] py-2 rounded-xl text-xs font-bold cursor-not-allowed border-0" disabled>
                      Stok Habis
                    </button>
                  ) : inCart ? (
                    <div className="mt-auto flex items-center justify-between bg-emerald-50 rounded-xl p-1">
                      <button onClick={() => updateQuantity(prod.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-[#01A684] shadow-sm border-0 cursor-pointer"><i className="fa-solid fa-minus text-[10px]"></i></button>
                      <span className="font-bold text-sm text-[#181b2b]">{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(prod.id, 1)} className="w-7 h-7 flex items-center justify-center bg-[#01A684] rounded-lg text-white shadow-sm border-0 cursor-pointer"><i className="fa-solid fa-plus text-[10px]"></i></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(prod)} className="mt-auto w-full bg-emerald-50 text-[#01A684] hover:bg-[#01A684] hover:text-white transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border-0 cursor-pointer">
                      <i className="fa-solid fa-plus text-[10px]"></i> Tambah
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Order Summary Bar (Mobile) */}
      <div className="fixed bottom-[90px] md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-40 lg:hidden">
        <div className="bg-[#01A684] text-white rounded-2xl p-3 shadow-lg flex items-center justify-between cursor-pointer" onClick={handleCheckout}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-basket-shopping text-sm"></i>
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Pesanan</p>
              <p className="text-sm font-bold">{totalItems} Item</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold tabular-nums">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
            <button className="bg-white text-[#01A684] px-4 py-2 rounded-xl text-sm font-bold shadow-sm border-0 cursor-pointer">
              Bayar
            </button>
          </div>
        </div>
      </div>

      {/* Navigasi Bawah Kasir (Sesuai Referensi Gambar) */}
      <CashierBottomNav />

      {/* Modal Tutup Shift */}
      {activeModal === 'tutup-shift' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E9EBED] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-[#181b2b]">Tutup Shift</h3>
              <button className="text-[#86899B] border-0 bg-transparent cursor-pointer" onClick={() => setActiveModal(null)}><i className="fa-solid fa-times text-lg"></i></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-[#E9EBED] space-y-2 text-sm">
                <div className="flex justify-between"><span>Modal Awal</span><span className="font-medium">Rp {initialCash}</span></div>
                <div className="flex justify-between"><span>Total Penjualan</span><span className="font-medium text-[#01A684]">+ Rp {totalAmount.toLocaleString('id-ID')}</span></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#86899B] mb-1.5 uppercase tracking-wide">Uang Aktual di Laci (Rp)</label>
                <input type="text" value={actualCash} onChange={(e) => setActualCash(e.target.value)} className="w-full bg-slate-50 border border-[#E9EBED] rounded-xl px-4 py-3 text-lg font-bold text-[#181b2b] outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-[#E9EBED] bg-slate-50 flex gap-3">
              <button className="flex-1 py-3 rounded-xl font-semibold text-[#181b2b] bg-white border border-[#E9EBED] cursor-pointer" onClick={() => setActiveModal(null)}>Batal</button>
              <button className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#181b2b] cursor-pointer border-0" onClick={() => { setIsShiftOpen(false); setActiveModal(null); }}>Konfirmasi Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catatan & Pengeluaran */}
      {activeModal === 'catatan' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E9EBED] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-[#181b2b]">Catatan &amp; Pengeluaran</h3>
              <button className="text-[#86899B] border-0 bg-transparent cursor-pointer" onClick={() => setActiveModal(null)}><i className="fa-solid fa-times text-lg"></i></button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#86899B] mb-1.5 uppercase">Kategori</label>
                <select className="w-full bg-slate-50 border border-[#E9EBED] rounded-xl px-4 py-3 text-sm text-[#181b2b] outline-none">
                  <option>Pengeluaran Operasional (Bahan Baku)</option>
                  <option>Kasbon Karyawan</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#86899B] mb-1.5 uppercase">Nominal (Rp)</label>
                <input type="number" placeholder="0" className="w-full bg-slate-50 border border-[#E9EBED] rounded-xl px-4 py-3 text-lg font-bold text-[#181b2b] outline-none" />
              </div>
            </div>
            <div className="p-5 border-t border-[#E9EBED] bg-slate-50 flex gap-3">
              <button className="flex-1 py-3 rounded-xl font-semibold text-[#181b2b] bg-white border border-[#E9EBED] cursor-pointer" onClick={() => setActiveModal(null)}>Batal</button>
              <button className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#01A684] cursor-pointer border-0" onClick={() => setActiveModal(null)}>Simpan Catatan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses Transaksi */}
      {activeModal === 'sukses' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#01A684] flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#181b2b]">Transaksi Berhasil!</h3>
            <p className="text-xs text-[#86899B]">Data penjualan telah tersimpan otomatis dan terpusat ke laporan Owner.</p>
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-[#01A684] text-white text-xs font-bold rounded-xl cursor-pointer border-0"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}

    </div>
  );
}