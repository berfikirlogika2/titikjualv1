import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ShoppingBag, LogOut, CheckCircle2, Menu } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierDashboard() {
  const navigate = useNavigate();
  
  const [cashierName, setCashierName] = useState('Dewi Lestari');
  const [ownerId, setOwnerId] = useState('');
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [modalShift, setModalShift] = useState(false);
  
  // Inisial huruf otomatis dari nama kasir
  const [initials, setInitials] = useState('DL');
  
  // Input dengan format string titik
  const [initialCashInput, setInitialCashInput] = useState('');
  const [actualCashInput, setActualCashInput] = useState('');
  const [activeShiftId, setActiveShiftId] = useState(null);

  // Katalog Produk dari Supabase
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Keranjang & Drawer Mobile
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);

  // State Action Bar / Dropdown Menu Shift (Garis Tiga)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRupiahInput = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const parseRupiahNumber = (formattedStr) => {
    if (!formattedStr) return 0;
    return Number(formattedStr.replace(/\./g, ''));
  };

  // Inisialisasi Sesi & Cek Shift Aktif Supabase + localStorage serta Mapping Produk yang Fleksibel
  useEffect(() => {
    const initCashierSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerId = 'toko_123';
        let currentCashierName = 'Dewi Lestari';

        if (session && session.user) {
          currentCashierName = session.user.user_metadata?.full_name || session.user.email || 'Kasir';
          currentOwnerId = session.user.user_metadata?.owner_id || localStorage.getItem('owner_id') || session.user.id;
          setCashierName(currentCashierName);
          setOwnerId(currentOwnerId);
        } else {
          currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
          setOwnerId(currentOwnerId);
        }

        // Buat inisial huruf otomatis dari nama kasir
        const nameParts = currentCashierName.split(' ');
        const calculatedInitials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
          : nameParts[0].substring(0, 2).toUpperCase();
        setInitials(calculatedInitials);

        // Cek status shift lokal terlebih dahulu
        const localShiftStatus = localStorage.getItem(`shift_active_${currentCashierName}`);
        const localShiftId = localStorage.getItem(`active_shift_id`);

        if (localShiftStatus === 'true' && localShiftId) {
          setIsShiftOpen(true);
          setActiveShiftId(localShiftId);
          setModalShift(false);
        } else {
          // Cek ke Database Supabase
          const { data: shiftData } = await supabase
            .from('shifts')
            .select('*')
            .eq('owner_id', currentOwnerId)
            .eq('cashier_name', currentCashierName)
            .eq('status', 'open')
            .maybeSingle();

          if (shiftData) {
            setIsShiftOpen(true);
            setActiveShiftId(shiftData.id);
            setModalShift(false);
            localStorage.setItem(`shift_active_${currentCashierName}`, 'true');
            localStorage.setItem(`active_shift_id`, shiftData.id);
          } else {
            setIsShiftOpen(false);
            setModalShift(true);
          }
        }

        // Ambil Produk dari Supabase dengan Pemetaan Kolom Fleksibel (Mendukung halaman Owner)
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('owner_id', currentOwnerId);

        let rawProducts = prodData;
        if (prodError || !rawProducts || rawProducts.length === 0) {
          const { data: prodIndo } = await supabase.from('produk').select('*');
          if (prodIndo) rawProducts = prodIndo;
        }

        if (rawProducts && rawProducts.length > 0) {
          setProducts(rawProducts.map((item, idx) => {
            // Ambil harga langsung atau dari variasi/variants
            let parsedPrice = Number(item.price || item.harga || item.harga_jual || 0);
            if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
              parsedPrice = Number(item.variants[0].price || item.variants[0].harga || parsedPrice);
            } else if (item.variasi && Array.isArray(item.variasi) && item.variasi.length > 0) {
              parsedPrice = Number(item.variasi[0].price || item.variasi[0].harga || parsedPrice);
            }

            return {
              id: item.id || idx,
              name: item.name || item.nama || item.nama_produk || 'Produk Tanpa Nama',
              category: item.category || item.kategori || item.kategori_produk || 'Semua',
              price: parsedPrice,
              stock: Number(item.stock || item.stok || 10),
              image: item.image_url || item.foto || item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300'
            };
          }));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Gagal memuat sesi kasir:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initCashierSession();
  }, []);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    const rawCash = parseRupiahNumber(initialCashInput);
    if (rawCash < 0) {
      alert('Masukkan modal awal yang valid.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([
          {
            owner_id: ownerId,
            cashier_name: cashierName,
            initial_cash: rawCash,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setActiveShiftId(data.id);
        localStorage.setItem(`active_shift_id`, data.id);
      }

      setIsShiftOpen(true);
      setModalShift(false);
      localStorage.setItem(`shift_active_${cashierName}`, 'true');
      setInitialCashInput('');
    } catch (err) {
      console.error('Gagal open shift:', err.message);
      setIsShiftOpen(true);
      setModalShift(false);
    }
  };

  const handleCloseShiftConfirm = async () => {
    try {
      const rawActual = parseRupiahNumber(actualCashInput);
      if (activeShiftId) {
        await supabase
          .from('shifts')
          .update({
            actual_cash: rawActual,
            status: 'closed',
            closed_at: new Date().toISOString()
          })
          .eq('id', activeShiftId);
      }

      setIsShiftOpen(false);
      setActiveShiftId(null);
      setCloseShiftModal(false);
      setIsProfileMenuOpen(false);
      
      localStorage.removeItem(`shift_active_${cashierName}`);
      localStorage.removeItem(`active_shift_id`);
      
      setModalShift(true);
      setActualCashInput('');
      alert('Shift berhasil ditutup.');
    } catch (err) {
      console.error('Gagal close shift:', err.message);
    }
  };

  const handleOpenShiftMenuClick = () => {
    if (isShiftOpen) {
      alert('Kamu sudah memasukan modal awal uang di laci kasir');
    } else {
      setModalShift(true);
    }
    setIsProfileMenuOpen(false);
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

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    navigate('/kasir/pesanan', { state: { cart, subtotal } });
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[200px] md:pb-12 lg:pr-80">
      
      {/* MODAL OPEN SHIFT (Terkunci jika sudah aktif) */}
      {modalShift && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-100 text-[#01A684] rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-lg font-bold mb-1">Buka Shift Kasir (Open Shift)</h2>
            <p className="text-xs text-gray-500 mb-4">Wajib masukkan modal awal di laci kasir untuk mulai bertransaksi.</p>
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
                <input
                  type="text"
                  placeholder="150.000"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(formatRupiahInput(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#01A684]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#01A684] text-white py-3 rounded-xl font-semibold text-sm cursor-pointer border-0 shadow-sm hover:opacity-90"
              >
                Mulai Shift
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLOSE SHIFT */}
      {closeShiftModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-lg font-bold mb-1 text-red-600">Tutup Shift (Close Shift)</h2>
            <p className="text-xs text-gray-500 mb-4">Masukkan total uang aktual di laci saat ini.</p>
            <div className="space-y-4 text-left">
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
                <input
                  type="text"
                  placeholder="1.000.000"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(formatRupiahInput(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#01A684]"
                />
              </div>
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
          
          {/* Identitas Kasir Tunggal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 bg-[#01A684] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1A1A1A]">{cashierName}</h1>
              <span className="text-[10px] bg-[#E6F6F3] text-[#01A684] px-2 py-0.5 rounded-full font-semibold">
                {isShiftOpen ? 'Shift Aktif' : 'Shift Nonaktif'}
              </span>
            </div>
          </div>

          {/* Tombol Garis Tiga (Hamburger Menu) untuk Open / Close Shift */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm cursor-pointer flex items-center justify-center text-gray-700 hover:border-[#01A684] transition-all"
              title="Menu Shift"
            >
              <Menu size={20} />
            </button>

            {/* Dropdown Menu Shift */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#1A1A1A]">{cashierName}</p>
                  <p className="text-[10px] text-gray-400">Manajemen Shift Kasir</p>
                </div>
                <button
                  onClick={handleOpenShiftMenuClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#01A684] hover:bg-emerald-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
                >
                  <CheckCircle2 size={15} />
                  <span>Open Shift (Buka Shift)</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setCloseShiftModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
                >
                  <LogOut size={15} />
                  <span>Close Shift (Tutup Shift)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk makanan atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs outline-none focus:border-[#01A684]"
          />
        </div>

        {/* KATEGORI */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {['Semua', 'Minuman', 'Makanan', 'Snack'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border-0 ${
                selectedCategory === cat ? 'bg-[#01A684] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="w-full max-w-md mx-auto md:max-w-full md:px-8 px-6 pt-4">
        {loading ? (
          <p className="text-center text-xs text-gray-500 py-12">Memuat produk dari Supabase...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-12">Belum ada produk yang tersedia di database Supabase.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#01A684]"
              >
                <div>
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
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

      {/* MOBILE PESANAN (DRAWER) */}
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
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-400">Rp {formatRp(item.price)} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white/10 rounded-md text-white border-0">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white/10 rounded-md text-white border-0">+</button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold mt-2 cursor-pointer border-0"
              >
                Bayar Sekarang (Rp {formatRp(subtotal)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* TABLET & DESKTOP SIDEBAR (PESANAN DI ATAS, TOTAL & TOMBOL DI KANAN BAWAH) */}
      <aside className="hidden md:flex fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 p-6 z-40 flex-col justify-between shadow-sm">
        <div>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#01A684]" /> Pesanan Saat Ini
          </h2>
          
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">Belum ada item pesanan.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-[#01A684] font-semibold">Rp {formatRp(item.price * item.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded-md text-xs border-0">-</button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded-md text-xs border-0">+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total Pembayaran & Tombol Proses Pembayaran di Kanan Bawah */}
        <div className="border-t border-gray-100 pt-4 space-y-3 bg-white">
          <div className="flex justify-between text-sm font-bold">
            <span>Total Pembayaran</span>
            <span className="text-[#01A684]">Rp {formatRp(subtotal)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={handleProceedToCheckout}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white border-0 cursor-pointer ${cart.length > 0 ? 'bg-[#01A684]' : 'bg-gray-300'}`}
          >
            Proses Pembayaran
          </button>
        </div>
      </aside>

      <CashierBottomNav />

    </div>
  );
}