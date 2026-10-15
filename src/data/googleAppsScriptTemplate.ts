export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT UNTUK GOOGLE SPREADSHEET (PT KMI Wire and Cable Tbk)
 * FORM PENGAMBILAN & PEMAKAIAN BARANG
 * =========================================================================
 * Kolom data yang dicatat ke Spreadsheet:
 * 1. Tanggal Form
 * 2. Mesin
 * 3. Nama Pengambil
 * 4. Nama Barang
 * 5. Kuantitas (Qty)
 * 6. Satuan (U/M)
 * 7. Keterangan Pemakaian
 *
 * (Waktu Simpan, ID Transaksi, dan No Item telah dihapus sesuai permintaan)
 * =========================================================================
 * Panduan Pemasangan:
 * 1. Buka Google Spreadsheet Anda di Google Drive.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode yang ada di Code.gs, lalu Salin & Tempel seluruh kode ini.
 * 4. Klik ikon "Simpan" (Ctrl+S / Cmd+S).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Deployment Baru" (New Deployment).
 * 6. Pada ikon gerigi "Pilih jenis", pilih "Aplikasi Web" (Web app).
 * 7. Isi:
 *    - Deskripsi: KMI Form Webhook
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Siapa yang memiliki akses (Who has access): SIAPA SAJA (Anyone)  <-- PENTING!
 * 8. Klik "Terapkan" (Deploy) & Berikan izin (Review Permissions).
 * 9. Salin URL Aplikasi Web yang diberikan (berakhiran /exec).
 * 10. Masukkan URL tersebut ke konfigurasi web app / Vercel Environment Variables.
 */

function setupSheetsIfMissing(ss) {
  // Sheet Pengambilan
  var sheetPengambilan = ss.getSheetByName('Pengambilan');
  if (!sheetPengambilan) {
    sheetPengambilan = ss.insertSheet('Pengambilan');
  }

  // Jika sheet belum memiliki baris header, buat header 7 kolom:
  if (sheetPengambilan.getLastRow() === 0) {
    sheetPengambilan.appendRow([
      'Tanggal Form',
      'Mesin',
      'Nama Pengambil',
      'Nama Barang',
      'Kuantitas (Qty)',
      'Satuan (U/M)',
      'Keterangan Pemakaian'
    ]);
    sheetPengambilan.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#fce8e6');
    sheetPengambilan.setFrozenRows(1);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    // Ping / Test connection
    if (data.action === 'ping' || data.type === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Google Apps Script berhasil terhubung ke spreadsheet!',
        spreadsheetName: ss.getName(),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName(data.sheetName || 'Pengambilan');
    if (!sheet) {
      sheet = ss.insertSheet(data.sheetName || 'Pengambilan');
    }

    // Jika sheet baru dan belum ada header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Tanggal Form',
        'Mesin',
        'Nama Pengambil',
        'Nama Barang',
        'Kuantitas (Qty)',
        'Satuan (U/M)',
        'Keterangan Pemakaian'
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#fce8e6');
      sheet.setFrozenRows(1);
    }

    var items = data.items || [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      // Hanya kirim: Tanggal, Mesin, Nama Pengambil, Barang, Qty, Satuan, Keterangan
      // (Waktu simpan, ID transaksi, dan No item telah dihilangkan)
      sheet.appendRow([
        data.tanggal || '',
        data.mesin || '',
        data.namaPengambil || '',
        item.barang || '',
        item.qty || '',
        item.unit || '',
        item.keterangan || ''
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      type: 'pengambilan',
      rowCount: items.length,
      message: 'Data pengambilan berhasil ditambahkan ke sheet ' + sheet.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Webhook Google Apps Script untuk Form Pengambilan PT KMI Wire and Cable Tbk aktif.'
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
