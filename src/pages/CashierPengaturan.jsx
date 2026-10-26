import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Lock, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierPengaturan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Fadhil Kasir',
    username: 'fadhilkasir',
    phone: '081234567890',
    email: 'fadhil@pos.com',
    role: 'Kasir'
  });

  const [passwords, setPasswords] = useState({
    newPass: '',
    confirmPass: ''
  });

  const [notifSystem, setNotifSystem] = useState(true);

  // Ambil data profil asli dari sesi login Supabase saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userEmail = session.user.email || 'fadhil@pos.com';
          // Ambil username bawaan dari email (sebelum tanda @) atau metadata
          const defaultUsername = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (data) {
            setProfile({
              name: data.full_name || 'Fadhil Kasir',
              username: data.username || defaultUsername,
              phone: data.phone || '081234567890',
              email: userEmail,
              role: data.role || 'Kasir'
            });
            setNotifSystem(data.notif_system ?? true);
          } else {
            // Jika belum ada di tabel profiles, buat baris baru otomatis
            await supabase.from('profiles').insert([
              {
                id: session.user.id,
                full_name: 'Fadhil Kasir',
                username: defaultUsername,
                phone: '081234567890',
                role: 'Kasir',
                notif_system: true
              }
            ]);
            setProfile(prev => ({
              ...prev,
              username: defaultUsername,
              email: userEmail
            }));
          }
        }
      } catch (err) {
        console.error('Gagal mengambil profil kasir:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Simpan Perubahan Profil ke Supabase
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profile.name,
            username: profile.username,
            phone: profile.phone,
            notif_system: notifSystem,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (error) throw error;
        alert('Profil berhasil diperbarui!');
      } else {
        alert('Profil berhasil diperbarui secara lokal!');
      }
    } catch (err) {
      alert('Gagal memperbarui profil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Perbarui Kata Sandi
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.newPass) {
      alert('Mohon masukkan kata sandi baru.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPass
      });

      if (error) throw error;

      alert('Kata sandi berhasil diperbarui!');
      setPasswords({ newPass: '', confirmPass: '' });
    } catch (err) {
      alert('Gagal memperbarui kata sandi: ' + err.message);
    }
  };

  // Fungsi Logout / Keluar Akun
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate('/login');
    }
  };

  // Ambil inisial nama untuk avatar default (Contoh: "Fadhil Kasir" -> "FK")
  const getInitials = (name) => {
    if (!name) return 'FK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[160px] lg:pb-12 lg:pl-24 lg:pr-8">
      
      {/* MainHeader */}
      <header className="pt-8 pb-4 px-6 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-lg font-semibold flex-1 px-2 truncate text-center">Pengaturan Profil</h1>

        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium mr-3">
          <User size={14} />
          <span>Kasir</span>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-[#01A684]/10 flex items-center justify-center font-bold text-[#01A684]">
          {getInitials(profile.name)}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8">
        <div className="px-6 pt-4 pb-20 space-y-4">
          
          {/* Profile Card Section (Menggunakan Inisial Tanpa Foto Dummy) */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-[#E6F6F3] text-[#01A684] flex items-center justify-center text-3xl font-extrabold border-4 border-[#01A684]/20 shadow-inner">
                {getInitials(profile.name)}
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{profile.name}</h2>
            <p className="text-sm text-gray-500">@{profile.username} • {profile.role}</p>
          </div>

          {/* Account Information Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <User size={16} className="text-[#01A684]" /> Informasi Akun
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nama Lengkap</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Username Login</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                  type="text" 
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nomor Telepon</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-100 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" 
                  type="email" 
                  value={profile.email}
                  disabled
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors mt-2 cursor-pointer border-0 shadow-xs flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>

          {/* Security Section (Pembaruan Kata Sandi yang Lebih Rapi) */}
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <Lock size={16} className="text-[#01A684]" /> Perbarui Kata Sandi
            </h3>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Kata Sandi Baru</label>
              <input 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                placeholder="Minimal 6 karakter" 
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({...passwords, newPass: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Konfirmasi Kata Sandi Baru</label>
              <input 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                placeholder="Ulangi kata sandi baru" 
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors mt-2 cursor-pointer border-0 shadow-xs"
            >
              Ubah Kata Sandi
            </button>
          </form>

          {/* App Preferences (Mode Gelap Dihilangkan) */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Preferensi Aplikasi</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#1A1A1A]">Notifikasi Sistem</span>
              <button 
                type="button"
                onClick={() => setNotifSystem(!notifSystem)}
                className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer border-0 ${notifSystem ? 'bg-[#01A684]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifSystem ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Tombol Logout di Paling Bawah */}
          <div className="pt-2">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-[20px] text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <LogOut size={18} />
              Keluar Akun (Log Out)
            </button>
          </div>

        </div>
      </main>

      <CashierBottomNav />

    </div>
  );
}