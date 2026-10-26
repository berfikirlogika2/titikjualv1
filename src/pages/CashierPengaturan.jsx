import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Edit3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierPengaturan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dewi Lestari',
    username: 'dewi_lestari',
    phone: '081234567890',
    email: 'dewi.lestari@pos.com',
    role: 'Kasir',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASkWqdHV7mD5ewCARR72cMZmIdVZlZ9KEtJHtWoORHxtrZ2ayNUg66aB90Bqj95MsHHT9fttvD5mUZZLxcnBrMIHeh1lXMKdw2wTjhGaQaHpHxyJF208uamxkfiuH6zLX52ysQRiVTFIiyfsaeHwct2do2ezDhkzTNfb59Kf8mgnYPkbGNManQbLC7mHgfZ59rPx5skdgCVrxB9DTraTvi8X4T-2r74XKf5EHKWZ-kryA4QoCYpevrkQ'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [notifSystem, setNotifSystem] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Ambil data profil dan preferensi dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (data) {
            setProfile({
              name: data.full_name || data.name || 'Dewi Lestari',
              username: data.username || 'dewi_lestari',
              phone: data.phone || '081234567890',
              email: session.user.email || 'dewi.lestari@pos.com',
              role: data.role || 'Kasir',
              avatar: data.avatar_url || profile.avatar
            });
            setNotifSystem(data.notif_system ?? true);
            setDarkMode(data.dark_mode ?? false);
          } else {
            // Jika baris profil belum ada di tabel profiles, buat baris baru secara otomatis
            await supabase.from('profiles').insert([
              {
                id: session.user.id,
                full_name: 'Dewi Lestari',
                username: 'dewi_lestari',
                phone: '081234567890',
                role: 'Kasir',
                notif_system: true,
                dark_mode: false
              }
            ]);
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

  // Simpan Perubahan Profil & Preferensi ke Supabase
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { error } = await supabase
          .from('profiles')
          update({
            full_name: profile.name,
            username: profile.username,
            phone: profile.phone,
            notif_system: notifSystem,
            dark_mode: darkMode,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (error) throw error;
        alert('Profil dan preferensi berhasil diperbarui ke Supabase!');
      } else {
        alert('Profil berhasil diperbarui secara lokal (Simulasi)!');
      }
    } catch (err) {
      alert('Gagal memperbarui profil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Perbarui Kata Sandi menggunakan Supabase Auth
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.newPass) {
      alert('Mohon isi kata sandi baru.');
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

      alert('Kata sandi berhasil diperbarui di Supabase Auth!');
      setPasswords({ current: '', newPass: '', confirmPass: '' });
    } catch (err) {
      alert('Gagal memperbarui kata sandi: ' + err.message);
    }
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
          <span>Kasir (Edit Akses)</span>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          KP
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8">
        <div className="px-6 pt-4 pb-20 space-y-4">
          
          {/* Profile Card Section */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-[#E6F6F3] shadow-sm" 
                src={profile.avatar} 
              />
              <button 
                onClick={() => {
                  const newAvatar = prompt('Masukkan URL foto profil baru:', profile.avatar);
                  if (newAvatar) setProfile({ ...profile, avatar: newAvatar });
                }}
                className="absolute bottom-0 right-0 bg-[#01A684] text-white p-2 rounded-full shadow-md hover:opacity-90 transition-colors cursor-pointer border-0"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.role}</p>
          </div>

          {/* Account Information Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Informasi Akun</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nama Lengkap</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Username</label>
                <input 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
                  type="text" 
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none" 
                  type="email" 
                  value={profile.email}
                  disabled
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors mt-2 cursor-pointer border-0 shadow-xs"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>

          {/* Security Section */}
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Keamanan</h3>
            <input 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
              placeholder="Kata Sandi Saat Ini (Opsional)" 
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
            />
            <input 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
              placeholder="Kata Sandi Baru" 
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({...passwords, newPass: e.target.value})}
            />
            <input 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none" 
              placeholder="Konfirmasi Kata Sandi Baru" 
              type="password"
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})}
            />
            <button 
              type="submit" 
              className="w-full bg-[#01A684] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-colors mt-2 cursor-pointer border-0 shadow-xs"
            >
              Perbarui Kata Sandi
            </button>
          </form>

          {/* App Preferences */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-xs">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Preferensi Aplikasi</h3>
            <div className="space-y-4">
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#1A1A1A]">Mode Gelap</span>
                <button 
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer border-0 ${darkMode ? 'bg-[#01A684]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <CashierBottomNav />

    </div>
  );
}