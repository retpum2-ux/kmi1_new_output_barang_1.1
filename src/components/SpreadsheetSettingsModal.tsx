import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Link2,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { AppSettings } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/googleAppsScriptTemplate';
import { testSheetsConnection } from '../services/api';

interface SpreadsheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SpreadsheetSettingsModal: React.FC<SpreadsheetSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [appsScriptUrl, setAppsScriptUrl] = useState(
    settings.appsScriptUrl || settings.webhookUrl || ''
  );
  const [sheetNamePengambilan, setSheetNamePengambilan] = useState(
    settings.sheetNamePengambilan || 'Pengambilan'
  );

  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'guide'>('config');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = appsScriptUrl.trim();
    onSaveSettings({
      ...settings,
      appsScriptUrl: cleanUrl,
      webhookUrl: cleanUrl,
      sheetNamePengambilan: sheetNamePengambilan.trim() || 'Pengambilan',
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleTestConnection = async () => {
    const url = appsScriptUrl.trim();
    if (!url) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Webhook Google Apps Script terlebih dahulu!',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSheetsConnection(url);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('APPS_SCRIPT_URL');
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col border border-stone-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-700 text-white rounded-md">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Integrasi Google Spreadsheet
              </h2>
              <p className="text-xs text-stone-300">
                Koneksi Google Apps Script (Key: <span className="font-mono text-emerald-300 font-bold">APPS_SCRIPT_URL</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-300 bg-stone-100 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Konfigurasi Spreadsheet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Salin Kode Apps Script
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Petunjuk Cara Pasang
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Key Apps Script Highlight Card */}
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-emerald-950 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-900">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <span>Nama Key Apps Script:</span>
                    <code className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-mono font-black text-xs sm:text-sm border border-emerald-400">
                      APPS_SCRIPT_URL
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[11px] transition-colors cursor-pointer shadow-3xs"
                    title="Salin nama Key"
                  >
                    {isKeyCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isKeyCopied ? 'Tersalin!' : 'Salin Key'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Gunakan key <strong className="font-mono">APPS_SCRIPT_URL</strong> pada <em>Environment Variables Vercel</em> atau langsung tempelkan URL Webhook pada kotak di bawah ini. Pengaitan form kini fokus ke <strong>1 Google Spreadsheet</strong>.
                </p>
              </div>

              {savedNotification && (
                <div className="p-2.5 bg-blue-50 border border-blue-400 text-blue-900 text-xs rounded-lg flex items-center gap-2 font-bold animate-in fade-in">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>Pengaturan Google Spreadsheet berhasil disimpan!</span>
                </div>
              )}

              {/* SPREADSHEET CARD */}
              <div className="bg-white p-4 sm:p-5 border-2 border-stone-300 rounded-xl shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm">
                      Google Spreadsheet Tujuan
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    1 File Spreadsheet
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                    URL Webhook Apps Script (Key: APPS_SCRIPT_URL) *
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-stone-400 bg-stone-100 text-stone-500 rounded-l-md">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-400 focus:outline-none focus:border-blue-600 bg-white font-mono rounded-r-md"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Salin URL Web App yang berakhiran <code>/exec</code> dari Google Apps Script spreadsheet Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Tab Sheet :
                    </label>
                    <input
                      type="text"
                      value={sheetNamePengambilan}
                      onChange={(e) => setSheetNamePengambilan(e.target.value)}
                      placeholder="Pengambilan"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-400 rounded-md bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !appsScriptUrl.trim()}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-400 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      {isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Spreadsheet'}
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`p-2.5 border text-xs rounded-md ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    <strong>{testResult.success ? 'BERHASIL: ' : 'PERINGATAN: '}</strong>
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Pengaturan Spreadsheet
                </button>
              </div>
            </form>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900">
                <p>
                  Salin skrip ini dan tempelkan ke <strong>Ekstensi &gt; Apps Script</strong> pada Google Spreadsheet Anda.
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {isCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCodeCopied ? 'Tersalin ke Clipboard!' : 'Salin Kode Lengkap'}
                </button>
              </div>

              <div className="relative border border-stone-800 bg-stone-900 text-stone-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Buka File Google Spreadsheet di Google Drive
                </h4>
                <p className="pl-7 text-stone-600 leading-relaxed">
                  Buka file Google Spreadsheet Anda (misal: <em>"KMI Wire & Cable - Data Pengambilan Barang"</em>) di Google Drive.
                </p>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Pasang Kode Apps Script
                </h4>
                <div className="pl-7 space-y-1.5 text-stone-600">
                  <p>
                    Klik menu <strong>Ekstensi &gt; Apps Script</strong> &gt; hapus kode bawaan &gt; tempel kode dari tab <em>"Salin Kode Apps Script"</em> &gt; Simpan (Ctrl+S).
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Deploy Sebagai Aplikasi Web (Who has access: Anyone)
                </h4>
                <div className="pl-7 space-y-1 text-stone-600">
                  <p>• Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment baru</strong>.</p>
                  <p>• Pilih jenis <strong>Aplikasi web</strong>.</p>
                  <p>• Siapa yang memiliki akses (Who has access): <strong className="text-blue-700 underline">SIAPA SAJA (Anyone)</strong>.</p>
                  <p>• Salin <strong>URL Aplikasi Web</strong> (berakhiran <code>/exec</code>).</p>
                </div>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  Pasang Key APPS_SCRIPT_URL di Vercel atau Simpan di UI
                </h4>
                <div className="pl-7 space-y-1 text-stone-600 leading-relaxed">
                  <p>
                    • Di Vercel Dashboard: Tambahkan Environment Variable dengan Nama Key: <strong className="font-mono text-stone-900">APPS_SCRIPT_URL</strong> dan Value: URL Web App Anda.
                  </p>
                  <p>
                    • Atau masukkan langsung ke tab <em>"Konfigurasi Spreadsheet"</em> di formulir ini, lalu klik <strong>"Simpan Pengaturan Spreadsheet"</strong>. Selesai!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-300 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
