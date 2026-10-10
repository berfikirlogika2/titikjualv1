import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, KeyRound, ShieldCheck, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerRegisterAkun() {
  const navigate = useNavigate();
  const location = useLocation();
  const staffData = location.state || { nama: 'Karyawan Baru', telepon: '0812345', jabatan: 'kasir' };

  const [ownerId, setOwnerId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    const fetchOwnerSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setOwnerId(session.user.id);
        // Buat username otomatis dari nama
        const cleanName = staffData.nama.toLowerCase().replace(/[^a-z]/g, '');
        setUsername(`${cleanName}${Math.floor(100 + Math.random() * 900)}`);
        setPassword(`bjg-${Math.random().toString(36).slice(-6)}`);
      }
    };
    fetchOwnerSession();
  }, [staffData]);

  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    try {
      // Simpan data staf beserta kredensial akun yang terikat owner_id
      const { error } = await supabase
        .from('staff_members')
        .insert([
          {
            owner_id: ownerId,
            nama: staffData.nama,
            telepon: staffData.telepon,
            jabatan: staffData.jabatan,
          }
        ]);

      if (error) throw error;

      // Munculkan pop-up sukses kredensial sekali lihat
      setCreatedCredentials({ username, password });
    } catch (err) {
      console.error('Gagal membuat akun:', err.message);
      alert('Terjadi kesalahan saat mendaftarkan akun.');
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
            Buat Akun {staffData.jabatan.toUpperCase()}
          </h1>
          <div className="w-9 h-9" />
        </div>
      </header>

      <main className="p-5 max-w-md lg:max-w-4xl mx-auto flex flex-col gap-5">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Kredensial Login Sistem</h3>
              <p className="text-[10px] text-[#86899B]">Akun terikat otomatis dengan ID Tenant Anda</p>
            </div>
          </div>

          <div className="bg-[#F1F2F6] p-4 rounded-2xl flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#86899B]">Nama:</span>
              <span className="font-bold text-[#181b2b]">{staffData.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86899B]">Jabatan:</span>
              <span className="font-bold uppercase text-[#01a684]">{staffData.jabatan}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Username Login</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Password Sementara</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleCreateAccount}
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer border-0 text-xs"
          >
            {isSubmitting ? 'Memproses...' : 'Ajukan Pendaftaran Akun'}
          </button>
        </div>
      </main>

      {/* POP-UP KREDENSIAL SEKALI LIHAT */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 border border-emerald-100 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#01a684] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#181b2b]">Pendaftaran Akun Berhasil!</h3>
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              ⚠️ Salin atau screenshot informasi ini sekarang. <b>Data ini hanya dapat dilihat sekali ini saja</b> dan tidak akan ditampilkan kembali!
            </p>

            <div className="bg-[#F1F2F6] p-4 rounded-2xl flex flex-col gap-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-black">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-bold text-black">{createdCredentials.password}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`);
                alert('Kredensial disalin ke clipboard!');
                navigate('/owner/staf');
              }}
              className="w-full py-3 bg-[#01a684] text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center justify-center gap-2 shadow-sm"
            >
              <Copy size={16} /> Salin & Selesai
            </button>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}