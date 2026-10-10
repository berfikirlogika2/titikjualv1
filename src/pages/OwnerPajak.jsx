import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, Receipt, Download, FileSpreadsheet, FileText, 
  AlertTriangle, CheckCircle2, HelpCircle, Building2, User, ShieldCheck, Lock 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerPajak() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState('');
  const [totalOmzetTahunan, setTotalOmzetTahunan] = useState(150000000); // Default simulasi omzet

  const [tipePemilik, setTipePemilik] = useState('pribadi');
  const [sudahPunyaNpwpd, setSudahPunyaNpwpd] = useState(false);
  const [nomorNpwpd, setNomorNpwpd] = useState('');
  const [potongPajakDiStruk, setPotongPajakDiStruk] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Ambil data sesi dan omzet dari Supabase
  useEffect(() => {
    const fetchTaxData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Jika sesi belum ada, gunakan data fallback/simulasi agar tidak terlempar ke login
        if (!session) {
          console.warn('Sesi Supabase belum aktif. Menggunakan data simulasi pajak.');
          setOwnerId('owner-sample-id');
          setLoading(false);
          return;
        }

        const user = session.user;
        const currentOwnerId = user.id;
        setOwnerId(currentOwnerId);

        // Ambil total omzet tahun berjalan
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('total_amount, type')
          .eq('owner_id', currentOwnerId)
          .eq('type', 'Masuk')
          .gte('created_at', startOfYear);

        if (!txError && txData && txData.length > 0) {
          const sumOmzet = txData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
          setTotalOmzetTahunan(sumOmzet);
        }

        // Ambil pengaturan pajak tersimpan
        const { data: taxSettings } = await supabase
          .from('store_tax_settings')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .maybeSingle();

        if (taxSettings) {
          setTipePemilik(taxSettings.business_type || 'pribadi');
          setSudahPunyaNpwpd(taxSettings.has_npwpd || false);
          setNomorNpwpd(taxSettings.npwpd_number || '');
          setPotongPajakDiStruk(taxSettings.auto_tax_active || false);
        }
      } catch (err) {
        console.error('Gagal memuat data pajak:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxData();
  }, [navigate]);

  const thresholdOmzetPajak = 360000000; // Rp 360 Juta
  const memenuhiSyaratPajak = totalOmzetTahunan >= thresholdOmzetPajak;

  const handleTogglePajakStruk = (checked) => {
    if (checked && !memenuhiSyaratPajak) {
      alert(`Omzet tahunan Anda (Rp ${totalOmzetTahunan.toLocaleString('id-ID')}) belum mencapai batas minimum wajib pungut pajak daerah (Rp ${thresholdOmzetPajak.toLocaleString('id-ID')}).`);
      return;
    }
    if (checked && !sudahPunyaNpwpd) {
      setShowWarningModal(true);
    } else {
      setPotongPajakDiStruk(checked);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (ownerId === 'owner-sample-id') {
        alert('Simulasi pengaturan pajak berhasil disimpan!');
        return;
      }

      const { error } = await supabase
        .from('store_tax_settings')
        .upsert({
          owner_id: ownerId,
          business_type: tipePemilik,
          has_npwpd: sudahPunyaNpwpd,
          npwpd_number: nomorNpwpd,
          auto_tax_active: potongPajakDiStruk,
          updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });

      if (error) throw error;
      alert('Pengaturan pajak berhasil disimpan dan disinkronkan!');
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err.message);
      alert('Terjadi kesalahan saat menyimpan pengaturan pajak.');
    }
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER PRESISI */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pajak & Kepatuhan Usaha
          </h1>

          <div className="w-9 h-9 shrink-0" />
        </div>
      </header>

      {/* KONTEN UTAMA RESPONSIF */}
      <main className="p-5 max-w-md lg:max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-5">

        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* HERO CARD STATUS OMZET */}
          <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 w-full">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#01a684]" /> VALIDASI OMZET REAL-TIME ({new Date().getFullYear()})
              </span>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-300">Akumulasi Omzet Toko Anda:</p>
                  <h2 className="text-2xl lg:text-3xl font-black tracking-tight tabular-nums mt-0.5">
                    {loading ? 'Memuat...' : `Rp ${totalOmzetTahunan.toLocaleString('id-ID')}`}
                  </h2>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  memenuhiSyaratPajak ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}>
                  {memenuhiSyaratPajak ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{memenuhiSyaratPajak ? 'Memenuhi Syarat Wajib Pajak Daerah' : 'Belum Wajib Pajak (Dibawah Threshold)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: PPH UMKM */}
          <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">1. Pajak Penghasilan Toko (PPh Final)</h3>
                <p className="text-[10px] text-[#86899B]">Beban pajak resmi PPh 0,5% UMKM</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <label className="font-bold text-[#181b2b]">Bentuk Badan Usaha:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipePemilik('pribadi')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer bg-white ${
                    tipePemilik === 'pribadi' ? 'border-[#01a684] bg-emerald-50/50 text-[#181b2b] shadow-sm' : 'border-[#E9EBED] text-[#86899B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <User size={14} className={tipePemilik === 'pribadi' ? 'text-[#01a684]' : ''} />
                    Perorangan
                  </div>
                  <p className="text-[10px] leading-tight text-[#86899B]">Fasilitas bebas s.d. Rp500 Juta</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipePemilik('badan')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer bg-white ${
                    tipePemilik === 'badan' ? 'border-[#01a684] bg-emerald-50/50 text-[#181b2b] shadow-sm' : 'border-[#E9EBED] text-[#86899B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Building2 size={14} className={tipePemilik === 'badan' ? 'text-[#01a684]' : ''} />
                    PT / CV
                  </div>
                  <p className="text-[10px] leading-tight text-[#86899B]">Tarif tetap 0,5% dari omzet</p>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#F1F2F6]/80 border border-[#E9EBED]/60 rounded-2xl flex flex-col gap-1.5 text-xs">
              {tipePemilik === 'pribadi' ? (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-[#01a684]">
                    <CheckCircle2 size={15} /> Status PPh Perorangan
                  </div>
                  <p className="text-[11px] text-[#86899B] leading-relaxed">
                    {totalOmzetTahunan <= 500000000 ? (
                      <span>Omzet Anda saat ini <b>belum melewati Rp500 Juta</b>. Anda dibebaskan dari pemotongan PPh Final UMKM (Rp 0).</span>
                    ) : (
                      <span>Omzet Anda telah melewati Rp500 Juta. Kelebihan omzet dikenakan PPh Final 0,5%.</span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-amber-600">
                    <HelpCircle size={15} /> Status PPh Badan PT/CV
                  </div>
                  <p className="text-[11px] text-[#86899B] leading-relaxed">
                    Wajib menyetorkan <b>0.5% dari total omzet bulanan</b> tanpa batasan threshold perorangan.
                  </p>
                </>
              )}
            </div>
          </section>

        </div>

        {/* KOLOM KANAN */}
        <div className="flex flex-col gap-5">

          {/* SECTION 2: PAJAK STRUK PEMBELI */}
          <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 lg:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">2. Pajak Restoran / Pembeli (10%)</h3>
                <p className="text-[10px] text-[#86899B]">Otomatis di kasir berdasarkan omzet</p>
              </div>
            </div>

            {!memenuhiSyaratPajak && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-800">
                <Lock size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Fitur pungut pajak 10% dikunci otomatis karena omzet tahunan belum mencapai ambang batas wajib pajak daerah (Rp 360 Juta).
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 text-xs">
              <label className="font-bold text-[#181b2b]">Status Pendaftaran NPWPD:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!memenuhiSyaratPajak}
                  onClick={() => setSudahPunyaNpwpd(true)}
                  className={`py-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                    sudahPunyaNpwpd ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'
                  } ${!memenuhiSyaratPajak ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Sudah Ada NPWPD
                </button>
                <button
                  type="button"
                  onClick={() => { setSudahPunyaNpwpd(false); setPotongPajakDiStruk(false); }}
                  className={`py-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                    !sudahPunyaNpwpd ? 'bg-[#181b2b] text-white border-[#181b2b]' : 'bg-white text-[#86899B] border-[#E9EBED]'
                  }`}
                >
                  Belum Terdaftar
                </button>
              </div>
            </div>

            {sudahPunyaNpwpd && (
              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-[#181b2b]">Nomor NPWPD Toko:</label>
                <input
                  type="text"
                  value={nomorNpwpd}
                  onChange={(e) => setNomorNpwpd(e.target.value)}
                  placeholder="Contoh: 12.345.678.9-012.000"
                  className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
                />
              </div>
            )}

            <div className="p-3.5 bg-[#F1F2F6]/80 rounded-2xl flex items-center justify-between border border-[#E9EBED]/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#181b2b]">Aktifkan Pajak 10% di Kasir</span>
                <span className="text-[10px] text-[#86899B]">Sesuai validasi omzet & izin</span>
              </div>
              <input
                type="checkbox"
                disabled={!memenuhiSyaratPajak}
                checked={potongPajakDiStruk}
                onChange={(e) => handleTogglePajakStruk(e.target.checked)}
                className="w-4 h-4 accent-[#01a684] cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </section>

          {/* SECTION 3: DOWNLOAD LAPORAN */}
          <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 lg:p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
                <Download size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Unduh Laporan Siap Lapor</h3>
                <p className="text-[10px] text-[#86899B]">Rekap bulanan untuk pajak</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button 
                onClick={() => alert('Mengunduh Laporan Excel Pajak...')}
                className="p-3 border border-[#E9EBED] rounded-2xl flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-left transition-all bg-white"
              >
                <FileSpreadsheet size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#181b2b]">Excel</p>
                  <p className="text-[9px] text-[#86899B]">.XLSX</p>
                </div>
              </button>

              <button 
                onClick={() => alert('Mengunduh Laporan PDF Pajak...')}
                className="p-3 border border-[#E9EBED] rounded-2xl flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-left transition-all bg-white"
              >
                <FileText size={18} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#181b2b]">PDF</p>
                  <p className="text-[9px] text-[#86899B]">Ringkasan</p>
                </div>
              </button>
            </div>
          </section>

          <button 
            onClick={handleSaveSettings}
            className="w-full bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer text-xs border-0"
          >
            Simpan Pengaturan Kepatuhan Pajak
          </button>

        </div>

      </main>

      {/* MODAL PERINGATAN */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 border border-red-100">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Peringatan Izin</h3>
            </div>
            <p className="text-xs text-[#86899B] leading-relaxed">
              Memungut pajak tanpa mendaftarkan izin NPWPD resmi ke dinas terkait menyalahi aturan perpajakan daerah.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setSudahPunyaNpwpd(true); setPotongPajakDiStruk(true); setShowWarningModal(false); }}
                className="px-3 py-2 border border-[#E9EBED] text-[#181b2b] text-[11px] font-bold rounded-xl cursor-pointer bg-transparent"
              >
                Sudah Punya
              </button>
              <button
                onClick={() => { setPotongPajakDiStruk(false); setShowWarningModal(false); }}
                className="px-3 py-2 bg-red-500 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-sm border-0"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}