import React from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Calendar,
  Wrench,
  User,
  Package,
  Layers,
  Send,
  Plus,
} from 'lucide-react';

interface PanduanPengisianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanduanPengisianModal: React.FC<PanduanPengisianModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col border border-stone-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-md text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Petunjuk Isi
              </h2>
              <p className="text-xs text-stone-300">
                PT KMI Wire and Cable Tbk — Form Pengambilan & Pemakaian Barang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-4 text-xs text-stone-800">
          {/* Banner Pengantar */}
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              Petunjuk Pengisian Formulir Pengambilan Barang
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">
              Formulir ini digunakan untuk mendokumentasikan setiap pengambilan material atau sparepart dari gudang pabrik. Mohon pastikan data diisi dengan benar sebelum menekan tombol simpan.
            </p>
          </div>

          {/* Bagian 1: Identitas Formulir */}
          <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <span className="px-2 py-0.5 bg-[#f4e2d0] text-stone-900 font-bold rounded text-[11px] uppercase border border-stone-300">
                Langkah 1
              </span>
              <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                Informasi Utama Formulir
              </h3>
            </div>

            <div className="space-y-2 text-stone-700">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Tanggal :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Secara default terisi tanggal hari ini. Anda dapat mengubah tanggal jika sedang mendokumentasikan pemakaian yang terjadi di hari sebelumnya.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Mesin :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Isi kode atau nama mesin tempat material akan digunakan (contoh: <code>RBD-01</code>, <code>MWD-01</code>, <code>STR-01</code>, <code>EXT-02</code>, atau <code>WORKSHOP</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Nama Pengambil :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Isi nama lengkap operator atau teknisi yang mengambil barang dari gudang.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 2: Baris Barang */}
          <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <span className="px-2 py-0.5 bg-[#f4e2d0] text-stone-900 font-bold rounded text-[11px] uppercase border border-stone-300">
                Langkah 2
              </span>
              <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                Rincian Barang yang Diambil
              </h3>
            </div>

            <div className="space-y-2 text-stone-700">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Cari / Pilih Barang [ V ] :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Ketik nama atau kode barang pada kotak pencarian, atau klik tombol panah <strong>[ V ]</strong> untuk memilih material yang tersedia dari daftar master barang PT KMI.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Qty & Satuan [ U/M ] :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Ketik jumlah kuantitas angka pada kolom <strong>Qty</strong> (misal: <code>250</code> atau <code>12.5</code>), lalu pilih satuan yang sesuai pada tombol <strong>[ U/M ]</strong> (seperti <code>KG</code>, <code>ROLL</code>, <code>MTR</code>, <code>PCS</code>, <code>DRUM</code>, dsb.).
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-stone-900">• Keterangan pemakaian :</strong>
                <p className="text-stone-600 mt-0.5">
                  Tuliskan peruntukan atau alasan pemakaian material (contoh: <em>"Pemakaian shift 1"</em>, <em>"Penggantian dies aus"</em>, atau <em>"Trial order kabel baru"</em>).
                </p>
              </div>
            </div>
          </div>

          {/* Bagian 3: Tombol Aksi */}
          <div className="bg-white p-4 border border-stone-300 rounded-lg shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <span className="px-2 py-0.5 bg-[#f4e2d0] text-stone-900 font-bold rounded text-[11px] uppercase border border-stone-300">
                Langkah 3
              </span>
              <h3 className="font-bold text-stone-900 text-xs sm:text-sm">
                Aksi & Penyimpanan
              </h3>
            </div>

            <div className="space-y-2 text-stone-700">
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-[#a5d6a7] text-stone-900 rounded shrink-0 mt-0.5">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-stone-900">Tombol "Tambah barang" :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Gunakan tombol hijau ini jika dalam satu kali transaksi terdapat lebih dari satu macam material yang diambil (akan muncul blok <strong>Barang 2</strong>, <strong>Barang 3</strong>, dst.).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-[#90caf9] text-stone-900 rounded shrink-0 mt-0.5">
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-stone-900">Tombol "SIMPAN" :</strong>
                  <p className="text-stone-600 mt-0.5">
                    Setelah seluruh kolom terisi lengkap, klik tombol biru <strong>SIMPAN</strong>. Data akan divalidasi dan langsung tersimpan ke sistem serta otomatis diteruskan ke Google Spreadsheet.
                  </p>
                </div>
              </div>

              {/* Info 2 Spreadsheet */}
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Dukungan Sinkronisasi ke 2 Spreadsheet Berbeda:
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  Hasil pengisian form ini otomatis terkirim serentak ke <strong>2 Google Spreadsheet berbeda</strong> sekaligus (misal: Spreadsheet Pabrik & Spreadsheet Backup/Logistik) melalui konfigurasi Webhook URL 1 dan Webhook URL 2 di backend server / Vercel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
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
