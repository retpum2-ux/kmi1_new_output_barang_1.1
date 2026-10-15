import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { ItemEntryPengambilan, PengambilanFormData } from '../types';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { UnitSelectDropdown } from './UnitSelectDropdown';
import { DAFTAR_BARANG, ItemBarang } from '../code/daftar-barang';
import { DAFTAR_SATUAN, SatuanUnit } from '../code/daftar-satuan';
import { PanduanPengisianModal } from './PanduanPengisianModal';

interface PengambilanPageProps {
  onBack?: () => void;
  onSubmit: (formData: PengambilanFormData) => Promise<{ success: boolean; synced: boolean; message: string }>;
}

export const PengambilanPage: React.FC<PengambilanPageProps> = ({
  onBack,
  onSubmit,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [mesin, setMesin] = useState<string>('');
  const [namaPengambil, setNamaPengambil] = useState<string>('');

  const [itemsList, setItemsList] = useState<ItemBarang[]>(DAFTAR_BARANG);
  const [unitsList, setUnitsList] = useState<SatuanUnit[]>(DAFTAR_SATUAN);

  React.useEffect(() => {
    fetch('/api/csv/daftar-barang')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItemsList(data);
      })
      .catch(() => {});

    fetch('/api/csv/daftar-satuan')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setUnitsList(data);
      })
      .catch(() => {});
  }, []);

  const [itemList, setItemList] = useState<ItemEntryPengambilan[]>([
    {
      id: `item-entry-1`,
      barang: '',
      qty: '',
      unit: DAFTAR_SATUAN[0]?.code || 'PCS',
      keterangan: '',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    success: boolean;
    synced: boolean;
    message: string;
  } | null>(null);
  const [isPanduanOpen, setIsPanduanOpen] = useState<boolean>(false);

  const handleAddItem = () => {
    setItemList((prev) => [
      ...prev,
      {
        id: `item-entry-${Date.now()}`,
        barang: '',
        qty: '',
        unit: unitsList[0]?.code || 'PCS',
        keterangan: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemList.length <= 1) return;
    setItemList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof ItemEntryPengambilan,
    val: string | number,
    itemObj?: ItemBarang
  ) => {
    setItemList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };

      if (field === 'barang' && itemObj?.defaultUnit) {
        copy[index].unit = itemObj.defaultUnit;
      }

      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal || !tanggal.trim()) {
      alert('Silakan pilih atau isi Tanggal.');
      return;
    }

    if (!mesin || !mesin.trim()) {
      alert('Kolom Mesin wajib diisi.');
      return;
    }

    if (!namaPengambil || !namaPengambil.trim()) {
      alert('Kolom Nama Pengambil wajib diisi.');
      return;
    }

    if (itemList.length === 0) {
      alert('Silakan isi setidaknya 1 baris barang.');
      return;
    }

    for (let i = 0; i < itemList.length; i++) {
      const it = itemList[i];
      if (!it.barang || !it.barang.trim()) {
        alert(`Kolom Cari / Pilih barang pada Barang ${i + 1} wajib diisi.`);
        return;
      }
      if (!it.qty || String(it.qty).trim() === '' || Number(it.qty) <= 0) {
        alert(`Kolom Qty pada Barang ${i + 1} wajib diisi angka lebih dari 0.`);
        return;
      }
      if (!it.unit || !it.unit.trim()) {
        alert(`Kolom Satuan [ U/M ] pada Barang ${i + 1} wajib dipilih.`);
        return;
      }
      if (!it.keterangan || !it.keterangan.trim()) {
        alert(`Kolom Keterangan pemakaian pada Barang ${i + 1} wajib diisi.`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    const formData: PengambilanFormData = {
      type: 'pengambilan',
      tanggal,
      mesin: mesin.trim(),
      namaPengambil: namaPengambil.trim(),
      items: itemList,
    };

    try {
      const res = await onSubmit(formData);
      setSubmitFeedback(res);

      if (res.success) {
        setItemList([
          {
            id: `item-entry-${Date.now()}`,
            barang: '',
            qty: '',
            unit: 'KG',
            keterangan: '',
          },
        ]);
        setMesin('');
        setNamaPengambil('');
      }
    } catch (err: any) {
      setSubmitFeedback({
        success: false,
        synced: false,
        message: `Gagal menyimpan: ${err.message || 'Error tidak diketahui'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Centered layout for mobile and desktop
    <div className="w-full min-h-screen flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 animate-in fade-in">
      {/* Optional minimal back control */}
      {onBack && (
        <div className="w-full max-w-2xl mb-2 flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-800 rounded-lg hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Kembali</span>
          </button>
        </div>
      )}

      {/* Main Form Frame with rounded-2xl & Warna Background Lebih Cerah */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#fffaf3] border border-stone-800 rounded-2xl shadow-md p-4 sm:p-8 pt-3 sm:pt-4 relative space-y-5"
      >
        {/* ================= 1. BAGIAN JUDUL & HEADER (DI LUAR KOTAK) ================= */}
        {/* Top row: Company label (Left) & [Petunjuk Isi] + [KMI1] (Right) */}
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold mb-2">
          <span className="text-stone-600 font-semibold tracking-wide">
            PT KMI Wire and Cable Tbk
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPanduanOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 border border-stone-800 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              title="Buka Petunjuk Isi"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Petunjuk Isi</span>
            </button>

            <span className="text-stone-900 font-bold tracking-wider text-xs sm:text-sm">
              KMI1
            </span>
          </div>
        </div>

        {/* Centered Main Header */}
        <div className="text-center my-2 sm:my-4 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-wider uppercase font-sans">
            FORM
          </h2>
          <h1 className="text-base sm:text-xl font-black text-black tracking-wide uppercase font-sans px-2 leading-tight">
            PENGAMBILAN DAN PEMAKAIAN BARANG
          </h1>
        </div>

        {/* Feedback Alert with rounded-xl */}
        {submitFeedback && (
          <div
            className={`p-3 border text-xs flex items-start gap-2 rounded-xl shadow-2xs ${
              submitFeedback.success
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-red-50 border-red-400 text-red-900'
            }`}
          >
            {submitFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <p className="font-bold">{submitFeedback.message}</p>
            </div>
          </div>
        )}

        {/* Top Level Form Fields (Di luar kotak, langsung di form) */}
        <div className="space-y-4">
          {/* Field: Tanggal : */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-black mb-1">
              Tanggal :
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-800 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Field: Mesin : */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-black mb-1">
              Mesin :
            </label>
            <input
              type="text"
              required
              value={mesin}
              onChange={(e) => setMesin(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-800 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Field: Nama Pengambil : */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-black mb-1">
              Nama Pengambil :
            </label>
            <input
              type="text"
              required
              value={namaPengambil}
              onChange={(e) => setNamaPengambil(e.target.value)}
              placeholder="Nama pengambil barang..."
              className="w-full px-3 py-2 bg-white border border-stone-800 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-stone-400"
            />
          </div>
        </div>

        {/* ================= 2. BAGIAN KOTAK BARANG (WARNA PUTIH KONTRAS BERSIH) ================= */}
        <div className="space-y-4 pt-1">
          {itemList.map((item, index) => (
            <div key={item.id} className="space-y-1.5">
              {/* Block Label Badge */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#f4e2d0] border border-stone-700/60 rounded-md text-sm sm:text-base font-bold text-stone-900 shadow-3xs">
                  Barang {index + 1}
                </span>

                {itemList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900 font-semibold px-2 py-0.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                    title="Hapus baris barang ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              {/* Item Card Box with clean white background for contrast */}
              <div className="bg-white border-2 border-stone-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-xs">
                {/* Row 1: Cari / Pilih barang [ V ] */}
                <div>
                  <ItemSearchDropdown
                    value={item.barang}
                    onChange={(val, itemObj) => handleUpdateItem(index, 'barang', val, itemObj)}
                    items={itemsList}
                    placeholder="Cari / Pilih barang"
                    required={true}
                  />
                </div>

                {/* Row 2: Qty and [ U/M ] */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      required
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(index, 'qty', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-800 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-stone-400 font-mono"
                    />
                  </div>

                  <div>
                    <UnitSelectDropdown
                      value={item.unit}
                      onChange={(unitCode) => handleUpdateItem(index, 'unit', unitCode)}
                      units={unitsList}
                    />
                  </div>
                </div>

                {/* Row 3: Keterangan pemakaian */}
                <div>
                  <input
                    type="text"
                    required
                    value={item.keterangan}
                    onChange={(e) => handleUpdateItem(index, 'keterangan', e.target.value)}
                    placeholder="Keterangan pemakaian"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-800 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-stone-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. BAGIAN SIMPAN & AKSI (WARNA PANEL AKSI KHUSUS) ================= */}
        <div className="bg-[#f2decb] border border-stone-800/60 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
          {/* Button: Tambah barang */}
          <div>
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full sm:w-64 py-2.5 px-4 bg-[#a5d6a7] hover:bg-[#92cb94] active:bg-[#7cb97f] text-stone-900 font-black text-sm sm:text-base border border-stone-900 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah barang</span>
            </button>
          </div>

          {/* Button: SIMPAN */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-3.5 px-4 bg-[#90caf9] hover:bg-[#80bdff] active:bg-[#68abfc] disabled:opacity-60 text-stone-900 font-black text-base sm:text-lg tracking-wider uppercase border border-stone-900 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>SIMPAN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal Panduan Pengisian Form */}
      <PanduanPengisianModal
        isOpen={isPanduanOpen}
        onClose={() => setIsPanduanOpen(false)}
      />
    </div>
  );
};
