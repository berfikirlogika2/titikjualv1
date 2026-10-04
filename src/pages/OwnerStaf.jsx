import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Settings2, KeyRound, X, Check, 
  BarChart3, ChevronRight, Calculator, CalendarDays, Calendar, 
  AlertCircle, CheckCircle2, User, ShieldCheck 
} from 'lucide-react';
import OwnerBottomNav from './OwnerBottomNav';

const formatRupiah = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numberString = val.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
};

const parseRupiah = (str) => {
  if (!str) return 0;
  return parseInt(str.toString().replace(/\./g, ''), 10) || 0;
};

export default function OwnerStaf() {
  const navigate = useNavigate();

  const [stafList, setStafList] = useState([
    {
      id: 1,
      nama: 'Sarah Jenkins',
      role: 'Kasir Utama',
      gajiPokok: 3000000,
      periodeKomisi: 'bulanan', 
      tipeKomisi: 'persen',
      nilaiKomisi: 2,
      targetHarian: 500000,
      targetBulanan: 15000000,
      omzetBulanIni: 13500000,
      komisiTerkumpul: 270000,
    },
    {
      id: 2,
      nama: 'Budi Santoso',
      role: 'Kasir Shift Sore',
      gajiPokok: 2500000,
      periodeKomisi: 'harian', 
      tipeKomisi: 'nominal', 
      nilaiKomisi: 5000,
      targetHarian: 400000,
      targetBulanan: 12000000,
      omzetBulanIni: 6200000,
      komisiTerkumpul: 75000,
      riwayatHarian: [
        { hari: 'Senin', tanggal: '01 Sep', omzet: 450000, tercapai: true, komisiDapat: 5000 },
        { hari: 'Selasa', tanggal: '02 Sep', omzet: 350000, tercapai: false, komisiDapat: 0 }, 
        { hari: 'Rabu', tanggal: '03 Sep', omzet: 500000, tercapai: true, komisiDapat: 5000 }, 
      ],
    },
  ]);

  const [selectedStaf, setSelectedStaf] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State Setting Insentif
  const [formGajiPokok, setFormGajiPokok] = useState('');
  const [formPeriodeKomisi, setFormPeriodeKomisi] = useState('bulanan');
  const [formTipeKomisi, setFormTipeKomisi] = useState('persen');
  const [formNilaiKomisi, setFormNilaiKomisi] = useState('');
  const [formTargetHarian, setFormTargetHarian] = useState('');
  const [formTargetBulanan, setFormTargetBulanan] = useState('');

  const handleOpenSetting = (staf) => {
    setSelectedStaf({ ...staf });
    setFormGajiPokok(formatRupiah(staf.gajiPokok));
    setFormPeriodeKomisi(staf.periodeKomisi || 'bulanan');
    setFormTipeKomisi(staf.tipeKomisi || 'persen');
    setFormNilaiKomisi(staf.tipeKomisi === 'persen' ? staf.nilaiKomisi.toString() : formatRupiah(staf.nilaiKomisi));
    setFormTargetHarian(formatRupiah(staf.targetHarian));
    setFormTargetBulanan(formatRupiah(staf.targetBulanan));
    setIsModalOpen(true);
  };

  const handleOpenDetail = (staf) => {
    setSelectedStaf(staf);
    setIsDetailModalOpen(true);
  };

  const handleSaveSetting = () => {
    const updatedStaf = {
      ...selectedStaf,
      gajiPokok: parseRupiah(formGajiPokok),
      periodeKomisi: formPeriodeKomisi,
      tipeKomisi: formTipeKomisi,
      nilaiKomisi: formTipeKomisi === 'persen' ? parseFloat(formNilaiKomisi) || 0 : parseRupiah(formNilaiKomisi),
      targetHarian: parseRupiah(formTargetHarian),
      targetBulanan: parseRupiah(formTargetBulanan),
    };

    setStafList(stafList.map(s => s.id === updatedStaf.id ? updatedStaf : s));
    setIsModalOpen(false);
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
            Pengaturan Staf & Insentif
          </h1>

          <button 
            onClick={() => alert('Fitur Tambah Staf Baru')} 
            className="w-9 h-9 flex items-center justify-center text-[#01a684] hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto flex flex-col gap-4">

        {/* HERO CARD DENGAN ORNAMEN WATERMARK LOGO KASIR PRO */}
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
                <BarChart3 size={12} className="text-[#01a684]" /> EVALUASI PENJUALAN TIM
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1">Skema Gaji & Komisi Insentif</h2>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                Atur target omzet harian & bulanan untuk memotivasi kinerja tim kasir Anda.
              </p>
            </div>
          </div>
        </div>

        {/* DAFTAR TIM STAF */}
        <div className="flex flex-col gap-3">
          {stafList.map((staf) => {
            const progressBulanan = Math.min(100, Math.round((staf.omzetBulanIni / staf.targetBulanan) * 100));

            return (
              <div key={staf.id} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#01a684] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {staf.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#181b2b]">{staf.nama}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#01a684] border border-emerald-200">
                          {staf.periodeKomisi === 'harian' ? 'Target Harian' : 'Target Bulanan'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#86899B] mt-0.5">
                        {staf.role} • Gaji Pokok: Rp {formatRupiah(staf.gajiPokok)}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenSetting(staf)}
                    className="p-2 rounded-xl bg-[#F1F2F6] text-[#86899B] hover:text-[#01a684] transition-all cursor-pointer"
                  >
                    <Settings2 size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-1 bg-[#F1F2F6]/80 p-3 rounded-2xl">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-[#86899B]">Capaian Omzet Bulan Ini</span>
                    <span className="text-[#181b2b] tabular-nums font-bold">
                      Rp {formatRupiah(staf.omzetBulanIni)} ({progressBulanan}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#01a684] rounded-full" style={{ width: `${progressBulanan}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#E9EBED]/60 text-xs">
                  <div>
                    <span className="text-[10px] text-[#86899B] block">Estimasi Komisi:</span>
                    <strong className="text-[#01a684] text-xs font-black">Rp {formatRupiah(staf.komisiTerkumpul)}</strong>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenDetail(staf)}
                      className="px-2.5 py-1.5 bg-emerald-50 text-[#01a684] text-[10px] font-bold rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer"
                    >
                      Detail Rincian <ChevronRight size={12} />
                    </button>
                    <button 
                      onClick={() => alert(`Reset PIN Akun ${staf.nama}`)}
                      className="p-1.5 text-slate-400 hover:text-[#181b2b] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <KeyRound size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* MODAL EDIT SKEMA GAJI & INSENTIF */}
      {isModalOpen && selectedStaf && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Setting Gaji & Insentif</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#86899B] hover:text-[#181b2b]">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="font-bold text-[#181b2b]">Gaji Pokok Bulanan (Rp)</label>
                <input
                  type="text"
                  value={formGajiPokok}
                  onChange={(e) => setFormGajiPokok(formatRupiah(e.target.value))}
                  className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none mt-1 focus:ring-2 focus:ring-[#01a684]"
                />
              </div>

              <div>
                <label className="font-bold text-[#181b2b]">Sistem Evaluasi Target</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormPeriodeKomisi('harian')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formPeriodeKomisi === 'harian' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Target Harian
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPeriodeKomisi('bulanan')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formPeriodeKomisi === 'bulanan' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Target Bulanan
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#181b2b]">
                  {formPeriodeKomisi === 'harian' ? 'Target Omzet Harian (Rp)' : 'Target Omzet Bulanan (Rp)'}
                </label>
                <input
                  type="text"
                  value={formPeriodeKomisi === 'harian' ? formTargetHarian : formTargetBulanan}
                  onChange={(e) => formPeriodeKomisi === 'harian' ? setFormTargetHarian(formatRupiah(e.target.value)) : setFormTargetBulanan(formatRupiah(e.target.value))}
                  className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none mt-1 focus:ring-2 focus:ring-[#01a684]"
                />
              </div>

              <div>
                <label className="font-bold text-[#181b2b]">Bentuk Komisi Bonus</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormTipeKomisi('persen')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipeKomisi === 'persen' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Persen (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipeKomisi('nominal')}
                    className={`py-2 rounded-xl font-bold text-xs border cursor-pointer ${formTipeKomisi === 'nominal' ? 'bg-[#01a684] text-white border-[#01a684]' : 'bg-white text-[#86899B] border-[#E9EBED]'}`}
                  >
                    Nominal (Rp)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#181b2b]">Besar Nilai Bonus</label>
                <input
                  type="text"
                  value={formNilaiKomisi}
                  onChange={(e) => setFormNilaiKomisi(formTipeKomisi === 'nominal' ? formatRupiah(e.target.value) : e.target.value)}
                  placeholder={formTipeKomisi === 'persen' ? 'Cth: 2' : 'Cth: 5.000'}
                  className="w-full bg-[#F1F2F6] rounded-xl p-2.5 font-bold outline-none mt-1 focus:ring-2 focus:ring-[#01a684]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E9EBED] text-[#181b2b] text-xs font-bold rounded-xl cursor-pointer">
                Batal
              </button>
              <button onClick={handleSaveSetting} className="flex-1 py-2.5 bg-[#01a684] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL RINCIAN KINERJA STAF */}
      {isDetailModalOpen && selectedStaf && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-xs border border-[#E9EBED]">
            <div className="flex justify-between items-center border-b border-[#E9EBED] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#181b2b]">Rincian Kinerja {selectedStaf.nama}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-[#86899B]"><X size={18} /></button>
            </div>

            <div className="bg-[#F1F2F6] p-3 rounded-2xl flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#86899B]">Gaji Pokok:</span>
                <span className="font-bold text-[#181b2b]">Rp {formatRupiah(selectedStaf.gajiPokok)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86899B]">Total Bonus Komisi:</span>
                <span className="font-black text-[#01a684]">Rp {formatRupiah(selectedStaf.komisiTerkumpul)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E9EBED]">
                <span className="font-bold text-[#181b2b]">Total Take-Home Pay:</span>
                <span className="font-black text-[#01a684] text-xs">Rp {formatRupiah(selectedStaf.gajiPokok + selectedStaf.komisiTerkumpul)}</span>
              </div>
            </div>

            {selectedStaf.riwayatHarian && selectedStaf.riwayatHarian.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-[#86899B] uppercase tracking-wider">Histori Capaian Harian:</span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {selectedStaf.riwayatHarian.map((rh, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-[#E9EBED] text-[10px]">
                      <span>{rh.hari}, {rh.tanggal}</span>
                      <span className={`font-bold ${rh.tercapai ? 'text-[#01a684]' : 'text-slate-400'}`}>
                        {rh.tercapai ? `+ Rp ${formatRupiah(rh.komisiDapat)}` : 'Gagal Target'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setIsDetailModalOpen(false)} className="w-full py-2.5 bg-[#181b2b] text-white rounded-xl font-bold mt-2 cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      )}

      <OwnerBottomNav />

    </div>
  );
}