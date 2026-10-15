import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  Link2,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  ExternalLink,
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
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || '');
  const [webhookUrl2, setWebhookUrl2] = useState(settings.webhookUrl2 || '');
  const [sheetNamePengambilan, setSheetNamePengambilan] = useState(
    settings.sheetNamePengambilan || 'Pengambilan'
  );
  const [sheetNamePengambilan2, setSheetNamePengambilan2] = useState(
    settings.sheetNamePengambilan2 || 'Pengambilan'
  );

  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'guide'>('config');
  const [testingTarget, setTestingTarget] = useState<1 | 2 | null>(null);
  const [testResult1, setTestResult1] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [testResult2, setTestResult2] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      webhookUrl: webhookUrl.trim(),
      webhookUrl2: webhookUrl2.trim(),
      sheetNamePengambilan: sheetNamePengambilan.trim() || 'Pengambilan',
      sheetNamePengambilan2: sheetNamePengambilan2.trim() || 'Pengambilan',
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleTestConnection = async (target: 1 | 2) => {
    const url = target === 1 ? webhookUrl.trim() : webhookUrl2.trim();
    if (!url) {
      if (target === 1) {
        setTestResult1({
          success: false,
          message: 'Masukkan URL Webhook Spreadsheet 1 terlebih dahulu!',
        });
      } else {
        setTestResult2({
          success: false,
          message: 'Masukkan URL Webhook Spreadsheet 2 terlebih dahulu!',
        });
      }
      return;
    }

    setTestingTarget(target);
    if (target === 1) setTestResult1(null);
    if (target === 2) setTestResult2(null);

    const result = await testSheetsConnection(url);
    setTestingTarget(null);
    if (target === 1) setTestResult1(result);
    if (target === 2) setTestResult2(result);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col border border-stone-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-700 text-white rounded-md">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Integrasi 2 Google Spreadsheet Berbeda
              </h2>
              <p className="text-xs text-stone-300">
                Data otomatis terkirim serentak ke 2 spreadsheet saat form disimpan
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
            Konfigurasi 2 Spreadsheet
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
            Petunjuk Cara Pasang 2 File
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Info Banner */}
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-emerald-900 text-xs flex items-start gap-2">
                <Layers className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Sinkronisasi Ganda Aktif:</strong> Setiap kali operator menekan tombol <strong>SIMPAN</strong>, sistem akan secara otomatis mengirim dan mencatat data transaksi ke <strong>kedua spreadsheet</strong> di bawah ini secara bersamaan.
                </p>
              </div>

              {savedNotification && (
                <div className="p-2.5 bg-blue-50 border border-blue-400 text-blue-900 text-xs rounded-lg flex items-center gap-2 font-bold animate-in fade-in">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>Pengaturan 2 Spreadsheet berhasil disimpan!</span>
                </div>
              )}

              {/* SPREADSHEET 1 */}
              <div className="bg-white p-4 border-2 border-stone-300 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm">
                      Google Spreadsheet 1 (Utama / Pabrik)
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Target Utama
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                    URL Webhook Apps Script Spreadsheet 1 *
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-stone-400 bg-stone-100 text-stone-500 rounded-l-md">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-400 focus:outline-none focus:border-blue-600 bg-white font-mono rounded-r-md"
                    />
                  </div>
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
                      onClick={() => handleTestConnection(1)}
                      disabled={testingTarget === 1 || !webhookUrl.trim()}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-400 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingTarget === 1 ? 'animate-spin' : ''}`} />
                      {testingTarget === 1 ? 'Menguji...' : 'Uji Koneksi Spreadsheet 1'}
                    </button>
                  </div>
                </div>

                {testResult1 && (
                  <div
                    className={`p-2.5 border text-xs rounded-md ${
                      testResult1.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    <strong>{testResult1.success ? 'BERHASIL: ' : 'PERINGATAN: '}</strong>
                    {testResult1.message}
                  </div>
                )}
              </div>

              {/* SPREADSHEET 2 */}
              <div className="bg-white p-4 border-2 border-stone-300 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm">
                      Google Spreadsheet 2 (Kedua / Cadangan / Divisi Lain)
                    </h3>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Target Tambahan
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                    URL Webhook Apps Script Spreadsheet 2
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-stone-400 bg-stone-100 text-stone-500 rounded-l-md">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={webhookUrl2}
                      onChange={(e) => setWebhookUrl2(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec (Spreadsheet kedua)"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-400 focus:outline-none focus:border-blue-600 bg-white font-mono rounded-r-md"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Masukkan URL Web App dari file spreadsheet kedua Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Tab Sheet :
                    </label>
                    <input
                      type="text"
                      value={sheetNamePengambilan2}
                      onChange={(e) => setSheetNamePengambilan2(e.target.value)}
                      placeholder="Pengambilan"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-stone-400 rounded-md bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(2)}
                      disabled={testingTarget === 2 || !webhookUrl2.trim()}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-400 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingTarget === 2 ? 'animate-spin' : ''}`} />
                      {testingTarget === 2 ? 'Menguji...' : 'Uji Koneksi Spreadsheet 2'}
                    </button>
                  </div>
                </div>

                {testResult2 && (
                  <div
                    className={`p-2.5 border text-xs rounded-md ${
                      testResult2.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    <strong>{testResult2.success ? 'BERHASIL: ' : 'PERINGATAN: '}</strong>
                    {testResult2.message}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Pengaturan 2 Spreadsheet
                </button>
              </div>
            </form>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900">
                <p>
                  Salin skrip ini dan tempelkan ke <strong>Ekstensi &gt; Apps Script</strong> pada <strong>kedua spreadsheet</strong> Anda (Spreadsheet 1 & Spreadsheet 2).
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Tersalin ke Clipboard!' : 'Salin Kode Lengkap'}
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
                  Buat 2 File Spreadsheet Berbeda di Google Drive
                </h4>
                <p className="pl-7 text-stone-600 leading-relaxed">
                  Buka Google Drive (<a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">drive.google.com</a>), buat dua file spreadsheet berbeda, misalnya:
                  <br />• File 1: <strong>"KMI Wire & Cable - Data Pengambilan (Pabrik)"</strong>
                  <br />• File 2: <strong>"KMI Wire & Cable - Data Pengambilan (Arsip / Gudang Pusat)"</strong>
                </p>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Pasang Kode Apps Script di Masing-Masing File
                </h4>
                <div className="pl-7 space-y-1.5 text-stone-600">
                  <p>
                    Buka <strong>Spreadsheet 1</strong> &gt; menu <strong>Ekstensi &gt; Apps Script</strong> &gt; tempel kode dari tab <em>"Salin Kode Apps Script"</em> &gt; Simpan (Ctrl+S).
                  </p>
                  <p>
                    Lakukan hal yang sama pada <strong>Spreadsheet 2</strong> &gt; menu <strong>Ekstensi &gt; Apps Script</strong> &gt; tempel kode yang sama &gt; Simpan (Ctrl+S).
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Deploy Keduanya Sebagai Aplikasi Web (Who has access: Anyone)
                </h4>
                <div className="pl-7 space-y-1 text-stone-600">
                  <p>Pada masing-masing Apps Script:</p>
                  <p>• Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment baru</strong>.</p>
                  <p>• Pilih jenis <strong>Aplikasi web</strong>.</p>
                  <p>• Siapa yang memiliki akses (Who has access): <strong className="text-blue-700 underline">SIAPA SAJA (Anyone)</strong>.</p>
                  <p>• Salin <strong>URL Aplikasi Web Spreadsheet 1</strong> dan <strong>URL Aplikasi Web Spreadsheet 2</strong>.</p>
                </div>
              </div>

              <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  Masukkan Kedua URL ke Form Pengaturan Ini
                </h4>
                <p className="pl-7 text-stone-600 leading-relaxed">
                  Kembali ke tab <em>"Konfigurasi 2 Spreadsheet"</em> di formulir ini, masukkan URL 1 ke kotak Spreadsheet 1 dan URL 2 ke kotak Spreadsheet 2, lalu klik <strong>"Simpan Pengaturan 2 Spreadsheet"</strong>. Selesai! Kini setiap kali form diisi, data otomatis masuk ke kedua file tersebut sekaligus.
                </p>
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
