/**
 * Google Apps Script Template untuk Google Spreadsheet
 * PT KMI Wire and Cable Tbk - Form Pengambilan & Pemakaian Barang
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - WEBHOOK GOOGLE SPREADSHEET
 * PT KMI WIRE AND CABLE TBK
 * FORM PENGAMBILAN & PEMAKAIAN BARANG
 * =========================================================================
 * 
 * 7 KOLOM DATA YANG DICATAT:
 * 1. Tanggal Form
 * 2. Mesin
 * 3. Nama Pengambil
 * 4. Nama Barang
 * 5. Kuantitas (Qty)
 * 6. Satuan (U/M)
 * 7. Keterangan Pemakaian
 * 
 * =========================================================================
 * PANDUAN PEMASANGAN (HANYA SEKALI):
 * 1. Buka Google Spreadsheet tujuan di Google Drive.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus seluruh kode yang ada di editor (Code.gs).
 * 4. Tempelkan seluruh kode ini dari baris paling atas sampai bawah.
 * 5. Klik ikon disket "Simpan" (Ctrl+S / Cmd+S).
 * 6. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Deployment baru".
 * 7. Klik ikon gerigi "Pilih jenis", lalu pilih "Aplikasi Web" (Web app).
 * 8. Isi konfigurasi:
 *    - Deskripsi: Webhook Form KMI Wire & Cable
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Siapa yang memiliki akses (Who has access): SIAPA SAJA (Anyone)  <-- WAJIB!
 * 9. Klik "Terapkan" (Deploy). Jika muncul permintaan izin, klik "Beri Akses" (Authorize access) 
 *    > Pilih akun Google > Advanced (Lanjutan) > Buka Proyek (tidak aman).
 * 10. Salin "URL Aplikasi Web" (URL berakhiran /exec).
 * 11. Masukkan URL tersebut ke aplikasi (Key: APPS_SCRIPT_URL).
 * =========================================================================
 */

// Nama tab default untuk data pengambilan
var DEFAULT_SHEET_NAME = 'Pengambilan';

// Header kolom tabel
var HEADERS = [
  'Tanggal Form',
  'Mesin',
  'Nama Pengambil',
  'Nama Barang',
  'Kuantitas (Qty)',
  'Satuan (U/M)',
  'Keterangan Pemakaian'
];

/**
 * Menyiapkan sheet dan header jika belum ada
 */
function getOrCreateSheet(ss, sheetName) {
  var targetName = sheetName || DEFAULT_SHEET_NAME;
  var sheet = ss.getSheetByName(targetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
  }
  
  // Jika sheet masih kosong (baris = 0), buat header 7 kolom
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    
    // Format baris header
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8f0fe');
    headerRange.setFontColor('#1a73e8');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Auto-fit kolom
    for (var col = 1; col <= HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
  
  return sheet;
}

/**
 * Menangani permintaan POST (Pengiriman data dari form web)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  // Tunggu maksimal 30 detik untuk menghindari benturan data (concurrency)
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Server spreadsheet sedang sibuk, silakan coba beberapa detik lagi.'
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'Payload kosong atau tidak valid.'
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Fitur Uji Koneksi / Ping
    if (payload.action === 'ping' || payload.type === 'test') {
      return createJsonResponse({
        status: 'success',
        message: 'Koneksi ke Google Apps Script berhasil terhubung!',
        spreadsheetTitle: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    // 2. Simpan Data Formulir Pengambilan
    var sheet = getOrCreateSheet(ss, payload.sheetName);
    var items = payload.items || [];
    
    if (!Array.isArray(items) || items.length === 0) {
      return createJsonResponse({
        status: 'error',
        message: 'Tidak ada data barang yang dikirim.'
      });
    }

    var tanggal = payload.tanggal || '';
    var mesin = payload.mesin || '-';
    var namaPengambil = payload.namaPengambil || '-';

    var rowsToAdd = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var qtyVal = it.qty !== undefined && it.qty !== null ? it.qty : '';
      
      rowsToAdd.push([
        tanggal,
        mesin,
        namaPengambil,
        it.barang || it.name || '',
        qtyVal,
        it.unit || 'PCS',
        it.keterangan || '-'
      ]);
    }

    // Tulis baris baru sekaligus ke spreadsheet
    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var range = sheet.getRange(startRow, 1, rowsToAdd.length, HEADERS.length);
      range.setValues(rowsToAdd);
      
      // Rapikan kolom kuantitas agar rata kanan
      sheet.getRange(startRow, 5, rowsToAdd.length, 1).setHorizontalAlignment('right');
      // Satuan rata tengah
      sheet.getRange(startRow, 6, rowsToAdd.length, 1).setHorizontalAlignment('center');
    }

    return createJsonResponse({
      status: 'success',
      message: 'Berhasil mencatat ' + rowsToAdd.length + ' baris barang ke sheet "' + sheet.getName() + '".',
      rowsAdded: rowsToAdd.length,
      transactionId: payload.transactionId || ''
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: 'Gagal memproses data: ' + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menangani permintaan GET (Untuk pengecekan status webhook via browser)
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return createJsonResponse({
    status: 'online',
    message: 'Webhook Google Apps Script untuk Form Pengambilan PT KMI Wire and Cable Tbk aktif dan siap menerima data.',
    spreadsheetName: ss ? ss.getName() : 'Google Spreadsheet',
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper untuk output JSON dengan MIME Type yang tepat
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
