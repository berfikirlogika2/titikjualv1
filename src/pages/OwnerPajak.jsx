import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, Receipt, Download, FileSpreadsheet, FileText, 
  AlertTriangle, CheckCircle2, HelpCircle, Building2, User, ShieldCheck 
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerPajak() {
  const navigate = useNavigate();

  const [tipePemilik, setTipePemilik] = useState('pribadi');
  const [sudahPunyaNpwpd, setSudahPunyaNpwpd] = useState(false);
  const [nomorNpwpd, setNomorNpwpd] = useState('');
  const [potongPajakDiStruk, setPotongPajakDiStruk] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleTogglePajakStruk = (checked) => {
    if (checked && !sudahPunyaNpwpd) {
      setShowWarningModal(true);
    } else {
      setPotongPajakDiStruk(checked);
    }
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 font-sans antialiased relative">
      
      {/* HEADER PRESISI */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 pt-[env(safe-area-inset-top)]">
        <div className="h-14 flex items-center justify-between relative">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pajak Toko
          </h1>

          <div className="w-9 h-9 shrink-0" />
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO CARD PAJAK DENGAN ORNAMEN WATERMARK LOGO KASIR PRO */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden min-h-[110px] flex items-center">
          
          {/* ORNAMEN BACKGROUND LOGO KASIR PRO (WATERMARK UTAMA) */}
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-20 text-emerald-300 transform rotate-[-12deg]">
            <svg 
              viewBox="0 0 100 65" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-52 h-52"
            >
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
                <ShieldCheck size={12} className="text-[#01a684]" /> DUKUNGAN REGULASI UMKM
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">Sistem Otomatisasi Pajak</h2>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed max-w-[250px]">
                Kelola pajak PPh 0,5% UMKM & Pajak Restoran (10%) dengan perhitungan otomatis di aplikasi.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: PAJAK TOKO */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">1. Pajak Penghasilan Toko</h3>
              <p className="text-[10px] text-[#86899B]">Beban pajak resmi PPh 0,5% Final UMKM</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <label className="font-bold text-[#181b2b]">Bentuk Usaha Anda:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipePemilik('pribadi')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  tipePemilik === 'pribadi'
                    ? 'border-[#01a684] bg-emerald-50/50 text-[#181b2b]'
                    : 'border-[#E9EBED] text-[#86899B] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <User size={14} className={tipePemilik === 'pribadi' ? 'text-[#01a684]' : ''} />
                  Perorangan
                </div>
                <p className="text-[10px] leading-tight text-[#86899B]">Usaha Mikro / Sendiri</p>
              </button>

              <button
                type="button"
                onClick={() => setTipePemilik('badan')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  tipePemilik === 'badan'
                    ? 'border-[#01a684] bg-emerald-50/50 text-[#181b2b]'
                    : 'border-[#E9EBED] text-[#86899B] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Building2 size={14} className={tipePemilik === 'badan' ? 'text-[#01a684]' : ''} />
                  PT / CV
                </div>
                <p className="text-[10px] leading-tight text-[#86899B]">Badan Hukum Resmi</p>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#F1F2F6]/80 border border-[#E9EBED]/60 rounded-2xl flex flex-col gap-1.5 text-xs">
            {tipePemilik === 'pribadi' ? (
              <>
                <div className="flex items-center gap-1.5 font-bold text-[#01a684]">
                  <CheckCircle2 size={15} />
                  Fasilitas Bebas Pajak S.D. Rp500 Juta
                </div>
                <p className="text-[11px] text-[#86899B] leading-relaxed">
                  Jika omzet perorangan dalam setahun belum mencapai <b>Rp500 Juta</b>, pajak Anda <b>BEBAS (Rp 0)</b>.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 font-bold text-amber-600">
                  <HelpCircle size={15} />
                  Pajak Badan PT/CV
                </div>
                <p className="text-[11px] text-[#86899B] leading-relaxed">
                  Wajib membayar <b>0.5% dari seluruh omzet kotor</b> tanpa batas bebas pajak Rp500 Juta.
                </p>
              </>
            )}
          </div>
        </section>

        {/* SECTION 2: PAJAK STRUK PEMBELI */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">2. Pajak Tambahan Pembeli</h3>
              <p className="text-[10px] text-[#86899B]">Pajak Restoran / Daerah (10%) di Struk Kasir</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <label className="font-bold text-[#181b2b]">Status Pendaftaran Izin NPWPD / PB1 Daerah:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setSudahPunyaNpwpd(true); }}
                className={`py-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                  sudahPunyaNpwpd
                    ? 'bg-[#01a684] text-white border-[#01a684]'
                    : 'bg-white text-[#86899B] border-[#E9EBED]'
                }`}
              >
                Sudah Ada NPWPD
              </button>
              <button
                type="button"
                onClick={() => { 
                  setSudahPunyaNpwpd(false); 
                  setPotongPajakDiStruk(false); 
                }}
                className={`py-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                  !sudahPunyaNpwpd
                    ? 'bg-[#181b2b] text-white border-[#181b2b]'
                    : 'bg-white text-[#86899B] border-[#E9EBED]'
                }`}
              >
                Belum Terdaftar
              </button>
            </div>
          </div>

          {sudahPunyaNpwpd && (
            <div className="flex flex-col gap-1 text-xs">
              <label className="font-bold text-[#181b2b]">Nomor Izin NPWPD Toko:</label>
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
              <span className="text-[10px] text-[#86899B]">Otomatis ditambahkan pada tiap transaksi</span>
            </div>
            <input
              type="checkbox"
              checked={potongPajakDiStruk}
              onChange={(e) => handleTogglePajakStruk(e.target.checked)}
              className="w-4 h-4 accent-[#01a684] cursor-pointer"
            />
          </div>
        </section>

        {/* SECTION 3: DOWNLOAD */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Unduh Laporan Siap Lapor</h3>
              <p className="text-[10px] text-[#86899B]">Rekap bulanan untuk kebutuhan pelaporan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button 
              onClick={() => alert('Mengunduh Laporan Excel Pajak Toko...')}
              className="p-3 border border-[#E9EBED] rounded-2xl flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-left transition-all bg-white"
            >
              <FileSpreadsheet size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#181b2b]">Format Excel</p>
                <p className="text-[9px] text-[#86899B]">File .XLSX</p>
              </div>
            </button>

            <button 
              onClick={() => alert('Mengunduh Laporan PDF Pajak Pembeli...')}
              className="p-3 border border-[#E9EBED] rounded-2xl flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-left transition-all bg-white"
            >
              <FileText size={18} className="text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#181b2b]">Format PDF</p>
                <p className="text-[9px] text-[#86899B]">Ringkasan PDF</p>
              </div>
            </button>
          </div>
        </section>

        <button 
          onClick={() => alert('Pengaturan pajak berhasil disimpan!')}
          className="w-full bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer text-xs"
        >
          Simpan Pengaturan Pajak
        </button>

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
              Memungut pajak 10% tanpa mendaftarkan izin ke Dinas Pendapatan Daerah dapat dikategorikan sebagai pelanggaran.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setSudahPunyaNpwpd(true);
                  setPotongPajakDiStruk(true);
                  setShowWarningModal(false);
                }}
                className="px-3 py-2 border border-[#E9EBED] text-[#181b2b] text-[11px] font-bold rounded-xl cursor-pointer"
              >
                Sudah Punya Izin
              </button>
              <button
                onClick={() => {
                  setPotongPajakDiStruk(false);
                  setShowWarningModal(false);
                }}
                className="px-3 py-2 bg-red-500 text-white text-[11px] font-bold rounded-xl cursor-pointer shadow-sm"
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