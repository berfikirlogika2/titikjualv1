import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Settings2, 
  BarChart3, ChevronRight 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
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

export default function OwnerStaf() {
  const navigate = useNavigate();

  const [stafList, setStafList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data staf dari Supabase berdasarkan owner_id yang aktif
  useEffect(() => {
    const fetchStaf = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Data simulasi fallback jika sesi belum aktif
          setStafList([
            { id: 1, nama: 'Sarah Jenkins', role: 'Kasir Utama', gajiPokok: 3000000, periodeKomisi: 'bulanan', omzetBulanIni: 13500000, targetBulanan: 15000000, komisiTerkumpul: 270000 },
            { id: 2, nama: 'Budi Santoso', role: 'Kasir Shift Sore', gajiPokok: 2500000, periodeKomisi: 'harian', omzetBulanIni: 6200000, targetBulanan: 12000000, komisiTerkumpul: 75000 }
          ]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('owner_id', session.user.id);

        if (error) throw error;
        if (data && data.length > 0) {
          setStafList(data);
        }
      } catch (err) {
        console.error('Gagal memuat data staf:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaf();
  }, []);

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER BERSIH TANPA TOMBOL TAMBAH DI KANAN */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pengaturan Staf & Insentif
          </h1>

          <div className="w-9 h-9 shrink-0" />
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="p-5 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-5">

        {/* HERO CARD */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-3xl p-6 lg:p-8 shadow-lg relative overflow-hidden min-h-[130px] flex items-center">
          <div className="relative z-10 w-full">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 size={12} className="text-[#01a684]" /> EVALUASI PENJUALAN TIM
            </span>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight mt-1">Skema Gaji & Komisi Insentif</h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-lg">
              Atur target omzet harian & bulanan serta kelola akun akses login untuk tim kasir dan admin Anda.
            </p>
          </div>
        </div>

        {/* TOMBOL TAMBAH STAFF DI HALAMAN UTAMA */}
        <button 
          onClick={() => navigate('/owner/register-staff')}
          className="w-full bg-[#01a684] text-white font-bold py-4 rounded-2xl shadow-md hover:opacity-90 transition-all cursor-pointer border-0 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          <UserPlus size={18} /> Tambah Staff
        </button>

        {/* DAFTAR TIM STAF */}
        {loading ? (
          <p className="text-xs text-center text-[#86899B] py-8">Memuat data staf...</p>
        ) : stafList.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-8 text-center flex flex-col items-center gap-2">
            <p className="text-xs text-[#86899B]">Belum ada data karyawan yang terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stafList.map((staf) => {
              const targetBln = staf.target_bulanan || staf.targetBulanan || 1;
              const omzetBln = staf.omzet_bulan_ini || staf.omzetBulanIni || 0;
              const progressBulanan = Math.min(100, Math.round((omzetBln / targetBln) * 100));

              return (
                <div key={staf.id} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#01a684] text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                        {staf.nama.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-[#181b2b]">{staf.nama}</h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#01a684] border border-emerald-200 uppercase">
                            {staf.jabatan || staf.role || 'Staff'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#86899B] mt-0.5">
                          Gaji: Rp {formatRupiah(staf.gaji_pokok || staf.gajiPokok || 0)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="p-2 rounded-xl bg-[#F1F2F6] text-[#86899B] hover:text-[#01a684] transition-all cursor-pointer border-0"
                      title="Pengaturan & Edit"
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-[#F1F2F6]/80 p-3.5 rounded-2xl">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="text-[#86899B]">Capaian Omzet Bulan Ini</span>
                      <span className="text-[#181b2b] tabular-nums font-bold">
                        Rp {formatRupiah(omzetBln)} ({progressBulanan}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-[#01a684] rounded-full" style={{ width: `${progressBulanan}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E9EBED]/60 text-xs">
                    <div>
                      <span className="text-[10px] text-[#86899B] block">Estimasi Komisi:</span>
                      <strong className="text-[#01a684] text-xs font-black">Rp {formatRupiah(staf.komisi_terkumpul || staf.komisiTerkumpul || 0)}</strong>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="px-3 py-1.5 bg-emerald-50 text-[#01a684] text-[10px] font-bold rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer border-0 shadow-sm"
                    >
                      Detail Rincian <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <OwnerBottomNav />

    </div>
  );
}