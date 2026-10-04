import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, QrCode, Image as ImageIcon, 
  Crown, X, Upload, Receipt, CheckCircle2, Plus, Trash2, 
  ArrowRight, Sparkles, TrendingUp, Diamond, Shield, CreditCard, Sliders, Check, LayoutTemplate, AlertCircle, Save
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerPengaturan() {
  const navigate = useNavigate();

  // State untuk Informasi Toko
  const [toko, setToko] = useState({
    namaToko: 'Kedai Kopi Budi',
    alamat: 'Jl. Margonda Raya No. 123, Depok',
    telepon: '081234567890',
    email: 'info@kedaikopi.com',
    kategori: 'F&B (Kuliner / Cafe / Resto)',
  });

  const [isLainnyaSelected, setIsLainnyaSelected] = useState(false);
  const [kategoriCustom, setKategoriCustom] = useState('');

  // State untuk Langganan
  const [paketAktif, setPaketAktif] = useState({
    id: 'growth',
    nama: 'Growth Pack',
    status: 'Aktif',
    terakhirBayar: '12 Sep 2025',
    berakhir: '12 Okt 2026',
    harga: '250.000 / bulan'
  });

  // State untuk Pengaturan Struk & Pilihan Template (1 sampai 4)
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [footerStruk, setFooterStruk] = useState('');
  const [logoStrukPreview, setLogoStrukPreview] = useState(null);
  const [customTexts, setCustomTexts] = useState([]);
  const [inputCustomText, setInputCustomText] = useState('');

  // State Pengaturan Operasional & Kasir
  const [shiftSettings, setShiftSettings] = useState({
    wajibModalAwal: true,
    izinkanKasirLihatLaporan: false,
  });

  const [paymentMethods, setPaymentMethods] = useState({
    tunai: true,
    qris: true,
    transfer: true,
    debitKredit: false,
    tempo: false,
  });

  const [businessMode, setBusinessMode] = useState('fnb');

  // State untuk melacak perubahan belum disimpan (Unsaved Changes Tracker)
  const [isDirty, setIsDirty] = useState(false);

  // Setiap kali ada state konfigurasi yang berubah, set isDirty menjadi true
  useEffect(() => {
    setIsDirty(true);
  }, [toko, kategoriCustom, selectedTemplate, footerStruk, logoStrukPreview, customTexts, shiftSettings, paymentMethods, businessMode]);

  // Handler Simpan Semua Pengaturan
  const handleSaveAll = () => {
    setIsDirty(false);
    alert('Semua pengaturan sistem & template struk berhasil disimpan!');
  };

  // Warning saat user mencoba menutup tab / browser jika belum save
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // State Modal
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState('growth');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const daftarKategoriToko = [
    'F&B (Kuliner / Cafe / Resto)',
    'Retail / Toko Kelontong',
    'Fashion & Pakaian',
    'Carwash & Bikewash (Cuci Kendaraan)',
    'Laundry Kiloan & Satuan',
    'Bengkel & Service Kendaraan',
    'Barbershop & Salon Kecantikan',
    'Jasa & Service Lainnya',
    'Lainnya',
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      desc: 'Untuk usaha pemula yang butuh sistem dasar.',
      price: '150.000',
      icon: Store,
      features: ['1 Pengguna Kasir', 'Maksimal 100 Produk', 'Laporan Penjualan Dasar'],
    },
    {
      id: 'growth',
      name: 'Growth Pack',
      desc: 'Fitur lengkap untuk bisnis berkembang.',
      price: '250.000',
      isPopular: true,
      icon: TrendingUp,
      features: ['3 Pengguna Kasir', 'Produk Tidak Terbatas', 'Manajemen Inventori Lanjut'],
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      desc: 'Solusi komprehensif skala besar.',
      price: '450.000',
      icon: Diamond,
      features: ['Pengguna Tidak Terbatas', 'Multi-Cabang (Hingga 5)', 'Dukungan Prioritas 24/7'],
    },
  ];

  const isHighestPlan = paketAktif.id === 'premium';

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoStrukPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomText = () => {
    if (!inputCustomText.trim()) return;
    if (customTexts.length >= 3) {
      alert('Maksimal penambahan 3 custom teks pada struk!');
      return;
    }
    setCustomTexts([...customTexts, inputCustomText.trim()]);
    setInputCustomText('');
  };

  const handleDeleteCustomText = (index) => {
    setCustomTexts(customTexts.filter((_, i) => i !== index));
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Apakah Anda yakin ingin menghentikan langganan POS Kasir Pro? Akses owner akan dibatasi setelah masa aktif berakhir.')) {
      setPaketAktif(prev => ({ ...prev, status: 'Non-Aktif / Menunggu Berakhir' }));
      alert('Langganan berhasil dihentikan.');
    }
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const chosen = plans.find(p => p.id === selectedPlanToUpgrade);
      setPaketAktif({
        id: chosen.id,
        nama: chosen.name,
        status: 'Aktif',
        terakhirBayar: '09 Sep 2026',
        berakhir: '09 Sep 2027',
        harga: `${chosen.price} / bulan`
      });
      setIsUpgradeModalOpen(false);
      setPaymentMethod(null);
      alert('Pembayaran Berhasil! Paket langganan Anda telah diperbarui.');
    }, 1500);
  };

  const defaultFooter = 'Terima kasih atas kunjungan Anda!';
  const activeFooter = footerStruk.trim() !== '' ? footerStruk : defaultFooter;

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] font-sans antialiased pb-40 relative">
      
      {/* HEADER PRESISI */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 pt-[env(safe-area-inset-top)]">
        <div className="h-14 flex items-center justify-between relative">
          <button 
            onClick={() => {
              if (isDirty && !window.confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
                return;
              }
              navigate(-1);
            }} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pengaturan Sistem
          </h1>

          <div className="w-9 h-9 shrink-0" />
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">
        
        {/* HERO CARD PENGATURAN */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden min-h-[110px] flex items-center">
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-20 text-emerald-300 transform rotate-[-12deg]">
            <svg viewBox="0 0 100 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-52 h-52">
              <rect x="5" y="18" width="90" height="35" rx="5" stroke="currentColor" strokeWidth="5"/>
              <path d="M5 58H95" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <rect x="58" y="2" width="22" height="13" rx="3" stroke="currentColor" strokeWidth="3.5"/>
              <path d="M69 15V18" stroke="currentColor" strokeWidth="3.5"/>
              <text x="12" y="42" fill="currentColor" fontSize="18" fontWeight="900" fontFamily="sans-serif">KASIR</text>
              <text x="61" y="11" fill="currentColor" fontSize="7" fontWeight="900" fontFamily="sans-serif">PRO</text>
            </svg>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Store size={12} className="text-[#01a684]" /> TOKO & KONTROL
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">{toko.namaToko}</h2>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                Kelola profil bisnis, shift kasir, metode pembayaran, hingga kustomisasi struk.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: LANGGANAN APLIKASI */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-[#E9EBED]/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center font-bold">
                <Crown size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Status Langganan</h2>
                <p className="text-[10px] text-[#86899B]">Keanggotaan aktif sistem POS</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              paketAktif.status === 'Aktif' ? 'bg-emerald-100 text-[#01a684]' : 'bg-amber-100 text-amber-700'
            }`}>
              <CheckCircle2 size={12} /> {paketAktif.status}
            </span>
          </div>

          <div className="bg-[#F1F2F6]/80 p-3.5 rounded-2xl flex flex-col gap-2 border border-[#E9EBED]/50 text-xs font-medium">
            <div className="flex justify-between items-center">
              <span className="text-[#86899B]">Paket Saat Ini:</span>
              <span className="font-bold text-[#181b2b]">{paketAktif.nama}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#86899B]">Masa Berakhir:</span>
              <span className="font-bold text-[#01a684]">{paketAktif.berakhir}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => { setSelectedPlanToUpgrade(paketAktif.id); setPaymentMethod(null); setIsUpgradeModalOpen(true); }}
              className="flex-1 bg-[#01a684] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              Perpanjang / Upgrade Paket
            </button>
            <button 
              onClick={handleCancelSubscription}
              className="px-3 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
            >
              Berhenti
            </button>
          </div>
        </section>

        {/* SECTION 2: PROFIL BISNIS TOKO */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 border-b border-[#E9EBED]/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Informasi Usaha Toko</h2>
              <p className="text-[10px] text-[#86899B]">Profil publik dan cetak header struk</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Toko</label>
              <input 
                type="text" 
                value={toko.namaToko} 
                onChange={(e) => setToko({...toko, namaToko: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2.5 font-bold text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Kategori Bisnis</label>
              <button
                type="button"
                onClick={() => setIsKategoriModalOpen(true)}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2.5 font-semibold text-[#181b2b] text-left flex justify-between items-center cursor-pointer"
              >
                <span>{isLainnyaSelected && kategoriCustom ? `Lainnya: ${kategoriCustom}` : toko.kategori}</span>
                <span className="text-[#01a684] text-[10px] font-bold">Ubah</span>
              </button>
            </div>

            {isLainnyaSelected && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#01a684] mb-1">Keterangan Kategori Lainnya (Manual)</label>
                <input 
                  type="text" 
                  value={kategoriCustom} 
                  onChange={(e) => setKategoriCustom(e.target.value)}
                  placeholder="Cth: Petshop / Fotokopi / Toko Buah"
                  className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2.5 font-bold text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Alamat Lengkap</label>
              <textarea 
                rows="2" 
                value={toko.alamat} 
                onChange={(e) => setToko({...toko, alamat: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Nomor Telepon Toko</label>
              <input 
                type="text" 
                value={toko.telepon} 
                onChange={(e) => setToko({...toko, telepon: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2.5 font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: MANAJEMEN SHIFT & KASIR */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 border-b border-[#E9EBED]/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Manajemen Shift & Kasir</h2>
              <p className="text-[10px] text-[#86899B]">Kontrol modal awal dan hak akses laporan</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-[#F1F2F6] rounded-2xl border border-[#E9EBED] cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-[#181b2b]">Wajib Input Modal Awal</span>
                <span className="text-[9px] text-[#86899B]">Kasir wajib isi cash-in-drawer saat mulai shift</span>
              </div>
              <input 
                type="checkbox" 
                checked={shiftSettings.wajibModalAwal} 
                onChange={(e) => setShiftSettings({...shiftSettings, wajibModalAwal: e.target.checked})}
                className="w-4 h-4 accent-[#01a684] rounded cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#F1F2F6] rounded-2xl border border-[#E9EBED] cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-[#181b2b]">Akses Laporan untuk Kasir</span>
                <span className="text-[9px] text-[#86899B]">Izinkan kasir melihat total omset di HP mereka</span>
              </div>
              <input 
                type="checkbox" 
                checked={shiftSettings.izinkanKasirLihatLaporan} 
                onChange={(e) => setShiftSettings({...shiftSettings, izinkanKasirLihatLaporan: e.target.checked})}
                className="w-4 h-4 accent-[#01a684] rounded cursor-pointer" 
              />
            </label>
          </div>
        </section>

        {/* SECTION 4: METODE PEMBAYARAN KASIR */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 border-b border-[#E9EBED]/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Metode Pembayaran Kasir</h2>
              <p className="text-[10px] text-[#86899B]">Pilih metode bayar yang aktif di layar POS</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'tunai', label: 'Tunai (Cash)' },
              { id: 'qris', label: 'QRIS Digital' },
              { id: 'transfer', label: 'Transfer Bank' },
              { id: 'debitKredit', label: 'Kartu Debit / Kredit' },
              { id: 'tempo', label: 'Tempo / Berhutang' },
            ].map((m) => {
              const isActive = paymentMethods[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethods({...paymentMethods, [m.id]: !isActive})}
                  className={`p-3 rounded-2xl border font-bold text-left flex justify-between items-center cursor-pointer transition-all ${
                    isActive ? 'bg-emerald-50 border-[#01a684] text-[#01a684]' : 'bg-[#F1F2F6] border-[#E9EBED] text-slate-500'
                  }`}
                >
                  <span className="truncate">{m.label}</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-[#01a684] text-white' : 'border border-slate-300'}`}>
                    {isActive && <Check size={10} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: MODE OPERASIONAL BISNIS */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 border-b border-[#E9EBED]/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Mode Operasional Bisnis</h2>
              <p className="text-[10px] text-[#86899B]">Sesuaikan alur layar kasir dengan jenis usaha</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { id: 'fnb', title: 'Mode F&B / Cafe', desc: 'Ada opsi nomor meja & tipe order (Dine-in / Takeaway)' },
              { id: 'jasa', title: 'Mode Jasa / Cuci & Laundry', desc: 'Ada input plat nomor kendaraan / catatan berat cucian' },
              { id: 'retail', title: 'Mode Retail / Toko Kelontong', desc: 'Scan barcode langsung tanpa opsi meja' },
            ].map((mode) => (
              <div 
                key={mode.id}
                onClick={() => setBusinessMode(mode.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  businessMode === mode.id ? 'bg-emerald-50/70 border-[#01a684]' : 'bg-[#F1F2F6] border-[#E9EBED]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border ${
                  businessMode === mode.id ? 'border-[#01a684] bg-[#01a684] text-white' : 'border-slate-400'
                }`}>
                  {businessMode === mode.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <span className="font-bold text-[#181b2b] block">{mode.title}</span>
                  <span className="text-[10px] text-[#86899B]">{mode.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: KUSTOMISASI STRUK & PILIHAN 4 TEMPLATE */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 border-b border-[#E9EBED]/50 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Template Struk & Kustomisasi Logo</h2>
              <p className="text-[10px] text-[#86899B]">Pilih varian tata letak dengan logo jumbo atau watermark</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-2">Pilih Varian Tata Letak Struk</label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: '1', name: '🧾 1. Standar Rata Tengah (Logo Sedang)', desc: 'Gaya umum dengan logo ukuran sedang proporsional.' },
                  { id: '2', name: '⭐ 2. Logo Jumbo / Super Besar di Header', desc: 'Menonjolkan logo toko sangat besar di bagian atas.' },
                  { id: '3', name: '✨ 3. Logo Ornamen Tipis (Watermark)', desc: 'Logo menjadi ornamen latar belakang transparan yang elegan.' },
                  { id: '4', name: '🧾 4. Format Detail Shift & Transaksi', desc: 'Dilengkapi informasi nomor transaksi & kasir.' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                      selectedTemplate === tmpl.id 
                        ? 'bg-emerald-50 border-[#01a684] text-[#01a684] ring-2 ring-[#01a684]/20 shadow-sm' 
                        : 'bg-[#F1F2F6] border-[#E9EBED] text-[#181b2b] hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{tmpl.name}</span>
                    <span className="text-[10px] text-slate-500">{tmpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#E9EBED]">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F2F6] border border-[#E9EBED] flex items-center justify-center overflow-hidden shrink-0">
                {logoStrukPreview ? (
                  <img src={logoStrukPreview} alt="Logo Toko" className="w-full h-full object-cover filter grayscale contrast-200 brightness-0" />
                ) : (
                  <ImageIcon size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#181b2b]">Logo Header Struk (Auto Hitam Pekat)</label>
                  {logoStrukPreview && (
                    <button onClick={() => setLogoStrukPreview(null)} className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer">Hapus Logo</button>
                  )}
                </div>
                <label className="bg-[#01a684] text-white px-3 py-2 rounded-xl text-center font-bold cursor-pointer hover:opacity-90 transition-all text-[11px] inline-flex items-center justify-center gap-1.5">
                  <Upload size={13} /> {logoStrukPreview ? 'Ganti Logo' : 'Unggah Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-[10px] font-bold uppercase text-[#86899B]">Custom Teks Tambahan ({customTexts.length}/3)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputCustomText} 
                  onChange={(e) => setInputCustomText(e.target.value)}
                  placeholder="Cth: WiFi: KopiBudi / IG: @kedaibudi" 
                  className="flex-1 bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 text-xs font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]"
                />
                <button type="button" onClick={handleAddCustomText} className="bg-[#181b2b] text-white px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer shrink-0">
                  <Plus size={16} />
                </button>
              </div>

              {customTexts.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  {customTexts.map((txt, idx) => (
                    <div key={idx} className="bg-slate-50 border border-[#E9EBED] px-3 py-2 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-medium text-[#181b2b] truncate max-w-[240px]">{idx + 1}. {txt}</span>
                      <button onClick={() => handleDeleteCustomText(idx)} className="text-red-400 hover:text-red-600 cursor-pointer p-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#86899B] mb-1">Custom Teks Penutup (Footer)</label>
              <input 
                type="text" 
                value={footerStruk} 
                onChange={(e) => setFooterStruk(e.target.value)}
                placeholder="Terima kasih atas kunjungan Anda!"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 text-xs font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
              />
            </div>
          </div>
        </section>

        {/* SECTION 7: LIVE PREVIEW UKURAN RIIL FISIK PRINTER THERMAL 58mm */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-[#E9EBED]/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center">
                <Receipt size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase text-[#181b2b] tracking-wider">Live Preview Skala Riil</h2>
                <p className="text-[10px] text-[#86899B]">Lebar Kertas Thermal 58mm</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-[#01a684] font-bold px-2.5 py-1 rounded-full">58mm Actual Size</span>
          </div>

          {/* CONTAINER KERTAS FISIK THERMAL 58mm (LEBAR PRESISI 220px) */}
          <div className="bg-white text-black p-3.5 w-[220px] mx-auto shadow-2xl font-mono text-[9px] leading-tight flex flex-col gap-1.5 border-t border-b border-slate-200 relative overflow-hidden">
            
            {/* ========================================================= */}
            {/* RENDER TEMPLATE 1: LOGO UKURAN SEDANG (RATA TENGAH) */}
            {/* ========================================================= */}
            {selectedTemplate === '1' && (
              <div className="flex flex-col items-center text-center gap-1">
                {logoStrukPreview && (
                  <img src={logoStrukPreview} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-0.5 filter grayscale contrast-200 brightness-0" />
                )}
                <h3 className="font-bold uppercase text-[10px]">{toko.namaToko}</h3>
                <p className="text-[8px] text-slate-700">{toko.alamat}</p>
                <p className="text-[8px] text-slate-700 mb-1.5">Telp: {toko.telepon}</p>

                <div className="w-full text-center text-[8px] text-slate-600 space-y-0.5 mb-1.5">
                  <p>09 Sep 2026 - 12:44</p>
                  <p>Kasir: Budi</p>
                </div>

                <div className="w-full space-y-0.5 text-left mb-1.5">
                  <div className="flex justify-between">
                    <span>2x Caffe Latte</span>
                    <span>44.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Croissant</span>
                    <span>22.000</span>
                  </div>
                </div>

                <div className="w-full space-y-0.5 border-t border-dashed border-slate-400 pt-1 mb-1.5 text-left">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>66.000</span>
                  </div>
                  <div className="flex justify-between font-bold text-[10px] pt-0.5">
                    <span>TOTAL</span>
                    <span>Rp 66.000</span>
                  </div>
                </div>

                {customTexts.length > 0 && (
                  <div className="text-[8px] text-slate-700 space-y-0.5 my-1">
                    {customTexts.map((ct, idx) => (
                      <p key={idx}>{ct}</p>
                    ))}
                  </div>
                )}

                <p className="text-[8px] italic mt-1">{activeFooter}</p>
              </div>
            )}

            {/* ========================================================= */}
            {/* RENDER TEMPLATE 2: LOGO JUMBO / SUPER BESAR DI HEADER */}
            {/* ========================================================= */}
            {selectedTemplate === '2' && (
              <div className="flex flex-col items-center text-center gap-1">
                {logoStrukPreview && (
                  <img src={logoStrukPreview} alt="Logo Jumbo" className="w-20 h-20 object-contain mx-auto mb-1 filter grayscale contrast-200 brightness-0" />
                )}
                <h3 className="font-black uppercase text-[11px] tracking-wider">{toko.namaToko}</h3>
                <p className="text-[8px] text-slate-700 mb-1.5">{toko.alamat}</p>

                <div className="w-full text-center text-[8px] text-slate-600 space-y-0.5 mb-1.5">
                  <p>09 Sep 2026 - 12:44 | Kasir: Budi</p>
                </div>

                <div className="w-full space-y-0.5 text-left mb-1.5">
                  <div className="flex justify-between">
                    <span>2x Caffe Latte</span>
                    <span>44.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Croissant</span>
                    <span>22.000</span>
                  </div>
                </div>

                <div className="w-full space-y-0.5 border-t border-dashed border-slate-400 pt-1 mb-1.5 text-left">
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>TOTAL</span>
                    <span>Rp 66.000</span>
                  </div>
                </div>

                {customTexts.length > 0 && (
                  <div className="text-[8px] text-slate-700 space-y-0.5 my-1">
                    {customTexts.map((ct, idx) => (
                      <p key={idx}>{ct}</p>
                    ))}
                  </div>
                )}

                <p className="text-[8px] italic mt-1">{activeFooter}</p>
              </div>
            )}

            {/* ========================================================= */}
            {/* RENDER TEMPLATE 3: LOGO ORNAMEN TIPIS (WATERMARK BACKGROUND) */}
            {/* ========================================================= */}
            {selectedTemplate === '3' && (
              <div className="relative flex flex-col items-center text-center gap-1 py-1">
                {logoStrukPreview && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0">
                    <img src={logoStrukPreview} alt="Watermark" className="w-32 h-32 object-contain filter grayscale contrast-200 brightness-0" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center gap-1 w-full">
                  <h3 className="font-bold uppercase text-[10px]">{toko.namaToko}</h3>
                  <p className="text-[8px] text-slate-700">{toko.alamat}</p>
                  <p className="text-[8px] text-slate-700 mb-1.5">Telp: {toko.telepon}</p>

                  <div className="w-full text-center text-[8px] text-slate-600 space-y-0.5 mb-1.5">
                    <p>09 Sep 2026 - 12:44</p>
                    <p>Kasir: Budi</p>
                  </div>

                  <div className="w-full space-y-0.5 text-left mb-1.5">
                    <div className="flex justify-between">
                      <span>2x Caffe Latte</span>
                      <span>44.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Croissant</span>
                      <span>22.000</span>
                    </div>
                  </div>

                  <div className="w-full space-y-0.5 border-t border-dashed border-slate-400 pt-1 mb-1.5 text-left">
                    <div className="flex justify-between font-bold text-[10px]">
                      <span>TOTAL</span>
                      <span>Rp 66.000</span>
                    </div>
                  </div>

                  {customTexts.length > 0 && (
                    <div className="text-[8px] text-slate-700 space-y-0.5 my-1">
                      {customTexts.map((ct, idx) => (
                        <p key={idx}>{ct}</p>
                      ))}
                    </div>
                  )}

                  <p className="text-[8px] italic mt-1">{activeFooter}</p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* RENDER TEMPLATE 4: DETAIL SHIFT & LOGO MINI */}
            {/* ========================================================= */}
            {selectedTemplate === '4' && (
              <div className="flex flex-col text-left gap-1">
                <div className="text-center mb-0.5 flex flex-col items-center">
                  {logoStrukPreview && (
                    <img src={logoStrukPreview} alt="Logo" className="w-8 h-8 object-contain mb-0.5 filter grayscale contrast-200 brightness-0" />
                  )}
                  <h3 className="font-bold uppercase text-[10px]">{toko.namaToko}</h3>
                  <p className="text-[8px] text-slate-600">{toko.alamat}</p>
                </div>

                <div className="bg-slate-100 p-1 rounded text-[8px] space-y-0.5 mb-1">
                  <div className="flex justify-between">
                    <span>Shift: Pagi</span>
                    <span>Meja: 04</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order: Dine-In</span>
                    <span>Kasir: Budi</span>
                  </div>
                </div>

                <div className="space-y-0.5 mb-1">
                  <div className="flex justify-between">
                    <span>2x Caffe Latte</span>
                    <span>44.000</span>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1 border-t border-dashed border-slate-400 mb-1">
                  <div className="flex justify-between font-bold text-[10px]">
                    <span>TOTAL BAYAR</span>
                    <span>Rp 44.000</span>
                  </div>
                </div>

                {customTexts.length > 0 && (
                  <div className="text-[8px] text-slate-700 text-center my-0.5">
                    {customTexts.map((ct, idx) => (
                      <p key={idx}>{ct}</p>
                    ))}
                  </div>
                )}

                <p className="text-[8px] italic text-center mt-0.5">{activeFooter}</p>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* ========================================================= */}
      {/* FLOATING BAR PENGINGAT PERUBAHAN BELUM DISIMPAN (UNSAVED BAR) */}
      {/* ========================================================= */}
      {isDirty && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-[#181b2b] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-bounce-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold">Perubahan belum disimpan!</p>
              <p className="text-[9px] text-slate-300">Jangan lupa klik simpan sebelum keluar.</p>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            className="bg-[#01a684] hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Save size={14} /> Simpan
          </button>
        </div>
      )}

      {/* MODAL KATEGORI TOKO */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-2 text-xs border border-[#E9EBED] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Pilih Kategori Bisnis</h3>
              <button onClick={() => setIsKategoriModalOpen(false)} className="text-[#86899B]"><X size={16} /></button>
            </div>
            {daftarKategoriToko.map((kat) => (
              <button 
                key={kat}
                onClick={() => { 
                  if (kat === 'Lainnya') {
                    setIsLainnyaSelected(true);
                    setToko({...toko, kategori: 'Lainnya'});
                  } else {
                    setIsLainnyaSelected(false);
                    setKategoriCustom('');
                    setToko({...toko, kategori: kat});
                  }
                  setIsKategoriModalOpen(false); 
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-left cursor-pointer ${toko.kategori === kat ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL UPGRADE & PAYMENT GATEWAY */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED] max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#E9EBED] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">
                {!paymentMethod ? 'Pilih Paket & Perpanjangan' : 'Selesaikan Pembayaran'}
              </h3>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-[#86899B]"><X size={18} /></button>
            </div>

            {!paymentMethod && (
              <div className="flex flex-col gap-4">
                {!isHighestPlan && (
                  <div className="bg-gradient-to-r from-[#01a684] to-teal-700 rounded-2xl p-4 text-white shadow-sm flex flex-col gap-1">
                    <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase w-max">
                      <Sparkles size={12} /> Penawaran Upgrade
                    </div>
                    <h4 className="font-extrabold text-sm mt-1">Upgrade Paket Lebih Untung!</h4>
                    <p className="text-[10px] text-white/90">Nikmati fitur tanpa batas dengan upgrade plan ke level di atasnya.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="font-bold uppercase text-[10px] text-[#86899B] tracking-wider">Daftar Paket Pilihan:</span>
                  <div className="grid grid-cols-1 gap-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanToUpgrade === plan.id;
                      const isCurrent = paketAktif.id === plan.id;
                      const IconComponent = plan.icon;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanToUpgrade(plan.id)}
                          className={`rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all relative bg-white ${
                            isSelected ? 'border-2 border-[#01a684] shadow-md ring-2 ring-[#01a684]/10 bg-emerald-50/30' : 'border border-[#E9EBED] shadow-sm'
                          }`}
                        >
                          {isCurrent && <span className="absolute -top-3 right-4 bg-slate-800 text-white text-[9px] px-2.5 py-0.5 rounded-full font-bold">PAKET SAAT INI</span>}
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#01a684] text-white' : 'bg-gray-100 text-[#01a684]'}`}>
                              <IconComponent size={18} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-[#181b2b]">{plan.name}</h4>
                              <p className="text-[10px] text-[#86899B] mt-0.5">{plan.desc}</p>
                              <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-[10px] text-[#86899B]">Rp</span>
                                <span className={`text-sm font-black ${isSelected ? 'text-[#01a684]' : 'text-[#181b2b]'}`}>{plan.price}</span>
                                <span className="text-[10px] text-[#86899B]">/bln</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setPaymentMethod('bca')}
                  className="w-full bg-[#01a684] text-white font-bold py-3 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer text-xs mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>Lanjutkan ke Pembayaran ({plans.find(p => p.id === selectedPlanToUpgrade)?.name})</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {paymentMethod && (
              <div className="flex flex-col gap-3 py-1">
                <div className="bg-slate-50 p-3 rounded-2xl border border-[#E9EBED] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#86899B] block font-bold uppercase">Paket Dipilih:</span>
                    <span className="font-bold text-xs text-[#181b2b]">{plans.find(p => p.id === selectedPlanToUpgrade)?.name}</span>
                  </div>
                  <button onClick={() => setPaymentMethod(null)} className="text-[10px] text-[#01a684] font-bold underline cursor-pointer">Ubah Paket</button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('bca')} className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'bca' ? 'border-[#01a684] bg-emerald-50 text-[#01a684]' : 'border-[#E9EBED]'}`}>
                    <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-[10px]">BCA</span>
                    <span>Transfer BCA</span>
                  </button>
                  <button onClick={() => setPaymentMethod('qris')} className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'qris' ? 'border-[#01a684] bg-emerald-50 text-[#01a684]' : 'border-[#E9EBED]'}`}>
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center font-bold"><QrCode size={14} /></span>
                    <span>QRIS Instant</span>
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2 mt-2 p-3 bg-[#F1F2F6] rounded-2xl">
                  {paymentMethod === 'bca' ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Virtual Account BCA</span>
                      <span className="text-sm font-black text-[#181b2b] tracking-wider">880312984920198</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENTGATEWAY" alt="QRIS" className="w-28 h-28 object-contain border border-slate-200 p-1 bg-white rounded-xl shadow-inner" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setPaymentMethod(null)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer">Kembali</button>
                  <button type="button" disabled={isProcessingPayment} onClick={handleProcessPayment} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-sm disabled:opacity-50">
                    {isProcessingPayment ? 'Memverifikasi...' : 'Konfirmasi Bayar'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}