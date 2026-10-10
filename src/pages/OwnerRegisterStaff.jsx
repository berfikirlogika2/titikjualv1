import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerRegisterStaff() {
  const navigate = useNavigate();

  const [ownerId, setOwnerId] = useState('');
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [jabatan, setJabatan] = useState('staff'); // 'staff', 'kasir', 'admin'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil sesi owner asli dari Supabase
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('Sesi tidak ditemukan atau error:', error);
        alert('Sesi Anda telah kedaluwarsa atau belum login. Silakan login kembali.');
        navigate('/login-form');
        return;
      }
      setOwnerId(session.user.id);
    };
    fetchSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !telepon) {
      alert('Mohon lengkapi nama dan nomor telepon!');
      return;
    }

    if (!ownerId) {
      alert('Owner ID belum terdeteksi. Pastikan Anda sudah login dengan benar.');
      return;
    }

    // Jika jabatan Kasir atau Admin, arahkan ke halaman pembuatan akun khusus
    if (jabatan === 'kasir' || jabatan === 'admin') {
      navigate('/owner/register-akun', { state: { nama, telepon, jabatan, ownerId } });
      return;
    }

    // Jika Staff biasa, langsung simpan ke Supabase
    setIsSubmitting(true);
    try {
      const payload = {
        owner_id: ownerId,
        nama: nama,
        telepon: telepon,
        jabatan: jabatan,
        gaji_pokok: 0,
        target_bulanan: 0
      };

      console.log('Mengirim data staff:', payload);

      const { data, error } = await supabase
        .from('staff_members')
        .insert([payload])
        .select();

      if (error) {
        console.error('Error dari Supabase:', error);
        throw error;
      }

      console.log('Berhasil disimpan:', data);
      alert('Data staff berhasil ditambahkan ke database!');
      navigate('/owner/staf');
    } catch (err) {
      console.error('Gagal menyimpan staff:', err.message);
      alert('Gagal menyimpan ke database: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate">
            Tambah Karyawan Baru
          </h1>
          <div className="w-9 h-9" />
        </div>
      </header>

      <main className="p-5 max-w-md lg:max-w-4xl mx-auto flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Informasi Awal Karyawan</h3>
              <p className="text-[10px] text-[#86899B]">Pilih jabatan untuk menentukan hak akses sistem</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs mt-2">
            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Pilih Jabatan / Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'staff', label: 'Staff / Umum' },
                  { id: 'kasir', label: 'Kasir POS' },
                  { id: 'admin', label: 'Admin Toko' },
                ].map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setJabatan(j.id)}
                    className={`py-3 rounded-2xl font-bold border text-center transition-all cursor-pointer ${
                      jabatan === j.id 
                        ? 'bg-[#01a684] text-white border-[#01a684] shadow-sm' 
                        : 'bg-white text-[#86899B] border-[#E9EBED]'
                    }`}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nama Lengkap Karyawan</label>
              <input 
                type="text" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Rina Melati"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nomor Telepon / WhatsApp</label>
              <input 
                type="text" 
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="Contoh: 081299887766"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            {(jabatan === 'kasir' || jabatan === 'admin') && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Jabatan <b>{jabatan.toUpperCase()}</b> memerlukan akun login khusus. Setelah ini Anda akan diarahkan ke halaman pembuatan kredensial akun kasir/admin yang terikat pada toko Anda.
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer border-0 flex items-center justify-center gap-2 text-xs"
          >
            {isSubmitting ? 'Menyimpan...' : (jabatan === 'staff' ? 'Simpan Data Karyawan' : 'Lanjut ke Pembuatan Akun')} <ArrowRight size={16} />
          </button>
        </form>
      </main>
      <OwnerBottomNav />
    </div>
  );
}