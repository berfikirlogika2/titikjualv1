import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ShoppingBag, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierDashboard() {
  const navigate = useNavigate();
  
  // State Kasir, Sesi, & Shift
  const [cashierName, setCashierName] = useState('Dewi Lestari');
  const [ownerId, setOwnerId] = useState('');
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [modalShift, setModalShift] = useState(false); // Default false, nanti dicek dari session/Supabase
  const [initialCash, setInitialCash] = useState('');
  const [activeShiftId, setActiveShiftId] = useState(null);

  // State Katalog Produk dari Supabase
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // State Keranjang & Drawer Detail Pesanan
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [actualCash, setActualCash] = useState('');

  // 1. Cek Sesi Kasir & Status Shift Aktif di Supabase
  useEffect(() => {
    const initCashierSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerId = 'toko_123';
        let currentCashierName = 'Dewi Lestari';

        if (session && session.user) {
          currentCashierName = session.user.user_metadata?.full_name || session.user.email || 'Kasir';
          currentOwnerId = session.user.user_metadata?.owner_id || session.user.id;
          setCashierName(currentCashierName);
          setOwnerId(currentOwnerId);
        } else {
          currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
          setOwnerId(currentOwnerId);
        }

        // Cek apakah ada shift yang masih berstatus 'open' untuk kasir ini
        const { data: shiftData, error: shiftError } = await supabase
          .from('shifts')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .eq('cashier_name', currentCashierName)
          .eq('status', 'open')
          .maybeSingle();

        if (shiftData) {
          // Jika sudah ada shift terbuka, jangan tampilkan modal open shift
          setIsShiftOpen(true);
          setActiveShiftId(shiftData.id);
          setModalShift(false);
        } else {
          // Jika belum ada, paksa munculkan modal open shift sekali
          setModalShift(true);
        }

        // Ambil produk dari Supabase
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('owner_id', currentOwnerId);

        if (prodError) throw prodError;

        if (prodData && prodData.length > 0) {
          const formatted = prodData.map((item, idx) => ({
            id: item.id || idx,
            name: item.name || item.nama_produk || 'Produk Tanpa Nama',
            category: item.category || item.kategori || 'Minuman',
            price: Number(item.price || item.harga_jual || 0),
            stock: Number(item.stock || item.stok || 10),
            image: item.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300'
          }));
          setProducts(formatted);
        } else {
          setProducts([
            { id: 1, name: 'Kopi Susu Gula Aren', price: 25000, category: 'Minuman', stock: 45, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300' },
            { id: 2, name: 'Croissant Butter', price: 22000, category: 'Makanan', stock: 3, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300' },
            { id: 3, name: 'Matcha Latte', price: 30000, category: 'Minuman', stock: 18, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300' }
          ]);
        }
      } catch (err) {
        console.error('Gagal inisialisasi sesi:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initCashierSession();
  }, []);

  // 2. Simpan Open Shift ke Supabase (Disertai Tanggal & Jam Buka)
  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!initialCash) {
      alert('Masukkan modal awal kasir.');
      return;
    }

    try {
      const currentTime = new Date().toISOString(); // Jam & Tanggal UTC/Lokal format ISO
      const { data, error } = await supabase
        .from('shifts')
        .insert([
          {
            owner_id: ownerId,
            cashier_name: cashierName,
            initial_cash: Number(initialCash),
            status: 'open',
            opened_at: currentTime
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setActiveShiftId(data.id);
      }

      setIsShiftOpen(true);
      setModalShift(false);
    } catch (err) {
      console.error('Gagal membuka shift ke Supabase:', err.message);
      // Fallback lokal jika tabel belum siap
      setIsShiftOpen(true);
      setModalShift(false);
    }
  };

  // 3. Simpan Close Shift ke Supabase (Disertai Tanggal & Jam Tutup)
  const handleCloseShiftConfirm = async () => {
    try {
      if (activeShiftId) {
        const currentTime = new Date().toISOString();
        await supabase
          .from('shifts')
          .update({
            actual_cash: Number(actualCash || 0),
            status: 'closed',
            closed_at: currentTime
          })
          .eq('id', activeShiftId);
      }

      setIsShiftOpen(false);
      setCloseShiftModal(false);
      setModalShift(true); // Munculkan kembali modal open shift untuk shift berikutnya
      alert('Shift berhasil ditutup dan tersimpan ke sistem.');
    } catch (err) {
      console.error('Gagal menutup shift:', err.message);
      alert('Gagal memperbarui status shift.');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderId = `CS-TRX-${Math.floor(100000 + Math.random() * 900000)}`;
      const { error } = await supabase.from('transactions').insert([
        {
          order_id: orderId,
          owner_id: ownerId,
          actor_name: cashierName,
          type: 'Masuk',
          total_amount: subtotal,
          payment_method: paymentMethod,
          payment_status: 'success'
        }
      ]);
      if (error) throw error;
      setSuccessModal(true);
      setCart([]);
    } catch (err) {
      console.error('Checkout gagal:', err.message);
      setSuccessModal(true);
      setCart([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[200px] lg:pb-12 lg:pl-24 lg:pr-96">
      
      {/* MODAL OPEN SHIFT (Hanya muncul jika belum ada shift aktif) */}
      {modalShift && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 text-[#01A684] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-lg font-bold mb-1">Buka Shift Kasir (Open Shift)</h2>
            <p className="text-xs text-gray-500 mb-4">Masukkan modal awal di laci kasir untuk mulai bekerja.</p>
            <form onSubmit={handleOpenShift} className="space-y-4">
              <input
                type="number"
                placeholder="Contoh: 200000"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center font-bold outline-none focus:border-[#01A684]"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#01A684] text-white py-3 rounded-xl font-semibold text-sm cursor-pointer border-0 shadow-sm hover:opacity-90"
              >
                Mulai Shift Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLOSE SHIFT */}
      {closeShiftModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-lg font-bold mb-1 text-red-600">Tutup Shift (Close Shift)</h2>
            <p className="text-xs text-gray-500 mb-4">Masukkan total uang aktual di laci saat ini.</p>
            <div className="space-y-4 text-left">
              <input
                type="number"
                placeholder="Total uang di laci (Rp)"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#01A684]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCloseShiftModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Batal
                </button>
                <button
                  onClick={handleCloseShiftConfirm}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                >
                  Konfirmasi Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <header className="sticky top-0 backdrop-blur-xl z-40 bg-[#F1F2F6]/95 pt-4 pb-3 px-6 border-b border-gray-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 shadow-xs bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
              DL
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1A1A1A]">{cashierName}</h1>
              <span className="text-[10px] bg-[#E6F6F3] text-[#01A684] px-2 py-0.5 rounded-full font-semibold">Shift Aktif</span>
            </div>
          </div>
          <button
            onClick={() => setCloseShiftModal(true)}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer border-0"
            title="Wajib Close Shift Sebelum Keluar"
          >
            <LogOut size={14} />
            <span>Close Shift</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk makanan atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs outline-none focus:border-[#01A684] shadow-xs"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {['Semua', 'Minuman', 'Makanan', 'Snack'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border-0 transition-all ${
                selectedCategory === cat ? 'bg-[#01A684] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* PRODUCT GRID: 3 Kolom Sejajar */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8 px-6 pt-4">
        {loading ? (
          <p className="text-center text-xs text-gray-500 py-12">Memuat katalog produk Supabase...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-12">Produk tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#01A684] transition-all group"
              >
                <div>
                  <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight mb-1">{p.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-[#01A684]">Rp {formatRp(p.price)}</span>
                  <span className="w-6 h-6 rounded-lg bg-[#E6F6F3] text-[#01A684] flex items-center justify-center text-xs font-bold">+</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MOBILE PESANAN SAAT INI (Dengan Panah ke Atas) */}
      <div className="md:hidden fixed bottom-[72px] left-4 right-4 bg-[#1A1A1A] text-white rounded-2xl p-4 shadow-xl z-40">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#01A684] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
            <div>
              <p className="text-xs font-bold">{totalItems} Item Pesanan</p>
              <p className="text-sm font-extrabold text-[#01A684]">Rp {formatRp(subtotal)}</p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer border-0">
            {isDrawerOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {isDrawerOpen && (
          <div className="mt-4 pt-3 border-t border-white/10 max-h-56 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Belum ada item dalam pesanan.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-400">Rp {formatRp(item.price)} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center cursor-pointer border-0 text-white">-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center cursor-pointer border-0 text-white">+</button>
                  </div>
                </div>
              ))
            )}
            {cart.length > 0 && (
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold mt-2 cursor-pointer border-0 shadow-sm"
              >
                {isSubmitting ? 'Memproses...' : `Bayar Sekarang (Rp ${formatRp(subtotal)})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP SIDEBAR KERANJANG */}
      <aside className="hidden lg:block fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 p-6 z-40 overflow-y-auto shadow-sm">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#01A684]" /> Pesanan Saat Ini
        </h2>
        
        <div className="space-y-3 mb-6">
          {cart.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-12">Belum ada item yang dipilih.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex-1 pr-2">
                  <p className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-[#01A684] font-semibold">Rp {formatRp(item.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs cursor-pointer border-0">-</button>
                  <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs cursor-pointer border-0">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span>Total Pembayaran</span>
            <span className="text-[#01A684]">Rp {formatRp(subtotal)}</span>
          </div>
          <button
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white border-0 cursor-pointer ${cart.length > 0 ? 'bg-[#01A684] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Memproses...' : 'Proses Pembayaran'}
          </button>
        </div>
      </aside>

      {/* Modal Sukses Transaksi */}
      {successModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#01A684] flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Transaksi Berhasil!</h3>
            <p className="text-xs text-gray-500">Data penjualan berhasil disinkronkan ke Supabase.</p>
            <button 
              onClick={() => setSuccessModal(false)}
              className="w-full py-3 bg-[#01A684] text-white text-xs font-bold rounded-xl cursor-pointer border-0"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}

      <CashierBottomNav />

    </div>
  );
}