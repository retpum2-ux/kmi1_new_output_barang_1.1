import React, { useState } from 'react';
import { X, Download, Trash2, CheckCircle2, Clock, Search, AlertCircle } from 'lucide-react';
import { SubmissionRecord } from '../types';

interface RecordsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SubmissionRecord[];
  onClearRecords: () => void;
}

export const RecordsHistoryModal: React.FC<RecordsHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchId = rec.id.toLowerCase().includes(q);
    const matchMesin = (rec.mesin || '').toLowerCase().includes(q);
    const matchPengambil = (rec.namaPengambil || '').toLowerCase().includes(q);
    const matchTanggal = (rec.tanggal || '').includes(q);
    const matchItems = rec.items.some(
      (it) =>
        (it.barang || '').toLowerCase().includes(q) ||
        (it.keterangan || '').toLowerCase().includes(q)
    );
    return matchId || matchMesin || matchPengambil || matchTanggal || matchItems;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    // Build CSV content
    const headers = [
      'Waktu Simpan',
      'ID Transaksi',
      'Tanggal Form',
      'Mesin',
      'Nama Pengambil',
      'No Item',
      'Nama Barang',
      'Kuantitas (Qty)',
      'Satuan (U/M)',
      'Keterangan Pemakaian',
      'Status Sync Sheets',
    ];

    const rows: string[][] = [];

    filteredRecords.forEach((rec) => {
      rec.items.forEach((item, idx) => {
        rows.push([
          rec.createdAt ? new Date(rec.createdAt).toLocaleString('id-ID') : '',
          rec.id,
          rec.tanggal,
          rec.mesin || '-',
          rec.namaPengambil || '-',
          String(idx + 1),
          item.barang || '',
          String(item.qty || ''),
          item.unit || '',
          item.keterangan || '',
          rec.syncedToSheets ? 'Tersinkron ke Sheets' : 'Lokal',
        ]);
      });
    });

    const csvContent =
      '\uFEFF' + // UTF-8 BOM so Excel opens Indonesian characters properly
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join(
        '\r\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KMI_Form_Pengambilan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] flex flex-col border border-stone-800 shadow-2xl overflow-hidden rounded-none">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Riwayat Pengisian Form Pengambilan Barang
            </h2>
            <p className="text-xs text-stone-300">
              Daftar form yang telah dikirim dan disinkronkan ke Google Spreadsheet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search bar */}
        <div className="p-3 bg-stone-100 border-b border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, mesin, pengambil, barang..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 text-xs focus:outline-none focus:border-stone-800"
              />
            </div>
            <span className="text-stone-500 font-medium whitespace-nowrap">
              Total: {records.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel / CSV
            </button>
            <button
              onClick={() => {
                if (confirm('Yakin ingin menghapus seluruh riwayat lokal?')) {
                  onClearRecords();
                }
              }}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Riwayat
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
          {filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-stone-300 shadow-2xs overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b text-xs bg-rose-50 border-rose-200">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 uppercase bg-rose-200 text-rose-900">
                        PENGAMBILAN
                      </span>
                      <span className="font-mono text-stone-600 font-semibold">{rec.id}</span>
                      <span className="text-stone-500">• Tanggal: {rec.tanggal}</span>
                      <span className="text-stone-700 font-medium">
                        • Mesin: {rec.mesin || '-'}
                      </span>
                      <span className="text-stone-700 font-medium">
                        • Pengambil: {rec.namaPengambil || '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.syncedToSheets ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersinkron ke Sheets
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertCircle className="w-3 h-3" />
                          Tersimpan Lokal
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400 font-mono">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString('id-ID') : ''}
                      </span>
                    </div>
                  </div>

                  {/* Card Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-stone-200">
                      <thead className="bg-stone-50 text-stone-600 font-semibold">
                        <tr>
                          <th className="px-3 py-1.5 w-10 text-center">#</th>
                          <th className="px-3 py-1.5">Nama Barang</th>
                          <th className="px-3 py-1.5 w-24 text-right">Qty</th>
                          <th className="px-3 py-1.5 w-20 text-center">U/M</th>
                          <th className="px-3 py-1.5">Keterangan Pemakaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-800">
                        {rec.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50/70">
                            <td className="px-3 py-1.5 text-center text-stone-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-1.5 font-medium text-stone-900">
                              {item.barang}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold">
                              {item.qty}
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono text-blue-700 font-semibold">
                              [ {item.unit} ]
                            </td>
                            <td className="px-3 py-1.5 text-stone-600">
                              {item.keterangan || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-stone-200">
              <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">Belum ada riwayat formulir</p>
              <p className="text-xs text-stone-500 mt-1">
                Data yang diisi di formulir Pengambilan akan otomatis tercatat di sini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-300 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
