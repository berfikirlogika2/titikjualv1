import React, { useState } from 'react';

export default function SuperadminDashboardPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="max-w-md mx-auto w-full min-h-screen relative shadow-lg bg-[#F1F2F6] text-gray-900 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pb-4 sticky top-0 z-50 backdrop-blur-md pt-4 bg-[#F1F2F6]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <a href="#" className="px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#01a684]">admin_panel_settings</span>
                  Kelola Tenant
                </a>
                <a href="#" className="px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#01a684]">monitoring</span>
                  System Health
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-bold text-[#01a684]">
              SA
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold text-[#181b2b]">Super Admin</h1>
              <div className="flex items-center text-xs text-[#86899B] mt-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#01a684] inline-block mr-1.5"></span>
                System Global Monitor
              </div>
            </div>
          </div>
        </div>

        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm relative">
          <i className="fa-regular fa-bell text-gray-700"></i>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-5 flex flex-col gap-4 pt-2">
        <section className="bg-white rounded-xl p-5 shadow-sm mt-2">
          <span className="text-[10px] font-bold text-[#86899B] tracking-wider uppercase mb-2">Total System Revenue</span>
          <p className="text-2xl font-bold text-[#181b2b] tabular-nums">Rp 1.250.000.000</p>
        </section>
      </main>

      {/* Navigasi Superadmin */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-md border border-white/20 z-50 shadow-lg rounded-full overflow-hidden">
        <div className="flex items-center gap-4 py-3 px-4 overflow-x-auto no-scrollbar">
          <a href="#" className="flex flex-col items-center gap-1 shrink-0 min-w-[72px] text-[#01A684]">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-medium">Overview</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 shrink-0 min-w-[72px] text-[#86899B]">
            <span className="material-symbols-outlined">store</span>
            <span className="text-[10px] font-medium">Outlets</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 shrink-0 min-w-[72px] text-[#86899B]">
            <span className="material-symbols-outlined">manage_accounts</span>
            <span className="text-[10px] font-medium">Users</span>
          </a>
        </div>
      </nav>
    </div>
  );
}