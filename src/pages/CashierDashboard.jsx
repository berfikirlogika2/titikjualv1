import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ShoppingBag, LogOut, CheckCircle2, Menu, Edit3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierDashboard() {
  const navigate = useNavigate();
  
  const [cashierName, setCashierName] = useState('Fadhil Kasir');
  const [ownerId, setOwnerId] = useState('');
  
  const [initials, setInitials] = useState('FK');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [editingCartItem, setEditingCartItem] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cashier_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('cashier_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Gagal menyimpan keranjang:', err);
    }
  }, [cart]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sinkronisasi data dari tabel profiles Supabase (Fadhil Kasir / FK)
  useEffect(() => {
    const initCashierSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerId = 'toko_123';
        let currentCashierName = 'Fadhil Kasir';

        if (session && session.user) {
          currentOwnerId = session.user.id;
          setOwnerId(currentOwnerId);

          // Ambil nama asli dari tabel profiles Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData && profileData.full_name) {
            currentCashierName = profileData.full_name;
          } else {
            currentCashierName = session.user.user_metadata?.full_name || 'Fadhil Kasir';
          }
          setCashierName(currentCashierName);
        } else {
          currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
          setOwnerId(currentOwnerId);
        }

        const nameParts = currentCashierName.split(' ');
        const calculatedInitials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
          : nameParts[0].substring(0, 2).toUpperCase();
        setInitials(calculatedInitials);

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
            let rawVariants = item.varian || item.variants || item.variasi || item.options || [];
            if (typeof rawVariants === 'string') {
              try {
                rawVariants = JSON.parse(rawVariants);
              } catch (e) {
                rawVariants = [];
              }
            }

            const variants = Array.isArray(rawVariants) ? rawVariants.map(v => ({
              name: v.nama || v.name || v.variant_name || 'Varian',
              price: Number(v.hargaJual || v.price || v.harga || v.harga_jual || v.amount || 0)
            })) : [];

            let basePrice = Number(item.harga_jual || item.price || item.harga || item.amount || 0);
            if (variants.length > 0 && basePrice === 0) {
              basePrice = variants[0].price;
            }

            return {
              id: item.id || idx,
              name: item.nama || item.name || item.nama_produk || 'Produk Tanpa Nama',
              category: item.kategori || item.category || 'Semua',
              price: basePrice,
              variants: variants,
              stock: Number(item.stok_manual || item.stock || item.stok || 10),
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

  const handleProductClick = (product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
    } else {
      addToCartDirect(product, product.price, '');
    }
  };

  const addToCartDirect = (product, price, variantName) => {
    const cartItemId = variantName ? `${product.id}-${variantName}` : product.id;
    const cartItemName = variantName ? `${product.name} (${variantName})` : product.name;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === cartItemId);
      if (existing) {
        return prev.map((item) => item.cartId === cartItemId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [
        ...prev, 
        { 
          cartId: cartItemId, 
          id: product.id, 
          name: product.name, 
          cartItemName: cartItemName, 
          price: price, 
          qty: 1, 
          stock: product.stock,
          variants: product.variants,
          selectedVariant: variantName
        }
      ];
    });
    setVariantModalProduct(null);
  };

  const updateQty = (cartId, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.cartId === cartId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleUpdateCartItemVariant = (oldCartId, newVariantName, newPrice) => {
    setCart((prev) => {
      const targetItem = prev.find(i => i.cartId === oldCartId);
      if (!targetItem) return prev;

      const newCartId = `${targetItem.id}-${newVariantName}`;
      const newCartItemName = `${targetItem.name} (${newVariantName})`;

      const existingNewVariant = prev.find(i => i.cartId === newCartId);

      if (existingNewVariant) {
        return prev.map(item => {
          if (item.cartId === newCartId) {
            return { ...item, qty: item.qty + targetItem.qty };
          }
          return item;
        }).filter(item => item.cartId !== oldCartId);
      } else {
        return prev.map(item => {
          if (item.cartId === oldCartId) {
            return {
              ...item,
              cartId: newCartId,
              cartItemName: newCartItemName,
              price: newPrice,
              selectedVariant: newVariantName
            };
          }
          return item;
        });
      }
    });
    setEditingCartItem(null);
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
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[200px] lg:pb-12 md:pr-80">
      
      {variantModalProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-gray-900 mb-1">{variantModalProduct.name}</h3>
            <p className="text-xs text-gray-500 mb-4">Pilih varian produk yang diinginkan:</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {variantModalProduct.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => addToCartDirect(variantModalProduct, v.price, v.name)}
                  className="w-full p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-[#01A684] rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer active:scale-95 duration-150"
                >
                  <span className="text-gray-800">{v.name}</span>
                  <span className="text-[#01A684]">Rp {formatRp(v.price)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setVariantModalProduct(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {editingCartItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Ubah Varian: {editingCartItem.name}</h3>
            <p className="text-xs text-gray-500 mb-4">Pilih varian baru untuk pesanan ini:</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {editingCartItem.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUpdateCartItemVariant(editingCartItem.cartId, v.name, v.price)}
                  className={`w-full p-3 border rounded-xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer active:scale-95 duration-150 ${
                    editingCartItem.selectedVariant === v.name 
                      ? 'bg-emerald-50 border-[#01A684] text-[#01A684]' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                  }`}
                >
                  <span>{v.name}</span>
                  <span>Rp {formatRp(v.price)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditingCartItem(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 backdrop-blur-xl z-40 bg-[#F1F2F6]/95 pt-4 pb-3 px-6 border-b border-gray-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 bg-[#01A684] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1A1A1A]">{cashierName}</h1>
              <span className="text-[10px] bg-[#E6F6F3] text-[#01A684] px-2 py-0.5 rounded-full font-semibold">
                Kasir Outlet
              </span>
            </div>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm cursor-pointer flex items-center justify-center text-gray-700 hover:border-[#01A684] transition-all"
              title="Menu Opsi"
            >
              <Menu size={20} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#1A1A1A]">{cashierName}</p>
                  <p className="text-[10px] text-gray-400">Akses Kasir</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/kasir/pengaturan');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
                >
                  <Menu size={15} className="text-[#01A684]" />
                  <span>Pengaturan Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>

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

      <main className="w-full max-w-md mx-auto md:max-w-full md:px-8 px-6 pt-4">
        {loading ? (
          <p className="text-center text-xs text-gray-500 py-12">Memuat produk dari Supabase...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-12">Belum ada produk yang tersedia di database Supabase.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              let priceDisplay = `Rp ${formatRp(p.price)}`;
              if (p.variants && p.variants.length > 0) {
                const prices = p.variants.map(v => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                priceDisplay = min === max ? `Rp ${formatRp(min)}` : `Rp ${formatRp(min)} - Rp ${formatRp(max)}`;
              }

              return (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#01A684] active:scale-[0.98] transition-transform duration-150 group"
                >
                  <div>
                    <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight mb-1">{p.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] font-bold text-[#01A684]">{priceDisplay}</span>
                    <span className="w-6 h-6 rounded-lg bg-[#E6F6F3] text-[#01A684] flex items-center justify-center text-xs font-bold active:scale-75 transition-transform duration-150 shadow-xs">
                      +
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="lg:hidden fixed bottom-[72px] left-4 right-4 bg-[#1A1A1A] text-white rounded-2xl p-4 shadow-xl z-40">
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
              <div key={item.cartId} className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{item.cartItemName}</p>
                    {item.variants && item.variants.length > 0 && (
                      <button 
                        onClick={() => setEditingCartItem(item)}
                        className="text-[#01A684] hover:underline text-[10px] flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded cursor-pointer border-0 active:scale-95 duration-150"
                        title="Ubah Varian"
                      >
                        <Edit3 size={10} /> Ubah
                      </button>
                    )}
                  </div>
                  <p className="text-gray-400">Rp {formatRp(item.price)} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.cartId, -1)} className="w-6 h-6 bg-white/10 rounded-md text-white border-0 cursor-pointer active:scale-90 duration-150">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.cartId, 1)} className="w-6 h-6 bg-white/10 rounded-md text-white border-0 cursor-pointer active:scale-90 duration-150">+</button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-bold mt-2 cursor-pointer border-0 active:scale-95 duration-150"
              >
                Bayar Sekarang (Rp {formatRp(subtotal)})
              </button>
            )}
          </div>
        )}
      </div>

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
                <div key={item.cartId} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{item.cartItemName}</p>
                    </div>
                    {item.variants && item.variants.length > 0 && (
                      <button 
                        onClick={() => setEditingCartItem(item)}
                        className="text-[#01A684] hover:underline text-[10px] font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5 cursor-pointer border-0 active:scale-95 duration-150"
                      >
                        <Edit3 size={10} /> Ubah Varian
                      </button>
                    )}
                    <p className="text-[11px] text-[#01A684] font-semibold mt-1">Rp {formatRp(item.price * item.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.cartId, -1)} className="w-6 h-6 bg-gray-100 rounded-md text-xs border-0 cursor-pointer active:scale-90 duration-150">-</button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.cartId, 1)} className="w-6 h-6 bg-gray-100 rounded-md text-xs border-0 cursor-pointer active:scale-90 duration-150">+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3 bg-white">
          <div className="flex justify-between text-sm font-bold">
            <span>Total Pembayaran</span>
            <span className="text-[#01A684]">Rp {formatRp(subtotal)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={handleProceedToCheckout}
            className={`w-full py-3 rounded-xl text-xs font-bold text-white border-0 cursor-pointer ${cart.length > 0 ? 'bg-[#01A684] active:scale-[0.98]' : 'bg-gray-300'}`}
          >
            Proses Pembayaran
          </button>
        </div>
      </aside>

      <CashierBottomNav />

    </div>
  );
}