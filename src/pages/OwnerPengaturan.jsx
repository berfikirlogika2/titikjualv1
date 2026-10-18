import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, QrCode, Image as ImageIcon, 
  Crown, X, Upload, Receipt, CheckCircle2, Plus, Trash2, 
  ArrowRight, Sparkles, TrendingUp, Diamond, Shield, CreditCard, Sliders, Check, LayoutTemplate, AlertCircle, Save, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerPengaturan() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // State Informasi Toko
  const [toko, setToko] = useState({
    namaToko: '',
    alamat: '',
    telepon: '',
    email: '',
    kategori: 'F&B (Kuliner / Cafe / Resto)',
  });

  const [isLainnyaSelected, setIsLainnyaSelected] = useState(false);
  const [kategoriCustom, setKategoriCustom] = useState('');

  // State Langganan (Mengerucut dari Pemilihan Plan Awal)
  const [paketAktif, setPaketAktif] = useState({
    id: 'growth',
    nama: 'Growth Pack',
    status: 'Aktif',
    terakhirBayar: '-',
    berakhir: '-',
    harga: '250.000 / bulan'
  });

  // State Pengaturan Struk & Pilihan Template (1 sampai 4)
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [footerStruk, setFooterStruk] = useState('');
  const [logoStrukPreview, setLogoStrukPreview] = useState(null);
  const [customTexts, setCustomTexts] = useState([]);
  const [inputCustomText, setInputCustomText] = useState('');

  // State Manajemen Shift & Kasir (Hanya Buka & Tutup Shift, Tanpa Akses Laporan)
  const [wajibBukaTutupShift, setWajibBukaTutupShift] = useState(true);

  // State Metode Pembayaran Kasir
  const [paymentMethods, setPaymentMethods] = useState({
    tunai: true,
    qris: true,
    transfer: true,
    debitKredit: false,
    tempo: false,
  });

  // State Mode Operasional Bisnis
  const [businessMode, setBusinessMode] = useState('fnb');

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

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Sinkronisasi Data Pengaturan & Pendaftaran dari Supabase
  const fetchPengaturan = async () => {
    setLoading(true);
    try {
      const currentOwnerId = getOwnerId();
      
      // 1. Cek data di tabel store_settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', currentOwnerId)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (settingsData) {
        const kat = settingsData.kategori_bisnis || 'F&B (Kuliner / Cafe / Resto)';
        const isLainnya = kat === 'Lainnya' || !daftarKategoriToko.includes(kat);
        
        setToko({
          namaToko: settingsData.nama_toko || '',
          alamat: settingsData.alamat || '',
          telepon: settingsData.telepon || '',
          email: settingsData.email || '',
          kategori: isLainnya ? 'Lainnya' : kat,
        });
        setIsLainnyaSelected(isLainnya);
        setKategoriCustom(settingsData.kategori_custom || (isLainnya && kat !== 'Lainnya' ? kat : ''));

        setPaketAktif({
          id: settingsData.paket_id || 'growth',
          nama: settingsData.paket_nama || 'Growth Pack',
          status: settingsData.paket_status || 'Aktif',
          terakhirBayar: settingsData.paket_terakhir_bayar || '-',
          berakhir: settingsData.paket_berakhir || '-',
          harga: settingsData.paket_harga || '250.000 / bulan'
        });

        setWajibBukaTutupShift(settingsData.wajib_buka_tutup_shift ?? true);
        if (settingsData.payment_methods) setPaymentMethods(settingsData.payment_methods);
        if (settingsData.business_mode) setBusinessMode(settingsData.business_mode);
        if (settingsData.selected_template) setSelectedTemplate(settingsData.selected_template);
        if (settingsData.footer_struk) setFooterStruk(settingsData.footer_struk);
        if (settingsData.logo_url) setLogoStrukPreview(settingsData.logo_url);
        if (settingsData.custom_texts) setCustomTexts(settingsData.custom_texts);
      } else {
        // 2. Fallback: Tarik dari data pendaftaran awal (Supabase Auth / Users / LocalStorage Pendaftaran)
        const { data: authData } = await supabase.auth.getUser();
        const userMeta = authData?.user?.user_metadata || {};
        
        const savedRegData = JSON.parse(localStorage.getItem('register_data') || '{}');
        const savedPlanData = JSON.parse(localStorage.getItem('selected_plan') || '{}');

        const initialNamaToko = userMeta.nama_toko || userMeta.nama_usaha || savedRegData.namaToko || 'Kedai Kopi Budi';
        const initialTelepon = userMeta.telepon || userMeta.no_hp || savedRegData.telepon || '';
        const initialEmail = authData?.user?.email || savedRegData.email || '';
        const initialAlamat = userMeta.alamat || savedRegData.alamat || '';
        const initialKategori = userMeta.kategori_bisnis || savedRegData.kategori || 'F&B (Kuliner / Cafe / Resto)';

        const planId = userMeta.paket_id || savedPlanData.id || 'growth';
        const matchedPlan = plans.find(p => p.id === planId) || plans[1];

        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        const formatTgl = (d) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

        const initialPaket = {
          id: matchedPlan.id,
          nama: matchedPlan.name,
          status: 'Aktif',
          terakhirBayar: formatTgl(now),
          berakhir: formatTgl(nextMonth),
          harga: `${matchedPlan.price} / bulan`
        };

        setToko({
          namaToko: initialNamaToko,
          alamat: initialAlamat,
          telepon: initialTelepon,
          email: initialEmail,
          kategori: initialKategori,
        });
        setPaketAktif(initialPaket);

        // Buat baris awal di store_settings agar tersinkronisasi
        await supabase.from('store_settings').upsert([{
          owner_id: currentOwnerId,
          nama_toko: initialNamaToko,
          kategori_bisnis: initialKategori,
          alamat: initialAlamat,
          telepon: initialTelepon,
          email: initialEmail,
          paket_id: initialPaket.id,
          paket_nama: initialPaket.nama,
          paket_status: initialPaket.status,
          paket_terakhir_bayar: initialPaket.terakhirBayar,
          paket_berakhir: initialPaket.berakhir,
          paket_harga: initialPaket.harga,
          wajib_buka_tutup_shift: true,
          payment_methods: paymentMethods,
          business_mode: 'fnb',
          selected_template: '1',
          footer_struk: 'Terima kasih atas kunjungan Anda!',
          custom_texts: []
        }]);
      }
      setIsDirty(false);
    } catch (err) {
      console.error('Gagal memuat pengaturan:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengaturan();
  }, []);

  const markDirty = () => {
    if (!loading) setIsDirty(true);
  };

  // Simpan Semua Pengaturan ke Supabase & LocalStorage (Untuk Konsumsi Instan Halaman Kasir)
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const currentOwnerId = getOwnerId();
      const payload = {
        owner_id: currentOwnerId,
        nama_toko: toko.namaToko,
        kategori_bisnis: isLainnyaSelected ? 'Lainnya' : toko.kategori,
        kategori_custom: isLainnyaSelected ? kategoriCustom : '',
        alamat: toko.alamat,
        telepon: toko.telepon,
        email: toko.email,
        paket_id: paketAktif.id,
        paket_nama: paketAktif.nama,
        paket_status: paketAktif.status,
        paket_terakhir_bayar: paketAktif.terakhirBayar,
        paket_berakhir: paketAktif.berakhir,
        paket_harga: paketAktif.harga,
        wajib_buka_tutup_shift: wajibBukaTutupShift,
        payment_methods: paymentMethods,
        business_mode: businessMode,
        selected_template: selectedTemplate,
        footer_struk: footerStruk.trim() !== '' ? footerStruk : 'Terima kasih atas kunjungan Anda!',
        logo_url: logoStrukPreview,
        custom_texts: customTexts,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('store_settings')
        .upsert([payload], { onConflict: 'owner_id' });

      if (error) throw error;

      // Sinkronkan juga ke cache lokal agar halaman Kasir langsung merespons tanpa jeda
      localStorage.setItem('pos_store_settings', JSON.stringify(payload));

      setIsDirty(false);
      alert('Semua pengaturan sistem, aturan shift kasir, metode pembayaran & template struk berhasil disimpan ke Supabase!');
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err.message);
      alert('Gagal menyimpan ke database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

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

  const isHighestPlan = paketAktif.id === 'premium';

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoStrukPreview(event.target.result);
        markDirty();
      };
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
    markDirty();
  };

  const handleDeleteCustomText = (index) => {
    setCustomTexts(customTexts.filter((_, i) => i !== index));
    markDirty();
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghentikan langganan? Akses akan dibatasi setelah masa aktif berakhir.')) {
      const updatedPaket = { ...paketAktif, status: 'Non-Aktif / Menunggu Berakhir' };
      setPaketAktif(updatedPaket);
      try {
        await supabase
          .from('store_settings')
          .update({ paket_status: updatedPaket.status })
          .eq('owner_id', getOwnerId());
        alert('Status langganan berhasil diperbarui.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      const chosen = plans.find(p => p.id === selectedPlanToUpgrade);
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      const formatTgl = (d) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

      const newPaket = {
        id: chosen.id,
        nama: chosen.name,
        status: 'Aktif',
        terakhirBayar: formatTgl(now),
        berakhir: formatTgl(nextMonth),
        harga: `${chosen.price} / bulan`
      };

      setPaketAktif(newPaket);
      try {
        await supabase.from('store_settings').update({
          paket_id: newPaket.id,
          paket_nama: newPaket.nama,
          paket_status: newPaket.status,
          paket_terakhir_bayar: newPaket.terakhirBayar,
          paket_berakhir: newPaket.berakhir,
          paket_harga: newPaket.harga
        }).eq('owner_id', getOwnerId());
      } catch (err) {
        console.error('Gagal update paket:', err.message);
      }

      setIsProcessingPayment(false);
      setIsUpgradeModalOpen(false);
      setPaymentMethod(null);
      alert('Pembayaran Berhasil! Paket langganan Anda telah diperbarui di Supabase.');
    }, 1200);
  };

  const defaultFooter = 'Terima kasih atas kunjungan Anda!';
  const activeFooter = footerStruk.trim() !== '' ? footerStruk : defaultFooter;

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] font-sans antialiased pb-36 lg:pb-16 relative">
      
      {/* HEADER COMPACT & RESPONSIF */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <button 
            onClick={() => {
              if (isDirty && !window.confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
                return;
              }
              navigate(-1);
            }} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <h1 className="text-[11px] lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pengaturan Sistem POS
          </h1>

          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#01a684] text-white px-3 py-1.5 rounded-xl text-[10px] lg:text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Save size={13} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: COMPACT DI MOBILE, 2 KOLOM PROPORSIONAL DI TABLET/DESKTOP */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">
        
        {/* HERO CARD BERSIH TANPA WATERMARK */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-7 shadow-md relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[9px] lg:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Store size={12} className="text-emerald-400" /> TOKO & KONTROL PUSAT KASIR
            </span>
            <h2 className="text-base lg:text-2xl font-black tracking-tight mt-0.5">
              {toko.namaToko || 'Memuat Nama Toko...'}
            </h2>
            <p className="text-[10px] lg:text-xs text-slate-300 mt-1 leading-relaxed">
              Kelola profil usaha, paket langganan, kewajiban buka/tutup shift kasir, metode pembayaran POS, hingga template cetak struk.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/70 rounded-2xl p-8 text-center text-xs text-[#86899B] flex items-center justify-center gap-2">
            <RefreshCw size={15} className="animate-spin text-[#01a684]" /> Memuat konfigurasi toko dari Supabase...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-start">
            
            {/* KOLOM KIRI (7 KOLOM DI DESKTOP): LANGGANAN, PROFIL TOKO, SHIFT, PEMBAYARAN, MODE BISNIS */}
            <div className="lg:col-span-7 flex flex-col gap-3 lg:gap-5">
              
              {/* SECTION 1: STATUS LANGGANAN */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center font-bold shrink-0">
                      <Crown size={16} />
                    </div>
                    <div>
                      <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Status Langganan</h2>
                      <p className="text-[9px] lg:text-[10px] text-[#86899B]">Tersinkronisasi dengan paket pendaftaran awal</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] lg:text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                    paketAktif.status === 'Aktif' ? 'bg-emerald-100 text-[#01a684]' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <CheckCircle2 size={11} /> {paketAktif.status}
                  </span>
                </div>

                <div className="bg-[#F1F2F6]/80 p-3 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2 border border-[#E9EBED]/60 text-[11px]">
                  <div>
                    <span className="text-[9px] text-[#86899B] block uppercase font-bold">Paket Aktif</span>
                    <span className="font-bold text-[#181b2b]">{paketAktif.nama}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#86899B] block uppercase font-bold">Biaya Langganan</span>
                    <span className="font-bold text-slate-700">Rp {paketAktif.harga}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-[#86899B] block uppercase font-bold">Masa Berakhir</span>
                    <span className="font-bold text-[#01a684]">{paketAktif.berakhir}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button 
                    type="button"
                    onClick={() => { setSelectedPlanToUpgrade(paketAktif.id); setPaymentMethod(null); setIsUpgradeModalOpen(true); }}
                    className="flex-1 bg-[#01a684] text-white py-2.5 rounded-xl text-[11px] lg:text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    Perpanjang / Upgrade Paket
                  </button>
                  <button 
                    type="button"
                    onClick={handleCancelSubscription}
                    className="px-3 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-[11px] lg:text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                  >
                    Berhenti
                  </button>
                </div>
              </section>

              {/* SECTION 2: INFORMASI USAHA TOKO */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                    <Store size={16} />
                  </div>
                  <div>
                    <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Informasi Usaha Toko</h2>
                    <p className="text-[9px] lg:text-[10px] text-[#86899B]">Lengkapi data toko untuk identitas POS & header struk</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Nama Usaha / Toko</label>
                    <input 
                      type="text" 
                      value={toko.namaToko} 
                      onChange={(e) => { setToko({...toko, namaToko: e.target.value}); markDirty(); }}
                      placeholder="Masukkan nama toko..."
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-bold text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Kategori Bisnis</label>
                    <button
                      type="button"
                      onClick={() => setIsKategoriModalOpen(true)}
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-semibold text-[#181b2b] text-left flex justify-between items-center cursor-pointer"
                    >
                      <span className="truncate">{isLainnyaSelected && kategoriCustom ? `Lainnya: ${kategoriCustom}` : toko.kategori}</span>
                      <span className="text-[#01a684] text-[10px] font-bold shrink-0 ml-2">Pilih Kategori</span>
                    </button>
                  </div>

                  {isLainnyaSelected && (
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#01a684] mb-1">Spesifikasi Kategori Bisnis (Manual)</label>
                      <input 
                        type="text" 
                        value={kategoriCustom} 
                        onChange={(e) => { setKategoriCustom(e.target.value); markDirty(); }}
                        placeholder="Cth: Petshop / Apotek / Toko Bangunan"
                        className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 font-bold text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Nomor Telepon Toko</label>
                    <input 
                      type="text" 
                      value={toko.telepon} 
                      onChange={(e) => { setToko({...toko, telepon: e.target.value}); markDirty(); }}
                      placeholder="Cth: 081234567890"
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Email Toko / Usaha</label>
                    <input 
                      type="email" 
                      value={toko.email} 
                      onChange={(e) => { setToko({...toko, email: e.target.value}); markDirty(); }}
                      placeholder="Cth: outlet@tokoku.com"
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Alamat Lengkap Outlet</label>
                    <textarea 
                      rows="2" 
                      value={toko.alamat} 
                      onChange={(e) => { setToko({...toko, alamat: e.target.value}); markDirty(); }}
                      placeholder="Tuliskan alamat lengkap toko untuk dicetak pada struk kasir..."
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 3: MANAJEMEN SHIFT & KASIR (WAJIB BUKA & TUTUP SHIFT, TANPA AKSES LAPORAN) */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Manajemen Shift & Kasir</h2>
                    <p className="text-[9px] lg:text-[10px] text-[#86899B]">Terintegrasi langsung dengan halaman Cashier Dashboard</p>
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 p-3 bg-[#F1F2F6] rounded-2xl border border-[#E9EBED] cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#181b2b]">1. Wajib Input Buka Shift & Tutup Shift</span>
                    <span className="text-[10px] text-[#86899B] leading-relaxed mt-0.5">
                      Saat diaktifkan, kasir yang membuka aplikasi wajib melakukan <strong>Open Shift</strong> dengan menginput uang tunai (cash) di laci kasir, serta wajib menginput total uang fisik di meja kasir saat <strong>Close Shift</strong>.
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={wajibBukaTutupShift} 
                    onChange={(e) => { setWajibBukaTutupShift(e.target.checked); markDirty(); }}
                    className="w-5 h-5 accent-[#01a684] rounded cursor-pointer shrink-0" 
                  />
                </label>
              </section>

              {/* SECTION 4: METODE PEMBAYARAN KASIR */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Metode Pembayaran Kasir</h2>
                    <p className="text-[9px] lg:text-[10px] text-[#86899B]">Opsi pembayaran yang muncul saat transaksi di layar kasir</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { id: 'tunai', label: 'Tunai (Cash)' },
                    { id: 'qris', label: 'QRIS Digital' },
                    { id: 'transfer', label: 'Transfer Bank' },
                    { id: 'debitKredit', label: 'Debit / Kredit' },
                    { id: 'tempo', label: 'Tempo / Kasbon' },
                  ].map((m) => {
                    const isActive = paymentMethods[m.id];
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setPaymentMethods({...paymentMethods, [m.id]: !isActive}); markDirty(); }}
                        className={`p-2.5 rounded-xl border font-bold text-left flex justify-between items-center cursor-pointer transition-all ${
                          isActive ? 'bg-emerald-50 border-[#01a684] text-[#01a684]' : 'bg-[#F1F2F6] border-[#E9EBED] text-slate-500'
                        }`}
                      >
                        <span className="truncate pr-1">{m.label}</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#01a684] text-white' : 'border border-slate-300'}`}>
                          {isActive && <Check size={10} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* SECTION 5: MODE OPERASIONAL BISNIS */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Mode Operasional Bisnis</h2>
                    <p className="text-[9px] lg:text-[10px] text-[#86899B]">Menyesuaikan fitur input tambahan pada layar POS Kasir</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'fnb', title: 'Mode F&B / Cafe', desc: 'Nomor meja & tipe order (Dine-in / Takeaway)' },
                    { id: 'jasa', title: 'Mode Jasa & Cuci', desc: 'Input plat nomor / catatan berat cucian' },
                    { id: 'retail', title: 'Mode Retail / Toko', desc: 'Scan barcode cepat tanpa opsi meja' },
                  ].map((mode) => (
                    <div 
                      key={mode.id}
                      onClick={() => { setBusinessMode(mode.id); markDirty(); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                        businessMode === mode.id ? 'bg-emerald-50/70 border-[#01a684]' : 'bg-[#F1F2F6] border-[#E9EBED]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#181b2b]">{mode.title}</span>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                          businessMode === mode.id ? 'border-[#01a684] bg-[#01a684]' : 'border-slate-400'
                        }`}>
                          {businessMode === mode.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                      <span className="text-[9px] text-[#86899B] leading-snug">{mode.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* KOLOM KANAN (5 KOLOM DI DESKTOP): KUSTOMISASI STRUK & LIVE PREVIEW 58MM */}
            <div className="lg:col-span-5 flex flex-col gap-3 lg:gap-5">
              
              {/* SECTION 6: KUSTOMISASI STRUK & TEMPLATE */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                    <LayoutTemplate size={16} />
                  </div>
                  <div>
                    <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Template & Kustomisasi Struk</h2>
                    <p className="text-[9px] lg:text-[10px] text-[#86899B]">Pengaturan desain cetak struk kasir</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1.5">Pilih Varian Tata Letak Struk</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: '1', name: '1. Standar Rata Tengah', desc: 'Logo ukuran sedang proporsional.' },
                        { id: '2', name: '2. Logo Jumbo di Header', desc: 'Menonjolkan logo toko besar di atas.' },
                        { id: '3', name: '3. Logo Watermark Transparan', desc: 'Logo di tengah latar struk.' },
                        { id: '4', name: '4. Format Detail Shift & Meja', desc: 'Rincian shift, meja & kasir.' },
                      ].map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => { setSelectedTemplate(tmpl.id); markDirty(); }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                            selectedTemplate === tmpl.id 
                              ? 'bg-emerald-50 border-[#01a684] text-[#01a684]' 
                              : 'bg-[#F1F2F6] border-[#E9EBED] text-[#181b2b] hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-bold text-[11px]">{tmpl.name}</span>
                          <span className="text-[9px] text-slate-500">{tmpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-[#E9EBED]">
                    <div className="w-14 h-14 rounded-xl bg-[#F1F2F6] border border-[#E9EBED] flex items-center justify-center overflow-hidden shrink-0">
                      {logoStrukPreview ? (
                        <img src={logoStrukPreview} alt="Logo Toko" className="w-full h-full object-contain filter grayscale contrast-200 brightness-0" />
                      ) : (
                        <ImageIcon size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-[11px] text-[#181b2b] truncate">Logo Struk (Hitam Putih)</label>
                        {logoStrukPreview && (
                          <button type="button" onClick={() => { setLogoStrukPreview(null); markDirty(); }} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer shrink-0">Hapus</button>
                        )}
                      </div>
                      <label className="bg-[#01a684] text-white px-3 py-1.5 rounded-xl text-center font-bold cursor-pointer hover:opacity-90 transition-all text-[10px] inline-flex items-center justify-center gap-1.5">
                        <Upload size={12} /> {logoStrukPreview ? 'Ganti Logo' : 'Unggah Logo'}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B]">Custom Teks Tambahan ({customTexts.length}/3)</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        value={inputCustomText} 
                        onChange={(e) => setInputCustomText(e.target.value)}
                        placeholder="Cth: WiFi: KopiBudi / IG: @kedaibudi" 
                        className="flex-1 bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]"
                      />
                      <button type="button" onClick={handleAddCustomText} className="bg-[#181b2b] text-white px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer shrink-0">
                        <Plus size={14} />
                      </button>
                    </div>

                    {customTexts.length > 0 && (
                      <div className="flex flex-col gap-1 mt-0.5">
                        {customTexts.map((txt, idx) => (
                          <div key={idx} className="bg-slate-50 border border-[#E9EBED] px-2.5 py-1.5 rounded-xl flex justify-between items-center text-[11px]">
                            <span className="font-medium text-[#181b2b] truncate pr-2">{idx + 1}. {txt}</span>
                            <button type="button" onClick={() => handleDeleteCustomText(idx)} className="text-red-400 hover:text-red-600 cursor-pointer p-0.5 shrink-0">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] lg:text-[10px] font-bold uppercase text-[#86899B] mb-1">Teks Penutup Struk (Footer)</label>
                    <input 
                      type="text" 
                      value={footerStruk} 
                      onChange={(e) => { setFooterStruk(e.target.value); markDirty(); }}
                      placeholder="Terima kasih atas kunjungan Anda!"
                      className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl px-3 py-2 text-[11px] font-medium text-[#181b2b] outline-none focus:ring-2 focus:ring-[#01a684]" 
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 7: LIVE PREVIEW UKURAN RIIL FISIK PRINTER THERMAL 58mm */}
              <section className="bg-white/80 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/90 p-4 lg:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-[#E9EBED]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                      <Receipt size={16} />
                    </div>
                    <div>
                      <h2 className="text-[11px] lg:text-xs font-bold uppercase text-[#181b2b] tracking-wider">Live Preview Struk</h2>
                      <p className="text-[9px] lg:text-[10px] text-[#86899B]">Ukuran Kertas Thermal 58mm</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-[#01a684] font-bold px-2 py-0.5 rounded-full">58mm Size</span>
                </div>

                <div className="bg-white text-black p-3.5 w-[220px] mx-auto shadow-lg font-mono text-[9px] leading-tight flex flex-col gap-1.5 border border-slate-200 relative overflow-hidden rounded-xs">
                  {selectedTemplate === '1' && (
                    <div className="flex flex-col items-center text-center gap-1">
                      {logoStrukPreview && (
                        <img src={logoStrukPreview} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-0.5 filter grayscale contrast-200 brightness-0" />
                      )}
                      <h3 className="font-bold uppercase text-[10px]">{toko.namaToko || 'Nama Toko'}</h3>
                      <p className="text-[8px] text-slate-700">{toko.alamat || 'Alamat Toko'}</p>
                      <p className="text-[8px] text-slate-700 mb-1">Telp: {toko.telepon || '-'}</p>

                      <div className="w-full space-y-0.5 text-left border-t border-dashed border-slate-400 pt-1 mb-1">
                        <div className="flex justify-between">
                          <span>2x Caffe Latte</span>
                          <span>44.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1x Croissant</span>
                          <span>22.000</span>
                        </div>
                      </div>

                      <div className="w-full space-y-0.5 border-t border-dashed border-slate-400 pt-1 mb-1 text-left">
                        <div className="flex justify-between font-bold text-[10px]">
                          <span>TOTAL</span>
                          <span>Rp 66.000</span>
                        </div>
                      </div>

                      {customTexts.map((ct, idx) => <p key={idx} className="text-[8px] text-slate-700">{ct}</p>)}
                      <p className="text-[8px] italic mt-1">{activeFooter}</p>
                    </div>
                  )}

                  {selectedTemplate === '2' && (
                    <div className="flex flex-col items-center text-center gap-1">
                      {logoStrukPreview && (
                        <img src={logoStrukPreview} alt="Logo Jumbo" className="w-20 h-20 object-contain mx-auto mb-1 filter grayscale contrast-200 brightness-0" />
                      )}
                      <h3 className="font-black uppercase text-[11px]">{toko.namaToko || 'Nama Toko'}</h3>
                      <p className="text-[8px] text-slate-700 mb-1">{toko.alamat || 'Alamat Toko'}</p>
                      <div className="w-full space-y-0.5 text-left border-t border-dashed border-slate-400 pt-1 mb-1">
                        <div className="flex justify-between"><span>2x Caffe Latte</span><span>44.000</span></div>
                        <div className="flex justify-between"><span>1x Croissant</span><span>22.000</span></div>
                      </div>
                      <div className="w-full border-t border-dashed border-slate-400 pt-1 mb-1 flex justify-between font-bold text-[10px]">
                        <span>TOTAL</span><span>Rp 66.000</span>
                      </div>
                      {customTexts.map((ct, idx) => <p key={idx} className="text-[8px] text-slate-700">{ct}</p>)}
                      <p className="text-[8px] italic mt-1">{activeFooter}</p>
                    </div>
                  )}

                  {selectedTemplate === '3' && (
                    <div className="relative flex flex-col items-center text-center gap-1 py-1">
                      {logoStrukPreview && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0">
                          <img src={logoStrukPreview} alt="Watermark" className="w-28 h-28 object-contain filter grayscale contrast-200 brightness-0" />
                        </div>
                      )}
                      <div className="relative z-10 w-full flex flex-col items-center gap-1">
                        <h3 className="font-bold uppercase text-[10px]">{toko.namaToko || 'Nama Toko'}</h3>
                        <p className="text-[8px] text-slate-700 mb-1">{toko.alamat || 'Alamat Toko'}</p>
                        <div className="w-full space-y-0.5 text-left border-t border-dashed border-slate-400 pt-1 mb-1">
                          <div className="flex justify-between"><span>2x Caffe Latte</span><span>44.000</span></div>
                          <div className="flex justify-between"><span>1x Croissant</span><span>22.000</span></div>
                        </div>
                        <div className="w-full border-t border-dashed border-slate-400 pt-1 mb-1 flex justify-between font-bold text-[10px]">
                          <span>TOTAL</span><span>Rp 66.000</span>
                        </div>
                        {customTexts.map((ct, idx) => <p key={idx} className="text-[8px] text-slate-700">{ct}</p>)}
                        <p className="text-[8px] italic mt-1">{activeFooter}</p>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === '4' && (
                    <div className="flex flex-col text-left gap-1">
                      <div className="text-center mb-0.5 flex flex-col items-center">
                        {logoStrukPreview && (
                          <img src={logoStrukPreview} alt="Logo" className="w-8 h-8 object-contain mb-0.5 filter grayscale contrast-200 brightness-0" />
                        )}
                        <h3 className="font-bold uppercase text-[10px]">{toko.namaToko || 'Nama Toko'}</h3>
                        <p className="text-[8px] text-slate-600">{toko.alamat || 'Alamat Toko'}</p>
                      </div>
                      <div className="bg-slate-100 p-1 rounded text-[8px] space-y-0.5 mb-1">
                        <div className="flex justify-between"><span>Shift: Pagi</span><span>Mode: {businessMode.toUpperCase()}</span></div>
                      </div>
                      <div className="space-y-0.5 mb-1">
                        <div className="flex justify-between"><span>2x Caffe Latte</span><span>44.000</span></div>
                      </div>
                      <div className="pt-1 border-t border-dashed border-slate-400 mb-1 flex justify-between font-bold text-[10px]">
                        <span>TOTAL BAYAR</span><span>Rp 44.000</span>
                      </div>
                      {customTexts.map((ct, idx) => <p key={idx} className="text-[8px] text-center text-slate-700">{ct}</p>)}
                      <p className="text-[8px] italic text-center mt-0.5">{activeFooter}</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="w-full mt-4 bg-[#01a684] text-white py-3 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={15} /> {isSaving ? 'Menyimpan ke Supabase...' : 'Simpan Seluruh Pengaturan'}
                </button>
              </section>

            </div>

          </div>
        )}

      </main>

      {/* FLOATING BAR PENGINGAT PERUBAHAN BELUM DISIMPAN */}
      {isDirty && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-[#181b2b] text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={16} />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold">Ada perubahan belum disimpan</p>
              <p className="text-[9px] text-slate-300 truncate">Klik simpan untuk menyinkronkan ke kasir.</p>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#01a684] hover:bg-teal-600 text-white px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-2"
          >
            <Save size={13} /> {isSaving ? '...' : 'Simpan'}
          </button>
        </div>
      )}

      {/* MODAL PILIH KATEGORI BISNIS (DENGAN STRUKTUR FLEX & FOOTER STATIS) */}
      {isKategoriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full shadow-2xl flex flex-col max-h-[80vh] border border-[#E9EBED] overflow-hidden text-xs">
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Pilih Kategori Bisnis</h3>
              <button onClick={() => setIsKategoriModalOpen(false)} className="text-[#86899B] cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex flex-col gap-1.5">
              {daftarKategoriToko.map((kat) => (
                <button 
                  key={kat}
                  type="button"
                  onClick={() => { 
                    if (kat === 'Lainnya') {
                      setIsLainnyaSelected(true);
                      setToko({...toko, kategori: 'Lainnya'});
                    } else {
                      setIsLainnyaSelected(false);
                      setKategoriCustom('');
                      setToko({...toko, kategori: kat});
                    }
                    markDirty();
                    setIsKategoriModalOpen(false); 
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-left cursor-pointer flex justify-between items-center ${toko.kategori === kat ? 'bg-[#01a684] text-white' : 'bg-[#F1F2F6] text-[#181b2b]'}`}
                >
                  <span>{kat}</span>
                  {toko.kategori === kat && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPGRADE PAKET (DENGAN FOOTER STATIS ANTI-MENIMPA) */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[85vh] border border-[#E9EBED] overflow-hidden text-xs">
            
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">
                {!paymentMethod ? 'Pilih Paket & Perpanjangan' : 'Selesaikan Pembayaran'}
              </h3>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-[#86899B] cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
              {!paymentMethod ? (
                <>
                  {!isHighestPlan && (
                    <div className="bg-gradient-to-r from-[#01a684] to-teal-700 rounded-2xl p-3.5 text-white shadow-xs flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase w-max">
                        <Sparkles size={11} /> Penawaran Upgrade
                      </div>
                      <h4 className="font-extrabold text-xs mt-0.5">Upgrade Paket Lebih Untung!</h4>
                      <p className="text-[10px] text-white/90">Nikmati fitur tanpa batas dengan upgrade ke level di atasnya.</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanToUpgrade === plan.id;
                      const isCurrent = paketAktif.id === plan.id;
                      const IconComponent = plan.icon;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanToUpgrade(plan.id)}
                          className={`rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all relative bg-white ${
                            isSelected ? 'border-2 border-[#01a684] bg-emerald-50/20' : 'border border-[#E9EBED]'
                          }`}
                        >
                          {isCurrent && <span className="absolute top-2.5 right-2.5 bg-slate-800 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">PAKET SAAT INI</span>}
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#01a684] text-white' : 'bg-gray-100 text-[#01a684]'}`}>
                              <IconComponent size={16} />
                            </div>
                            <div className="flex-1 pr-16">
                              <h4 className="text-xs font-bold text-[#181b2b]">{plan.name}</h4>
                              <p className="text-[10px] text-[#86899B]">{plan.desc}</p>
                              <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-[10px] text-[#86899B]">Rp</span>
                                <span className={`text-sm font-black ${isSelected ? 'text-[#01a684]' : 'text-[#181b2b]'}`}>{plan.price}</span>
                                <span className="text-[9px] text-[#86899B]">/bln</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-[#E9EBED] flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-[#86899B] block font-bold uppercase">Paket Dipilih:</span>
                      <span className="font-bold text-xs text-[#181b2b]">{plans.find(p => p.id === selectedPlanToUpgrade)?.name}</span>
                    </div>
                    <button type="button" onClick={() => setPaymentMethod(null)} className="text-[10px] text-[#01a684] font-bold underline cursor-pointer">Ubah Paket</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPaymentMethod('bca')} className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'bca' ? 'border-[#01a684] bg-emerald-50 text-[#01a684]' : 'border-[#E9EBED]'}`}>
                      <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-[10px]">BCA</span>
                      <span>Transfer BCA</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('qris')} className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'qris' ? 'border-[#01a684] bg-emerald-50 text-[#01a684]' : 'border-[#E9EBED]'}`}>
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#01a684] flex items-center justify-center font-bold"><QrCode size={14} /></span>
                      <span>QRIS Instant</span>
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 bg-[#F1F2F6] rounded-2xl">
                    {paymentMethod === 'bca' ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Virtual Account BCA</span>
                        <span className="text-sm font-black text-[#181b2b] tracking-wider">880312984920198</span>
                      </div>
                    ) : (
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENTGATEWAY" alt="QRIS" className="w-28 h-28 object-contain border border-slate-200 p-1 bg-white rounded-xl" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Statis Modal Upgrade */}
            <div className="p-4 border-t border-[#E9EBED] bg-white shrink-0">
              {!paymentMethod ? (
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('bca')}
                  className="w-full bg-[#01a684] text-white font-bold py-3 rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Lanjutkan ke Pembayaran ({plans.find(p => p.id === selectedPlanToUpgrade)?.name})</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPaymentMethod(null)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] rounded-xl font-bold cursor-pointer bg-white">Kembali</button>
                  <button type="button" disabled={isProcessingPayment} onClick={handleProcessPayment} className="flex-1 py-2.5 bg-[#01a684] text-white rounded-xl font-bold cursor-pointer shadow-xs disabled:opacity-50">
                    {isProcessingPayment ? 'Memverifikasi...' : 'Konfirmasi Bayar'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}