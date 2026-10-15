import React from 'react';
import { Home, Database, Settings, HelpCircle, Table, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  currentPage: 'home' | 'pengambilan';
  onNavigate: (page: 'home' | 'pengambilan') => void;
  onOpenMaster: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  settings: AppSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMaster,
  onOpenSettings,
  onOpenGuide,
  onOpenHistory,
  settings,
}) => {
  const isSheetsConnected = Boolean(settings.webhookUrl && settings.webhookUrl.trim().length > 10);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="text-left group flex items-center gap-2.5 transition-opacity hover:opacity-85"
            title="Kembali ke Beranda"
          >
            <div className="w-8 h-8 rounded-md bg-stone-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              KMI
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-800 tracking-tight leading-tight">
                PT KMI Wire and Cable Tbk
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                Sistem Formulir Pabrik & Gudang
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Status Badge */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isSheetsConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Klik untuk konfigurasi Google Spreadsheet"
          >
            {isSheetsConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sheets Terhubung</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Sheets Belum Aktif</span>
              </>
            )}
          </button>

          {currentPage !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
              title="Ke Halaman Utama"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Home</span>
            </button>
          )}

          <button
            onClick={onOpenMaster}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            title="Kelola Master Barang & Satuan U/M"
          >
            <Database className="w-3.5 h-3.5 text-stone-600" />
            <span>Master Data</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            title="Lihat Riwayat Input"
          >
            <Table className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Riwayat</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            title="Pengaturan Google Spreadsheet"
          >
            <Settings className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden md:inline">Spreadsheet</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Panduan Update Barang, Satuan & Vercel / GitHub"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
