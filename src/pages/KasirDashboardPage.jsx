import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Plus, Minus, X, Lock, FileText, 
  TrendingUp, LogOut, Info, AlertTriangle, UploadCloud, ChevronRight,
  ShoppingBag, CreditCard, Tag, Box, User, Settings, ReceiptText
} from 'lucide-react';

export default function KasirDashboardPage() {
  const navigate = useNavigate();

  // State Drawer & Modal
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'buka-shift' | 'tutup-shift' | 'catatan' | null

  // State Filter & Pencarian
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // State Keranjang Belanja (Cart)
  const [cart, setCart] = useState([
    { id: 4, name: 'Es Kopi Susu', price: 18000, qty: 2 }
  ]);

  // State Uang di Laci untuk Tutup Shift Warning
  const [cashValue, setCashValue] = useState(1050000);

  // Data Produk Sample
  const products = [
    { id: 1, name: 'Burger Spesial', price: 45000, category: 'Makanan', stock: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { id: 2, name: 'Kentang Goreng', price: 20000, category: 'Snack', stock: 15, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400' },
    { id: 3, name: 'Salad Sehat', price: 35000, category: 'Makanan', stock: 0, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
    { id: 4, name: 'Es Kopi Susu', price: 18000, category: 'Minuman', stock: 20, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400' },
    { id: 5, name: 'Donut Coklat', price: 12000, category: 'Snack', stock: 12, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' },
    { id: 6, name: 'Jus Jeruk', price: 15000, category: 'Minuman', stock: 8, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400' }
  ];

  // Helper Cart Logic
  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === productId);
      if (existing && existing.qty > 1) {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item
        );
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const formatNum = (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl bg-slate-900 p-5 text-white shadow-lg lg:block">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">POS</p>
              <h1 className="mt-1 text-2xl font-bold">Kasir</h1>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { icon: <ShoppingBag size={18} />, label: 'Transaksi', active: true },
              { icon: <Box size={18} />, label: 'Produk' },
              { icon: <ReceiptText size={18} />, label: 'Riwayat' },
              { icon: <User size={18} />, label: 'Pelanggan' },
              { icon: <Settings size={18} />, label: 'Pengaturan' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                  item.active ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Pendapatan Hari Ini</p>
                <p className="text-lg font-semibold">Rp {formatNum(1845000)}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-slate-700 px-3 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-2xl bg-slate-900 p-3 text-white shadow"
            >
              <Menu size={20} />
            </button>
            <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
              <p className="text-xs text-slate-500">Kasir</p>
              <p className="font-semibold">Ayu</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">Selamat datang</p>
                <h2 className="text-2xl font-bold">Dashboard Kasir</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('buka-shift')}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  <Lock size={16} />
                  Buka Shift
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('tutup-shift')}
                  className="flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                >
                  <FileText size={16} />
                  Tutup Shift
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('catatan')}
                  className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  <Info size={16} />
                  Catatan
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Pencarian Produk</p>
                      <h3 className="text-lg font-semibold">Kategori</h3>
                    </div>
                    <div className="relative w-full max-w-sm">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Semua', 'Makanan', 'Minuman', 'Snack'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedCategory === category
                            ? 'bg-cyan-500 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="relative h-32 w-full overflow-hidden">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700">
                          {product.category}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold">{product.name}</h4>
                            <p className="mt-1 text-sm text-slate-500">Stok: {product.stock}</p>
                          </div>
                          <div className="rounded-xl bg-cyan-50 px-2 py-1 text-sm font-semibold text-cyan-700">
                            Rp {formatNum(product.price)}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={() => handleAddToCart(product)}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                            product.stock > 0
                              ? 'bg-slate-900 text-white hover:bg-slate-700'
                              : 'cursor-not-allowed bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Plus size={16} />
                          Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Checkout</p>
                    <h3 className="text-xl font-bold">Keranjang</h3>
                  </div>
                  <div className="rounded-full bg-cyan-500 px-3 py-1 text-sm font-semibold text-white">
                    {totalCartCount}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                      Keranjang masih kosong
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-slate-500">Rp {formatNum(item.price)} / item</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="rounded-full p-1 text-slate-600 hover:bg-white"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(products.find((p) => p.id === item.id))}
                              className="rounded-full p-1 text-slate-600 hover:bg-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">Subtotal</p>
                            <p className="font-semibold text-slate-800">Rp {formatNum(item.price * item.qty)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>Rp {formatNum(totalCartPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Diskon</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Pajak</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                      <span>Total</span>
                      <span>Rp {formatNum(totalCartPrice)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
                  >
                    <CreditCard size={16} />
                    Proses Pembayaran
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden">
          <div className="h-full w-72 bg-slate-900 p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">POS</p>
                <h3 className="mt-1 text-2xl font-bold">Kasir</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full border border-slate-700 p-2 text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {[
                { icon: <ShoppingBag size={18} />, label: 'Transaksi', active: true },
                { icon: <Box size={18} />, label: 'Produk' },
                { icon: <ReceiptText size={18} />, label: 'Riwayat' },
                { icon: <User size={18} />, label: 'Pelanggan' },
                { icon: <Settings size={18} />, label: 'Pengaturan' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium ${
                    item.active ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-slate-700 px-3 py-3 text-sm text-slate-300"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Operasional</p>
                <h3 className="text-xl font-bold">
                  {activeModal === 'buka-shift' && 'Buka Shift'}
                  {activeModal === 'tutup-shift' && 'Tutup Shift'}
                  {activeModal === 'catatan' && 'Catatan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === 'buka-shift' && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  <div className="flex items-start gap-3">
                    <Lock size={18} className="mt-0.5" />
                    <p>Shift dibuka. Saldo awal kunci laci sudah siap untuk digunakan.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Saldo awal</label>
                  <input
                    type="number"
                    defaultValue={500000}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Simpan
                </button>
              </div>
            )}

            {activeModal === 'tutup-shift' && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5" />
                    <p>Uang yang ada di laci saat ini: Rp {formatNum(cashValue)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Uang di laci</label>
                  <input
                    type="number"
                    value={cashValue}
                    onChange={(e) => setCashValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Konfirmasi Tutup Shift
                </button>
              </div>
            )}

            {activeModal === 'catatan' && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Catatan Hari Ini</label>
                  <textarea
                    rows="5"
                    placeholder="Tulis catatan operasional..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Simpan Catatan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}